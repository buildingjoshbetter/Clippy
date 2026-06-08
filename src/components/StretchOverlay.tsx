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
        background: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        zIndex: 10000,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#fffde6',
          textShadow: '4px 4px 0px rgba(0,0,0,0.5)',
          imageRendering: 'pixelated',
          letterSpacing: 4,
          marginBottom: 16,
        }}
      >
        TIME TO STRETCH!
      </div>
      <div
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 16,
          color: '#e0e0d0',
          textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
        }}
      >
        Stand up, reach for the sky, touch your toes
      </div>
      <div
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          color: '#999',
          marginTop: 24,
        }}
      >
        click anywhere to dismiss
      </div>
    </div>
  );
}
