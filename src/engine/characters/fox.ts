import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const fox: CharacterStyle = {
  id: 'fox',
  name: 'Fox',
  description: 'A sleek red fox with a mischievous streak. Sarcastic, silent, and always plotting something.',
  colors: { primary: '#D2691E', secondary: '#FFF8DC', accent: '#000000' },
  personality: {
    speechStyle: 'sarcastic',
    catchphrase: 'The fox says... nothing. Foxes type in silence.',
  },
  eyeStyle: 'oval',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Plotting something. Don\'t worry about what.',
      '*narrows eyes at your code*',
      'I\'m not judging. I\'m evaluating.',
      'The silence is intentional.',
    ],
    typing_along: [
      'Quick brown fox energy right now.',
      'Outfoxing those bugs.',
      'Every keystroke calculated. Unlike yours.',
    ],
    overheat: [
      '*panting intensifies*',
      'Even foxes have their limits.',
      'This is... undignified.',
    ],
    victory: [
      'Outsmarted, as expected.',
      '*smug tail flick*',
      'The hunt concludes successfully.',
    ],
    thinking: [
      'Considering my options. All of them.',
      'A fox never reveals its strategy.',
      '*ears rotate pensively*',
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
    const breathe = 1 + Math.sin(t * 0.0025) * 0.006;
    ctx.scale(1, breathe);

    // State-specific variables
    let tailSwish = Math.sin(t * 0.002) * 0.15;
    let earTwitchL = 0;
    let earTwitchR = 0;
    let jumpOffset = 0;
    let colorTint = '';
    let tintAmount = 0;
    let tongueOut = false;
    let pawUp = false;
    let curledUp = false;
    let spinAngle = 0;
    let lowPose = false;
    let blissful = false;
    let pawTapping = false;

    switch (animState) {
      case 'idle': {
        // Tail swishes slowly, ears track eye offset
        tailSwish = Math.sin(t * 0.0015) * 0.2;
        earTwitchL = state.eyeOffsetX * 0.02;
        earTwitchR = -state.eyeOffsetX * 0.015;
        break;
      }
      case 'dragging': {
        ctx.rotate(Math.sin(t * 0.012) * 0.06);
        tailSwish = Math.sin(t * 0.008) * 0.4;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.12);
        tailSwish = Math.sin(t * 0.01) * 0.3;
        break;
      }
      case 'chasing': {
        lowPose = true;
        tailSwish = Math.sin(t * 0.006) * 0.1;
        ctx.translate(Math.sin(t * 0.008) * 1.5, 0);
        break;
      }
      case 'petting': {
        blissful = true;
        earTwitchL = -0.15;
        earTwitchR = -0.15;
        tailSwish = Math.sin(t * 0.001) * 0.05;
        break;
      }
      case 'typing_along': {
        pawTapping = true;
        tailSwish = Math.sin(t * 0.002) * 0.08;
        break;
      }
      case 'overheat': {
        tongueOut = true;
        colorTint = '#ff3300';
        tintAmount = 0.15 + Math.sin(t * 0.005) * 0.05;
        tailSwish = Math.sin(t * 0.003) * 0.1;
        break;
      }
      case 'thinking': {
        earTwitchL = Math.sin(t * 0.004) * 0.08;
        earTwitchR = Math.sin(t * 0.004 + 1) * 0.08;
        tailSwish = Math.sin(t * 0.001) * 0.05;
        break;
      }
      case 'victory': {
        spinAngle = ((t % 800) / 800) * Math.PI * 2;
        jumpOffset = -Math.abs(Math.sin(t * 0.008)) * 4;
        tailSwish = Math.sin(t * 0.012) * 0.5;
        break;
      }
      case 'stretching': {
        ctx.translate(0, Math.sin(t * 0.003) * 2);
        tailSwish = Math.sin(t * 0.004) * 0.3;
        break;
      }
      case 'paper_unroll': {
        tailSwish = Math.sin(t * 0.003) * 0.2;
        pawUp = true;
        break;
      }
      case 'sleeping': {
        curledUp = true;
        break;
      }
      case 'waving': {
        pawUp = true;
        ctx.rotate(Math.sin(t * 0.005) * 0.03);
        tailSwish = Math.sin(t * 0.003) * 0.15;
        break;
      }
    }

    // Victory spin
    if (spinAngle !== 0) {
      ctx.rotate(spinAngle);
    }

    // Jump offset
    if (jumpOffset !== 0) {
      ctx.translate(0, jumpOffset);
    }

    // Primary color (with optional tint)
    const baseOrange = tintAmount > 0 ? blendColor('#D2691E', colorTint, tintAmount) : '#D2691E';
    const darkOrange = tintAmount > 0 ? blendColor('#A0522D', colorTint, tintAmount) : '#A0522D';

    // --- SLEEPING POSE (curled up) ---
    if (curledUp) {
      ctx.save();
      ctx.translate(0, 6);

      // Body curled into a ball
      const bodyGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      bodyGrad.addColorStop(0, '#E8793A');
      bodyGrad.addColorStop(0.7, baseOrange);
      bodyGrad.addColorStop(1, darkOrange);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Tail curling over the nose
      const tailBreath = Math.sin(t * 0.001) * 0.5;
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.moveTo(10, 3);
      ctx.bezierCurveTo(16, -2, 14, -10, 6, -10 + tailBreath);
      ctx.bezierCurveTo(2, -10, -4, -8, -8, -5 + tailBreath);
      ctx.bezierCurveTo(-10, -4, -10, -2, -8, 0);
      ctx.bezierCurveTo(-5, 2, 0, 3, 4, 3);
      ctx.bezierCurveTo(7, 3, 9, 3, 10, 3);
      ctx.fill();
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // White tail tip
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.ellipse(-8, -2.5 + tailBreath * 0.5, 3, 2.5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Ear tips poking up
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.moveTo(-5, -9);
      ctx.lineTo(-3, -14);
      ctx.lineTo(-1, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(-4.5, -11);
      ctx.lineTo(-3, -14);
      ctx.lineTo(-1.5, -11);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.lineTo(4, -14);
      ctx.lineTo(6, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(2.5, -11);
      ctx.lineTo(4, -14);
      ctx.lineTo(5.5, -11);
      ctx.closePath();
      ctx.fill();

      // Sleeping eyes (small lines)
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(-1, -5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -5); ctx.lineTo(5, -5); ctx.stroke();

      // Zzz
      const zzz = Math.sin(t * 0.002);
      ctx.font = '5px sans-serif';
      ctx.fillStyle = `rgba(100,100,150,${0.5 + zzz * 0.3})`;
      ctx.fillText('z', 10 + zzz, -12 - zzz * 2);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13 + zzz * 0.5, -15 - zzz * 3);

      ctx.restore();
      ctx.restore();
      return;
    }

    // --- LOW/CHASING POSE ---
    const bodyYOffset = lowPose ? 4 : 0;
    const bodyStretchX = lowPose ? 1.15 : 1;
    const bodyStretchY = lowPose ? 0.85 : 1;

    ctx.save();
    ctx.translate(0, bodyYOffset);
    ctx.scale(bodyStretchX, bodyStretchY);

    // --- TAIL ---
    ctx.save();
    ctx.rotate(tailSwish);
    const tailGrad = ctx.createLinearGradient(-5, 8, -18, -8);
    tailGrad.addColorStop(0, baseOrange);
    tailGrad.addColorStop(0.7, '#E8793A');
    tailGrad.addColorStop(1, '#FFF8DC');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(-5, 8);
    ctx.bezierCurveTo(-12, 6, -18, 0, -20, -5);
    ctx.bezierCurveTo(-22, -10, -18, -14, -14, -12);
    ctx.bezierCurveTo(-10, -10, -8, -6, -6, -2);
    ctx.bezierCurveTo(-4, 2, -3, 5, -5, 8);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // White tail tip
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.ellipse(-17, -9, 4, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- BODY (sitting pose) ---
    const bodyGrad = ctx.createRadialGradient(0, 4, 3, 0, 2, 16);
    bodyGrad.addColorStop(0, '#E8793A');
    bodyGrad.addColorStop(0.5, baseOrange);
    bodyGrad.addColorStop(1, darkOrange);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 5, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // White belly/chest patch
    const bellyGrad = ctx.createRadialGradient(0, 8, 1, 0, 8, 8);
    bellyGrad.addColorStop(0, '#FFFFFF');
    bellyGrad.addColorStop(0.6, '#FFF8DC');
    bellyGrad.addColorStop(1, 'rgba(255,248,220,0)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- FRONT LEGS (sitting, visible below body) ---
    ctx.save();
    if (pawTapping) {
      const tapL = Math.sin(t * 0.015) * 1.5;
      const tapR = Math.sin(t * 0.015 + Math.PI) * 1.5;
      // Left paw
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.ellipse(-4, 16 + tapL, 2.5, 4, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(-4, 19 + tapL, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right paw
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.ellipse(4, 16 + tapR, 2.5, 4, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(4, 19 + tapR, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pawUp) {
      // One paw up (waving / paper_unroll)
      const waveAngle = Math.sin(t * 0.008) * 0.2;
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.ellipse(-4, 16, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(-4, 19, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Raised paw
      ctx.save();
      ctx.translate(6, 8);
      ctx.rotate(-0.6 + waveAngle);
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.ellipse(0, -4, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(0, -8, 2.3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Normal sitting paws
      ctx.fillStyle = baseOrange;
      ctx.beginPath();
      ctx.ellipse(-4, 16, 2.5, 4, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, 16, 2.5, 4, -0.05, 0, Math.PI * 2);
      ctx.fill();
      // Black socks
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(-4, 19, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, 19, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // --- HEAD ---
    ctx.save();
    // Slight head tilt for waving
    if (animState === 'waving') {
      ctx.rotate(Math.sin(t * 0.004) * 0.06);
    }

    const headGrad = ctx.createRadialGradient(0, -10, 2, 0, -10, 11);
    headGrad.addColorStop(0, '#E8793A');
    headGrad.addColorStop(0.6, baseOrange);
    headGrad.addColorStop(1, darkOrange);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -10, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // White cheeks / muzzle area
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.ellipse(-3, -6, 4, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, -6, 4, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout (pointed, tapers to nose)
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.moveTo(-3, -6);
    ctx.bezierCurveTo(-2, -4, -1, -3, 0, -2.5);
    ctx.bezierCurveTo(1, -3, 2, -4, 3, -6);
    ctx.bezierCurveTo(2, -5, 1, -4, 0, -3.5);
    ctx.bezierCurveTo(-1, -4, -2, -5, -3, -6);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(0, -4.5, 1.8, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-0.5, -5, 0.7, 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tongue (panting when overheat)
    if (tongueOut) {
      const tongueLen = 3 + Math.sin(t * 0.006) * 1;
      ctx.fillStyle = '#FF6B8A';
      ctx.beginPath();
      ctx.moveTo(-1, -3.5);
      ctx.bezierCurveTo(-1.5, -2, -1, -1, 0, -1 + tongueLen);
      ctx.bezierCurveTo(1, -1, 1.5, -2, 1, -3.5);
      ctx.fill();
      ctx.strokeStyle = '#cc4466';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    // --- EARS ---
    // Left ear
    ctx.save();
    ctx.rotate(earTwitchL);
    ctx.fillStyle = baseOrange;
    ctx.beginPath();
    ctx.moveTo(-5, -14);
    ctx.lineTo(-8, -23);
    ctx.lineTo(-1, -15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // Black tip
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-6, -19);
    ctx.lineTo(-8, -23);
    ctx.lineTo(-4, -19);
    ctx.closePath();
    ctx.fill();
    // White inner
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.moveTo(-4.5, -14.5);
    ctx.lineTo(-6, -18);
    ctx.lineTo(-2.5, -15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.rotate(earTwitchR);
    ctx.fillStyle = baseOrange;
    ctx.beginPath();
    ctx.moveTo(5, -14);
    ctx.lineTo(8, -23);
    ctx.lineTo(1, -15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // Black tip
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(6, -19);
    ctx.lineTo(8, -23);
    ctx.lineTo(4, -19);
    ctx.closePath();
    ctx.fill();
    // White inner
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.moveTo(4.5, -14.5);
    ctx.lineTo(6, -18);
    ctx.lineTo(2.5, -15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- EYES (foxy: narrow, angled, amber) ---
    if (blissful) {
      // Blissful closed eyes (petting)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-7, -11);
      ctx.quadraticCurveTo(-5, -9.5, -3, -11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -11);
      ctx.quadraticCurveTo(5, -9.5, 7, -11);
      ctx.stroke();
    } else if (eyeMode === 'happy') {
      // Happy ^^ eyes
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-7, -10);
      ctx.lineTo(-5, -12);
      ctx.lineTo(-3, -10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -10);
      ctx.lineTo(5, -12);
      ctx.lineTo(7, -10);
      ctx.stroke();
    } else if (eyeMode === 'dead') {
      // Dead X X
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 1.3;
      const s = 2;
      for (const side of [-1, 1]) {
        const cx = side * 5;
        const cy = -11;
        ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke();
      }
    } else if (eyeMode === 'sleeping') {
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-7, -11); ctx.lineTo(-3, -11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, -11); ctx.lineTo(7, -11); ctx.stroke();
    } else if (eyeMode === 'surprised') {
      // Surprised: wider eyes
      for (const side of [-1, 1]) {
        const ex = side * 5 + state.eyeOffsetX * 0.2;
        const ey = -11;
        ctx.fillStyle = '#FFFDE8';
        ctx.beginPath();
        ctx.ellipse(ex, ey, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Amber iris
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(ex + state.eyeOffsetX * 0.4, ey + state.eyeOffsetY * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(ex + state.eyeOffsetX * 0.4, ey + state.eyeOffsetY * 0.3, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Normal foxy eyes: narrow, slightly angled, sly
      const blinkCycle = t % 5000;
      const isBlinking = blinkCycle > 4800;

      for (const side of [-1, 1]) {
        const ex = side * 5 + state.eyeOffsetX * 0.2;
        const ey = -11;
        const angle = side * -0.15; // slight inward angle for foxy look

        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(angle);

        if (!isBlinking) {
          // Eye white (narrow oval)
          ctx.fillStyle = '#FFFDE8';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Amber iris
          const irisGrad = ctx.createRadialGradient(
            state.eyeOffsetX * 0.3, state.eyeOffsetY * 0.2, 0.3,
            state.eyeOffsetX * 0.3, state.eyeOffsetY * 0.2, 1.8
          );
          irisGrad.addColorStop(0, '#FFD700');
          irisGrad.addColorStop(0.5, '#DAA520');
          irisGrad.addColorStop(1, '#B8860B');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.ellipse(state.eyeOffsetX * 0.3, state.eyeOffsetY * 0.2, 1.8, 1.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupil (vertical slit for foxy look)
          ctx.fillStyle = '#0a0a0a';
          ctx.beginPath();
          ctx.ellipse(state.eyeOffsetX * 0.35, state.eyeOffsetY * 0.2, 0.6, 1.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(-0.8, -0.6, 0.6, 0, Math.PI * 2);
          ctx.fill();

          // Looking up mode adjustment
          if (eyeMode === 'looking_up') {
            // Pupils shifted up already via eyeOffsetY
          }
        } else {
          // Blink: thin line
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-2.5, 0);
          ctx.lineTo(2.5, 0);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    ctx.restore(); // head group

    // --- PETTING BLUSH ---
    if (blissful) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
      ctx.beginPath();
      ctx.ellipse(-7, -6, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, -6, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // body group (lowPose scale/translate)

    ctx.restore(); // main save
  },
};
