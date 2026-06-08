import { useClippyStore } from '../store';

interface Props {
  phase: 'focus' | 'break' | 'longBreak';
  remainingMs: number;
  onStop: () => void;
}

const PHASE_LABELS: Record<Props['phase'], string> = {
  focus: 'Focus',
  break: 'Break',
  longBreak: 'Long Break',
};

const PHASE_COLORS: Record<Props['phase'], string> = {
  focus: '#34c759',
  break: '#5ac8fa',
  longBreak: '#af52de',
};

export function PomodoroWidget({ phase, remainingMs, onStop }: Props) {
  const { characterX, characterY, scale } = useClippyStore();

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const color = PHASE_COLORS[phase];
  const label = PHASE_LABELS[phase];

  const half = (48 * scale) / 2;
  const widgetX = characterX + half + 16;
  const widgetY = characterY - half;

  return (
    <div
      onClick={onStop}
      style={{
        position: 'fixed',
        left: widgetX,
        top: widgetY,
        background: 'rgba(20, 20, 30, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${color}44`,
        borderRadius: 10,
        padding: '8px 14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#e0e0e0',
        pointerEvents: 'auto',
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), inset 0 0 12px ${color}15`,
        zIndex: 9998,
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 90,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color,
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#fff',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {timeStr}
      </div>
      <div
        style={{
          fontSize: 9,
          color: '#777',
          marginTop: 4,
        }}
      >
        click to stop
      </div>
    </div>
  );
}
