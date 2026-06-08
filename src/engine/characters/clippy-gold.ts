import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const clippyGold: CharacterStyle = {
  id: 'clippy-gold',
  name: 'Golden Clippy',
  description: 'A gold-plated luxury paperclip. Formal, elegant, and utterly refined.',
  colors: { primary: '#d4a844', secondary: '#e8cc66', accent: '#a07820' },
  personality: {
    speechStyle: 'formal',
    catchphrase: 'One does not simply push to main without tests.',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      'Greetings, {name}. Shall we produce something magnificent?',
      'Ah, {name}. I have been polished and prepared for your arrival.',
      'Good day. Shall we craft something worthy of gilding?',
    ],
    idle: [
      'I could be a luxury bookmark, you know. Yet here I am.',
      'Even gold requires the occasional polish. Do carry on.',
      'Patience is a virtue I was forged with.',
      'One does not rush elegance.',
    ],
    error: [
      'How... undignified. Let us rectify this at once.',
      'A blemish upon our otherwise impeccable record.',
      'This shall not stand. Permit me to investigate.',
    ],
    success: [
      'Splendid. As one would expect from our collaboration.',
      'Excellence delivered, as promised.',
      'Another triumph befitting our caliber.',
    ],
  },
  draw(ctx: CanvasRenderingContext2D, state: DrawState) {
    ctx.save();

    // Apply body transforms
    ctx.scale(state.bodyStretch, state.bodySquash);

    // Apply body tilt
    if (state.bodyTilt) {
      ctx.rotate(state.bodyTilt);
    }

    const t = state.time;
    const animState = state.animState;

    // Colors
    const goldBody = '#d4a844';
    const goldHighlight = '#e8cc66';
    const goldShadow = '#a07820';
    const goldDark = '#7a5a14';

    // State-specific modifiers
    let bodyColor = goldBody;
    let glowIntensity = 0;
    let verticalOffset = 0;

    switch (animState) {
      case 'victory': {
        glowIntensity = 0.6 + 0.4 * Math.sin(t * 0.02);
        verticalOffset = -Math.abs(Math.sin(t * 0.008)) * 4;
        break;
      }
      case 'petting': {
        bodyColor = blendColor(goldBody, '#c8820a', 0.25);
        break;
      }
      case 'overheat': {
        const pulse = Math.sin(t * 0.01) * 0.3;
        bodyColor = blendColor(goldBody, '#ff4400', 0.2 + pulse);
        break;
      }
      case 'dragging': {
        verticalOffset = Math.sin(t * 0.03) * 1.5;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.15);
        break;
      }
      case 'chasing': {
        verticalOffset = Math.sin(t * 0.02) * 2;
        break;
      }
      case 'stretching': {
        const stretchPhase = Math.sin(t * 0.005);
        ctx.scale(1 + stretchPhase * 0.05, 1 - stretchPhase * 0.03);
        break;
      }
      case 'sleeping': {
        verticalOffset = Math.sin(t * 0.003) * 1;
        break;
      }
      case 'waving': {
        ctx.rotate(Math.sin(t * 0.012) * 0.08);
        break;
      }
      case 'thinking': {
        verticalOffset = Math.sin(t * 0.004) * 1.5;
        break;
      }
      default:
        break;
    }

    ctx.translate(0, verticalOffset);

    // Idle shimmer: a highlight that travels along the wire
    const shimmerPos = (t * 0.001) % 1.0; // 0..1 cycles

    // === DRAW PAPERCLIP BODY (wire shape) ===
    // Classic Clippy is an S-shaped paperclip wire

    // Outer shadow
    ctx.save();
    ctx.shadowColor = 'rgba(120, 80, 10, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // Main wire path (outer loop of paperclip)
    ctx.beginPath();
    ctx.moveTo(-6, 20);
    ctx.bezierCurveTo(-12, 20, -14, 16, -14, 10);
    ctx.lineTo(-14, -10);
    ctx.bezierCurveTo(-14, -18, -10, -22, -2, -22);
    ctx.bezierCurveTo(6, -22, 10, -18, 10, -10);
    ctx.lineTo(10, 10);
    ctx.bezierCurveTo(10, 14, 8, 16, 4, 16);
    ctx.bezierCurveTo(0, 16, -2, 14, -2, 10);
    ctx.lineTo(-2, -6);
    ctx.bezierCurveTo(-2, -10, 0, -12, 2, -12);

    // Wire style - gold gradient stroke
    const wireGrad = ctx.createLinearGradient(-14, -22, 10, 20);
    wireGrad.addColorStop(0, goldHighlight);
    wireGrad.addColorStop(0.3, bodyColor);
    wireGrad.addColorStop(0.6, goldShadow);
    wireGrad.addColorStop(0.8, bodyColor);
    wireGrad.addColorStop(1, goldHighlight);

    ctx.strokeStyle = wireGrad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // Inner highlight stroke (thinner, brighter)
    ctx.beginPath();
    ctx.moveTo(-6, 20);
    ctx.bezierCurveTo(-12, 20, -14, 16, -14, 10);
    ctx.lineTo(-14, -10);
    ctx.bezierCurveTo(-14, -18, -10, -22, -2, -22);
    ctx.bezierCurveTo(6, -22, 10, -18, 10, -10);
    ctx.lineTo(10, 10);
    ctx.bezierCurveTo(10, 14, 8, 16, 4, 16);
    ctx.bezierCurveTo(0, 16, -2, 14, -2, 10);
    ctx.lineTo(-2, -6);
    ctx.bezierCurveTo(-2, -10, 0, -12, 2, -12);

    const innerGrad = ctx.createLinearGradient(-14, -22, 10, 20);
    innerGrad.addColorStop(0, goldHighlight);
    innerGrad.addColorStop(0.5, '#f5e088');
    innerGrad.addColorStop(1, goldHighlight);

    ctx.strokeStyle = innerGrad;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // === SHIMMER EFFECT (idle and always subtle) ===
    // Traveling highlight along the wire
    const shimmerAlpha = animState === 'idle'
      ? 0.55 + 0.2 * Math.sin(t * 0.003)
      : animState === 'victory'
        ? 0.8
        : 0.25;

    // Compute shimmer position along the wire path
    const shimmerAngle = shimmerPos * Math.PI * 2;
    // Approximate positions along the wire
    const sx = -2 + Math.cos(shimmerAngle) * 10;
    const sy = -2 + Math.sin(shimmerAngle) * 16;

    const shimmerGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
    shimmerGrad.addColorStop(0, `rgba(255, 240, 180, ${shimmerAlpha})`);
    shimmerGrad.addColorStop(0.5, `rgba(248, 220, 120, ${shimmerAlpha * 0.4})`);
    shimmerGrad.addColorStop(1, 'rgba(248, 220, 120, 0)');

    ctx.fillStyle = shimmerGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    // === VICTORY FLASH ===
    if (animState === 'victory') {
      const flashAlpha = 0.3 + 0.3 * Math.sin(t * 0.015);
      const flashGrad = ctx.createRadialGradient(0, -5, 0, 0, -5, 24);
      flashGrad.addColorStop(0, `rgba(255, 245, 180, ${flashAlpha})`);
      flashGrad.addColorStop(0.6, `rgba(232, 204, 102, ${flashAlpha * 0.5})`);
      flashGrad.addColorStop(1, 'rgba(232, 204, 102, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(0, -5, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // === FACE AREA (white oval behind eyes) ===
    ctx.save();
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(-2, -12, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle gold border for face
    ctx.strokeStyle = goldShadow;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // === EYES ===
    const eyeMode: EyeMode = getEyeMode(animState);
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -12,
      eyeSpacing: 5,
      eyeRadius: 5.5,
      pupilRadius: 2.5,
      outlineColor: '#5a4010',
      irisColor: '#8B6508',
    });

    // === PETTING: warm amber cheeks ===
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(200, 140, 20, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-8, -9, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, -9, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // === MOUTH (small, subtle) ===
    if (animState === 'victory' || animState === 'petting') {
      // Smile
      ctx.strokeStyle = '#6b4c10';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-2, -6, 3, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (animState === 'overheat') {
      // Open mouth
      ctx.fillStyle = '#4a2800';
      ctx.beginPath();
      ctx.ellipse(-2, -5, 2.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (animState === 'sleeping') {
      // Gentle curve
      ctx.strokeStyle = '#8a6820';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.quadraticCurveTo(-2, -5, 0, -6);
      ctx.stroke();
    } else if (animState !== 'dead') {
      // Neutral slight smile
      ctx.strokeStyle = '#7a5a14';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(-2, -7, 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // === SLEEPING Z's ===
    if (animState === 'sleeping') {
      const zAlpha = 0.4 + 0.3 * Math.sin(t * 0.004);
      ctx.fillStyle = `rgba(180, 140, 40, ${zAlpha})`;
      ctx.font = 'bold 6px sans-serif';
      const zOffset = Math.sin(t * 0.003) * 2;
      ctx.fillText('z', 10, -18 + zOffset);
      ctx.font = 'bold 4px sans-serif';
      ctx.fillText('z', 13, -22 + zOffset * 0.7);
    }

    // === THINKING DOTS ===
    if (animState === 'thinking') {
      for (let i = 0; i < 3; i++) {
        const dotAlpha = 0.3 + 0.5 * Math.sin(t * 0.006 + i * 1.2);
        ctx.fillStyle = `rgba(180, 140, 40, ${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(12 + i * 4, -18 - i * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === TYPING_ALONG musical notes ===
    if (animState === 'typing_along') {
      const noteAlpha = 0.4 + 0.3 * Math.sin(t * 0.008);
      ctx.fillStyle = `rgba(160, 120, 32, ${noteAlpha})`;
      ctx.font = '6px sans-serif';
      const noteY = -20 + Math.sin(t * 0.005) * 2;
      ctx.fillText('♪', 10, noteY);
    }

    // === PAPER_UNROLL effect ===
    if (animState === 'paper_unroll') {
      const unrollProgress = (Math.sin(t * 0.004) + 1) * 0.5;
      ctx.strokeStyle = `rgba(160, 120, 32, 0.6)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(6, 8);
      ctx.lineTo(6, 8 + unrollProgress * 12);
      ctx.lineTo(14, 8 + unrollProgress * 12);
      ctx.lineTo(14, 8);
      ctx.stroke();
      // Paper lines
      if (unrollProgress > 0.3) {
        ctx.strokeStyle = 'rgba(160, 120, 32, 0.3)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
          const ly = 10 + i * 3;
          if (ly < 8 + unrollProgress * 12) {
            ctx.beginPath();
            ctx.moveTo(7, ly);
            ctx.lineTo(13, ly);
            ctx.stroke();
          }
        }
      }
    }

    // === WAVING arm ===
    if (animState === 'waving') {
      const waveAngle = Math.sin(t * 0.012) * 0.5;
      ctx.save();
      ctx.translate(10, -5);
      ctx.rotate(waveAngle - 0.3);
      ctx.strokeStyle = goldBody;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6, -8);
      ctx.stroke();
      // Hand
      ctx.fillStyle = goldHighlight;
      ctx.beginPath();
      ctx.arc(6, -8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // === IDLE BOB ===
    if (animState === 'idle') {
      // Subtle idle bob already handled by shimmer; add a tiny glow pulse
      const pulseAlpha = 0.08 + 0.06 * Math.sin(t * 0.004);
      const pulseGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 22);
      pulseGrad.addColorStop(0, `rgba(232, 204, 102, ${pulseAlpha})`);
      pulseGrad.addColorStop(1, 'rgba(232, 204, 102, 0)');
      ctx.fillStyle = pulseGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // === OVERHEAT steam ===
    if (animState === 'overheat') {
      for (let i = 0; i < 3; i++) {
        const steamY = -24 - Math.abs(Math.sin(t * 0.005 + i)) * 6;
        const steamAlpha = 0.3 - i * 0.08;
        ctx.strokeStyle = `rgba(200, 160, 40, ${steamAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4 + i * 4, -20);
        ctx.quadraticCurveTo(-3 + i * 4 + Math.sin(t * 0.008 + i) * 2, steamY, -2 + i * 4, steamY - 3);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
