import { SpeechVariant } from '../store';

interface Props {
  text: string;
  x: number;
  y: number;
  variant: SpeechVariant;
}

const VARIANT_COLORS: Record<SpeechVariant, { bg: string; border: string; accent: string }> = {
  tip: { bg: 'rgba(255, 255, 255, 0.92)', border: 'rgba(0, 0, 0, 0.08)', accent: '#666' },
  reminder: { bg: 'rgba(255, 245, 245, 0.92)', border: 'rgba(200, 80, 80, 0.15)', accent: '#c05050' },
  alert: { bg: 'rgba(255, 235, 235, 0.92)', border: 'rgba(200, 50, 50, 0.2)', accent: '#cc3333' },
  note: { bg: 'rgba(240, 248, 255, 0.92)', border: 'rgba(80, 80, 180, 0.12)', accent: '#6060b0' },
};

export function SpeechBubble({ text, x, y, variant }: Props) {
  const colors = VARIANT_COLORS[variant];
  const bubbleX = x - 230;
  const bubbleY = y - 20;

  return (
    <div
      style={{
        position: 'fixed',
        left: Math.max(8, bubbleX),
        top: bubbleY,
        background: colors.bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '8px 14px',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        maxWidth: 220,
        pointerEvents: 'auto',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        zIndex: 9999,
        lineHeight: 1.4,
        animation: 'speechIn 0.15s ease-out',
      }}
    >
      {text}
      {/* Tail pointing right toward the character */}
      <div
        style={{
          position: 'absolute',
          right: -6,
          top: '50%',
          marginTop: -5,
          width: 10,
          height: 10,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderTop: 'none',
          borderLeft: 'none',
          transform: 'rotate(-45deg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />
      <style>{`
        @keyframes speechIn {
          from { opacity: 0; transform: translateX(4px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
