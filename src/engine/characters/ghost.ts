import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const ghost: CharacterStyle = {
  id: 'ghost',
  name: 'Ghost',
  description: 'A friendly ghost floating around your desktop. Classic sheet shape with a wavy bottom edge and an adorable simple face. Occasionally flickers transparent.',
  colors: { primary: '#F8F8FF', secondary: '#E6E6FA', accent: '#FFB6C1' },
  personality: {
    speechStyle: 'casual',
    catchphrase: 'BOO! ...sorry, habit.',
  },
  eyeStyle: 'dot',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Just passing through... the fourth wall.',
      'I can see through your code. Literally.',
      'Being dead is pretty chill actually.',
      'BOO! ...sorry, habit.',
    ],
    petting: [
      "You're touching a ghost and I'm okay with it.",
      "I'd blush if I had blood circulation.",
      'Warm hands... I forgot what that feels like.',
    ],
    typing_along: [
      'Ghost-writing, get it?',
      'I haunt this codebase now.',
      'These keys feel so... corporeal.',
    ],
    victory: [
      'We slayed it! ...pun intended.',
      '*spins excitedly through a wall*',
      'Even the afterlife celebrates this!',
    ],
    overheat: [
      "Ghosts aren't supposed to feel heat...",
      'Is this what hell is like?',
      'I came back from the dead just to overheat?!',
    ],
  },
  draw: (ctx: CanvasRenderingContext2D, state: DrawState) => {
    ctx.save();

    // Apply body squash/stretch
    ctx.scale(state.bodyStretch, state.bodySquash);

    // Apply body tilt
    if (state.bodyTilt !== 0) {
      ctx.rotate(state.bodyTilt);
    }

    const t = state.time;
    const animState = state.animState;

    // Animation state variables
    let floatOffset = Math.sin(t * 0.003) * 2.5;
    let waveSpeed = 0.005;
    let waveAmp = 2.5;
    let bodyAlpha = 0.85;
    let glowIntensity = 0.15 + Math.sin(t * 0.002) * 0.05;
    let blushAlpha = 0;
    let overheatTint = 0;
    let rotation = 0;
    let scaleBoost = 1.0;
    let stretchX = 1.0;
    let trailAlpha = 0;
    let armLeftAngle = 0;
    let armRightAngle = 0;
    let showArms = false;
    let waveArm = false;
    let victoryJump = 0;
    let flickerAlpha = 1.0;
    let eyeMode: 'normal' | 'happy' | 'dead' | 'sleeping' | 'surprised' | 'tilde' = 'normal';

    // Ghostly flicker (occasional transparency pulse in idle)
    const flickerCycle = t % 8000;
    if (flickerCycle > 7600 && flickerCycle < 7900 && animState === 'idle') {
      flickerAlpha = 0.4 + Math.sin((flickerCycle - 7600) * 0.03) * 0.3;
    }

    switch (animState) {
      case 'idle':
        // defaults: gentle float, wave, transparency pulse
        break;
      case 'dragging':
        floatOffset = Math.sin(t * 0.01) * 4;
        waveSpeed = 0.012;
        waveAmp = 4;
        eyeMode = 'surprised';
        break;
      case 'wobble':
        floatOffset = Math.sin(t * 0.008) * 3;
        rotation = Math.sin(t * 0.015) * 0.15;
        waveAmp = 3.5;
        break;
      case 'chasing':
        floatOffset = Math.sin(t * 0.006) * 1.5;
        stretchX = 1.3;
        trailAlpha = 0.3;
        waveSpeed = 0.01;
        break;
      case 'petting':
        floatOffset = Math.sin(t * 0.004) * 1;
        blushAlpha = 0.4 + Math.sin(t * 0.005) * 0.1;
        glowIntensity = 0.25 + Math.sin(t * 0.003) * 0.08;
        eyeMode = 'happy';
        break;
      case 'typing_along':
        floatOffset = Math.sin(t * 0.004) * 1.5;
        showArms = true;
        armLeftAngle = Math.sin(t * 0.025) * 0.3;
        armRightAngle = Math.sin(t * 0.025 + Math.PI) * 0.3;
        break;
      case 'overheat':
        overheatTint = 0.35 + Math.sin(t * 0.006) * 0.1;
        floatOffset = Math.sin(t * 0.015) * 3;
        rotation = Math.sin(t * 0.02) * 0.12;
        waveSpeed = 0.015;
        waveAmp = 4;
        eyeMode = 'dead';
        break;
      case 'thinking':
        floatOffset = Math.sin(t * 0.002) * 1.5 - 1;
        eyeMode = 'normal'; // will use looking_up from offset
        break;
      case 'victory':
        rotation = (t * 0.01) % (Math.PI * 2);
        scaleBoost = 1.1 + Math.sin(t * 0.01) * 0.05;
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 4;
        eyeMode = 'happy';
        break;
      case 'stretching':
        stretchX = 1.0 + Math.sin(t * 0.004) * 0.2;
        floatOffset = Math.sin(t * 0.003) * 2 - 2;
        waveAmp = 3;
        break;
      case 'paper_unroll':
        floatOffset = Math.sin(t * 0.005) * 1.5;
        showArms = true;
        armLeftAngle = -0.4;
        armRightAngle = 0.4;
        break;
      case 'sleeping':
        floatOffset = 3; // sinks down
        waveAmp = 0.5; // nearly stops waving
        waveSpeed = 0.001;
        bodyAlpha = 0.7;
        eyeMode = 'sleeping';
        break;
      case 'waving':
        floatOffset = Math.sin(t * 0.004) * 2;
        waveArm = true;
        showArms = true;
        armRightAngle = -0.8 - Math.sin(t * 0.012) * 0.5;
        break;
    }

    // Apply transforms
    ctx.translate(0, floatOffset);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }
    if (scaleBoost !== 1.0) {
      ctx.scale(scaleBoost, scaleBoost);
    }
    if (stretchX !== 1.0) {
      ctx.scale(stretchX, 1.0 / stretchX);
    }
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }

    // Apply global alpha for flicker
    ctx.globalAlpha = flickerAlpha;

    // ====== GHOST TRAIL (chasing state) ======
    if (trailAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = trailAlpha * 0.4;
      ctx.translate(8, 1);
      drawGhostBody(ctx, t, 0.003, 1.5, 0.5, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = trailAlpha * 0.2;
      ctx.translate(15, 2);
      ctx.scale(0.7, 0.7);
      drawGhostBody(ctx, t, 0.002, 1.0, 0.4, 0, 0);
      ctx.restore();
    }

    // ====== MAIN GHOST BODY ======
    drawGhostBody(ctx, t, waveSpeed, waveAmp, bodyAlpha, overheatTint, glowIntensity);

    // ====== ARMS (typing, paper_unroll, waving) ======
    if (showArms) {
      ctx.save();
      // Left arm
      ctx.save();
      ctx.translate(-10, -2);
      ctx.rotate(armLeftAngle);
      ctx.fillStyle = `rgba(240, 240, 255, ${bodyAlpha * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(-3, 0, 4, 2.5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 200, 230, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(10, -2);
      ctx.rotate(armRightAngle);
      ctx.fillStyle = `rgba(240, 240, 255, ${bodyAlpha * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(3, 0, 4, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 200, 230, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    // ====== FACE ======
    const faceY = -5;

    // Eyes: simple large black dots
    if (eyeMode === 'happy') {
      // ^^ arcs
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-5, faceY, 3, Math.PI + 0.4, -0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, faceY, 3, Math.PI + 0.4, -0.4);
      ctx.stroke();
    } else if (eyeMode === 'dead') {
      // X X eyes
      ctx.strokeStyle = '#cc3333';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      const s = 2.5;
      for (const side of [-5, 5]) {
        ctx.beginPath(); ctx.moveTo(side - s, faceY - s); ctx.lineTo(side + s, faceY + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(side + s, faceY - s); ctx.lineTo(side - s, faceY + s); ctx.stroke();
      }
    } else if (eyeMode === 'sleeping') {
      // Tilde-like sleeping eyes ~_~
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (const side of [-5, 5]) {
        ctx.beginPath();
        ctx.moveTo(side - 3, faceY);
        ctx.quadraticCurveTo(side - 1.5, faceY - 1.5, side, faceY);
        ctx.quadraticCurveTo(side + 1.5, faceY + 1.5, side + 3, faceY);
        ctx.stroke();
      }
      // Z's for sleeping
      const zOffset = Math.sin(t * 0.002) * 1.5;
      ctx.fillStyle = 'rgba(100, 100, 140, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 10, faceY - 8 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13, faceY - 12 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 15, faceY - 15 + zOffset * 0.5);
    } else if (eyeMode === 'surprised') {
      // Larger dot eyes for surprise
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-5 + state.eyeOffsetX * 0.2, faceY + state.eyeOffsetY * 0.2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5 + state.eyeOffsetX * 0.2, faceY + state.eyeOffsetY * 0.2, 5, 0, Math.PI * 2);
      ctx.fill();
      // Small white highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-6, faceY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, faceY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal: large solid black dot eyes with subtle eye offset tracking
      let offX = state.eyeOffsetX * 0.15;
      let offY = state.eyeOffsetY * 0.15;
      if (animState === 'thinking') {
        offX = 1;
        offY = -1.5;
      }
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-5 + offX, faceY + offY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5 + offX, faceY + offY, 4, 0, Math.PI * 2);
      ctx.fill();
      // Small highlight dots for life
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(-6 + offX, faceY - 1.2 + offY, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4 + offX, faceY - 1.2 + offY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ====== MOUTH (small "O") ======
    if (eyeMode !== 'sleeping') {
      const mouthY = faceY + 7;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, mouthY, 2.2, 0, Math.PI * 2);
      ctx.stroke();
      // Slight inner shadow
      ctx.fillStyle = 'rgba(50, 50, 60, 0.3)';
      ctx.beginPath();
      ctx.arc(0, mouthY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // ====== BLUSH MARKS (always visible slightly, intensifies on petting) ======
    const baseBlush = 0.15;
    const finalBlush = Math.max(baseBlush, blushAlpha);
    ctx.fillStyle = `rgba(255, 182, 193, ${finalBlush})`;
    ctx.beginPath();
    ctx.ellipse(-9, faceY + 3, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, faceY + 3, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
};

/**
 * Draws the main ghost body shape: rounded dome top flowing into a wavy bottom edge.
 */
function drawGhostBody(
  ctx: CanvasRenderingContext2D,
  time: number,
  waveSpeed: number,
  waveAmp: number,
  alpha: number,
  overheatTint: number,
  glowIntensity: number
) {
  ctx.save();

  // Determine base color with overheat tint
  let baseR = 245, baseG = 245, baseB = 255;
  if (overheatTint > 0) {
    baseR = Math.round(245 + (255 - 245) * overheatTint);
    baseG = Math.round(245 - 100 * overheatTint);
    baseB = Math.round(255 - 150 * overheatTint);
  }

  // Inner glow gradient (radial from center)
  const glowGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, 20);
  glowGrad.addColorStop(0, `rgba(230, 230, 250, ${glowIntensity})`);
  glowGrad.addColorStop(0.5, `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`);
  glowGrad.addColorStop(1, `rgba(${baseR - 15}, ${baseG - 15}, ${baseB - 10}, ${alpha * 0.9})`);

  // Build ghost body path
  ctx.beginPath();

  // Start at left side, dome top
  const bodyTop = -18;
  const bodyLeft = -14;
  const bodyRight = 14;
  const bodyBottom = 14;

  // Left side going up
  ctx.moveTo(bodyLeft, bodyBottom);
  ctx.lineTo(bodyLeft, -2);

  // Dome top (bezier for smooth rounded top)
  ctx.bezierCurveTo(bodyLeft, bodyTop - 2, bodyLeft + 4, bodyTop - 6, 0, bodyTop - 6);
  ctx.bezierCurveTo(bodyRight - 4, bodyTop - 6, bodyRight, bodyTop - 2, bodyRight, -2);

  // Right side going down
  ctx.lineTo(bodyRight, bodyBottom);

  // Wavy bottom edge (4 undulating curves using sine)
  const segments = 4;
  const segWidth = (bodyRight - bodyLeft) / segments;
  for (let i = segments; i >= 0; i--) {
    const x = bodyLeft + i * segWidth;
    const phase = time * waveSpeed + i * 1.2;
    const yOff = Math.sin(phase) * waveAmp;
    if (i === segments) {
      // Already at bodyRight, bodyBottom — just start wavy from here
    } else {
      const prevX = bodyLeft + (i + 1) * segWidth;
      const midX = (prevX + x) / 2;
      const prevPhase = time * waveSpeed + (i + 1) * 1.2;
      const prevYOff = Math.sin(prevPhase) * waveAmp;
      ctx.quadraticCurveTo(midX, bodyBottom + (prevYOff + yOff) / 2 + waveAmp * 0.5, x, bodyBottom + yOff);
    }
  }

  ctx.closePath();

  // Fill with gradient
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Subtle outer stroke
  ctx.strokeStyle = `rgba(200, 200, 220, ${alpha * 0.5})`;
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // Inner highlight (top of dome)
  const highlightGrad = ctx.createRadialGradient(-3, bodyTop - 2, 1, 0, bodyTop, 10);
  highlightGrad.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
  highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.ellipse(-2, bodyTop + 2, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Edge glow effect
  ctx.shadowColor = `rgba(200, 200, 255, ${glowIntensity})`;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = `rgba(220, 220, 255, ${glowIntensity * 0.6})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, -4, 12, 16, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}
