import { useEffect } from 'react';
import { useClippyStore } from '../store';
import { playAlert } from '../systems/SoundSystem';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ReminderToast({ message, onDismiss }: Props) {
  const { characterX, characterY, scale } = useClippyStore();

  // Play alert sound on mount
  useEffect(() => {
    playAlert();
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const toastX = characterX + 48 * scale + 16;
  const toastY = characterY + 48 * scale - 20;

  return (
    <div
      style={{
        position: 'fixed',
        left: toastX,
        top: toastY,
        background: '#fffde6',
        border: '3px solid #cc4444',
        borderLeft: '6px solid #cc4444',
        padding: '10px 28px 10px 12px',
        fontFamily: '"Courier New", monospace',
        fontSize: 12,
        color: '#333',
        maxWidth: 220,
        pointerEvents: 'auto',
        imageRendering: 'pixelated',
        boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
        zIndex: 9999,
        wordBreak: 'break-word',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 'bold',
          color: '#cc4444',
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        REMINDER
      </div>
      <div>{message}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{
          position: 'absolute',
          top: 4,
          right: 6,
          background: 'none',
          border: 'none',
          fontFamily: '"Courier New", monospace',
          fontSize: 14,
          color: '#999',
          cursor: 'pointer',
          padding: '2px 4px',
          lineHeight: 1,
        }}
      >
        x
      </button>
    </div>
  );
}
