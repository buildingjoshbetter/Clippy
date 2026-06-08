export interface DrawState {
  eyeOffsetX: number;
  eyeOffsetY: number;
  bodyTilt: number;
  bodySquash: number;
  bodyStretch: number;
  animState: string;
  time: number;
}

const COLORS = {
  classic: { body: '#b4b4be', highlight: '#d0d0da', shadow: '#8c8c96' },
  gold: { body: '#d4a844', highlight: '#e8cc66', shadow: '#a07820' },
  dark: { body: '#4a4a54', highlight: '#6a6a74', shadow: '#2a2a34' },
  neon: { body: '#44ff88', highlight: '#88ffbb', shadow: '#22aa55' },
  rainbow: { body: '#b4b4be', highlight: '#d0d0da', shadow: '#8c8c96' },
  rusty: { body: '#b87040', highlight: '#d89060', shadow: '#885020' },
};

export function drawClippy(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, state: DrawState, variant: string = 'classic') {
  const colors = COLORS[variant as keyof typeof COLORS] || COLORS.classic;

  ctx.save();
  ctx.translate(24, 24);

  // Breathing animation
  const breathe = Math.sin(state.time / 800) * 0.5;
  ctx.scale(state.bodyStretch, state.bodySquash + breathe * 0.02);
  ctx.rotate((state.bodyTilt * Math.PI) / 180);

  // Body: paperclip wire shape - double loop
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Main paperclip shape (simplified for 48x48)
  ctx.beginPath();
  // Outer loop
  ctx.moveTo(-4, 16);
  ctx.lineTo(-4, -10);
  ctx.arc(0, -10, 4, Math.PI, 0, false);
  ctx.lineTo(4, 12);
  ctx.arc(0, 12, 4, 0, Math.PI, false);
  ctx.lineTo(-4, -6);
  // Inner return
  ctx.arc(-1, -6, 3, Math.PI, 0, true);
  ctx.lineTo(1, 8);
  ctx.stroke();

  // Highlight edge
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.lineTo(-5, -8);
  ctx.stroke();

  // Shadow edge
  ctx.strokeStyle = colors.shadow;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(5, -8);
  ctx.stroke();

  // Eyes (positioned at top of paperclip)
  const eyeY = -12;
  const eyeSpacing = 5;

  // Left eye white
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpacing + state.eyeOffsetX * 0.3, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Right eye white
  ctx.beginPath();
  ctx.arc(eyeSpacing + state.eyeOffsetX * 0.3, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blink check
  const blinkCycle = state.time % 4000;
  const isBlinking = blinkCycle > 3850;

  if (!isBlinking) {
    // Left pupil
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + state.eyeOffsetX, eyeY + state.eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Right pupil
    ctx.beginPath();
    ctx.arc(eyeSpacing + state.eyeOffsetX, eyeY + state.eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pupil highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + state.eyeOffsetX - 0.5, eyeY + state.eyeOffsetY - 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing + state.eyeOffsetX - 0.5, eyeY + state.eyeOffsetY - 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blink - draw lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 2, eyeY);
    ctx.lineTo(-eyeSpacing + 2, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - 2, eyeY);
    ctx.lineTo(eyeSpacing + 2, eyeY);
    ctx.stroke();
  }

  // Eyebrows
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(-eyeSpacing - 3, eyeY - 5);
  ctx.lineTo(-eyeSpacing + 2, eyeY - 5.5);
  ctx.stroke();
  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(eyeSpacing - 2, eyeY - 5.5);
  ctx.lineTo(eyeSpacing + 3, eyeY - 5);
  ctx.stroke();

  ctx.restore();
}
