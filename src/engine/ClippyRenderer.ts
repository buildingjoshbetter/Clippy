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

// ---------------------------------------------------------------------------
// Helper: draw the base paperclip body wire shape
// ---------------------------------------------------------------------------
function drawBody(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  colors: { body: string; highlight: string; shadow: string },
  tintColor?: string,
  tintAmount?: number
) {
  const bodyColor = tintColor
    ? blendColor(colors.body, tintColor, tintAmount || 0)
    : colors.body;
  const highlightColor = tintColor
    ? blendColor(colors.highlight, tintColor, (tintAmount || 0) * 0.5)
    : colors.highlight;
  const shadowColor = tintColor
    ? blendColor(colors.shadow, tintColor, (tintAmount || 0) * 0.5)
    : colors.shadow;

  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-4, 16);
  ctx.lineTo(-4, -10);
  ctx.arc(0, -10, 4, Math.PI, 0, false);
  ctx.lineTo(4, 12);
  ctx.arc(0, 12, 4, 0, Math.PI, false);
  ctx.lineTo(-4, -6);
  ctx.arc(-1, -6, 3, Math.PI, 0, true);
  ctx.lineTo(1, 8);
  ctx.stroke();

  // Highlight edge
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.lineTo(-5, -8);
  ctx.stroke();

  // Shadow edge
  ctx.strokeStyle = shadowColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(5, -8);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Helper: draw arm nubs (small lines extending from body)
// ---------------------------------------------------------------------------
function drawArms(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  leftAngle: number, // radians from horizontal
  rightAngle: number,
  leftLength: number,
  rightLength: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Left arm from about (-5, 0)
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-5 - Math.cos(leftAngle) * leftLength, 0 - Math.sin(leftAngle) * leftLength);
  ctx.stroke();

  // Right arm from about (5, 0)
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(5 + Math.cos(rightAngle) * rightLength, 0 - Math.sin(rightAngle) * rightLength);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Helper: draw eyes with various expressions
// ---------------------------------------------------------------------------
type EyeMode = 'normal' | 'happy' | 'dead' | 'sleeping' | 'surprised' | 'looking_up';

function drawEyes(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  mode: EyeMode,
  pupilScale: number = 1,
  forceBlink: boolean = false
) {
  const eyeY = -12;
  const eyeSpacing = 5;
  const blinkCycle = state.time % 4000;
  const isBlinking = forceBlink || blinkCycle > 3850;

  if (mode === 'happy') {
    // Happy ^^ eyes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    // Left happy eye
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 2.5, eyeY + 1);
    ctx.lineTo(-eyeSpacing, eyeY - 2);
    ctx.lineTo(-eyeSpacing + 2.5, eyeY + 1);
    ctx.stroke();
    // Right happy eye
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - 2.5, eyeY + 1);
    ctx.lineTo(eyeSpacing, eyeY - 2);
    ctx.lineTo(eyeSpacing + 2.5, eyeY + 1);
    ctx.stroke();
    return;
  }

  if (mode === 'dead') {
    // X X eyes
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 1.5;
    const s = 2.5;
    // Left X
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - s, eyeY - s);
    ctx.lineTo(-eyeSpacing + s, eyeY + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing + s, eyeY - s);
    ctx.lineTo(-eyeSpacing - s, eyeY + s);
    ctx.stroke();
    // Right X
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - s, eyeY - s);
    ctx.lineTo(eyeSpacing + s, eyeY + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeSpacing + s, eyeY - s);
    ctx.lineTo(eyeSpacing - s, eyeY + s);
    ctx.stroke();
    return;
  }

  if (mode === 'sleeping') {
    // Horizontal lines (closed eyes, relaxed)
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 3, eyeY);
    ctx.lineTo(-eyeSpacing + 3, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - 3, eyeY);
    ctx.lineTo(eyeSpacing + 3, eyeY);
    ctx.stroke();
    return;
  }

  // Normal / surprised / looking_up — draw whites first
  const eyeRadius = mode === 'surprised' ? 5 : 4;

  // Left eye white
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpacing + state.eyeOffsetX * 0.3, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Right eye white
  ctx.beginPath();
  ctx.arc(eyeSpacing + state.eyeOffsetX * 0.3, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!isBlinking) {
    let pupilOffX = state.eyeOffsetX;
    let pupilOffY = state.eyeOffsetY;

    if (mode === 'looking_up') {
      pupilOffX = 1.5;
      pupilOffY = -2;
    }

    const pupilR = 2 * pupilScale;

    // Left pupil
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + pupilOffX, eyeY + pupilOffY, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Right pupil
    ctx.beginPath();
    ctx.arc(eyeSpacing + pupilOffX, eyeY + pupilOffY, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + pupilOffX - 0.5, eyeY + pupilOffY - 0.5, 0.7 * pupilScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing + pupilOffX - 0.5, eyeY + pupilOffY - 0.5, 0.7 * pupilScale, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blink lines
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
}

// ---------------------------------------------------------------------------
// Helper: draw eyebrows
// ---------------------------------------------------------------------------
type BrowMode = 'neutral' | 'angry' | 'worried' | 'raised';

function drawEyebrows(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  mode: BrowMode
) {
  const eyeY = -12;
  const eyeSpacing = 5;
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  switch (mode) {
    case 'angry':
      // Angled down toward center (determined/angry)
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 3, eyeY - 7);
      ctx.lineTo(-eyeSpacing + 2, eyeY - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 2, eyeY - 4);
      ctx.lineTo(eyeSpacing + 3, eyeY - 7);
      ctx.stroke();
      break;

    case 'worried':
      // Angled up toward center (worried/sad)
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 3, eyeY - 4);
      ctx.lineTo(-eyeSpacing + 2, eyeY - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 2, eyeY - 7);
      ctx.lineTo(eyeSpacing + 3, eyeY - 4);
      ctx.stroke();
      break;

    case 'raised':
      // Both raised high
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 3, eyeY - 7);
      ctx.lineTo(-eyeSpacing + 2, eyeY - 7.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 2, eyeY - 7.5);
      ctx.lineTo(eyeSpacing + 3, eyeY - 7);
      ctx.stroke();
      break;

    default: // neutral
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 3, eyeY - 5);
      ctx.lineTo(-eyeSpacing + 2, eyeY - 5.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 2, eyeY - 5.5);
      ctx.lineTo(eyeSpacing + 3, eyeY - 5);
      ctx.stroke();
      break;
  }
}

