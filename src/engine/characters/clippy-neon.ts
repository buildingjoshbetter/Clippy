import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const clippyNeon: CharacterStyle = {
  id: 'clippy-neon',
  name: 'Neon Clippy',
  description: 'Cyberpunk glowing paperclip with neon green wireframe and pulsing glow effects.',
  colors: { primary: '#44ff88', secondary: '#00ffff', accent: '#1a3a2a' },
  personality: {
    speechStyle: 'energetic',
    catchphrase: "Let's hack the mainframe. Just kidding. Unless?",
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    typing: [
      'Entering the matrix...',
      'Hack the planet!',
      'Neon dreams and semicolons.',
    ],
    idle: [
      "Let's hack the mainframe. Just kidding. Unless?",
      'Glowing in standby mode...',
      'My circuits are tingling.',
    ],
    greeting: [
      'System online. Glow initiated.',
      'Booting up... with style.',
      'Welcome to the neon grid.',
    ],
  },
  draw(ctx: CanvasRenderingContext2D, state: DrawState) {
    ctx.save();

    // Apply body transforms
    ctx.scale(state.bodyStretch, state.bodySquash);

    const t = state.time;
    const animState = state.animState;

    // --- Determine glow color and intensity based on anim state ---
    let glowColor = '#44ff88';
    let glowIntensity = 6;
    let wireColor = '#44ff88';
    let accentColor = '#00ffff';

    // Idle: pulse glow
    if (animState === 'idle') {
      const pulse = Math.sin(t * 0.003) * 0.5 + 0.5; // 0..1
      glowIntensity = 4 + pulse * 4; // 4..8
    }

    // Overheat: red/orange glow
    if (animState === 'overheat') {
      glowColor = '#ff4400';
      wireColor = blendColor('#44ff88', '#ff4400', 0.7);
      accentColor = '#ff6600';
      glowIntensity = 10;
    }

    // Victory: rainbow cycle
    if (animState === 'victory') {
      const hue = (t * 0.2) % 360;
      glowColor = `hsl(${hue}, 100%, 60%)`;
      wireColor = `hsl(${hue}, 100%, 60%)`;
      accentColor = `hsl(${(hue + 120) % 360}, 100%, 60%)`;
      glowIntensity = 10;
    }

    // Petting: warm pink/magenta
    if (animState === 'petting') {
      glowColor = '#ff44cc';
      wireColor = blendColor('#44ff88', '#ff44cc', 0.6);
      accentColor = '#ff88ff';
      glowIntensity = 8;
    }

    // Sleeping: dim glow
    if (animState === 'sleeping') {
      glowIntensity = 2 + Math.sin(t * 0.001) * 1;
      wireColor = blendColor('#44ff88', '#1a3a2a', 0.4);
    }

    // Thinking: cyan pulse
    if (animState === 'thinking') {
      const pulse = Math.sin(t * 0.005) * 0.5 + 0.5;
      glowColor = '#00ffff';
      wireColor = blendColor('#44ff88', '#00ffff', pulse * 0.5);
      glowIntensity = 5 + pulse * 4;
    }

    // Dragging: brighter
    if (animState === 'dragging') {
      glowIntensity = 10;
    }

    // Chasing: fast pulse
    if (animState === 'chasing') {
      const fast = Math.sin(t * 0.01) * 0.5 + 0.5;
      glowIntensity = 5 + fast * 6;
    }

    // Waving: gentle cyan/green shift
    if (animState === 'waving') {
      const wave = Math.sin(t * 0.004) * 0.5 + 0.5;
      wireColor = blendColor('#44ff88', '#00ffff', wave * 0.4);
      glowIntensity = 6 + wave * 2;
    }

    // Wobble: jittery intensity
    if (animState === 'wobble') {
      glowIntensity = 5 + Math.random() * 4;
    }

    // Typing_along: steady bright
    if (animState === 'typing_along') {
      const blink = Math.sin(t * 0.008) > 0.3 ? 1 : 0.6;
      glowIntensity = 7 * blink + 3;
    }

    // Stretching: elongated glow
    if (animState === 'stretching') {
      glowIntensity = 6 + Math.sin(t * 0.004) * 2;
    }

    // Paper_unroll: scan line effect handled in wire drawing
    if (animState === 'paper_unroll') {
      glowIntensity = 7;
    }

    // --- Body tilt ---
    ctx.rotate(state.bodyTilt);

    // --- Draw dark body underneath ---
    ctx.save();
    ctx.strokeStyle = '#1a3a2a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    drawClipWirePath(ctx, t, animState);
    ctx.stroke();
    ctx.restore();

    // --- Draw neon wire with glow ---
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowIntensity;
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    drawClipWirePath(ctx, t, animState);
    ctx.stroke();

    // Second pass for stronger glow effect
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    drawClipWirePath(ctx, t, animState);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // --- Victory: jump offset ---
    let eyeYOffset = 0;
    if (animState === 'victory') {
      eyeYOffset = -Math.abs(Math.sin(t * 0.006)) * 3;
    }

    // --- Draw eyes ---
    ctx.save();
    ctx.translate(0, eyeYOffset);
    const eyeMode: EyeMode = getEyeMode(animState);

    // Green iris glow for eyes
    ctx.shadowColor = '#44ff88';
    ctx.shadowBlur = 3;
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -10,
      eyeSpacing: 5,
      eyeRadius: 5.5,
      pupilRadius: 2.5,
      outlineColor: '#22aa55',
      irisColor: '#117744',
    });
    ctx.shadowBlur = 0;
    ctx.restore();

    // --- State-specific overlays ---

    // Petting: blush marks
    if (animState === 'petting') {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ff66cc';
      ctx.shadowColor = '#ff44cc';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.ellipse(-9, -6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(9, -6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sleeping: Z particles
    if (animState === 'sleeping') {
      ctx.save();
      ctx.font = '6px monospace';
      ctx.fillStyle = '#44ff88';
      ctx.shadowColor = '#44ff88';
      ctx.shadowBlur = 4;
      const zFloat = Math.sin(t * 0.002) * 3;
      ctx.globalAlpha = 0.6 + Math.sin(t * 0.003) * 0.3;
      ctx.fillText('Z', 10, -18 + zFloat);
      ctx.font = '4px monospace';
      ctx.fillText('z', 14, -22 + zFloat * 0.7);
      ctx.restore();
    }

    // Overheat: warning sparks
    if (animState === 'overheat') {
      ctx.save();
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 6;
      for (let i = 0; i < 3; i++) {
        const angle = (t * 0.005 + i * 2.1) % (Math.PI * 2);
        const dist = 16 + Math.sin(t * 0.008 + i) * 4;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist - 4;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Waving: animated arm-like appendage
    if (animState === 'waving') {
      ctx.save();
      const waveAngle = Math.sin(t * 0.008) * 0.4;
      ctx.translate(12, -6);
      ctx.rotate(waveAngle);
      ctx.strokeStyle = wireColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowIntensity;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, -4);
      ctx.lineTo(7, -8);
      ctx.stroke();
      ctx.restore();
    }

    // Typing_along: data stream particles
    if (animState === 'typing_along') {
      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 3;
      ctx.font = '4px monospace';
      ctx.globalAlpha = 0.6;
      const chars = '01';
      for (let i = 0; i < 4; i++) {
        const yPos = ((t * 0.03 + i * 12) % 30) - 15;
        const xPos = -18 + i * 9;
        const ch = chars[(Math.floor(t * 0.01) + i) % 2];
        ctx.fillText(ch, xPos, yPos);
      }
      ctx.restore();
    }

    ctx.restore();
  },
};

/**
 * Draws the paperclip wire path as a series of bezier curves.
 * Classic paperclip shape: elongated oval with inner loop.
 */
function drawClipWirePath(
  ctx: CanvasRenderingContext2D,
  time: number,
  animState: string
) {
  // Idle bob
  let yOff = 0;
  if (animState === 'idle') {
    yOff = Math.sin(time * 0.002) * 1.5;
  }
  if (animState === 'chasing') {
    yOff = Math.sin(time * 0.01) * 2;
  }

  // Paperclip shape: outer loop going up-right, then inner loop
  // The shape is roughly 16px wide, 38px tall centered around (0, yOff)

  const top = -20 + yOff;
  const bot = 18 + yOff;
  const left = -8;
  const right = 8;
  const innerLeft = -4;
  const innerRight = 4;
  const innerTop = -14 + yOff;
  const innerBot = 12 + yOff;

  // Outer path: start bottom-left, go up, curve over top, down right side, curve bottom
  ctx.moveTo(left, bot - 4);

  // Left side going up
  ctx.lineTo(left, top + 6);

  // Top curve (left to right)
  ctx.bezierCurveTo(left, top, right, top, right, top + 6);

  // Right side going down
  ctx.lineTo(right, bot - 6);

  // Bottom curve (right to inner-right)
  ctx.bezierCurveTo(right, bot, innerRight, bot, innerRight, bot - 6);

  // Inner right going up
  ctx.lineTo(innerRight, innerTop + 4);

  // Inner top curve (right to left)
  ctx.bezierCurveTo(innerRight, innerTop, innerLeft, innerTop, innerLeft, innerTop + 4);

  // Inner left going down
  ctx.lineTo(innerLeft, innerBot - 4);

  // Inner bottom curve back to start area
  ctx.bezierCurveTo(innerLeft, innerBot, left, innerBot, left, innerBot - 4);
}
