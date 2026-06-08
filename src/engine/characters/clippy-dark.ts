import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const clippyDark: CharacterStyle = {
  id: 'clippy-dark',
  name: 'Shadow Clippy',
  description: 'A sleek dark-mode paperclip. Minimal, elegant, void-approved.',
  colors: { primary: '#4a4a54', secondary: '#6a6a74', accent: '#2a2a34' },
  personality: {
    speechStyle: 'zen',
    catchphrase: 'The void stares back. It seems friendly.',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Dark mode is a lifestyle.',
      'In the shadows, bugs cannot hide.',
      'Void main, indeed.',
    ],
    thinking: [
      'Contemplating the abyss...',
      'The dark offers clarity.',
      'Silence is the best debugger.',
    ],
    overheat: [
      'Even shadows can overheat.',
      'Too much entropy...',
      'The void grows warm.',
    ],
    petting: [
      'A gentle touch in the dark.',
      'Warmth found in shadow.',
      'The darkness appreciates you.',
    ],
    victory: [
      'Silver lining confirmed.',
      'The void celebrates quietly.',
      'Elegance in execution.',
    ],
  },
  draw(ctx: CanvasRenderingContext2D, state: DrawState) {
    ctx.save();

    // Apply body transforms
    ctx.scale(state.bodyStretch, state.bodySquash);

    const t = state.time;
    const anim = state.animState;

    // --- State-specific offsets ---
    let yOffset = 0;
    let tintColor = '';
    let tintAmount = 0;

    switch (anim) {
      case 'idle': {
        // Subtle hover bob
        yOffset = Math.sin(t / 1200) * 1.2;
        break;
      }
      case 'dragging': {
        yOffset = Math.sin(t / 80) * 1.5;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t / 100) * 0.12);
        break;
      }
      case 'chasing': {
        yOffset = Math.sin(t / 150) * 2;
        ctx.rotate(Math.sin(t / 200) * 0.05);
        break;
      }
      case 'petting': {
        tintColor = '#7088aa';
        tintAmount = 0.25 + Math.sin(t / 400) * 0.1;
        break;
      }
      case 'typing_along': {
        yOffset = Math.sin(t / 180) * 1.5;
        ctx.rotate(Math.sin(t / 300) * 0.03);
        break;
      }
      case 'overheat': {
        tintColor = '#8b3a8b';
        tintAmount = 0.35 + Math.sin(t / 200) * 0.15;
        yOffset = Math.sin(t / 60) * 0.8;
        break;
      }
      case 'thinking': {
        yOffset = Math.sin(t / 1500) * 0.8;
        break;
      }
      case 'victory': {
        const flash = Math.sin(t / 150) * 0.5 + 0.5;
        tintColor = '#e0e0e8';
        tintAmount = flash * 0.4;
        yOffset = -Math.abs(Math.sin(t / 200)) * 4;
        break;
      }
      case 'stretching': {
        yOffset = Math.sin(t / 600) * 2;
        break;
      }
      case 'paper_unroll': {
        ctx.rotate(Math.sin(t / 500) * 0.04);
        break;
      }
      case 'sleeping': {
        yOffset = Math.sin(t / 2000) * 0.5;
        break;
      }
      case 'waving': {
        ctx.rotate(Math.sin(t / 200) * 0.08);
        break;
      }
    }

    ctx.translate(0, yOffset);

    // --- Color calculations ---
    let bodyColor = '#4a4a54';
    let highlightColor = '#6a6a74';
    let shadowColor = '#2a2a34';

    if (tintColor && tintAmount > 0) {
      bodyColor = blendColor(bodyColor, tintColor, tintAmount);
      highlightColor = blendColor(highlightColor, tintColor, tintAmount * 0.7);
      shadowColor = blendColor(shadowColor, tintColor, tintAmount * 0.5);
    }

    // --- Dark aura / glow effect ---
    const auraPulse = 0.3 + Math.sin(t / 2000) * 0.1;
    ctx.shadowColor = `rgba(0, 0, 0, ${auraPulse})`;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // --- Draw paperclip wire body ---
    // The classic paperclip shape: an elongated double-loop

    // Outer loop (main body shape)
    ctx.beginPath();
    ctx.moveTo(0, -20);
    // Top curve
    ctx.bezierCurveTo(10, -20, 14, -16, 14, -10);
    // Right side down
    ctx.bezierCurveTo(14, -2, 14, 6, 14, 10);
    // Bottom curve
    ctx.bezierCurveTo(14, 18, 8, 22, 0, 22);
    // Bottom curve left
    ctx.bezierCurveTo(-8, 22, -14, 18, -14, 10);
    // Left side up (partial)
    ctx.bezierCurveTo(-14, 4, -14, -2, -14, -6);
    // Inner top curve going back right
    ctx.bezierCurveTo(-14, -14, -10, -20, 0, -20);

    // Set stroke style with gradient
    const wireGrad = ctx.createLinearGradient(-14, -20, 14, 22);
    wireGrad.addColorStop(0, highlightColor);
    wireGrad.addColorStop(0.3, bodyColor);
    wireGrad.addColorStop(0.7, bodyColor);
    wireGrad.addColorStop(1, shadowColor);

    ctx.strokeStyle = wireGrad;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Reset shadow for inner details
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Inner loop of the paperclip
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(6, -12, 8, -9, 8, -4);
    ctx.bezierCurveTo(8, 2, 8, 8, 8, 12);
    ctx.bezierCurveTo(8, 16, 5, 18, 0, 18);
    ctx.bezierCurveTo(-5, 18, -8, 16, -8, 12);
    ctx.bezierCurveTo(-8, 8, -8, 2, -8, -2);
    ctx.bezierCurveTo(-8, -8, -5, -12, 0, -12);

    const innerGrad = ctx.createLinearGradient(-8, -12, 8, 18);
    innerGrad.addColorStop(0, highlightColor);
    innerGrad.addColorStop(0.5, bodyColor);
    innerGrad.addColorStop(1, shadowColor);

    ctx.strokeStyle = innerGrad;
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // --- Highlight stroke (thinner, lighter, partial) ---
    ctx.beginPath();
    ctx.moveTo(-2, -19);
    ctx.bezierCurveTo(8, -19, 12, -15, 12, -10);
    ctx.bezierCurveTo(12, -5, 12, 0, 12, 4);

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // --- Subtle inner highlight on the inner loop ---
    ctx.beginPath();
    ctx.moveTo(1, -11);
    ctx.bezierCurveTo(5, -11, 6.5, -8, 6.5, -4);
    ctx.bezierCurveTo(6.5, 0, 6.5, 4, 6.5, 7);

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // --- Eyes ---
    const eyeMode: EyeMode = getEyeMode(anim);

    // Idle LED flash effect: eyes glow brighter periodically
    let eyeGlow = false;
    if (anim === 'idle') {
      const flashCycle = t % 5000;
      eyeGlow = flashCycle > 4700 && flashCycle < 4900;
    }

    // Custom sclera color for dark clippy - slightly blue-white
    const scleraBase = eyeGlow ? '#ffffff' : '#e8eaff';

    // Draw eyes with custom colors for this dark character
    // We draw custom eyes to get the blue-white sclera
    const eyeY = -4;
    const eyeSpacing = 5;
    const eyeRadius = eyeMode === 'surprised' ? 7 : 5.5;
    const pupilR = 2.5;

    if (eyeMode === 'happy') {
      ctx.strokeStyle = '#c0c0d0';
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
    } else if (eyeMode === 'dead') {
      ctx.strokeStyle = '#8b3a8b'; // dark purple X eyes for overheat
      ctx.lineWidth = 1.5;
      const s = 2.5;
      for (const side of [-1, 1]) {
        const cx = side * eyeSpacing;
        ctx.beginPath(); ctx.moveTo(cx - s, eyeY - s); ctx.lineTo(cx + s, eyeY + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + s, eyeY - s); ctx.lineTo(cx - s, eyeY + s); ctx.stroke();
      }
    } else if (eyeMode === 'sleeping') {
      ctx.strokeStyle = '#888899';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 3, eyeY); ctx.lineTo(-eyeSpacing + 3, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing - 3, eyeY); ctx.lineTo(eyeSpacing + 3, eyeY); ctx.stroke();

      // Zzz for sleeping
      const zzTime = (t / 1000) % 3;
      ctx.fillStyle = `rgba(150, 150, 170, ${0.4 + Math.sin(zzTime * Math.PI) * 0.3})`;
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 10 + zzTime * 2, -10 - zzTime * 3);
      if (zzTime > 1) {
        ctx.font = '4px sans-serif';
        ctx.fillText('z', 13 + zzTime, -14 - zzTime * 2);
      }
    } else {
      // Normal / surprised / looking_up eyes
      const blinkCycle = t % 4000;
      const isBlinking = blinkCycle > 3850;

      for (const side of [-1, 1]) {
        const ex = side * eyeSpacing + state.eyeOffsetX * 0.2;

        // Eye socket shadow
        ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
        ctx.beginPath();
        ctx.arc(ex, eyeY + 0.5, eyeRadius + 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Sclera with blue-white tint
        const scleraGrad = ctx.createRadialGradient(ex, eyeY - 1, 0, ex, eyeY, eyeRadius);
        scleraGrad.addColorStop(0, scleraBase);
        scleraGrad.addColorStop(1, '#d0d4ee');
        ctx.fillStyle = scleraGrad;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye outline
        ctx.strokeStyle = '#1a1a24';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // LED glow effect
        if (eyeGlow) {
          ctx.shadowColor = '#aabbff';
          ctx.shadowBlur = 6;
          ctx.strokeStyle = '#8899dd';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      }

      if (!isBlinking) {
        let pupilOffX = state.eyeOffsetX;
        let pupilOffY = state.eyeOffsetY;
        if (eyeMode === 'looking_up') { pupilOffX = 1.0; pupilOffY = -2.0; }

        for (const side of [-1, 1]) {
          const ex = side * eyeSpacing + pupilOffX * 0.7;
          const ey = eyeY + pupilOffY * 0.7;

          // Iris - dark blue-gray
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(ex, ey, pupilR + 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#08080e';
          ctx.beginPath();
          ctx.arc(ex, ey, pupilR, 0, Math.PI * 2);
          ctx.fill();

          // Highlight dot
          ctx.fillStyle = eyeGlow ? '#ffffff' : '#ccccee';
          ctx.beginPath();
          ctx.arc(ex - 0.8, ey - 1.0, 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Secondary highlight
          ctx.fillStyle = 'rgba(200, 210, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(ex + 0.6, ey + 0.6, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Blink
        ctx.strokeStyle = '#888899';
        ctx.lineWidth = 1.5;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(side * eyeSpacing, eyeY, 3.5, 0, Math.PI);
          ctx.stroke();
        }
      }
    }

    // --- Thinking bubbles ---
    if (anim === 'thinking') {
      const bubblePhase = (t / 600) % (Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 100, 120, 0.4)';
      ctx.beginPath();
      ctx.arc(12 + Math.sin(bubblePhase) * 2, -18, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15 + Math.sin(bubblePhase + 1) * 1.5, -22, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(17 + Math.sin(bubblePhase + 2), -25, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Waving arm ---
    if (anim === 'waving') {
      const waveAngle = Math.sin(t / 200) * 0.4;
      ctx.save();
      ctx.translate(14, 2);
      ctx.rotate(waveAngle - 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(3, -4, 6, -8, 5, -12);
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      // Hand/tip
      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.arc(5, -12, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- Overheat smoke/particles ---
    if (anim === 'overheat') {
      const smokePhase = t / 400;
      for (let i = 0; i < 3; i++) {
        const sx = -6 + i * 6;
        const sy = -22 - ((smokePhase + i * 1.5) % 4) * 3;
        const alpha = 0.3 - ((smokePhase + i * 1.5) % 4) * 0.07;
        if (alpha > 0) {
          ctx.fillStyle = `rgba(80, 40, 80, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx + Math.sin(smokePhase + i) * 2, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- Victory sparkles ---
    if (anim === 'victory') {
      const sparklePhase = t / 300;
      for (let i = 0; i < 4; i++) {
        const angle = sparklePhase + (i * Math.PI / 2);
        const dist = 16 + Math.sin(sparklePhase * 2 + i) * 3;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist - 4;
        const alpha = 0.5 + Math.sin(sparklePhase * 3 + i) * 0.3;
        ctx.fillStyle = `rgba(220, 220, 240, ${alpha})`;
        ctx.beginPath();
        // Star shape
        ctx.moveTo(sx, sy - 2);
        ctx.lineTo(sx + 0.7, sy - 0.7);
        ctx.lineTo(sx + 2, sy);
        ctx.lineTo(sx + 0.7, sy + 0.7);
        ctx.lineTo(sx, sy + 2);
        ctx.lineTo(sx - 0.7, sy + 0.7);
        ctx.lineTo(sx - 2, sy);
        ctx.lineTo(sx - 0.7, sy - 0.7);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- Paper unroll ---
    if (anim === 'paper_unroll') {
      const unrollProgress = Math.min(1, (t % 3000) / 2000);
      const paperHeight = unrollProgress * 14;
      ctx.fillStyle = 'rgba(60, 60, 70, 0.7)';
      ctx.strokeStyle = '#555566';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.rect(-6, 10, 12, paperHeight);
      ctx.fill();
      ctx.stroke();
      // Paper lines
      if (paperHeight > 3) {
        ctx.strokeStyle = 'rgba(100, 100, 115, 0.5)';
        ctx.lineWidth = 0.5;
        for (let ly = 13; ly < 10 + paperHeight - 1; ly += 3) {
          ctx.beginPath();
          ctx.moveTo(-4, ly);
          ctx.lineTo(4, ly);
          ctx.stroke();
        }
      }
    }

    // --- Stretching effect ---
    if (anim === 'stretching') {
      const stretchPhase = Math.sin(t / 600);
      // Small motion lines on sides
      ctx.strokeStyle = 'rgba(100, 100, 120, 0.3)';
      ctx.lineWidth = 0.8;
      const lineOffset = stretchPhase * 2;
      ctx.beginPath(); ctx.moveTo(-18, -2 + lineOffset); ctx.lineTo(-15, -2 + lineOffset); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(15, -2 - lineOffset); ctx.lineTo(18, -2 - lineOffset); ctx.stroke();
    }

    ctx.restore();
  },
};
