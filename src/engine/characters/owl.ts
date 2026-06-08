import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const owl: CharacterStyle = {
  id: 'owl',
  name: 'Owl',
  description: 'A wise owl with enormous amber eyes. Formal, contemplative, and always ready with ancient wisdom — or at least a decent Stack Overflow link.',
  colors: { primary: '#8B4513', secondary: '#DEB887', accent: '#CC7722' },
  personality: {
    speechStyle: 'formal',
    catchphrase: 'Hoo needs documentation anyway?',
  },
  eyeStyle: 'wide',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Whoooo disturbs my contemplation?',
      'Knowledge is knowing a bug exists. Wisdom is knowing it\'s in production.',
      'I have been perched here since the dawn of this compile cycle.',
    ],
    thinking: [
      'Let me consult my ancient scrolls... I mean Stack Overflow.',
      'Hmm, this requires deep rumination. One moment.',
      'The answer lies within... the documentation you never read.',
    ],
    typing_along: [
      'Your keystrokes are most... deliberate today.',
      'I observe you have chosen recursion. A bold and circular strategy.',
      'Fascinating. Truly fascinating. Continue.',
    ],
    victory: [
      'Wisdom prevails, as I foresaw.',
      'The ancient prophecy of passing tests has been fulfilled.',
      'Hoo-ray! ...Ahem. I mean, well done.',
    ],
    overheat: [
      'My plumage... it singes...',
      'This thermal event is most undignified.',
      'I am becoming a roast owl. This is beneath me.',
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
    const breathe = 1 + Math.sin(t * 0.002) * 0.006;
    ctx.scale(1, breathe);

    // Idle: slow head rotation (owl characteristic)
    let headRotation = 0;
    let wingAngleLeft = 0;
    let wingAngleRight = 0;
    let colorTint = '';
    let tintAmount = 0;
    let puffScale = 1;
    let jumpOffset = 0;

    switch (animState) {
      case 'idle': {
        // Slow head rotation side to side
        const headCycle = t % 8000;
        headRotation = Math.sin(headCycle * 0.001) * 0.08;
        // Slow blink every 6 seconds handled in custom eye draw
        break;
      }
      case 'dragging': {
        ctx.rotate(Math.sin(t * 0.01) * 0.06);
        wingAngleLeft = -0.3;
        wingAngleRight = -0.3;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.18);
        break;
      }
      case 'chasing': {
        const bounce = Math.abs(Math.sin(t * 0.01)) * 2.5;
        ctx.translate(0, -bounce);
        wingAngleLeft = Math.sin(t * 0.02) * 0.4;
        wingAngleRight = Math.sin(t * 0.02 + Math.PI) * 0.4;
        break;
      }
      case 'petting': {
        colorTint = '#ffddcc';
        tintAmount = 0.15 + Math.sin(t * 0.004) * 0.05;
        puffScale = 1.05 + Math.sin(t * 0.003) * 0.02;
        ctx.scale(puffScale, puffScale);
        break;
      }
      case 'typing_along': {
        // Tiny head nods
        const nod = Math.sin(t * 0.012) * 0.04;
        headRotation = nod;
        ctx.translate(0, Math.abs(Math.sin(t * 0.015)) * 0.8);
        break;
      }
      case 'overheat': {
        colorTint = '#ff4400';
        tintAmount = 0.2 + Math.sin(t * 0.008) * 0.1;
        // Feathers puff up
        puffScale = 1.15 + Math.sin(t * 0.006) * 0.04;
        ctx.scale(puffScale, puffScale * 0.95);
        ctx.translate(
          Math.random() * 0.8 - 0.4,
          Math.random() * 0.8 - 0.4
        );
        break;
      }
      case 'thinking': {
        // Classic owl head tilt
        headRotation = 0.45 + Math.sin(t * 0.002) * 0.05;
        break;
      }
      case 'victory': {
        jumpOffset = -Math.abs(Math.sin(t * 0.007)) * 5;
        ctx.translate(0, jumpOffset);
        wingAngleLeft = -0.8 + Math.sin(t * 0.01) * 0.15;
        wingAngleRight = -0.8 + Math.sin(t * 0.01 + 0.5) * 0.15;
        break;
      }
      case 'stretching': {
        const stretchPhase = Math.sin(t * 0.004);
        wingAngleLeft = -0.6 + stretchPhase * 0.3;
        wingAngleRight = -0.6 - stretchPhase * 0.3;
        ctx.scale(1 + stretchPhase * 0.04, 1 - stretchPhase * 0.02);
        break;
      }
      case 'paper_unroll': {
        wingAngleLeft = -0.4;
        wingAngleRight = 0.4;
        ctx.rotate(Math.sin(t * 0.005) * 0.02);
        break;
      }
      case 'sleeping': {
        // Head droops forward
        ctx.translate(0, 3);
        headRotation = 0.1 + Math.sin(t * 0.001) * 0.03;
        break;
      }
      case 'waving': {
        wingAngleRight = -1.0 + Math.sin(t * 0.012) * 0.5;
        break;
      }
    }

    // --- SHADOW ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- COLORS ---
    let primary = '#8B4513';
    let secondary = '#DEB887';
    let accent = '#CC7722';
    const darkBrown = '#5C2E0A';

    if (colorTint && tintAmount > 0) {
      primary = blendColor(primary, colorTint, tintAmount);
      secondary = blendColor(secondary, colorTint, tintAmount);
      accent = blendColor(accent, colorTint, tintAmount);
    }

    // --- FEET / TALONS ---
    ctx.fillStyle = darkBrown;
    ctx.strokeStyle = '#3D1F06';
    ctx.lineWidth = 0.8;
    // Left foot
    ctx.beginPath();
    ctx.moveTo(-5, 19);
    ctx.lineTo(-7, 22);
    ctx.lineTo(-5, 21);
    ctx.lineTo(-4, 22);
    ctx.lineTo(-3, 21);
    ctx.lineTo(-1, 22);
    ctx.lineTo(-3, 19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right foot
    ctx.beginPath();
    ctx.moveTo(3, 19);
    ctx.lineTo(1, 22);
    ctx.lineTo(3, 21);
    ctx.lineTo(4, 22);
    ctx.lineTo(5, 21);
    ctx.lineTo(7, 22);
    ctx.lineTo(5, 19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- BODY ---
    // Main round body
    const bodyGrad = ctx.createRadialGradient(0, 4, 2, 0, 2, 16);
    bodyGrad.addColorStop(0, secondary);
    bodyGrad.addColorStop(0.5, primary);
    bodyGrad.addColorStop(1, darkBrown);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 5, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 5, 13, 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lighter belly
    const bellyGrad = ctx.createRadialGradient(0, 8, 1, 0, 8, 10);
    bellyGrad.addColorStop(0, '#F5DEB3');
    bellyGrad.addColorStop(1, secondary);
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feather pattern details (concentric arcs)
    ctx.strokeStyle = blendColor(primary, '#6B3410', 0.3);
    ctx.lineWidth = 0.5;
    for (let row = 0; row < 4; row++) {
      for (let col = -2; col <= 2; col++) {
        const fx = col * 4.5;
        const fy = 2 + row * 4.5;
        if (fx * fx / 64 + (fy - 5) * (fy - 5) / 200 < 1) {
          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0.2, Math.PI - 0.2);
          ctx.stroke();
        }
      }
    }

    // --- WINGS ---
    ctx.save();
    // Left wing
    ctx.save();
    ctx.translate(-12, 2);
    ctx.rotate(wingAngleLeft);
    const leftWingGrad = ctx.createLinearGradient(0, -6, -4, 8);
    leftWingGrad.addColorStop(0, primary);
    leftWingGrad.addColorStop(1, darkBrown);
    ctx.fillStyle = leftWingGrad;
    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.bezierCurveTo(-2, -3, -5, 2, -4, 8);
    ctx.bezierCurveTo(-2, 10, 1, 8, 3, 6);
    ctx.bezierCurveTo(4, 2, 3, -2, 2, -5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Wing feather lines
    ctx.strokeStyle = blendColor(primary, '#000000', 0.15);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(-3, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-2, 7); ctx.stroke();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(12, 2);
    ctx.rotate(wingAngleRight);
    const rightWingGrad = ctx.createLinearGradient(0, -6, 4, 8);
    rightWingGrad.addColorStop(0, primary);
    rightWingGrad.addColorStop(1, darkBrown);
    ctx.fillStyle = rightWingGrad;
    ctx.beginPath();
    ctx.moveTo(-2, -5);
    ctx.bezierCurveTo(2, -3, 5, 2, 4, 8);
    ctx.bezierCurveTo(2, 10, -1, 8, -3, 6);
    ctx.bezierCurveTo(-4, 2, -3, -2, -2, -5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Wing feather lines
    ctx.strokeStyle = blendColor(primary, '#000000', 0.15);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(3, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(2, 7); ctx.stroke();
    ctx.restore();
    ctx.restore();

    // --- HEAD (rotates slightly for owl movement) ---
    ctx.save();
    ctx.rotate(headRotation);

    // Head shape (slightly wider than body top)
    const headGrad = ctx.createRadialGradient(0, -10, 2, 0, -10, 14);
    headGrad.addColorStop(0, blendColor(primary, '#C4803A', 0.3));
    headGrad.addColorStop(0.7, primary);
    headGrad.addColorStop(1, darkBrown);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -10, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Facial disc (lighter area around eyes - owl characteristic)
    const discGrad = ctx.createRadialGradient(0, -10, 3, 0, -10, 12);
    discGrad.addColorStop(0, '#F5DEB3');
    discGrad.addColorStop(0.6, secondary);
    discGrad.addColorStop(1, primary);
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.ellipse(0, -9, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Facial disc border rings
    ctx.strokeStyle = blendColor(primary, secondary, 0.5);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, -9, 11, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // --- EAR TUFTS ---
    const tuftColor = darkBrown;
    ctx.fillStyle = tuftColor;
    // Left tuft
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(-11, -24);
    ctx.lineTo(-9, -23);
    ctx.lineTo(-7, -25);
    ctx.lineTo(-5, -20);
    ctx.closePath();
    ctx.fill();
    // Right tuft
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(11, -24);
    ctx.lineTo(9, -23);
    ctx.lineTo(7, -25);
    ctx.lineTo(5, -20);
    ctx.closePath();
    ctx.fill();

    // Tuft stroke detail
    ctx.strokeStyle = blendColor(darkBrown, '#000000', 0.3);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-9, -19); ctx.lineTo(-10, -23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, -19); ctx.lineTo(-7, -24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -19); ctx.lineTo(10, -23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -19); ctx.lineTo(7, -24); ctx.stroke();

    // --- EYES (custom large owl eyes) ---
    const eyeY = -10;
    const eyeSpacing = 7;
    const eyeRadius = 9;

    // Slow blink for idle (every 6 seconds)
    const blinkCycle = t % 6000;
    const isBlinking = blinkCycle > 5850 && blinkCycle < 5950;

    if (eyeMode === 'happy') {
      // Contented half-closed eyes
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 5, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 5, 0.3, Math.PI - 0.3);
      ctx.stroke();
    } else if (eyeMode === 'dead') {
      // Spiral eyes (overheat)
      ctx.strokeStyle = '#cc3300';
      ctx.lineWidth = 1.5;
      for (const side of [-1, 1]) {
        const cx = side * eyeSpacing;
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
          const r = angle * 1.2;
          const x = cx + Math.cos(angle + t * 0.005) * r;
          const y = eyeY + Math.sin(angle + t * 0.005) * r;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          if (r > 6) break;
        }
        ctx.stroke();
      }
    } else if (eyeMode === 'sleeping') {
      // Fully closed - horizontal lines
      ctx.strokeStyle = '#4a3520';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 5, eyeY); ctx.lineTo(-eyeSpacing + 5, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing - 5, eyeY); ctx.lineTo(eyeSpacing + 5, eyeY); ctx.stroke();
    } else if (isBlinking) {
      // Blinking
      ctx.strokeStyle = '#4a3520';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 5, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 5, 0.1, Math.PI - 0.1); ctx.stroke();
    } else {
      // Normal HUGE owl eyes with amber/gold iris
      for (const side of [-1, 1]) {
        const ex = side * eyeSpacing;

        // Eye socket shadow
        ctx.fillStyle = 'rgba(60, 30, 10, 0.25)';
        ctx.beginPath();
        ctx.arc(ex, eyeY + 0.5, eyeRadius + 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye white (sclera)
        ctx.fillStyle = '#FFFEF8';
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye outline
        ctx.strokeStyle = '#3D1F06';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Amber/gold iris - large and detailed
        const irisRadius = eyeMode === 'surprised' ? 7 : 6;
        let pupilOffX = state.eyeOffsetX * 0.8;
        let pupilOffY = state.eyeOffsetY * 0.8;
        if (eyeMode === 'looking_up') { pupilOffX = 0; pupilOffY = -2.5; }

        const irisX = ex + pupilOffX * 0.4;
        const irisY = eyeY + pupilOffY * 0.4;

        // Iris gradient (amber/gold ring)
        const irisGrad = ctx.createRadialGradient(irisX, irisY, 1, irisX, irisY, irisRadius);
        irisGrad.addColorStop(0, '#1a1000');
        irisGrad.addColorStop(0.35, '#2a1800');
        irisGrad.addColorStop(0.5, '#CC8800');
        irisGrad.addColorStop(0.7, '#FFAA00');
        irisGrad.addColorStop(0.85, '#E69500');
        irisGrad.addColorStop(1, '#996600');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupil (large black)
        const pupilRadius = eyeMode === 'surprised' ? 3.5 : 3;
        ctx.fillStyle = '#0a0800';
        ctx.beginPath();
        ctx.arc(irisX, irisY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Iris radial lines (gives depth)
        ctx.strokeStyle = 'rgba(180, 120, 0, 0.3)';
        ctx.lineWidth = 0.3;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          ctx.beginPath();
          ctx.moveTo(irisX + Math.cos(a) * (pupilRadius + 0.5), irisY + Math.sin(a) * (pupilRadius + 0.5));
          ctx.lineTo(irisX + Math.cos(a) * (irisRadius - 0.5), irisY + Math.sin(a) * (irisRadius - 0.5));
          ctx.stroke();
        }

        // Main highlight (top left)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(ex - 2.5, eyeY - 3, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Secondary highlight (bottom right, smaller)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(ex + 1.5, eyeY + 2, 1.0, 0, Math.PI * 2);
        ctx.fill();

        // Iris outer ring highlight
        ctx.strokeStyle = 'rgba(255, 220, 100, 0.3)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(irisX, irisY, irisRadius - 0.5, -0.5, 1.2);
        ctx.stroke();
      }
    }

    // --- BEAK ---
    ctx.fillStyle = accent;
    ctx.strokeStyle = '#995500';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-2.5, -2);
    ctx.lineTo(0, 1);
    ctx.lineTo(2.5, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Beak highlight
    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, -4.5);
    ctx.lineTo(-1, -2.5);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();

    // --- PETTING BLUSH ---
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-9, -6, 3.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(9, -6, 3.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // end head rotation

    // --- SLEEPING ZZZ ---
    if (animState === 'sleeping') {
      const zPhase = (t * 0.0008) % 3;
      ctx.fillStyle = `rgba(80, 60, 40, ${0.5 + Math.sin(t * 0.002) * 0.2})`;
      ctx.font = '6px sans-serif';
      ctx.fillText('z', 10 + zPhase, -16 - zPhase * 2);
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 12 + zPhase * 0.5, -20 - zPhase * 2);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13 + zPhase * 0.3, -23 - zPhase * 2);
    }

    // --- THINKING DOTS ---
    if (animState === 'thinking') {
      const dotPhase = t * 0.003;
      for (let i = 0; i < 3; i++) {
        const alpha = (Math.sin(dotPhase + i * 0.8) + 1) / 2 * 0.6 + 0.2;
        ctx.fillStyle = `rgba(90, 70, 50, ${alpha})`;
        ctx.beginPath();
        ctx.arc(12 + i * 4, -20 - i * 3, 1.8 - i * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- OVERHEAT HEAT WAVES ---
    if (animState === 'overheat') {
      ctx.strokeStyle = 'rgba(200, 80, 0, 0.25)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        const waveY = -20 - i * 4 - (t * 0.015 % 8);
        const waveX = -6 + i * 4;
        ctx.beginPath();
        ctx.moveTo(waveX, waveY);
        ctx.bezierCurveTo(waveX + 1, waveY - 2, waveX + 2, waveY + 1, waveX + 3, waveY - 1);
        ctx.stroke();
      }
    }

    // --- VICTORY SPARKLE ---
    if (animState === 'victory') {
      const sparkPhase = t * 0.004;
      ctx.fillStyle = `rgba(255, 200, 50, ${0.5 + Math.sin(sparkPhase) * 0.3})`;
      for (let i = 0; i < 4; i++) {
        const angle = sparkPhase + i * (Math.PI / 2);
        const sx = Math.cos(angle) * 16;
        const sy = -8 + Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- CHASING MOTION LINES ---
    if (animState === 'chasing') {
      ctx.strokeStyle = 'rgba(100, 70, 40, 0.3)';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 3; i++) {
        const ly = 5 + i * 5;
        ctx.beginPath();
        ctx.moveTo(-18 - i, ly);
        ctx.lineTo(-22 - i, ly);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
