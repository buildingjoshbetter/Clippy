import { useClippyStore } from '../store';

interface Props {
  phase: 'focus' | 'break' | 'longBreak';
  remainingMs: number;
  onStop: () => void;
}

const PHASE_LABELS: Record<Props['phase'], string> = {
  focus: 'FOCUS',
  break: 'BREAK',
  longBreak: 'LONG BREAK',
};

const PHASE_COLORS: Record<Props['phase'], string> = {
  focus: '#2d8a4e',
  break: '#4a6fa5',
  longBreak: '#6a5acd',
};

export function PomodoroWidget({ phase, remainingMs, onStop }: Props) {
  const { characterX, characterY, scale } = useClippyStore();

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const borderColor = PHASE_COLORS[phase];
  const label = PHASE_LABELS[phase];

  const widgetX = characterX + 48 * scale + 16;
  const widgetY = characterY;

  return (
    <div
      onClick={onStop}
      style={{
        position: 'fixed',
        left: widgetX,
        top: widgetY,
        background: '#1a1a2e',
        border: `3px solid ${borderColor}`,
        padding: '8px 12px',
        fontFamily: '"Courier New", monospace',
        color: '#e0e0e0',
        pointerEvents: 'auto',
        imageRendering: 'pixelated',
        boxShadow: `3px 3px 0px rgba(0,0,0,0.4), inset 0 0 8px ${borderColor}33`,
        zIndex: 9998,
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 90,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 'bold',
          color: borderColor,
          letterSpacing: 2,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: 1,
        }}
      >
        {timeStr}
      </div>
      <div
        style={{
          fontSize: 8,
          color: '#888',
          marginTop: 4,
        }}
      >
        click to stop
      </div>
    </div>
  );
}
