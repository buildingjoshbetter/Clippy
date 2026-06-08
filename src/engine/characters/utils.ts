import { DrawState, EyeMode } from './index';

export function drawStandardEyes(
  ctx: CanvasRenderingContext2D,
  state: DrawState,
  mode: EyeMode,
  opts: {
    eyeY?: number;
    eyeSpacing?: number;
    eyeRadius?: number;
    pupilRadius?: number;
    outlineColor?: string;
    irisColor?: string;
  } = {}
) {
  const eyeY = opts.eyeY ?? -12;
  const eyeSpacing = opts.eyeSpacing ?? 5;
  const eyeRadius = opts.eyeRadius ?? (mode === 'surprised' ? 8 : 7);
  const pupilR = opts.pupilRadius ?? 3.2;
  const outlineColor = opts.outlineColor ?? '#2a2a30';
  const irisColor = opts.irisColor ?? '#222228';

  const blinkCycle = state.time % 4000;
  const isBlinking = blinkCycle > 3850;

  if (mode === 'happy') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 2.5, eyeY + 1);
    ctx.lineTo(-eyeSpacing, eyeY - 2);
    ctx.lineTo(-eyeSpacing + 2.5, eyeY + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - 2.5, eyeY + 1);
    ctx.lineTo(eyeSpacing, eyeY - 2);
    ctx.lineTo(eyeSpacing + 2.5, eyeY + 1);
    ctx.stroke();
    return;
  }

  if (mode === 'dead') {
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 1.5;
    const s = 2.5;
    for (const side of [-1, 1]) {
      const cx = side * eyeSpacing;
      ctx.beginPath(); ctx.moveTo(cx - s, eyeY - s); ctx.lineTo(cx + s, eyeY + s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s, eyeY - s); ctx.lineTo(cx - s, eyeY + s); ctx.stroke();
    }
    return;
  }

  if (mode === 'sleeping') {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-eyeSpacing - 3, eyeY); ctx.lineTo(-eyeSpacing + 3, eyeY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eyeSpacing - 3, eyeY); ctx.lineTo(eyeSpacing + 3, eyeY); ctx.stroke();
    return;
  }

  for (const side of [-1, 1]) {
    const ex = side * eyeSpacing + state.eyeOffsetX * 0.25;
    ctx.fillStyle = 'rgba(40, 40, 50, 0.2)';
    ctx.beginPath(); ctx.arc(ex, eyeY + 0.5, eyeRadius + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fdfdff';
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  if (!isBlinking) {
    let pupilOffX = state.eyeOffsetX;
    let pupilOffY = state.eyeOffsetY;
    if (mode === 'looking_up') { pupilOffX = 1.5; pupilOffY = -2.5; }

    for (const side of [-1, 1]) {
      const ex = side * eyeSpacing + pupilOffX;
      const ey = eyeY + pupilOffY;
      ctx.fillStyle = irisColor;
      ctx.beginPath(); ctx.arc(ex, ey, pupilR + 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0a0e';
      ctx.beginPath(); ctx.arc(ex, ey, pupilR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(ex - 1.0, ey - 1.2, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(ex + 0.7, ey + 0.8, 0.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.arc(side * eyeSpacing, eyeY, 4, 0, Math.PI); ctx.stroke();
    }
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function blendColor(base: string, tint: string, amount: number): string {
  const b = hexToRgb(base);
  const t = hexToRgb(tint);
  if (!b || !t) return base;
  const r = Math.round(b.r + (t.r - b.r) * amount);
  const g = Math.round(b.g + (t.g - b.g) * amount);
  const bl = Math.round(b.b + (t.b - b.b) * amount);
  return `rgb(${r},${g},${bl})`;
}

export function getEyeMode(animState: string): EyeMode {
  switch (animState) {
    case 'petting': return 'happy';
    case 'victory': return 'happy';
    case 'overheat': return 'dead';
    case 'sleeping': return 'sleeping';
    case 'dragging': return 'surprised';
    default: return 'normal';
  }
}
