import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const cat: CharacterStyle = {
  id: 'cat',
  name: 'Cat',
  description: 'A zen orange tabby in loaf position. Judges your code silently, occasionally kneads the keyboard.',
  colors: { primary: '#F4A460', secondary: '#CD853F', accent: '#FFB6C1' },
  personality: {
    speechStyle: 'zen',
    catchphrase: 'If it compiles, I sits.',
  },
  eyeStyle: 'oval',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Meow. Which means \'I\'m judging your code.\'',
      'I could help but... nah. Cat things.',
      'If it compiles, I sits.',
      '*stares at cursor moving across screen*',
    ],
    petting: [
      'Purrrr... don\'t stop or I\'ll push something off your desk.',
      '*kneads your keyboard*',
      'Five more seconds and I bite.',
    ],
    typing_along: [
      '*places paw on Enter key*',
      'Have you considered... a nap instead?',
      'That function is too long. Like my tail.',
    ],
    overheat: [
      '*hisses at CPU fan*',
      'My fur is literally standing on end.',
      'This laptop is finally warm enough to sit on.',
    ],
    victory: [
      '*slow blink of approval*',
      'I taught you everything you know.',
      'Now feed me. I mean... celebrate.',
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

    // State-specific variables
    let tailAngle = 0;
    let tailCurl = 0.3;
    let earFlatness = 0;
    let purrShake = 0;
    let jumpOffset = 0;
    let crouchOffset = 0;
    let pawExtend = 0;
    let colorTint = '';
    let tintAmount = 0;
    let buttWiggle = 0;
    let headDrop = 0;
    let tailWrapAround = false;
    let furRuffle = false;

    switch (animState) {
      case 'idle': {
        // Tail tip flick
        const flickCycle = t % 5000;
        if (flickCycle > 4200 && flickCycle < 4600) {
          tailAngle = Math.sin((flickCycle - 4200) * 0.03) * 0.4;
        }
        // Ear twitch
        const earCycle = t % 7000;
        if (earCycle > 6500 && earCycle < 6700) {
          earFlatness = Math.sin((earCycle - 6500) * 0.05) * 0.3;
        }
        break;
      }
      case 'dragging': {
        ctx.rotate(Math.sin(t * 0.012) * 0.06);
        tailAngle = Math.sin(t * 0.01) * 0.5;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.12);
        break;
      }
      case 'chasing': {
        // Low crouch with butt wiggle
        crouchOffset = 3;
        buttWiggle = Math.sin(t * 0.025) * 2;
        tailAngle = Math.sin(t * 0.02) * 0.6;
        ctx.translate(buttWiggle, crouchOffset);
        break;
      }
      case 'petting': {
        // Purr vibration
        purrShake = Math.sin(t * 0.08) * 0.4;
        ctx.translate(purrShake, 0);
        tailAngle = 0.5;
        tailCurl = 0.6;
        break;
      }
      case 'typing_along': {
        // Paw kneading animation
        const kneadCycle = (t % 800) / 800;
        pawExtend = Math.sin(kneadCycle * Math.PI * 2) * 3;
        break;
      }
      case 'overheat': {
        colorTint = '#ff3300';
        tintAmount = 0.15 + Math.sin(t * 0.005) * 0.05;
        earFlatness = 0.8;
        furRuffle = true;
        ctx.translate(Math.sin(t * 0.04) * 0.5, 0);
        break;
      }
      case 'thinking': {
        // Slow tail sway
        tailAngle = Math.sin(t * 0.004) * 0.3;
        // Head tilt
        ctx.rotate(Math.sin(t * 0.003) * 0.03);
        break;
      }
      case 'victory': {
        // Happy jump
        jumpOffset = -Math.abs(Math.sin(t * 0.008)) * 3;
        ctx.translate(0, jumpOffset);
        tailAngle = -0.2;
        tailCurl = 0.8;
        break;
      }
      case 'stretching': {
        ctx.scale(1.05, 0.95);
        pawExtend = 4;
        break;
      }
      case 'paper_unroll': {
        ctx.rotate(Math.sin(t * 0.006) * 0.04);
        pawExtend = 2 + Math.sin(t * 0.01) * 2;
        break;
      }
      case 'sleeping': {
        headDrop = 3;
        tailWrapAround = true;
        break;
      }
      case 'waving': {
        pawExtend = 5 + Math.sin(t * 0.01) * 2;
        break;
      }
    }

    const primary = colorTint ? blendColor('#F4A460', colorTint, tintAmount) : '#F4A460';
    const secondary = colorTint ? blendColor('#CD853F', colorTint, tintAmount) : '#CD853F';

    // === TAIL (behind body) ===
    ctx.save();
    if (tailWrapAround) {
      // Tail wraps around body when sleeping
      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.quadraticCurveTo(18, 12, 16, 14);
      ctx.quadraticCurveTo(10, 16, 0, 14);
      ctx.stroke();
      // Darker tip
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(4, 14.5);
      ctx.quadraticCurveTo(1, 14, 0, 14);
      ctx.stroke();
    } else {
      // Normal tail curling up from behind
      ctx.translate(14, 4);
      ctx.rotate(tailAngle);
      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -4, 8, -10);
      ctx.quadraticCurveTo(8 + tailCurl * 4, -14 - tailCurl * 4, 6 + tailCurl * 2, -16 - tailCurl * 4);
      ctx.stroke();
      // Darker tail tip
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(6 + tailCurl * 2, -16 - tailCurl * 4);
      ctx.quadraticCurveTo(5, -17 - tailCurl * 3, 4, -15 - tailCurl * 3);
      ctx.stroke();
    }
    ctx.restore();

    // === BODY (loaf shape) ===
    ctx.save();

    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body - rounded loaf
    const bodyGrad = ctx.createRadialGradient(0, 2, 4, 0, 4, 18);
    bodyGrad.addColorStop(0, '#FABA6F');
    bodyGrad.addColorStop(0.6, primary);
    bodyGrad.addColorStop(1, secondary);
    ctx.fillStyle = bodyGrad;

    if (furRuffle) {
      // Jagged outline for overheat
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const rx = 16 + Math.sin(i * 3 + t * 0.01) * 1.2;
        const ry = 9 + Math.sin(i * 2.5 + t * 0.008) * 0.8;
        const x = Math.cos(angle) * rx;
        const y = 4 + Math.sin(angle) * ry;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-17, 2, -15, -2);
      ctx.quadraticCurveTo(-12, -6, -6, -7);
      ctx.quadraticCurveTo(0, -8, 6, -7);
      ctx.quadraticCurveTo(12, -6, 15, -2);
      ctx.quadraticCurveTo(17, 2, 16, 8);
      ctx.quadraticCurveTo(14, 12, 8, 13);
      ctx.quadraticCurveTo(0, 14, -8, 13);
      ctx.quadraticCurveTo(-14, 12, -16, 8);
      ctx.closePath();
      ctx.fill();
    }

    // Body outline
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Tabby stripes
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.4;
    // Stripe 1
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.quadraticCurveTo(-5, -4.5, -2, -3);
    ctx.stroke();
    // Stripe 2
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-3, -1.5, 0, 0);
    ctx.stroke();
    // Stripe 3
    ctx.beginPath();
    ctx.moveTo(3, -3);
    ctx.quadraticCurveTo(6, -4.5, 9, -3);
    ctx.stroke();
    // Stripe 4
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.quadraticCurveTo(7, -1.5, 10, 0);
    ctx.stroke();
    // Stripe 5
    ctx.beginPath();
    ctx.moveTo(-4, 3);
    ctx.quadraticCurveTo(0, 2, 4, 3);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.restore();

    // === PAWS (tucked under chest) ===
    ctx.save();
    const pawColor = blendColor(primary, '#8B6914', 0.2);

    // Left paw
    ctx.fillStyle = pawColor;
    ctx.beginPath();
    ctx.ellipse(-7 - pawExtend * 0.5, 11, 4 + Math.abs(pawExtend) * 0.2, 2.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Right paw
    ctx.fillStyle = pawColor;
    ctx.beginPath();
    ctx.ellipse(7 + pawExtend * 0.5, 11, 4 + Math.abs(pawExtend) * 0.2, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Paw toes (small lines)
    if (pawExtend > 1) {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 0.6;
      for (const side of [-1, 1]) {
        const px = side * (7 + pawExtend * 0.5);
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(px + i * 1.5, 11.5);
          ctx.lineTo(px + i * 1.5 + side * 0.5, 13);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // === HEAD ===
    ctx.save();
    ctx.translate(0, -8 + headDrop);

    // Head shape
    const headGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
    headGrad.addColorStop(0, '#FABA6F');
    headGrad.addColorStop(1, primary);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Forehead tabby M-mark
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(-2, -7);
    ctx.lineTo(0, -5);
    ctx.lineTo(2, -7);
    ctx.lineTo(4, -5);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // === EARS ===
    // Left ear
    ctx.save();
    ctx.translate(-7, -6);
    ctx.rotate(-0.3 - earFlatness * 0.5);
    // Outer ear
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(0, -6);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Inner ear (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(-1.5, 2);
    ctx.lineTo(0, -3.5);
    ctx.lineTo(1.5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.translate(7, -6);
    ctx.rotate(0.3 + earFlatness * 0.5);
    // Outer ear
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(0, -6);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Inner ear (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(-1.5, 2);
    ctx.lineTo(0, -3.5);
    ctx.lineTo(1.5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // === EYES (cat-style almond with vertical slit pupils) ===
    const blinkCycle = t % 4000;
    const isBlinking = blinkCycle > 3850;
    // Slow blink in idle
    const slowBlinkCycle = t % 6000;
    const isSlowBlink = animState === 'idle' && slowBlinkCycle > 5700 && slowBlinkCycle < 5900;

    if (eyeMode === 'happy') {
      // Squinty happy eyes (petting/victory)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.quadraticCurveTo(-5, -2, -2.5, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2.5, 0);
      ctx.quadraticCurveTo(5, -2, 7.5, 0);
      ctx.stroke();
    } else if (eyeMode === 'sleeping') {
      // Closed eyes - horizontal lines
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-3, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
    } else if (eyeMode === 'dead') {
      // X X eyes
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 1.5;
      const s = 2.5;
      for (const side of [-1, 1]) {
        const cx = side * 5;
        ctx.beginPath(); ctx.moveTo(cx - s, -s); ctx.lineTo(cx + s, s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + s, -s); ctx.lineTo(cx - s, s); ctx.stroke();
      }
    } else if (isBlinking || isSlowBlink) {
      // Blinking - thin lines
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-3, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
    } else {
      // Normal cat eyes - almond shaped with vertical slit pupils
      for (const side of [-1, 1]) {
        const ex = side * 5 + state.eyeOffsetX * 0.2;
        const ey = 0 + state.eyeOffsetY * 0.15;

        // Almond eye shape (outer)
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.moveTo(ex - 4, ey);
        ctx.quadraticCurveTo(ex, ey - 3.5, ex + 4, ey);
        ctx.quadraticCurveTo(ex, ey + 3.5, ex - 4, ey);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2a2a30';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Vertical slit pupil
        let pupilOffX = state.eyeOffsetX * 0.8;
        let pupilOffY = state.eyeOffsetY * 0.5;
        if (eyeMode === 'looking_up') { pupilOffX = 0.5; pupilOffY = -1.5; }
        if (eyeMode === 'surprised') { pupilOffX *= 0.5; pupilOffY *= 0.5; }

        const pupilX = ex + pupilOffX * 0.3;
        const pupilY = ey + pupilOffY * 0.3;
        const pupilWidth = eyeMode === 'surprised' ? 2.0 : 1.0;
        const pupilHeight = eyeMode === 'surprised' ? 4.5 : 3.0;

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(pupilX, pupilY, pupilWidth, pupilHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(ex - 1.5 * side, ey - 1.2, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === NOSE (small pink triangle) ===
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(-1.5, 5);
    ctx.lineTo(1.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D4838F';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Mouth line
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(-1.5, 6.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(1.5, 6.5);
    ctx.stroke();

    // === WHISKERS ===
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 0.5;
    ctx.lineCap = 'round';
    const whiskerTwitch = Math.sin(t * 0.003) * 0.5;

    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(-12, 2 + whiskerTwitch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, 5);
    ctx.lineTo(-12, 5 + whiskerTwitch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-11, 8 + whiskerTwitch);
    ctx.stroke();

    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(12, 2 - whiskerTwitch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 5);
    ctx.lineTo(12, 5 - whiskerTwitch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(11, 8 - whiskerTwitch);
    ctx.stroke();

    ctx.restore(); // head

    // === SLEEPING Z's ===
    if (animState === 'sleeping') {
      const zPhase = (t % 3000) / 3000;
      ctx.fillStyle = `rgba(100,100,150,${1 - zPhase})`;
      ctx.font = `${8 + zPhase * 4}px sans-serif`;
      ctx.fillText('z', 10 + zPhase * 4, -14 - zPhase * 10);
      if (zPhase > 0.3) {
        ctx.fillStyle = `rgba(100,100,150,${1 - (zPhase - 0.3) / 0.7})`;
        ctx.font = `${6 + (zPhase - 0.3) * 3}px sans-serif`;
        ctx.fillText('z', 14 + (zPhase - 0.3) * 3, -10 - (zPhase - 0.3) * 8);
      }
    }

    // === PETTING BLUSH ===
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(255, 150, 150, 0.25)';
      ctx.beginPath();
      ctx.ellipse(-7, -5, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, -5, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};
