import { useEffect, useRef, useCallback } from 'react';
import { useClippyStore } from '../store';
import { useInput } from './useInput';
import { invoke } from '@tauri-apps/api/core';
import { lerp } from '../utils/math';
import { getIdleAction, resetIdleTier } from '../systems/IdleBehavior';
import { getRandomLine } from '../config/speechLines';
import { getCharacter } from '../engine/characters';

export function useClippy() {
  const store = useClippyStore();
  const input = useInput();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastAnimChange = useRef(0);
  const wobbleVelX = useRef(0);
  const wobbleVelY = useRef(0);
  const pettingTimer = useRef(0);
  const firstRun = useRef(true);

  // Update character bounds for hit testing (character draws centered at origin)
  useEffect(() => {
    const size = 48 * store.scale;
    invoke('update_character_bounds', {
      x: store.characterX - size / 2, y: store.characterY - size / 2, w: size, h: size
    }).catch(() => {});
  }, [store.characterX, store.characterY, store.scale]);

  // Eye follow — continuous animation loop for smooth tracking
  const eyeTargetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const s = useClippyStore.getState();
    const cx = s.characterX;
    const cy = s.characterY - 8 * s.scale;
    const dx = input.cursorX - cx;
    const dy = input.cursorY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxOffset = 6;

    if (dist > 5) {
      const angle = Math.atan2(dy, dx);
      const strength = Math.min(1, dist / 150);
      eyeTargetRef.current = {
        x: Math.cos(angle) * maxOffset * strength,
        y: Math.sin(angle) * maxOffset * strength,
      };
    } else {
      eyeTargetRef.current = { x: 0, y: 0 };
    }
  }, [input.cursorX, input.cursorY]);

  useEffect(() => {
    const interval = setInterval(() => {
      const s = useClippyStore.getState();
      const target = eyeTargetRef.current;
      const newX = lerp(s.eyeOffsetX, target.x, 0.25);
      const newY = lerp(s.eyeOffsetY, target.y, 0.25);
      if (Math.abs(newX - s.eyeOffsetX) > 0.01 || Math.abs(newY - s.eyeOffsetY) > 0.01) {
        s.setEyeOffset(newX, newY);
      }
    }, 33);
    return () => clearInterval(interval);
  }, []);

  // Behavior state machine
  useEffect(() => {
    const now = Date.now();
    const timeSinceChange = now - lastAnimChange.current;

    // Global cooldown — don't switch states more than once every 3 seconds (except dragging)
    if (isDragging.current) {
      if (store.animState !== 'dragging') {
        store.setAnimState('dragging');
        lastAnimChange.current = now;
      }
      return;
    }

    if (timeSinceChange < 3000) return;

    // Overheat: fast typing for 5+ seconds, animation only
    if (input.isTypingFast && timeSinceChange > 5000 && store.animState !== 'overheat') {
      store.setAnimState('overheat');
      lastAnimChange.current = now;
      return;
    }

    // Typing along — requires sustained typing (~30+ WPM), only from idle, no speech
    if (input.isTyping && !input.isTypingFast && store.animState === 'idle') {
      store.setAnimState('typing_along');
      lastAnimChange.current = now;
      return;
    }

    // Scrolling — only from idle
    if (input.isScrolling && store.animState === 'idle') {
      store.setAnimState('paper_unroll');
      lastAnimChange.current = now;
      return;
    }

    // Chase: fast cursor, only from idle
    if (input.cursorVelocity > 1200 && store.animState === 'idle') {
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
    if (store.animState === 'overheat' && !input.isTypingFast && timeSinceChange > 3000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'typing_along' && !input.isTyping && timeSinceChange > 3000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'paper_unroll' && !input.isScrolling && timeSinceChange > 3000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'chasing' && input.cursorVelocity < 200 && timeSinceChange > 3000) {
      store.setBodyTransform(0, 1, 1);
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'sleeping' && input.idleDurationMs < 1000) {
      store.setAnimState('idle');
      lastAnimChange.current = now;
    } else if (store.animState === 'thinking' && timeSinceChange > 3000 && (input.isTyping || input.isScrolling || input.cursorVelocity > 1200)) {
      store.setAnimState(input.isTyping ? 'typing_along' : input.isScrolling ? 'paper_unroll' : 'chasing');
      lastAnimChange.current = now;
    }
  }, [input, store.animState]);

  // Chase behavior — move toward cursor
  useEffect(() => {
    if (store.animState !== 'chasing') return;

    const interval = setInterval(() => {
      const cx = store.characterX;
      const cy = store.characterY;
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
        store.setBodyTransform(0, 1, 1);
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
    const half = size / 2;
    const inBounds = e.clientX >= store.characterX - half && e.clientX <= store.characterX + half
                  && e.clientY >= store.characterY - half && e.clientY <= store.characterY + half;
    if (inBounds) {
      // If accessibility not granted, clicking opens System Preferences
      if (!input.accessibilityGranted) {
        invoke('request_accessibility').catch(() => {});
        store.showSpeech("Opening Accessibility settings — add this app, then I'll detect your typing!", 'tip', 5000);
        return;
      }
      isDragging.current = true;
      dragOffset.current = { x: e.clientX - store.characterX, y: e.clientY - store.characterY };
      store.setAnimState('dragging');
    }
  }, [store.characterX, store.characterY, store.scale, input.accessibilityGranted]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      store.setPosition(e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      // Clamp to screen bounds
      const s = useClippyStore.getState();
      const half = (48 * s.scale) / 2;
      const maxX = window.innerWidth - half;
      const maxY = window.innerHeight - half;
      const clampedX = Math.max(half, Math.min(maxX, s.characterX));
      const clampedY = Math.max(half, Math.min(maxY, s.characterY));
      if (clampedX !== s.characterX || clampedY !== s.characterY) {
        s.setPosition(clampedX, clampedY);
      }
      wobbleVelX.current = (Math.random() - 0.5) * 20;
      wobbleVelY.current = (Math.random() - 0.5) * 20;
      store.setAnimState('wobble');
    }
  }, []);

  // Right-click for context menu
  const onContextMenu = useCallback((e: MouseEvent) => {
    const size = 48 * store.scale;
    const half = size / 2;
    const inBounds = e.clientX >= store.characterX - half && e.clientX <= store.characterX + half
                  && e.clientY >= store.characterY - half && e.clientY <= store.characterY + half;
    if (inBounds) {
      e.preventDefault();
      store.openContextMenu(e.clientX, e.clientY);
    }
  }, [store.characterX, store.characterY, store.scale]);

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onContextMenu]);

  // Petting detection — slow cursor hovering on the top third of character
  useEffect(() => {
    if (store.animState === 'dragging' || store.animState === 'wobble') return;

    const size = 48 * store.scale;
    const half = size / 2;
    const headTop = store.characterY - half;
    const headBottom = store.characterY - half + size / 3;
    const inHead = input.cursorX >= store.characterX - half && input.cursorX <= store.characterX + half
                && input.cursorY >= headTop && input.cursorY <= headBottom;
    const isSlow = input.cursorVelocity < 50;

    if (inHead && isSlow) {
      pettingTimer.current += 33;
      if (pettingTimer.current > 1000 && store.animState !== 'petting') {
        store.setAnimState('petting');
        store.showSpeech(getRandomLine('petting', store.userName, getCharacter(store.characterVariant).speechOverrides), 'tip', 3000);
        lastAnimChange.current = Date.now();
      }
    } else {
      pettingTimer.current = 0;
      if (store.animState === 'petting') {
        store.setAnimState('idle');
        lastAnimChange.current = Date.now();
      }
    }
  }, [input.cursorX, input.cursorY, input.cursorVelocity]);

  // First-run greeting
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      setTimeout(() => {
        store.setAnimState('waving');
        store.showSpeech("Hey! I'm your desktop buddy. Right-click me for options, or just keep coding.", 'tip', 6000);
        setTimeout(() => {
          if (useClippyStore.getState().animState === 'waving') {
            useClippyStore.getState().setAnimState('idle');
          }
        }, 3000);
        // If no interaction after 10s, nudge about petting
        setTimeout(() => {
          const s = useClippyStore.getState();
          if (s.animState === 'idle' && !s.speechBubble) {
            s.showSpeech("Try moving your mouse near my head for a surprise.", 'tip', 4000);
          }
        }, 10000);
      }, 1500);
    }
  }, []);

  // Accessibility permission prompt and retry
  const accessibilityPrompted = useRef(false);
  useEffect(() => {
    if (input.accessibilityGranted) return;

    // Show prompt after 3 seconds if accessibility still not granted
    const promptTimer = setTimeout(() => {
      if (!accessibilityPrompted.current) {
        accessibilityPrompted.current = true;
        store.showSpeech("I need Accessibility permission to react to your typing and scrolling. Click me to open Settings!", 'alert', 8000);
      }
    }, 3000);

    // Retry the event monitor every 3 seconds in case the user granted permission
    const retryInterval = setInterval(async () => {
      try {
        const started = await invoke<boolean>('retry_event_monitor');
        if (started) {
          store.showSpeech("Keyboard access granted — now I can see you type!", 'tip', 3000);
        }
      } catch {}
    }, 3000);

    return () => {
      clearTimeout(promptTimer);
      clearInterval(retryInterval);
    };
  }, [input.accessibilityGranted]);

  // Reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const pending = store.reminders.find(r => !r.delivered && r.triggerAt <= now);
      if (pending) {
        store.dismissReminder(pending.id);
        store.setActiveReminder({ id: pending.id, message: pending.message });
        store.setAnimState('waving');
        setTimeout(() => {
          if (store.animState === 'waving') store.setAnimState('idle');
        }, 2000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [store.reminders]);

  // Stretch reminder — triggers after sustained work (default 45 min)
  const workSessionStart = useRef(Date.now());
  const stretchIntervalMs = 45 * 60 * 1000;
  useEffect(() => {
    // Reset work session if idle for more than 5 minutes
    if (input.idleDurationMs > 300000) {
      workSessionStart.current = Date.now();
      return;
    }

    const sessionDuration = Date.now() - workSessionStart.current;
    if (sessionDuration >= stretchIntervalMs && !store.stretchActive) {
      store.setStretchActive(true);
      store.setAnimState('stretching');
      store.showSpeech(
        getRandomLine('stretch', store.userName, getCharacter(store.characterVariant).speechOverrides),
        'reminder', 10000
      );
      workSessionStart.current = Date.now();
    }
  }, [input.idleDurationMs, store.stretchActive]);

  // Idle behavior system
  useEffect(() => {
    if (store.animState !== 'idle' && store.animState !== 'sleeping') {
      resetIdleTier();
      return;
    }

    const interval = setInterval(() => {
      const action = getIdleAction(input.idleDurationMs, store.userName, getCharacter(store.characterVariant).speechOverrides);
      if (action) {
        switch (action.type) {
          case 'speech':
            if (action.speech) store.showSpeech(action.speech, 'tip', 4000);
            break;
          case 'sleep':
            store.setAnimState('sleeping');
            break;
          // look and tap are handled by the renderer based on animState
        }
      }
    }, 5000); // check every 5 seconds

    return () => clearInterval(interval);
  }, [store.animState, input.idleDurationMs]);
}
