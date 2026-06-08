import { ClippyCanvas } from './components/ClippyCanvas';
import { SpeechBubble } from './components/SpeechBubble';
import { useClippyStore } from './store';

export default function App() {
  const { speechBubble, characterX, characterY } = useClippyStore();

  return (
    <>
      <ClippyCanvas />
      {speechBubble && (
        <SpeechBubble
          text={speechBubble.text}
          x={characterX}
          y={characterY}
          variant={speechBubble.variant || 'tip'}
        />
      )}
    </>
  );
}