// ---------------------------------------------------------------------------
// Color blending utility
// ---------------------------------------------------------------------------
function blendColor(base: string, tint: string, amount: number): string {
  const b = hexToRgb(base);
  const t = hexToRgb(tint);
  if (!b || !t) return base;
  const r = Math.round(b.r + (t.r - b.r) * amount);
  const g = Math.round(b.g + (t.g - b.g) * amount);
  const bl = Math.round(b.b + (t.b - b.b) * amount);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

// ---------------------------------------------------------------------------
// Main draw function
// ---------------------------------------------------------------------------
export function drawClippy(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  variant: string = 'classic'
) {
  const colors = COLORS[variant as keyof typeof COLORS] || COLORS.classic;

  ctx.save();
  ctx.translate(24, 24);

  switch (state.animState) {
    case 'idle':
      drawIdle(ctx, state, colors);
      break;
    case 'dragging':
      drawDragging(ctx, state, colors);
      break;
    case 'wobble':
      drawWobble(ctx, state, colors);
      break;
    case 'chasing':
      drawChasing(ctx, state, colors);
      break;
    case 'petting':
      drawPetting(ctx, state, colors);
      break;
    case 'typing_along':
      drawTypingAlong(ctx, state, colors);
      break;
    case 'overheat':
      drawOverheat(ctx, state, colors);
      break;
    case 'thinking':
      drawThinking(ctx, state, colors);
      break;
    case 'victory':
      drawVictory(ctx, state, colors);
      break;
    case 'stretching':
      drawStretching(ctx, state, colors);
      break;
    case 'paper_unroll':
      drawPaperUnroll(ctx, state, colors);
      break;
    case 'sleeping':
      drawSleeping(ctx, state, colors);
      break;
    case 'waving':
      drawWaving(ctx, state, colors);
      break;
    default:
      drawIdle(ctx, state, colors);
      break;
  }

  ctx.restore();
}

// ===========================================================================
// STATE RENDERERS
// ===========================================================================

function drawIdle(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Breathing
  const breathe = Math.sin(state.time / 800) * 0.5;
  ctx.scale(state.bodyStretch, state.bodySquash + breathe * 0.02);

  // Occasional random look-around: every ~6s, drift eyes slightly
  const lookPhase = (state.time % 6000) / 6000;
  let extraEyeX = 0;
  let extraEyeY = 0;
  if (lookPhase > 0.85 && lookPhase < 0.95) {
    extraEyeX = Math.sin(lookPhase * Math.PI * 20) * 1.5;
    extraEyeY = Math.cos(lookPhase * Math.PI * 14) * 0.8;
  }

  drawBody(ctx, colors);

  // Override eye offset slightly for look-around
  const modState = { ...state, eyeOffsetX: state.eyeOffsetX + extraEyeX, eyeOffsetY: state.eyeOffsetY + extraEyeY };
  drawEyes(ctx, modState, 'normal');
  drawEyebrows(ctx, 'neutral');
}

function drawDragging(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Squashed body (shorter, wider)
  ctx.scale(1.2, 0.8);

  drawBody(ctx, colors);

  // Surprised eyes (larger pupils)
  drawEyes(ctx, state, 'surprised', 1.3);
  drawEyebrows(ctx, 'raised');
}

function drawWobble(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Wobble handled by bodySquash/bodyStretch from the hook
  ctx.scale(state.bodyStretch, state.bodySquash);

  drawBody(ctx, colors);
  drawEyes(ctx, state, 'normal');
  drawEyebrows(ctx, 'worried');
}

function drawChasing(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Tilted in direction of movement + bounce
  const bounce = Math.abs(Math.sin(state.time / 150)) * 2;
  ctx.rotate((state.bodyTilt * Math.PI) / 180);
  ctx.translate(0, -bounce);

  // Slight lean forward
  ctx.scale(0.95, 1.05);

  drawBody(ctx, colors);
  drawEyes(ctx, state, 'normal', 0.9);
  drawEyebrows(ctx, 'angry'); // determined

  // Small leg/bounce lines beneath
  ctx.strokeStyle = colors.shadow;
  ctx.lineWidth = 1;
  const legPhase = state.time / 100;
  ctx.beginPath();
  ctx.moveTo(-3, 17);
  ctx.lineTo(-3 + Math.sin(legPhase) * 3, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, 17);
  ctx.lineTo(3 + Math.sin(legPhase + Math.PI) * 3, 20);
  ctx.stroke();
}

function drawPetting(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Slight side rocking
  const rock = Math.sin(state.time / 500) * 3;
  ctx.rotate((rock * Math.PI) / 180);

  // Pink tint
  drawBody(ctx, colors, '#ff88aa', 0.25);

  // Happy eyes ^^
  drawEyes(ctx, state, 'happy');

  // Small blush marks
  ctx.fillStyle = 'rgba(255, 100, 130, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-8, -9, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -9, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTypingAlong(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Body bobs slightly
  const bob = Math.sin(state.time / 200) * 1;
  ctx.translate(0, bob);

  drawBody(ctx, colors);
  drawEyes(ctx, state, 'normal', 0.8);
  drawEyebrows(ctx, 'neutral');

  // Arm nubs animate up/down rapidly
  const armPhase = state.time / 80;
  const leftY = Math.sin(armPhase) * 3;
  const rightY = Math.sin(armPhase + Math.PI) * 3;

  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Left arm nub
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.lineTo(-9, 2 + leftY);
  ctx.stroke();

  // Right arm nub
  ctx.beginPath();
  ctx.moveTo(5, 2);
  ctx.lineTo(9, 2 + rightY);
  ctx.stroke();

  // Tiny "keyboard" dots at arm tips
  ctx.fillStyle = colors.shadow;
  ctx.fillRect(-10, 4 + leftY, 2, 1);
  ctx.fillRect(9, 4 + rightY, 2, 1);
}

function drawOverheat(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Red tint that intensifies over time
  const intensity = Math.min(1, (state.time % 10000) / 5000) * 0.6;
  // Trembling
  const trembleX = (Math.random() - 0.5) * 1.5;
  const trembleY = (Math.random() - 0.5) * 1.5;
  ctx.translate(trembleX, trembleY);

  drawBody(ctx, colors, '#ff2200', intensity);

  // Eyes as X's or swirls depending on intensity
  if (intensity > 0.3) {
    drawEyes(ctx, state, 'dead');
  } else {
    // Swirl eyes — draw spiral
    ctx.strokeStyle = '#cc3300';
    ctx.lineWidth = 1;
    const eyeY = -12;
    const eyeSpacing = 5;
    for (const xOff of [-eyeSpacing, eyeSpacing]) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.3) {
        const r = a * 0.5;
        const px = xOff + Math.cos(a + state.time / 200) * r;
        const py = eyeY + Math.sin(a + state.time / 200) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  drawEyebrows(ctx, 'worried');
}

function drawThinking(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  drawBody(ctx, colors);

  // Eyes look up-right
  drawEyes(ctx, state, 'looking_up');
  drawEyebrows(ctx, 'raised');

  // One arm to chin area
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.quadraticCurveTo(-7, -4, -3, -7);
  ctx.stroke();

  // Small dot at "hand" near chin
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.arc(-3, -7, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Thought dots above (three dots in ascending arc)
  const dotAlpha = (Math.sin(state.time / 400) + 1) / 2;
  ctx.fillStyle = `rgba(100, 100, 100, ${0.4 + dotAlpha * 0.4})`;
  ctx.beginPath();
  ctx.arc(6, -18, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9, -20, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -22, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawVictory(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Jump up oscillation
  const jump = Math.abs(Math.sin(state.time / 250)) * 5;
  ctx.translate(0, -jump);

  // Gold flash overlay
  const flash = (Math.sin(state.time / 150) + 1) / 2;
  drawBody(ctx, colors, '#ffd700', flash * 0.3);

  drawEyes(ctx, state, 'happy');

  // Arms up in celebration
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Left arm up
  const armWave = Math.sin(state.time / 200) * 0.3;
  ctx.beginPath();
  ctx.moveTo(-5, -2);
  ctx.lineTo(-9, -10 + armWave);
  ctx.stroke();

  // Right arm up
  ctx.beginPath();
  ctx.moveTo(5, -2);
  ctx.lineTo(9, -10 - armWave);
  ctx.stroke();

  // Arm tip dots
  ctx.fillStyle = colors.highlight;
  ctx.beginPath();
  ctx.arc(-9, -10 + armWave, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9, -10 - armWave, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawStretching(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Elongated body (tall and thin)
  const stretchAmount = 0.7 + Math.sin(state.time / 600) * 0.15;
  ctx.scale(0.8, 1.3 + stretchAmount * 0.2);

  // Green tint for relaxation
  drawBody(ctx, colors, '#44cc66', 0.2);

  drawEyes(ctx, state, 'happy');

  // Arms stretched up
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(-6, -14);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.lineTo(6, -14);
  ctx.stroke();
}

function drawPaperUnroll(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Body leaning slightly
  ctx.rotate(-0.1);

  drawBody(ctx, colors);
  drawEyes(ctx, state, 'normal');
  drawEyebrows(ctx, 'neutral');

  // One arm extended holding a wavy line (paper)
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Extended arm
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(12, -3);
  ctx.stroke();

  // Wavy paper line
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, -5);
  const scrollOffset = state.time / 200;
  for (let i = 0; i < 10; i++) {
    const px = 12 + i * 1.2;
    const py = -5 + Math.sin(i * 0.8 + scrollOffset) * 2;
    ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Paper edge shadow
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(12, -3);
  for (let i = 0; i < 10; i++) {
    const px = 12 + i * 1.2;
    const py = -3 + Math.sin(i * 0.8 + scrollOffset) * 2;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawSleeping(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  // Body sags — slightly shorter and tilted
  const sag = Math.sin(state.time / 1200) * 1;
  ctx.scale(1.02, 0.96);
  ctx.rotate((sag * Math.PI) / 180);

  drawBody(ctx, colors);

  // Eyes as horizontal lines (sleeping)
  drawEyes(ctx, state, 'sleeping');

  // Small "drool" or mouth line to emphasize sleep
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-2, -6);
  ctx.quadraticCurveTo(0, -4.5, 2, -6);
  ctx.stroke();
}

function drawWaving(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  state: DrawState,
  colors: { body: string; highlight: string; shadow: string }
) {
  drawBody(ctx, colors);
  drawEyes(ctx, state, 'normal');
  drawEyebrows(ctx, 'neutral');

  // One arm up and waving side to side
  const waveAngle = Math.sin(state.time / 200) * 0.5;
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Waving arm (right side)
  ctx.save();
  ctx.translate(5, -4);
  ctx.rotate(-0.8 + waveAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -8);
  ctx.stroke();

  // Hand at top
  ctx.fillStyle = colors.highlight;
  ctx.beginPath();
  ctx.arc(0, -8, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Static left arm (resting)
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.lineTo(-7, 5);
  ctx.stroke();
}
