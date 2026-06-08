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

export default function App() {
  const store = useClippyStore();

  // Initialize behavior systems
  useClippy();
  useAIStatus();

  return (
    <>
      <ClippyCanvas />

      {store.speechBubble && (
        <SpeechBubble
          text={store.speechBubble.text}
          x={store.characterX + (48 * store.scale) / 2}
          y={store.characterY - 10}
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
