import { useEffect, useRef, useState, useCallback } from 'react';
import { useClippyStore } from '../store';
import { playStretch, playDing } from '../systems/SoundSystem';

export type PomodoroPhase = 'idle' | 'focus' | 'break' | 'longBreak';

interface TimerState {
  stretchEnabled: boolean;
  stretchIntervalMin: number;
  pomodoroPhase: PomodoroPhase;
  pomodoroRemainingMs: number;
  pomodoroSessionCount: number;
}

export function useTimers() {
  const store = useClippyStore();
  const [timerState, setTimerState] = useState<TimerState>({
    stretchEnabled: true,
    stretchIntervalMin: 45,
    pomodoroPhase: 'idle',
    pomodoroRemainingMs: 0,
    pomodoroSessionCount: 0,
  });

  const stretchTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pomodoroRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pomodoroEndRef = useRef(0);

  // Stretch reminder
  useEffect(() => {
    if (!timerState.stretchEnabled) return;

    stretchTimerRef.current = setInterval(() => {
      store.setAnimState('stretching');
      store.showSpeech(`Time to stretch, ${store.userName || 'friend'}!`, 'reminder', 10000);
      playStretch();
      setTimeout(() => {
        if (store.animState === 'stretching') {
          store.setAnimState('idle');
        }
      }, 10000);
    }, timerState.stretchIntervalMin * 60 * 1000);

    return () => clearInterval(stretchTimerRef.current);
  }, [timerState.stretchEnabled, timerState.stretchIntervalMin]);

  const startPomodoro = useCallback((phase: 'focus' | 'break' | 'longBreak') => {
    const durations = { focus: 25, break: 5, longBreak: 15 };
    const durationMs = durations[phase] * 60 * 1000;
    pomodoroEndRef.current = Date.now() + durationMs;

    setTimerState(s => ({ ...s, pomodoroPhase: phase, pomodoroRemainingMs: durationMs }));

    if (phase === 'focus') {
      store.showSpeech(`Focus time! Let's go, ${store.userName || 'friend'}!`, 'tip', 3000);
    } else {
      store.showSpeech('Break time! You earned it.', 'tip', 3000);
    }

    clearInterval(pomodoroRef.current);
    pomodoroRef.current = setInterval(() => {
      const remaining = Math.max(0, pomodoroEndRef.current - Date.now());
      setTimerState(s => ({ ...s, pomodoroRemainingMs: remaining }));

      if (remaining <= 0) {
        clearInterval(pomodoroRef.current);
        playDing();

        if (phase === 'focus') {
          setTimerState(s => {
            const newCount = s.pomodoroSessionCount + 1;
            return { ...s, pomodoroPhase: 'idle', pomodoroSessionCount: newCount };
          });
          store.showSpeech('Focus session complete!', 'tip', 3000);
        } else {
          setTimerState(s => ({ ...s, pomodoroPhase: 'idle' }));
          store.showSpeech('Break over! Ready to focus?', 'tip', 3000);
        }
      }
    }, 1000);
  }, [store]);

  const stopPomodoro = useCallback(() => {
    clearInterval(pomodoroRef.current);
    setTimerState(s => ({ ...s, pomodoroPhase: 'idle', pomodoroRemainingMs: 0 }));
  }, []);

  return { ...timerState, startPomodoro, stopPomodoro };
}
