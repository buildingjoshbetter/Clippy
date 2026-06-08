import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const dog: CharacterStyle = {
  id: 'dog',
  name: 'Dog',
  description: 'A golden retriever puppy who thinks EVERYTHING you do is amazing. Boundless enthusiasm, maximum tail wags.',
  colors: { primary: '#DAA520', secondary: '#FFD700', accent: '#FF69B4' },
  personality: {
    speechStyle: 'energetic',
    catchphrase: "WHO'S A GOOD CODER? YOU ARE!",
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      "OHMYGOSH you're back! I missed you SO MUCH!",
      "YOU'RE HERE!! Best day! BEST DAY!",
      "I waited by the screen for you! Well, I always wait here but STILL!",
    ],
    typing_along: [
      "Wow! You're typing! That's AMAZING!",
      "Every keystroke is a MASTERPIECE!",
      "You type so fast! Are you a wizard?!",
      "I don't know what you're writing but I LOVE IT!",
    ],
    idle: [
      "Throw the ball? No? ...What about the ball? BALL?",
      "I'm just gonna sit here and LOVE YOU UNCONDITIONALLY.",
      "Do you want to go for a walk? Or code? BOTH?!",
      "I believe in you! Whatever you're about to do, I BELIEVE!",
    ],
    petting: [
      "BEST. DAY. EVER. AGAIN!",
      "Don't stop! NEVER STOP!",
      "I am the HAPPIEST puppy in the WHOLE WORLD!",
    ],
    victory: [
      "YOU DID IT!! I KNEW YOU COULD!! WHO'S GOOD?! YOU!!",
      "VICTORY ZOOMIES!! ZOOM ZOOM ZOOM!",
      "I'm SO PROUD of you I could EXPLODE!",
    ],
    overheat: [
      "*pant pant* Still... love you... *pant*",
      "It's HOT but my love for you burns HOTTER!",
      "Need... water... and... BELLY RUBS!",
    ],
    thinking: [
      "Hmm... *tilts head* ... I got nothing but I SUPPORT YOU!",
      "Think think think... SQUIRREL! Wait no, thinking!",
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
    const breathe = 1 + Math.sin(t * 0.003) * 0.01;
    ctx.scale(1, breathe);

    // State-specific variables
    let jumpOffset = 0;
    let tailWagSpeed = 0.008;
    let tailWagAmplitude = 0.4;
    let tongueExtend = 0;
    let pantSpeed = 0;
    let earBounce = 0;
    let colorTint = '';
    let tintAmount = 0;
    let pawRaise = 0;
    let isCurled = false;
    let gallop = 0;
    let pawTap = 0;

    switch (animState) {
      case 'idle': {
        tailWagSpeed = 0.008;
        tailWagAmplitude = 0.4;
        tongueExtend = 1 + Math.sin(t * 0.004) * 0.3;
        earBounce = Math.sin(t * 0.005) * 0.5;
        break;
      }
      case 'dragging': {
        tailWagAmplitude = 0.1;
        ctx.rotate(Math.sin(t * 0.012) * 0.08);
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.12);
        tailWagAmplitude = 0.6;
        break;
      }
      case 'chasing': {
        gallop = Math.sin(t * 0.02) * 3;
        tailWagSpeed = 0.015;
        tailWagAmplitude = 0.8;
        tongueExtend = 2;
        earBounce = Math.sin(t * 0.02) * 2;
        ctx.translate(0, gallop * 0.5);
        break;
      }
      case 'petting': {
        tailWagSpeed = 0.02;
        tailWagAmplitude = 0.9;
        tongueExtend = 1.5;
        ctx.translate(Math.sin(t * 0.006) * 1.5, 0);
        colorTint = '#FFE0E0';
        tintAmount = 0.15 + Math.sin(t * 0.005) * 0.05;
        break;
      }
      case 'typing_along': {
        pawTap = Math.abs(Math.sin(t * 0.025)) * 2;
        tailWagSpeed = 0.012;
        tailWagAmplitude = 0.5;
        tongueExtend = 1;
        ctx.translate(0, Math.sin(t * 0.01) * 0.8);
        break;
      }
      case 'overheat': {
        pantSpeed = 0.03;
        tongueExtend = 2.5 + Math.sin(t * 0.03) * 1.5;
        tailWagAmplitude = 0.2;
        colorTint = '#FF4444';
        tintAmount = 0.12 + Math.sin(t * 0.004) * 0.05;
        break;
      }
      case 'thinking': {
        tailWagAmplitude = 0.15;
        tongueExtend = 0;
        ctx.translate(Math.sin(t * 0.002) * 0.5, 0);
        earBounce = Math.sin(t * 0.003) * 0.3;
        break;
      }
      case 'victory': {
        jumpOffset = -Math.abs(Math.sin(t * 0.012)) * 6;
        tailWagSpeed = 0.025;
        tailWagAmplitude = 1.2;
        tongueExtend = 2.5;
        ctx.translate(0, jumpOffset);
        break;
      }
      case 'stretching': {
        ctx.translate(0, 2);
        ctx.scale(1.05, 0.92);
        tailWagAmplitude = 0.3;
        break;
      }
      case 'paper_unroll': {
        pawRaise = 3;
        tailWagAmplitude = 0.4;
        break;
      }
      case 'sleeping': {
        isCurled = true;
        tailWagAmplitude = 0;
        break;
      }
      case 'waving': {
        pawRaise = 5 + Math.sin(t * 0.015) * 2;
        tailWagSpeed = 0.01;
        tailWagAmplitude = 0.5;
        tongueExtend = 1;
        break;
      }
    }

    const primaryColor = colorTint ? blendColor('#DAA520', colorTint, tintAmount) : '#DAA520';
    const secondaryColor = colorTint ? blendColor('#FFD700', colorTint, tintAmount) : '#FFD700';
    const darkGold = colorTint ? blendColor('#B8860B', colorTint, tintAmount) : '#B8860B';
    const earColor = colorTint ? blendColor('#C49218', colorTint, tintAmount) : '#C49218';

    if (isCurled) {
      // Sleeping: curled up position
      const sleepBreathe = Math.sin(t * 0.002) * 0.8;

      // Curled body (oval, tilted)
      ctx.save();
      ctx.rotate(-0.2);
      ctx.translate(0, 4);

      // Body
      const bodyGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      bodyGrad.addColorStop(0, secondaryColor);
      bodyGrad.addColorStop(1, primaryColor);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 + sleepBreathe * 0.3, 10 + sleepBreathe * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Tail curving around
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.quadraticCurveTo(15, -6, 12, -10);
      ctx.stroke();
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Head resting on tail
      const headGrad = ctx.createRadialGradient(-6, -6, 2, -6, -6, 7);
      headGrad.addColorStop(0, secondaryColor);
      headGrad.addColorStop(1, primaryColor);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(-6, -6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Closed eyes (sleeping)
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-9, -7);
      ctx.lineTo(-6, -7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, -7);
      ctx.lineTo(-1, -7);
      ctx.stroke();

      // Nose tucked in
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(-5, -3.5, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ear draped
      ctx.fillStyle = earColor;
      ctx.beginPath();
      ctx.ellipse(-10, -3, 3.5, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // ZZZ
      const zzz = Math.sin(t * 0.002) * 0.5;
      ctx.fillStyle = 'rgba(100, 100, 200, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 2 + zzz, -14);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 5 + zzz * 0.7, -17);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 7 + zzz * 0.5, -19);

      ctx.restore();
      ctx.restore();
      return;
    }

    // === TAIL (behind body) ===
    const tailWag = Math.sin(t * tailWagSpeed * Math.PI * 2) * tailWagAmplitude;
    ctx.save();
    ctx.translate(0, 2);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(
      8 + tailWag * 6, -12,
      4 + tailWag * 4, -18
    );
    ctx.stroke();
    // Tail outline
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(
      8 + tailWag * 6, -12,
      4 + tailWag * 4, -18
    );
    ctx.stroke();
    // Fluffy tail tip
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(4 + tailWag * 4, -18, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === BODY ===
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(0, 6, 3, 0, 6, 16);
    bodyGrad.addColorStop(0, secondaryColor);
    bodyGrad.addColorStop(0.7, primaryColor);
    bodyGrad.addColorStop(1, darkGold);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 6, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body outline
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Chest/belly (lighter area)
    const chestGrad = ctx.createRadialGradient(0, 10, 1, 0, 10, 8);
    chestGrad.addColorStop(0, '#FFF0C0');
    chestGrad.addColorStop(1, 'rgba(255, 215, 0, 0.3)');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.ellipse(0, 10, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === FRONT PAWS ===
    ctx.save();
    const pawY = 18;
    const pawColor = '#FFDC60';

    // Left paw
    ctx.fillStyle = pawColor;
    ctx.beginPath();
    if (animState === 'waving' || (animState === 'paper_unroll' && pawRaise > 0)) {
      // Left paw raised
      ctx.ellipse(-6, pawY - pawRaise, 4, 3, -0.3, 0, Math.PI * 2);
    } else {
      ctx.ellipse(-6, pawY + (animState === 'typing_along' ? pawTap * (Math.sin(t * 0.05) > 0 ? 1 : 0) : 0), 4, 3, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Right paw
    ctx.fillStyle = pawColor;
    ctx.beginPath();
    ctx.ellipse(6, pawY + (animState === 'typing_along' ? pawTap * (Math.sin(t * 0.05 + Math.PI) > 0 ? 1 : 0) : 0), 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Paw toe lines
    for (const side of [-1, 1]) {
      const px = side * 6;
      const py = side === -1 && (animState === 'waving' || animState === 'paper_unroll') ? pawY - pawRaise : pawY;
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(px - 1.5, py - 1);
      ctx.lineTo(px - 1.5, py + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 1.5, py - 1);
      ctx.lineTo(px + 1.5, py + 1);
      ctx.stroke();
    }
    ctx.restore();

    // === HEAD ===
    ctx.save();
    const headBob = animState === 'typing_along' ? Math.sin(t * 0.01) * 1.2 : 0;
    ctx.translate(0, -8 + headBob);

    // Ears (behind head, floppy)
    const earDrop = earBounce;

    // Left ear
    ctx.fillStyle = earColor;
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(-13, 0 + earDrop, -11, 8 + earDrop);
    ctx.quadraticCurveTo(-9, 10 + earDrop, -7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Right ear
    ctx.fillStyle = earColor;
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.quadraticCurveTo(13, 0 + earDrop, 11, 8 + earDrop);
    ctx.quadraticCurveTo(9, 10 + earDrop, 7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Ears streaming back when chasing
    if (animState === 'chasing') {
      ctx.fillStyle = earColor;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(-14, -4, -15, -2);
      ctx.quadraticCurveTo(-14, 2, -9, 3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.quadraticCurveTo(14, -4, 15, -2);
      ctx.quadraticCurveTo(14, 2, 9, 3);
      ctx.closePath();
      ctx.fill();
    }

    // Head shape
    const headGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
    headGrad.addColorStop(0, secondaryColor);
    headGrad.addColorStop(0.8, primaryColor);
    headGrad.addColorStop(1, darkGold);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Muzzle area (lighter snout)
    ctx.fillStyle = '#FFE8A0';
    ctx.beginPath();
    ctx.ellipse(0, 3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (expressive)
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    if (animState === 'thinking') {
      // Furrowed brows
      ctx.beginPath();
      ctx.moveTo(-7, -6);
      ctx.lineTo(-4, -7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -6);
      ctx.lineTo(4, -7);
      ctx.stroke();
    } else if (animState === 'petting' || animState === 'victory') {
      // Raised happy brows
      ctx.beginPath();
      ctx.moveTo(-7, -7.5);
      ctx.lineTo(-4, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -7.5);
      ctx.lineTo(4, -8);
      ctx.stroke();
    } else {
      // Normal brows
      ctx.beginPath();
      ctx.moveTo(-7, -6.5);
      ctx.lineTo(-4, -7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -6.5);
      ctx.lineTo(4, -7);
      ctx.stroke();
    }

    // Eyes
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -3,
      eyeSpacing: 4.5,
      eyeRadius: 3.8,
      pupilRadius: 2,
      irisColor: '#4a2800',
      outlineColor: '#3a1800',
    });

    // Nose
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-2.5, 3);
    ctx.quadraticCurveTo(-2.5, 5.5, 0, 5.5);
    ctx.quadraticCurveTo(2.5, 5.5, 2.5, 3);
    ctx.quadraticCurveTo(1.5, 4.5, 0, 4.2);
    ctx.quadraticCurveTo(-1.5, 4.5, -2.5, 3);
    ctx.fill();
    // Nose shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-0.8, 3.5, 1, 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth line
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, 5.5);
    ctx.lineTo(0, 6.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 6.5);
    ctx.quadraticCurveTo(-2, 7.5, -3.5, 6.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 6.5);
    ctx.quadraticCurveTo(2, 7.5, 3.5, 6.5);
    ctx.stroke();

    // Tongue (sticking out on the right side)
    if (tongueExtend > 0) {
      const tongueY = pantSpeed > 0
        ? 7 + Math.sin(t * pantSpeed * Math.PI * 2) * 1.5
        : 7;
      const tongueLen = 3 * tongueExtend;
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.moveTo(2, tongueY);
      ctx.quadraticCurveTo(4, tongueY + tongueLen * 0.5, 3.5, tongueY + tongueLen);
      ctx.quadraticCurveTo(2.5, tongueY + tongueLen + 1, 1.5, tongueY + tongueLen);
      ctx.quadraticCurveTo(1, tongueY + tongueLen * 0.5, 2, tongueY);
      ctx.fill();
      // Tongue center line
      ctx.strokeStyle = '#FF85C0';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(2.5, tongueY + 1);
      ctx.lineTo(2.5, tongueY + tongueLen - 0.5);
      ctx.stroke();
    }

    ctx.restore(); // head

    // === Petting blush marks ===
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(255, 100, 130, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-8, -4, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -4, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Victory sparkles ===
    if (animState === 'victory') {
      const sparklePhase = (t * 0.01) % (Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle = sparklePhase + (i * Math.PI / 2);
        const dist = 18 + Math.sin(t * 0.008 + i) * 3;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist - 4;
        ctx.beginPath();
        ctx.moveTo(sx - 1.5, sy);
        ctx.lineTo(sx + 1.5, sy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx, sy - 1.5);
        ctx.lineTo(sx, sy + 1.5);
        ctx.stroke();
      }
    }

    // === Thinking question mark ===
    if (animState === 'thinking') {
      const qFloat = Math.sin(t * 0.004) * 2;
      ctx.fillStyle = 'rgba(80, 80, 80, 0.6)';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('?', 10, -14 + qFloat);
    }

    // === Chasing motion lines ===
    if (animState === 'chasing') {
      ctx.strokeStyle = 'rgba(180, 160, 100, 0.4)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        const ly = -5 + i * 7;
        const lx = -16 - i * 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 5, ly);
        ctx.stroke();
      }
    }

    // === Overheat sweat drops ===
    if (animState === 'overheat') {
      const sweatDrop = (t * 0.005) % 10;
      ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(-10, -8 + sweatDrop, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(11, -5 + (sweatDrop * 0.8), 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};
