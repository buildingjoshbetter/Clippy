import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const clippy: CharacterStyle = {
  id: 'clippy',
  name: 'Clippy',
  description: 'The classic silver paperclip assistant. Sarcastic, iconic, and always ready to help — whether you want it or not.',
  colors: { primary: '#b4b4be', secondary: '#d0d0da', accent: '#8c8c96' },
  personality: {
    speechStyle: 'sarcastic',
    catchphrase: 'It looks like you\'re writing code. Would you like help?',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'It looks like you\'re staring at the screen. Would you like me to stare back?',
      'I see you\'re procrastinating. Can I help with that?',
      'You haven\'t typed in a while. Everything okay, champ?',
    ],
    typing_along: [
      'It looks like you\'re writing code. Would you like help?',
      'Interesting variable name. Bold choice.',
      'I would have written that differently, but sure.',
      'Are you sure about that semicolon?',
    ],
    overheat: [
      'I\'m literally melting here.',
      'This is fine. Everything is fine.',
      'My wire is getting... bendy.',
    ],
    victory: [
      'See? You just needed a little paperclip energy.',
      'I helped. You\'re welcome.',
      'Another victory for the clip!',
    ],
    thinking: [
      'Let me think... no wait, that\'s your job.',
      'Hmm, have you tried turning it off and on again?',
      'I\'m not just a pretty paperclip, you know.',
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
    const eyeMode: EyeMode = getEyeMode(animState);

    // Breathing animation
    const breathe = 1 + Math.sin(t * 0.003) * 0.008;
    ctx.scale(1, breathe);

    // State-specific transforms
    let jumpOffset = 0;
    let colorTint = '';
    let tintAmount = 0;
    let armAngleLeft = 0;
    let armAngleRight = 0;
    let shakeMagnitude = 0;

    switch (animState) {
      case 'idle': {
        // Subtle look-around every 6 seconds
        const lookCycle = t % 6000;
        if (lookCycle > 5500 && lookCycle < 5800) {
          ctx.translate(Math.sin(lookCycle * 0.02) * 0.3, 0);
        }
        break;
      }
      case 'dragging': {
        ctx.rotate(Math.sin(t * 0.01) * 0.05);
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.15);
        break;
      }
      case 'chasing': {
        const bounce = Math.abs(Math.sin(t * 0.012)) * 2;
        ctx.translate(0, -bounce);
        ctx.rotate(state.bodyTilt * 0.3);
        break;
      }
      case 'petting': {
        colorTint = '#ffaacc';
        tintAmount = 0.2 + Math.sin(t * 0.005) * 0.05;
        ctx.rotate(Math.sin(t * 0.004) * 0.04);
        break;
      }
      case 'typing_along': {
        const bob = Math.sin(t * 0.015) * 1.5;
        ctx.translate(0, bob);
        armAngleLeft = Math.sin(t * 0.03) * 0.4;
        armAngleRight = Math.sin(t * 0.03 + Math.PI) * 0.4;
        break;
      }
      case 'overheat': {
        colorTint = '#ff3300';
        tintAmount = 0.25 + Math.sin(t * 0.01) * 0.1;
        shakeMagnitude = 1.2;
        ctx.translate(
          Math.random() * shakeMagnitude - shakeMagnitude / 2,
          Math.random() * shakeMagnitude - shakeMagnitude / 2
        );
        break;
      }
      case 'thinking': {
        armAngleRight = -0.6;
        break;
      }
      case 'victory': {
        jumpOffset = -Math.abs(Math.sin(t * 0.008)) * 6;
        ctx.translate(0, jumpOffset);
        armAngleLeft = -1.2 + Math.sin(t * 0.01) * 0.2;
        armAngleRight = -1.2 + Math.sin(t * 0.01 + 0.5) * 0.2;
        break;
      }
      case 'stretching': {
        const stretchPhase = Math.sin(t * 0.004);
        ctx.scale(1 + stretchPhase * 0.05, 1 - stretchPhase * 0.03);
        armAngleLeft = -0.8 + stretchPhase * 0.3;
        armAngleRight = -0.8 - stretchPhase * 0.3;
        break;
      }
      case 'paper_unroll': {
        ctx.rotate(Math.sin(t * 0.006) * 0.03);
        armAngleLeft = -0.5;
        armAngleRight = 0.5;
        break;
      }
      case 'sleeping': {
        ctx.translate(0, 2);
        ctx.rotate(Math.sin(t * 0.001) * 0.02);
        break;
      }
      case 'waving': {
        armAngleRight = -1.0 + Math.sin(t * 0.012) * 0.6;
        break;
      }
    }

    // --- SHADOW ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- PAPERCLIP BODY ---
    // Metallic gradient
    const bodyGrad = ctx.createLinearGradient(-8, -18, 8, 18);
    let primary = '#b4b4be';
    let secondary = '#d0d0da';
    let accent = '#8c8c96';

    if (colorTint && tintAmount > 0) {
      primary = blendColor(primary, colorTint, tintAmount);
      secondary = blendColor(secondary, colorTint, tintAmount);
      accent = blendColor(accent, colorTint, tintAmount);
    }

    bodyGrad.addColorStop(0, secondary);
    bodyGrad.addColorStop(0.3, primary);
    bodyGrad.addColorStop(0.7, primary);
    bodyGrad.addColorStop(1, accent);

    // Victory gold flash
    if (animState === 'victory') {
      const flashPhase = (Math.sin(t * 0.006) + 1) / 2;
      if (flashPhase > 0.8) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
      }
    }

    // Outer wire path
    ctx.lineWidth = 4;
    ctx.strokeStyle = bodyGrad;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Left side going up
    ctx.moveTo(-5, 18);
    ctx.lineTo(-5, -12);
    // Top curve (bezier)
    ctx.bezierCurveTo(-5, -18, 5, -18, 5, -12);
    // Right side going down
    ctx.lineTo(5, 14);
    // Bottom curve
    ctx.bezierCurveTo(5, 20, -5, 20, -5, 14);
    // Inner left going up
    ctx.lineTo(-2, -8);
    // Inner top curve
    ctx.bezierCurveTo(-2, -12, 2, -12, 2, -8);
    // Inner right going down
    ctx.lineTo(2, 10);
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Highlight on left edge (thinner, lighter stroke)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-5, 16);
    ctx.lineTo(-5, -10);
    ctx.bezierCurveTo(-5, -16, -1, -17, 0, -15);
    ctx.stroke();

    // Inner highlight
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-2, 8);
    ctx.lineTo(-2, -6);
    ctx.stroke();

    // --- ARMS ---
    ctx.lineWidth = 3;
    ctx.strokeStyle = bodyGrad;
    ctx.lineCap = 'round';

    // Left arm
    ctx.save();
    ctx.translate(-5, 0);
    ctx.rotate(armAngleLeft);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -2);
    ctx.stroke();
    // Hand nub
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(-5, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right arm
    ctx.save();
    ctx.translate(5, 0);
    ctx.rotate(armAngleRight);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, -2);
    ctx.stroke();
    // Hand nub
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- EYEBROWS ---
    if (animState === 'thinking') {
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, -19);
      ctx.lineTo(-3, -20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -20);
      ctx.lineTo(7, -18.5);
      ctx.stroke();
    } else if (animState === 'overheat') {
      ctx.strokeStyle = '#aa2200';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-7, -18);
      ctx.lineTo(-3, -19.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -19.5);
      ctx.lineTo(7, -18);
      ctx.stroke();
    } else {
      // Default subtle eyebrows
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-7, -19);
      ctx.lineTo(-3, -19.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -19.5);
      ctx.lineTo(7, -19);
      ctx.stroke();
    }

    // --- EYES ---
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -12,
      eyeSpacing: 5,
      eyeRadius: 7,
      pupilRadius: 3.2,
      outlineColor: '#2a2a30',
      irisColor: '#222228',
    });

    // --- PETTING BLUSH ---
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(255, 150, 180, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-7, -8, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, -8, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- SLEEPING MOUTH / ZZZ ---
    if (animState === 'sleeping') {
      // Small mouth line
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2, -5);
      ctx.lineTo(2, -5);
      ctx.stroke();

      // Zzz
      const zPhase = (t * 0.001) % 3;
      ctx.fillStyle = `rgba(100, 100, 120, ${0.5 + Math.sin(t * 0.002) * 0.2})`;
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 8 + zPhase, -14 - zPhase * 2);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 10 + zPhase * 0.5, -18 - zPhase * 2);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 11 + zPhase * 0.3, -21 - zPhase * 2);
    }

    // --- THINKING DOTS ---
    if (animState === 'thinking') {
      const dotPhase = t * 0.003;
      for (let i = 0; i < 3; i++) {
        const alpha = (Math.sin(dotPhase + i * 0.8) + 1) / 2 * 0.6 + 0.2;
        ctx.fillStyle = `rgba(100, 100, 120, ${alpha})`;
        ctx.beginPath();
        ctx.arc(10 + i * 4, -18 - i * 3, 1.5 - i * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- CHASING LEGS ---
    if (animState === 'chasing') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const legPhase = t * 0.02;
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-3, 18);
      ctx.lineTo(-4 + Math.sin(legPhase) * 2, 23);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(3, 18);
      ctx.lineTo(4 + Math.sin(legPhase + Math.PI) * 2, 23);
      ctx.stroke();
    }

    // --- OVERHEAT SWIRLS ---
    if (animState === 'overheat') {
      const swirlPhase = t * 0.005;
      ctx.strokeStyle = 'rgba(200, 50, 0, 0.3)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        const angle = swirlPhase + i * (Math.PI * 2 / 3);
        const sx = Math.cos(angle) * 12;
        const sy = -5 + Math.sin(angle) * 4 - i * 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 1.5);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
