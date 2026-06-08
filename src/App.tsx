import { ClippyCanvas } from './components/ClippyCanvas';
import { SpeechBubble } from './components/SpeechBubble';
import { useClippyStore } from './store';
import { useClippy } from './hooks/useClippy';
import { useAIStatus } from './hooks/useAIStatus';

export default function App() {
  const { speechBubble, characterX, characterY, scale } = useClippyStore();

  // Initialize behavior systems
  useClippy();
  useAIStatus();

  return (
    <>
      <ClippyCanvas />
      {speechBubble && (
        <SpeechBubble
          text={speechBubble.text}
          x={characterX + (48 * scale) / 2}
          y={characterY - 10}
          variant={speechBubble.variant || 'tip'}
        />
      )}
    </>
  );
}
