import { SpeechVariant } from '../store';

interface Props {
  text: string;
  x: number;
  y: number;
  variant: SpeechVariant;
}

const VARIANT_COLORS: Record<SpeechVariant, { bg: string; border: string }> = {
  tip: { bg: '#fffde6', border: '#c8c080' },
  reminder: { bg: '#fff0f0', border: '#c08080' },
  alert: { bg: '#ffe0e0', border: '#cc4444' },
  note: { bg: '#f0f8ff', border: '#8080c0' },
};

export function SpeechBubble({ text, x, y, variant }: Props) {
  const colors = VARIANT_COLORS[variant];
  const bubbleX = x - 40;
  const bubbleY = y - 60;

  return (
    <div
      style={{
        position: 'fixed',
        left: bubbleX,
        top: bubbleY,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 4,
        padding: '6px 10px',
        fontSize: 12,
        fontFamily: '"Courier New", monospace',
        color: '#333',
        maxWidth: 200,
        pointerEvents: 'auto',
        imageRendering: 'pixelated',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
        zIndex: 9999,
      }}
    >
      {text}
      {/* Triangle pointer */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          marginLeft: -4,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${colors.border}`,
        }}
      />
    </div>
  );
}
