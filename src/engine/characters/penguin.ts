import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const penguin: CharacterStyle = {
  id: 'penguin',
  name: 'Penguin',
  description: 'A nerdy Linux-style penguin (Tux inspired). Loves open source, hates proprietary software, and will interject about GNU/Linux at every opportunity.',
  colors: { primary: '#1a1a2e', secondary: '#ffffff', accent: '#FF8C00' },
  personality: {
    speechStyle: 'nerdy',
    catchphrase: "I'd just like to interject for a moment...",
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    typing_along: [
      'sudo make me a sandwich',
      'Kernel panic! ...just kidding.',
      'chmod 777? You absolute madman.',
      'Have you tried piping it to /dev/null?',
    ],
    thinking: [
      'Compiling... with gcc, obviously.',
      'Let me grep my memory banks...',
      'This calls for a man page.',
    ],
    idle: [
      'BTW, I use Arch.',
      'Have you tried turning it off and on again?',
      "I'd just like to interject for a moment...",
      'Free as in freedom, not as in beer.',
    ],
    overheat: [
      'My CPU is thermal throttling!',
      'Someone forgot to apply thermal paste...',
      'This is what happens without proper cooling.',
    ],
    victory: [
      'Another successful build!',
      'rm -rf problems && echo "solved"',
      'The penguin prevails!',
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
    const breathe = 1 + Math.sin(t * 0.003) * 0.006;
    ctx.scale(1, breathe);

    // State-specific transforms
    let jumpOffset = 0;
    let colorTint = '';
    let tintAmount = 0;
    let flipperAngleLeft = 0;
    let flipperAngleRight = 0;
    let waddleAngle = 0;
    let bellyPuff = 0;
    let isBellySlide = false;
    let headTuck = 0;

    switch (animState) {
      case 'idle': {
        // Subtle waddle — body rocks side to side gently
        waddleAngle = Math.sin(t * 0.003) * 0.03;
        ctx.rotate(waddleAngle);
        // Flippers rest at sides with tiny motion
        flipperAngleLeft = Math.sin(t * 0.002) * 0.05;
        flipperAngleRight = Math.sin(t * 0.002 + Math.PI) * 0.05;
        break;
      }
      case 'dragging': {
        ctx.rotate(Math.sin(t * 0.01) * 0.08);
        flipperAngleLeft = -0.5;
        flipperAngleRight = -0.5;
        break;
      }
      case 'wobble': {
        ctx.rotate(Math.sin(t * 0.015) * 0.2);
        flipperAngleLeft = Math.sin(t * 0.015) * 0.4;
        flipperAngleRight = Math.sin(t * 0.015 + Math.PI) * 0.4;
        break;
      }
      case 'chasing': {
        // Belly slide pose
        isBellySlide = true;
        ctx.translate(0, 4);
        ctx.rotate(Math.sin(t * 0.008) * 0.03);
        break;
      }
      case 'petting': {
        colorTint = '#ffaacc';
        tintAmount = 0.15 + Math.sin(t * 0.005) * 0.05;
        // Lean forward, belly puffs
        ctx.rotate(Math.sin(t * 0.003) * 0.03);
        bellyPuff = 2 + Math.sin(t * 0.004) * 0.5;
        break;
      }
      case 'typing_along': {
        // Flippers tap rapidly
        const bob = Math.sin(t * 0.012) * 1;
        ctx.translate(0, bob);
        flipperAngleLeft = Math.sin(t * 0.04) * 0.6;
        flipperAngleRight = Math.sin(t * 0.04 + Math.PI) * 0.6;
        break;
      }
      case 'overheat': {
        colorTint = '#ff3300';
        tintAmount = 0.15 + Math.sin(t * 0.01) * 0.08;
        // Fanning with one flipper
        flipperAngleRight = -0.8 + Math.sin(t * 0.025) * 0.5;
        ctx.translate(
          Math.random() * 0.8 - 0.4,
          Math.random() * 0.8 - 0.4
        );
        break;
      }
      case 'thinking': {
        // One flipper up to "chin"
        flipperAngleRight = -0.7;
        ctx.rotate(Math.sin(t * 0.002) * 0.02);
        break;
      }
      case 'victory': {
        // Both flippers up, small jump
        jumpOffset = -Math.abs(Math.sin(t * 0.008)) * 5;
        ctx.translate(0, jumpOffset);
        flipperAngleLeft = -1.3 + Math.sin(t * 0.012) * 0.2;
        flipperAngleRight = -1.3 + Math.sin(t * 0.012 + 0.5) * 0.2;
        break;
      }
      case 'stretching': {
        const stretchPhase = Math.sin(t * 0.004);
        ctx.scale(1 + stretchPhase * 0.04, 1 - stretchPhase * 0.03);
        flipperAngleLeft = -0.9 + stretchPhase * 0.3;
        flipperAngleRight = -0.9 - stretchPhase * 0.3;
        break;
      }
      case 'paper_unroll': {
        ctx.rotate(Math.sin(t * 0.005) * 0.03);
        flipperAngleLeft = -0.4;
        flipperAngleRight = 0.4;
        break;
      }
      case 'sleeping': {
        // Head tucked into chest, standing
        headTuck = 3;
        ctx.translate(0, 1);
        ctx.rotate(Math.sin(t * 0.001) * 0.015);
        break;
      }
      case 'waving': {
        flipperAngleRight = -1.1 + Math.sin(t * 0.012) * 0.5;
        break;
      }
    }

    // --- SHADOW ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBellySlide) {
      // --- BELLY SLIDE POSE (chasing) ---
      ctx.save();
      ctx.rotate(-0.05);

      // Body (horizontal oval)
      const slideGrad = ctx.createLinearGradient(-12, -4, 12, 8);
      slideGrad.addColorStop(0, '#1a1a2e');
      slideGrad.addColorStop(0.5, '#242444');
      slideGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = slideGrad;
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // White belly (bottom visible)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 6, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(-8, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Eyes on head
      drawStandardEyes(ctx, state, eyeMode, {
        eyeY: -3,
        eyeSpacing: 4,
        eyeRadius: 3.5,
        pupilRadius: 1.8,
        outlineColor: '#0a0a15',
        irisColor: '#111122',
      });

      // Beak
      ctx.fillStyle = '#FF8C00';
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.lineTo(-17, -1);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();

      // Flippers back
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.ellipse(10, -2, 4, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(10, 2, 4, 2.5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Speed lines
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.3)';
      ctx.lineWidth = 0.8;
      const speedPhase = t * 0.02;
      for (let i = 0; i < 3; i++) {
        const sx = 14 + ((speedPhase + i * 6) % 12);
        const sy = -2 + i * 4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 5, sy);
        ctx.stroke();
      }

      ctx.restore();
    } else {
      // --- NORMAL STANDING POSE ---

      // --- FEET ---
      const feetY = 18;
      ctx.fillStyle = '#FF8C00';
      // Left foot
      ctx.beginPath();
      ctx.moveTo(-6, feetY);
      ctx.lineTo(-9, feetY + 4);
      ctx.lineTo(-3, feetY + 4);
      ctx.closePath();
      ctx.fill();
      // Webbing detail
      ctx.strokeStyle = '#cc7000';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-6, feetY);
      ctx.lineTo(-7, feetY + 3.5);
      ctx.moveTo(-6, feetY);
      ctx.lineTo(-5, feetY + 3.5);
      ctx.stroke();

      // Right foot
      ctx.fillStyle = '#FF8C00';
      ctx.beginPath();
      ctx.moveTo(6, feetY);
      ctx.lineTo(3, feetY + 4);
      ctx.lineTo(9, feetY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cc7000';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(6, feetY);
      ctx.lineTo(5, feetY + 3.5);
      ctx.moveTo(6, feetY);
      ctx.lineTo(7, feetY + 3.5);
      ctx.stroke();

      // --- BODY (black oval) ---
      let bodyColor = '#1a1a2e';
      if (colorTint && tintAmount > 0) {
        bodyColor = blendColor(bodyColor, colorTint, tintAmount);
      }

      const bodyGrad = ctx.createRadialGradient(3, -4, 2, 0, 2, 20);
      bodyGrad.addColorStop(0, '#2d2d4a');
      bodyGrad.addColorStop(0.4, bodyColor);
      bodyGrad.addColorStop(1, '#0d0d1a');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 2, 12, 17, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle outline
      ctx.strokeStyle = 'rgba(60, 60, 100, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Shine on black body (top-left highlight)
      const shineGrad = ctx.createRadialGradient(-5, -8, 0, -5, -8, 8);
      shineGrad.addColorStop(0, 'rgba(100, 100, 160, 0.2)');
      shineGrad.addColorStop(1, 'rgba(100, 100, 160, 0)');
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.ellipse(-4, -6, 6, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // --- WHITE BELLY PATCH ---
      let bellyColor = '#ffffff';
      if (colorTint && tintAmount > 0) {
        bellyColor = blendColor(bellyColor, colorTint, tintAmount * 0.3);
      }

      const bellyGrad = ctx.createLinearGradient(0, -8, 0, 16);
      bellyGrad.addColorStop(0, bellyColor);
      bellyGrad.addColorStop(0.7, '#f0f0f5');
      bellyGrad.addColorStop(1, '#e8e8ee');

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 4 + bellyPuff * 0.3, 7 + bellyPuff * 0.3, 12 + bellyPuff * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Belly subtle border
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.3)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // --- FLIPPERS ---
      // Left flipper
      ctx.save();
      ctx.translate(-11, -2);
      ctx.rotate(flipperAngleLeft);
      const leftFlipGrad = ctx.createLinearGradient(0, -5, -4, 8);
      leftFlipGrad.addColorStop(0, '#2a2a45');
      leftFlipGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = leftFlipGrad;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(-3, -3, -5, 4, -3, 10);
      ctx.bezierCurveTo(-1, 11, 1, 10, 2, 8);
      ctx.bezierCurveTo(3, 4, 2, -2, 0, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(60, 60, 100, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      // Right flipper
      ctx.save();
      ctx.translate(11, -2);
      ctx.rotate(flipperAngleRight);
      const rightFlipGrad = ctx.createLinearGradient(0, -5, 4, 8);
      rightFlipGrad.addColorStop(0, '#2a2a45');
      rightFlipGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = rightFlipGrad;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(3, -3, 5, 4, 3, 10);
      ctx.bezierCurveTo(1, 11, -1, 10, -2, 8);
      ctx.bezierCurveTo(-3, 4, -2, -2, 0, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(60, 60, 100, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      // --- HEAD (upper portion of body, same black) ---
      // The head is the top of the oval, so we just draw the face features on top

      // --- EYES ---
      drawStandardEyes(ctx, state, eyeMode, {
        eyeY: -8 + headTuck,
        eyeSpacing: 5,
        eyeRadius: 4.5,
        pupilRadius: 2.2,
        outlineColor: '#0a0a15',
        irisColor: '#111122',
      });

      // --- BEAK ---
      const beakY = -2 + headTuck;
      ctx.fillStyle = '#FF8C00';
      ctx.beginPath();
      ctx.moveTo(-2.5, beakY);
      ctx.lineTo(0, beakY + 3.5);
      ctx.lineTo(2.5, beakY);
      ctx.closePath();
      ctx.fill();

      // Beak highlight
      const beakHighlight = ctx.createLinearGradient(-1, beakY, 1, beakY + 3);
      beakHighlight.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
      beakHighlight.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = beakHighlight;
      ctx.beginPath();
      ctx.moveTo(-1.5, beakY + 0.5);
      ctx.lineTo(0, beakY + 2.5);
      ctx.lineTo(1.5, beakY + 0.5);
      ctx.closePath();
      ctx.fill();

      // Beak outline
      ctx.strokeStyle = '#cc6600';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-2.5, beakY);
      ctx.lineTo(0, beakY + 3.5);
      ctx.lineTo(2.5, beakY);
      ctx.closePath();
      ctx.stroke();
    }

    // --- PETTING BLUSH ---
    if (animState === 'petting') {
      ctx.fillStyle = 'rgba(255, 150, 180, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-8, -5 + headTuck, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -5 + headTuck, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- SLEEPING ZZZ ---
    if (animState === 'sleeping') {
      // Small closed mouth
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1.5, 2 + headTuck);
      ctx.lineTo(1.5, 2 + headTuck);
      ctx.stroke();

      // Zzz floating up
      const zPhase = (t * 0.001) % 3;
      ctx.fillStyle = `rgba(100, 100, 150, ${0.5 + Math.sin(t * 0.002) * 0.2})`;
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 9 + zPhase, -12 - zPhase * 2);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 11 + zPhase * 0.5, -16 - zPhase * 2);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 12 + zPhase * 0.3, -19 - zPhase * 2);
    }

    // --- THINKING DOTS ---
    if (animState === 'thinking') {
      const dotPhase = t * 0.003;
      for (let i = 0; i < 3; i++) {
        const alpha = (Math.sin(dotPhase + i * 0.8) + 1) / 2 * 0.6 + 0.2;
        ctx.fillStyle = `rgba(100, 100, 150, ${alpha})`;
        ctx.beginPath();
        ctx.arc(12 + i * 3.5, -16 - i * 3, 1.5 - i * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- OVERHEAT SWEAT DROPS ---
    if (animState === 'overheat') {
      const sweatPhase = t * 0.004;
      ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
      for (let i = 0; i < 3; i++) {
        const dropY = ((sweatPhase + i * 2.5) % 8);
        const dropX = -8 + i * 8;
        ctx.beginPath();
        ctx.moveTo(dropX, -14 + dropY);
        ctx.bezierCurveTo(
          dropX - 1.5, -12 + dropY,
          dropX - 1.5, -10 + dropY,
          dropX, -9 + dropY
        );
        ctx.bezierCurveTo(
          dropX + 1.5, -10 + dropY,
          dropX + 1.5, -12 + dropY,
          dropX, -14 + dropY
        );
        ctx.fill();
      }
    }

    // --- VICTORY SPARKLES ---
    if (animState === 'victory') {
      const sparkPhase = t * 0.006;
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.7)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle = sparkPhase + i * (Math.PI / 2);
        const dist = 16 + Math.sin(sparkPhase + i) * 3;
        const sx = Math.cos(angle) * dist;
        const sy = -5 + Math.sin(angle) * dist * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx - 1.5, sy);
        ctx.lineTo(sx + 1.5, sy);
        ctx.moveTo(sx, sy - 1.5);
        ctx.lineTo(sx, sy + 1.5);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
