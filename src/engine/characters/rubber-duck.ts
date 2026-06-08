import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const rubberDuck: CharacterStyle = {
  id: 'rubber-duck',
  name: 'Rubber Duck',
  description: 'A classic yellow rubber duck — the patron saint of rubber duck debugging. Explain your code to the duck. The duck judges silently.',
  colors: { primary: '#FFD700', secondary: '#FF8C00', accent: '#4169E1' },
  personality: {
    speechStyle: 'casual',
    catchphrase: 'Quack. Now explain your code to me.',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    typing_along: [
      'Quack quack quack... that\'s debugging protocol.',
      'Tell me about the bug. I\'m listening. Quack.',
      'Keep typing. I\'m absorbing your logic through osmosis.',
      'Every keystroke brings you closer to enlightenment. Quack.',
    ],
    idle: [
      'Just floating here. Judging your variable names.',
      'Rubber duck debugging: step 1 is admitting you have a bug.',
      '*floats judgmentally*',
      'Go on. Explain it to me. I have all day.',
    ],
    greeting: [
      'Quack! Ready to debug?',
      'Place me by your monitor. Tell me everything.',
      'Quack. The debugging session begins.',
    ],
    petting: [
      '*squeak squeak* That\'s the spot.',
      'Squeezing me won\'t fix your merge conflicts.',
      'Quack! Gentle!',
    ],
    victory: [
      'QUACK QUACK QUACK! We did it!',
      '*splashes triumphantly*',
      'The bug is squashed. The duck is pleased.',
    ],
    overheat: [
      'I\'m... melting... rubber... can\'t... take...',
      'Too many nested loops... duck overheating...',
      'Quack... quack... *deflating noises*',
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

    // Animation variables
    let rockAngle = Math.sin(t * 0.002) * 0.04; // gentle floating rock
    let bobY = Math.sin(t * 0.003) * 1.0; // vertical bob
    let ripplePhase = t * 0.004; // water ripple animation
    let beakOpen = 0;
    let headTuck = 0;
    let wingRaise = 0;
    let blushAlpha = 0;
    let overheatSag = 0;
    let splashIntensity = 0;
    let squeakMark = false;
    let victoryBounce = 0;
    let paddleSpeed = 0;
    let headPeck = 0;
    let meltWave = 0;

    switch (animState) {
      case 'idle':
        // Occasional squeak (every ~8 seconds)
        squeakMark = (t % 8000) > 7600 && (t % 8000) < 7900;
        break;
      case 'dragging':
        rockAngle = Math.sin(t * 0.015) * 0.15;
        bobY = Math.sin(t * 0.01) * 3;
        splashIntensity = 0.6;
        break;
      case 'wobble':
        rockAngle = Math.sin(t * 0.02) * 0.2;
        bobY = Math.sin(t * 0.015) * 2;
        splashIntensity = 0.4;
        break;
      case 'chasing':
        rockAngle = -0.15; // leaning forward
        paddleSpeed = t * 0.03;
        bobY = Math.sin(t * 0.01) * 1.5;
        splashIntensity = 0.8;
        break;
      case 'petting':
        blushAlpha = 0.3 + Math.sin(t * 0.004) * 0.1;
        bobY = Math.sin(t * 0.005) * 0.5 + 1; // squishes down
        break;
      case 'typing_along':
        headPeck = Math.abs(Math.sin(t * 0.015)) * 3; // pecking motion
        splashIntensity = 0.2 + Math.abs(Math.sin(t * 0.015)) * 0.2;
        break;
      case 'overheat':
        overheatSag = 2 + Math.sin(t * 0.003) * 1;
        meltWave = t * 0.005;
        bobY = 2;
        break;
      case 'thinking':
        rockAngle = Math.sin(t * 0.001) * 0.02;
        bobY = Math.sin(t * 0.002) * 0.5;
        break;
      case 'victory':
        beakOpen = 0.8;
        victoryBounce = Math.abs(Math.sin(t * 0.008)) * 5;
        splashIntensity = 0.9;
        break;
      case 'stretching':
        wingRaise = 0.4 + Math.sin(t * 0.004) * 0.3;
        rockAngle = Math.sin(t * 0.003) * 0.06;
        break;
      case 'paper_unroll':
        headPeck = Math.sin(t * 0.006) * 1.5;
        bobY = Math.sin(t * 0.004) * 0.8;
        break;
      case 'sleeping':
        headTuck = 1;
        rockAngle = Math.sin(t * 0.001) * 0.01;
        bobY = Math.sin(t * 0.001) * 0.3;
        break;
      case 'waving':
        wingRaise = 0.6 + Math.sin(t * 0.012) * 0.4;
        bobY = Math.sin(t * 0.005) * 1;
        break;
    }

    // Apply transforms
    ctx.rotate(rockAngle);
    ctx.translate(0, -victoryBounce + bobY);

    // ====== WATER RIPPLES (below body) ======
    ctx.save();
    const rippleY = 16;
    const rippleAlpha = 0.25 + splashIntensity * 0.3;

    // Three concentric ripple ellipses
    for (let i = 0; i < 3; i++) {
      const rippleOffset = Math.sin(ripplePhase + i * 1.2) * 1.5;
      const rippleWidth = 12 + i * 4 + rippleOffset;
      const alpha = rippleAlpha * (1 - i * 0.25);

      ctx.strokeStyle = `rgba(65, 105, 225, ${alpha})`;
      ctx.lineWidth = 0.8 - i * 0.15;
      ctx.beginPath();
      ctx.ellipse(0, rippleY + i * 1.5, rippleWidth, 2 + i * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Splash droplets (when splashing)
    if (splashIntensity > 0.3) {
      ctx.fillStyle = `rgba(65, 105, 225, ${splashIntensity * 0.5})`;
      for (let i = 0; i < 4; i++) {
        const dropX = Math.sin(t * 0.01 + i * 1.8) * (8 + i * 3);
        const dropY = rippleY - 2 - Math.abs(Math.sin(t * 0.012 + i * 2)) * 4 * splashIntensity;
        ctx.beginPath();
        ctx.ellipse(dropX, dropY, 1, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ====== TAIL NUB ======
    ctx.save();
    ctx.translate(0, -2);
    const tailGrad = ctx.createLinearGradient(8, -2, 12, -6);
    tailGrad.addColorStop(0, '#FFD700');
    tailGrad.addColorStop(1, '#FFC200');

    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.quadraticCurveTo(11, -1, 10, -5);
    ctx.quadraticCurveTo(9, -6, 8, -4);
    ctx.quadraticCurveTo(7, -1, 7, 2);
    ctx.closePath();
    ctx.fill();

    // Tail outline
    ctx.strokeStyle = 'rgba(180, 140, 0, 0.4)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.quadraticCurveTo(11, -1, 10, -5);
    ctx.quadraticCurveTo(9, -6, 8, -4);
    ctx.stroke();
    ctx.restore();

    // ====== BODY ======
    ctx.save();
    const bodyY = 4 + overheatSag;

    // Body shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(1, bodyY + 2, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body (oval, bright yellow with rubber sheen)
    let bodyColor = '#FFD700';
    if (overheatSag > 0) {
      bodyColor = blendColor('#FFD700', '#FF6347', overheatSag * 0.1);
    }

    const bodyGrad = ctx.createRadialGradient(-4, bodyY - 5, 2, 0, bodyY, 13);
    bodyGrad.addColorStop(0, blendColor(bodyColor, '#FFFFFF', 0.35));
    bodyGrad.addColorStop(0.4, bodyColor);
    bodyGrad.addColorStop(0.75, '#E6C200');
    bodyGrad.addColorStop(1, '#CC9900');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();

    if (meltWave > 0) {
      // Melting wavy edges for overheat
      const segments = 24;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const rx = 12 + Math.sin(meltWave + i * 0.8) * 1.5;
        const ry = 10 + Math.sin(meltWave + i * 0.5) * 1.2 + (Math.sin(angle) > 0 ? overheatSag * 0.5 : 0);
        const px = Math.cos(angle) * rx;
        const py = bodyY + Math.sin(angle) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.ellipse(0, bodyY, 12, 10, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Flat bottom (clip off the very bottom to imply floating)
    ctx.fillStyle = blendColor(bodyColor, '#B8860B', 0.2);
    ctx.beginPath();
    ctx.ellipse(0, bodyY + 8, 10, 3, 0, 0, Math.PI);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(180, 130, 0, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, bodyY, 12, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight circle (plastic sheen on body)
    const sheenGrad = ctx.createRadialGradient(-5, bodyY - 4, 0, -5, bodyY - 4, 5);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.beginPath();
    ctx.arc(-5, bodyY - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ====== WING BUMPS ======
    ctx.save();
    const wingY = bodyY + 1;

    // Left wing bump
    const leftWingAngle = wingRaise > 0 ? -wingRaise * 1.2 : 0;
    ctx.save();
    ctx.translate(-10, wingY);
    ctx.rotate(leftWingAngle);

    const wingGrad = ctx.createLinearGradient(0, -3, -4, 3);
    wingGrad.addColorStop(0, '#F0C800');
    wingGrad.addColorStop(1, '#D4A800');

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(-5, -1, -4, 3);
    ctx.quadraticCurveTo(-2, 5, 0, 4);
    ctx.quadraticCurveTo(1, 2, 0, -3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(180, 130, 0, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // Right wing bump
    const rightWingAngle = wingRaise > 0 ? wingRaise * 1.2 : 0;
    ctx.save();
    ctx.translate(10, wingY);
    ctx.rotate(rightWingAngle);

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(5, -1, 4, 3);
    ctx.quadraticCurveTo(2, 5, 0, 4);
    ctx.quadraticCurveTo(-1, 2, 0, -3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(180, 130, 0, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // ====== HEAD ======
    ctx.save();
    const headY = -9 - headPeck * 0.3;
    const headX = headPeck > 0 ? -headPeck * 0.2 : 0;

    if (headTuck > 0) {
      // Sleeping: head tucked back
      ctx.translate(2 * headTuck, 3 * headTuck);
      ctx.rotate(0.2 * headTuck);
    }

    // Head shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.beginPath();
    ctx.arc(headX + 0.5, headY + 1, 9, 0, Math.PI * 2);
    ctx.fill();

    // Head (slightly taller round shape)
    let headColor = '#FFD700';
    if (overheatSag > 0) {
      headColor = blendColor('#FFD700', '#FF6347', overheatSag * 0.08);
    }

    const headGrad = ctx.createRadialGradient(headX - 2, headY - 3, 1, headX, headY, 9);
    headGrad.addColorStop(0, blendColor(headColor, '#FFFFFF', 0.4));
    headGrad.addColorStop(0.5, headColor);
    headGrad.addColorStop(1, '#D4A800');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(headX, headY, 8.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = 'rgba(180, 130, 0, 0.3)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(headX, headY, 8.5, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Head highlight (plastic sheen circle)
    const headSheenGrad = ctx.createRadialGradient(headX - 3, headY - 4, 0, headX - 3, headY - 4, 4);
    headSheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    headSheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = headSheenGrad;
    ctx.beginPath();
    ctx.arc(headX - 3, headY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // ====== BEAK ======
    ctx.save();
    const beakX = headX - 7;
    const beakY = headY + 2 + (headPeck > 0 ? headPeck * 0.2 : 0);

    // Upper beak
    const upperBeakGrad = ctx.createLinearGradient(beakX, beakY - 2, beakX - 8, beakY);
    upperBeakGrad.addColorStop(0, '#FF8C00');
    upperBeakGrad.addColorStop(0.5, '#FF7700');
    upperBeakGrad.addColorStop(1, '#E06500');

    ctx.fillStyle = upperBeakGrad;
    ctx.beginPath();
    ctx.moveTo(beakX, beakY - 1.5);
    ctx.quadraticCurveTo(beakX - 5, beakY - 2.5, beakX - 9, beakY - 0.5 - beakOpen * 2);
    ctx.quadraticCurveTo(beakX - 9, beakY + 0.5 - beakOpen, beakX - 7, beakY + 0.5 - beakOpen);
    ctx.quadraticCurveTo(beakX - 3, beakY + 0.5, beakX, beakY + 0.5);
    ctx.closePath();
    ctx.fill();

    // Upper beak highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(beakX - 1, beakY - 1.3);
    ctx.quadraticCurveTo(beakX - 4, beakY - 2, beakX - 7, beakY - 0.8 - beakOpen);
    ctx.stroke();

    // Lower beak
    const lowerBeakGrad = ctx.createLinearGradient(beakX, beakY + 0.5, beakX - 7, beakY + 2);
    lowerBeakGrad.addColorStop(0, '#FFA040');
    lowerBeakGrad.addColorStop(1, '#E07020');

    ctx.fillStyle = lowerBeakGrad;
    ctx.beginPath();
    ctx.moveTo(beakX, beakY + 0.5);
    ctx.quadraticCurveTo(beakX - 4, beakY + 1 + beakOpen * 2, beakX - 8, beakY + 1 + beakOpen * 3);
    ctx.quadraticCurveTo(beakX - 9, beakY + 0.5 + beakOpen * 2, beakX - 7, beakY + 0.5 + beakOpen);
    ctx.quadraticCurveTo(beakX - 3, beakY + 0.5, beakX, beakY + 0.5);
    ctx.closePath();
    ctx.fill();

    // Beak outline
    ctx.strokeStyle = 'rgba(150, 80, 0, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(beakX, beakY - 1.5);
    ctx.quadraticCurveTo(beakX - 5, beakY - 2.5, beakX - 9, beakY - 0.5 - beakOpen * 2);
    ctx.stroke();

    // Nostril dots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(beakX - 3, beakY - 0.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(beakX - 4.5, beakY - 0.8, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ====== EYES ======
    if (headTuck < 0.5) {
      const eyeY = headY - 2;
      const eyeSpacing = 4;
      const eyeR = 3.5;

      if (eyeMode === 'happy') {
        // Happy ^^ arcs
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(headX - eyeSpacing, eyeY + 1, 2.2, Math.PI + 0.4, -0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(headX + eyeSpacing, eyeY + 1, 2.2, Math.PI + 0.4, -0.4);
        ctx.stroke();
      } else if (eyeMode === 'dead') {
        // X X eyes
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 1.5;
        const s = 2.2;
        for (const side of [-1, 1]) {
          const cx = headX + side * eyeSpacing;
          ctx.beginPath(); ctx.moveTo(cx - s, eyeY - s); ctx.lineTo(cx + s, eyeY + s); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + s, eyeY - s); ctx.lineTo(cx - s, eyeY + s); ctx.stroke();
        }
      } else if (eyeMode === 'sleeping') {
        // Horizontal lines
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(headX - eyeSpacing - 2.5, eyeY); ctx.lineTo(headX - eyeSpacing + 2.5, eyeY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(headX + eyeSpacing - 2.5, eyeY); ctx.lineTo(headX + eyeSpacing + 2.5, eyeY); ctx.stroke();
      } else {
        // Normal, surprised, looking_up — draw full eyes with pupils
        const blinkCycle = t % 4200;
        const isBlinking = blinkCycle > 3900;
        const actualEyeR = eyeMode === 'surprised' ? eyeR + 1.2 : eyeR;

        for (const side of [-1, 1]) {
          const ex = headX + side * eyeSpacing;

          // Eye shadow
          ctx.fillStyle = 'rgba(40, 40, 50, 0.15)';
          ctx.beginPath();
          ctx.arc(ex, eyeY + 0.4, actualEyeR + 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Eye white
          ctx.fillStyle = '#FDFDFF';
          ctx.beginPath();
          ctx.arc(ex, eyeY, actualEyeR, 0, Math.PI * 2);
          ctx.fill();

          // Eye outline
          ctx.strokeStyle = '#2A2A30';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        if (!isBlinking) {
          let pupilOffX = state.eyeOffsetX * 0.4;
          let pupilOffY = state.eyeOffsetY * 0.4;
          if (eyeMode === 'looking_up') {
            pupilOffX = 0;
            pupilOffY = -2.0;
          }

          for (const side of [-1, 1]) {
            const ex = headX + side * eyeSpacing + pupilOffX;
            const ey = eyeY + pupilOffY;

            // Pupil (simple black dot — classic rubber duck style)
            ctx.fillStyle = '#1A1A1E';
            ctx.beginPath();
            ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(ex - 0.7, ey - 0.8, 0.9, 0, Math.PI * 2);
            ctx.fill();

            // Secondary highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(ex + 0.5, ey + 0.5, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Blink
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(headX + side * eyeSpacing, eyeY, 2.5, 0.2, Math.PI - 0.2);
            ctx.stroke();
          }
        }
      }

      // Petting blush (rosy cheeks)
      if (blushAlpha > 0) {
        ctx.fillStyle = `rgba(255, 120, 100, ${blushAlpha})`;
        ctx.beginPath();
        ctx.ellipse(headX - eyeSpacing - 1, eyeY + 4, 2.5, 1.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(headX + eyeSpacing + 1, eyeY + 4, 2.5, 1.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Sleeping: tucked head shows closed eye lines
      const sleepEyeY = headY - 1;
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX - 5, sleepEyeY);
      ctx.lineTo(headX - 1, sleepEyeY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 1, sleepEyeY);
      ctx.lineTo(headX + 5, sleepEyeY);
      ctx.stroke();

      // Z's floating up
      const zDrift = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 100, 140, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', headX + 8, headY - 6 + zDrift);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', headX + 11, headY - 10 + zDrift * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', headX + 13, headY - 13 + zDrift * 0.5);
    }

    ctx.restore(); // head

    // ====== PADDLING LINES (chasing) ======
    if (paddleSpeed > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(65, 105, 225, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const lx = 8 + i * 3;
        const ly = 12 + Math.sin(paddleSpeed + i * 2) * 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 4, ly + 1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ====== SQUEAK MARK (!) ======
    if (squeakMark) {
      ctx.save();
      ctx.fillStyle = 'rgba(60, 60, 70, 0.7)';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -22);
      ctx.restore();
    }

    // ====== OVERHEAT DRIP EFFECTS ======
    if (overheatSag > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 200, 0, ${overheatSag * 0.2})`;
      // Drip marks on sides
      for (let i = 0; i < 3; i++) {
        const dripX = -6 + i * 6;
        const dripY = bodyY + 8 + Math.sin(t * 0.003 + i) * 2;
        ctx.beginPath();
        ctx.ellipse(dripX, dripY, 1, 2 + overheatSag * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  },
};
