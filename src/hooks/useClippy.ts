import { useEffect, useRef, useCallback } from 'react';
import { useClippyStore } from '../store';
import { useInput } from './useInput';
import { invoke } from '@tauri-apps/api/core';
import { lerp } from '../utils/math';

export function useClippy() {
  const store = useClippyStore();
  const input = useInput();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastAnimChange = useRef(0);
  const wobbleVelX = useRef(0);
  const wobbleVelY = useRef(0);

  // Update character bounds for hit testing
  useEffect(() => {
    const w = 48 * store.scale;
    const h = 48 * store.scale;
    invoke('update_character_bounds', {
      x: store.characterX, y: store.characterY, w, h
    }).catch(() => {});
  }, [store.characterX, store.characterY, store.scale]);

  // Eye follow — always active
  useEffect(() => {
    const cx = store.characterX + 24 * store.scale;
    const cy = store.characterY + 12 * store.scale;
    const dx = input.cursorX - cx;
    const dy = input.cursorY - cy;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 2.5;

    const targetX = Math.cos(angle) * maxOffset;
    const targetY = Math.sin(angle) * maxOffset;

    const newX = lerp(store.eyeOffsetX, targetX, 0.12);
    const newY = lerp(store.eyeOffsetY, targetY, 0.12);
    store.setEyeOffset(newX, newY);
  }, [input.cursorX, input.cursorY]);

  // Behavior state machine
  useEffect(() => {
    const now = Date.now();
    const timeSinceChange = now - lastAnimChange.current;

    // Priority-ordered state transitions
    if (isDragging.current) {
      if (store.animState !== 'dragging') {
        store.setAnimState('dragging');
        lastAnimChange.current = now;
      }
      return;
    }

    // Overheat: fast typing for 3+ seconds
    if (input.isTypingFast && timeSinceChange > 3000 && store.animState !== 'overheat') {
      store.setAnimState('overheat');
      lastAnimChange.current = now;
      return;
    }

    // Typing along
    if (input.isTyping && !input.isTypingFast && store.animState !== 'typing_along' && store.animState !== 'overheat') {
      store.setAnimState('typing_along');
      lastAnimChange.current = now;
      return;
    }

    // Scrolling
    if (input.isScrolling && store.animState !== 'paper_unroll') {
      store.setAnimState('paper_unroll');
      lastAnimChange.current = now;
      return;
    }

    // Chase: fast cursor
    if (input.cursorVelocity > 800 && store.animState === 'idle') {
      store.setAnimState('chasing');
      lastAnimChange.current = now;
      return;
    }

    // Sleep: idle for 5 minutes
    if (input.idleDurationMs > 300000 && store.animState !== 'sleeping') {
      store.setAnimState('sleeping');
      lastAnimChange.current = now;
      return;
    }

    // Return to idle after states expire
    if (store.animState === 'overheat' && !input.isTypingFast && timeSinceChange > 2000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'typing_along' && !input.isTyping) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'paper_unroll' && !input.isScrolling && timeSinceChange > 1000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'chasing' && input.cursorVelocity < 200 && timeSinceChange > 500) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'sleeping' && input.idleDurationMs < 1000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    }
  }, [input, store.animState]);

  // Chase behavior — move toward cursor
  useEffect(() => {
    if (store.animState !== 'chasing') return;

    const interval = setInterval(() => {
      const cx = store.characterX + 24 * store.scale;
      const cy = store.characterY + 24 * store.scale;
      const dx = input.cursorX - cx;
      const dy = input.cursorY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 100) {
        const speed = 3;
        const nx = dx / dist;
        const ny = dy / dist;
        store.setPosition(
          store.characterX + nx * speed,
          store.characterY + ny * speed
        );
        store.setBodyTransform(nx * 10, 1, 1);
      }
    }, 33);

    return () => clearInterval(interval);
  }, [store.animState]);

  // Wobble physics after drag release
  useEffect(() => {
    if (store.animState !== 'wobble') return;

    const interval = setInterval(() => {
      const damping = 0.85;

      wobbleVelX.current *= damping;
      wobbleVelY.current *= damping;

      const squash = 1 + Math.sin(Date.now() / 100) * Math.abs(wobbleVelY.current) * 0.01;
      const stretch = 1 + Math.sin(Date.now() / 100) * Math.abs(wobbleVelX.current) * 0.01;

      store.setBodyTransform(0, squash, stretch);

      if (Math.abs(wobbleVelX.current) < 0.1 && Math.abs(wobbleVelY.current) < 0.1) {
        store.setBodyTransform(0, 1, 1);
        store.setAnimState('idle');
      }
    }, 33);

    return () => clearInterval(interval);
  }, [store.animState]);

  // Mouse handlers for dragging
  const onMouseDown = useCallback((e: MouseEvent) => {
    const size = 48 * store.scale;
    const inBounds = e.clientX >= store.characterX && e.clientX <= store.characterX + size
                  && e.clientY >= store.characterY && e.clientY <= store.characterY + size;
    if (inBounds) {
      isDragging.current = true;
      dragOffset.current = { x: e.clientX - store.characterX, y: e.clientY - store.characterY };
      store.setAnimState('dragging');
    }
  }, [store.characterX, store.characterY, store.scale]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      store.setPosition(e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      wobbleVelX.current = (Math.random() - 0.5) * 20;
      wobbleVelY.current = (Math.random() - 0.5) * 20;
      store.setAnimState('wobble');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp]);
}
