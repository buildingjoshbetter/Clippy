import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface InputState {
  cursorX: number;
  cursorY: number;
  cursorVelocity: number;
  lastKeystrokeMs: number;
  keystrokeCount: number;
  lastScrollMs: number;
  scrollCount: number;
  isTyping: boolean;
  isTypingFast: boolean;
  isScrolling: boolean;
  kps: number;
  idleDurationMs: number;
  accessibilityGranted: boolean;
}

interface RawInputState {
  cursor_x: number;
  cursor_y: number;
  last_keystroke_ms: number;
  keystroke_count: number;
  last_scroll_ms: number;
  scroll_count: number;
  last_mouse_move_ms: number;
  now_ms: number;
  accessibility_granted: boolean;
}

export function useInput(pollIntervalMs = 33): InputState {
  const [state, setState] = useState<InputState>({
    cursorX: 0, cursorY: 0, cursorVelocity: 0,
    lastKeystrokeMs: 0, keystrokeCount: 0,
    lastScrollMs: 0, scrollCount: 0,
    isTyping: false, isTypingFast: false, isScrolling: false,
    kps: 0, idleDurationMs: 99999, accessibilityGranted: false,
  });

  const prevCursorRef = useRef({ x: 0, y: 0 });
  const prevTimeRef = useRef(Date.now());
  const prevKeystrokeCountRef = useRef(0);
  const smoothKpsRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      if (!mounted) return;
      try {
        const raw = await invoke<RawInputState>('get_input_state');
        const now = Date.now();
        const dt = Math.max(now - prevTimeRef.current, 1);

        const dx = raw.cursor_x - prevCursorRef.current.x;
        const dy = raw.cursor_y - prevCursorRef.current.y;
        const velocity = Math.sqrt(dx * dx + dy * dy) / (dt / 1000);

        const recentKeys = raw.keystroke_count - prevKeystrokeCountRef.current;
        const rawKps = recentKeys / (dt / 1000);
        smoothKpsRef.current = smoothKpsRef.current * 0.7 + rawKps * 0.3;

        const lastActivity = Math.max(raw.last_keystroke_ms, raw.last_scroll_ms, raw.last_mouse_move_ms);
        const idleMs = raw.now_ms - lastActivity;
        const recentKeystroke = (raw.now_ms - raw.last_keystroke_ms) < 2000;

        setState({
          cursorX: raw.cursor_x,
          cursorY: raw.cursor_y,
          cursorVelocity: velocity,
          lastKeystrokeMs: raw.last_keystroke_ms,
          keystrokeCount: raw.keystroke_count,
          lastScrollMs: raw.last_scroll_ms,
          scrollCount: raw.scroll_count,
          isTyping: recentKeystroke && smoothKpsRef.current > 1.5,
          isTypingFast: smoothKpsRef.current > 8,
          isScrolling: (raw.now_ms - raw.last_scroll_ms) < 500,
          kps: smoothKpsRef.current,
          idleDurationMs: idleMs,
          accessibilityGranted: raw.accessibility_granted,
        });

        prevCursorRef.current = { x: raw.cursor_x, y: raw.cursor_y };
        prevTimeRef.current = now;
        prevKeystrokeCountRef.current = raw.keystroke_count;
      } catch (e) {
        // Ignore invoke errors during startup
      }
    }, pollIntervalMs);

    return () => { mounted = false; clearInterval(interval); };
  }, [pollIntervalMs]);

  return state;
}
