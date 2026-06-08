import { useEffect } from 'react';
import { useClippyStore } from '../store';
import { playAlert } from '../systems/SoundSystem';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ReminderToast({ message, onDismiss }: Props) {
  const { characterX, characterY, scale } = useClippyStore();

  useEffect(() => {
    playAlert();
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const half = (48 * scale) / 2;
  const toastX = characterX + half + 16;
  const toastY = characterY + half - 20;

  return (
    <div
      style={{
        position: 'fixed',
        left: toastX,
        top: toastY,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(200, 50, 50, 0.15)',
        borderLeft: '3px solid #ff3b30',
        borderRadius: 10,
        padding: '10px 32px 10px 14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 12,
        color: '#333',
        maxWidth: 240,
        pointerEvents: 'auto',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
        zIndex: 9999,
        wordBreak: 'break-word',
        animation: 'toastIn 0.2s ease-out',
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#ff3b30',
          letterSpacing: 0.3,
          marginBottom: 4,
        }}
      >
        Reminder
      </div>
      <div>{message}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          background: 'rgba(0, 0, 0, 0.05)',
          border: 'none',
          borderRadius: '50%',
          width: 18,
          height: 18,
          fontSize: 11,
          color: '#888',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        x
      </button>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
