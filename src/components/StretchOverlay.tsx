import { useEffect } from 'react';

interface Props {
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function StretchOverlay({ onDismiss, autoDismissMs = 10000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        zIndex: 10000,
        cursor: 'pointer',
        animation: 'stretchIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 42,
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          letterSpacing: -0.5,
          marginBottom: 12,
        }}
      >
        Time to stretch!
      </div>
      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 400,
        }}
      >
        Stand up, reach for the sky, touch your toes
      </div>
      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: 24,
        }}
      >
        click anywhere to dismiss
      </div>
      <style>{`
        @keyframes stretchIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
