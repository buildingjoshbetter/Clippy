import { useEffect, useRef } from 'react';
import { ClippyCanvas } from './components/ClippyCanvas';
import { SpeechBubble } from './components/SpeechBubble';
import { PomodoroWidget } from './components/PomodoroWidget';
import { StretchOverlay } from './components/StretchOverlay';
import { ReminderToast } from './components/ReminderToast';
import { FixedNote } from './components/FixedNote';
import { SettingsPanel } from './components/SettingsPanel';
import { ContextMenu } from './components/ContextMenu';
import { useClippyStore } from './store';
import { useClippy } from './hooks/useClippy';
import { useAIStatus } from './hooks/useAIStatus';
import { useConfig } from './hooks/useConfig';
import { useInteractiveRegions } from './hooks/useInteractiveRegions';
import { playDing } from './systems/SoundSystem';

export default function App() {
  const store = useClippyStore();
  const pomodoroEndRef = useRef(0);

  // Pomodoro countdown timer
  useEffect(() => {
    const phase = useClippyStore.getState().pomodoroPhase;
    if (phase === 'idle') return;

    const remaining = useClippyStore.getState().pomodoroRemainingMs;
    pomodoroEndRef.current = Date.now() + remaining;

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, pomodoroEndRef.current - now);
      const currentPhase = useClippyStore.getState().pomodoroPhase;
      if (currentPhase === 'idle') {
        clearInterval(interval);
        return;
      }
      useClippyStore.setState({ pomodoroRemainingMs: left });

      if (left <= 0) {
        clearInterval(interval);
        playDing();
        useClippyStore.setState({ pomodoroPhase: 'idle', pomodoroRemainingMs: 0 });
        useClippyStore.getState().showSpeech(
          currentPhase === 'focus' ? 'Focus session complete! Nice work.' : 'Break over! Ready to focus?',
          'tip', 3000
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [store.pomodoroPhase]);

  // Initialize behavior systems
  useClippy();
  useAIStatus();
  useConfig();
  useInteractiveRegions();

  return (
    <>
      <ClippyCanvas />

      {store.speechBubble && (
        <SpeechBubble
          text={store.speechBubble.text}
          x={store.characterX - (48 * store.scale) / 2}
          y={store.characterY}
          variant={store.speechBubble.variant || 'tip'}
        />
      )}

      {store.pinnedNote && (
        <FixedNote />
      )}

      {store.pomodoroPhase !== 'idle' && (
        <PomodoroWidget
          phase={store.pomodoroPhase as 'focus' | 'break' | 'longBreak'}
          remainingMs={store.pomodoroRemainingMs}
          onStop={() => store.setPomodoroState('idle', 0)}
        />
      )}

      {store.stretchActive && (
        <StretchOverlay onDismiss={() => store.setStretchActive(false)} />
      )}

      {store.activeReminder && (
        <ReminderToast
          message={store.activeReminder.message}
          onDismiss={() => store.setActiveReminder(null)}
        />
      )}

      {store.contextMenuOpen && (
        <ContextMenu />
      )}

      {store.settingsOpen && (
        <SettingsPanel onClose={() => store.setSettingsOpen(false)} />
      )}
    </>
  );
}
