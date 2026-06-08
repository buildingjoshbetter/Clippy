import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const parrot: CharacterStyle = {
  id: 'parrot',
  name: 'Parrot',
  description: 'A vibrant tropical parrot perched on a branch. Energetic, colorful, and always ready to squawk encouragement at your code.',
  colors: { primary: '#2ecc71', secondary: '#e74c3c', accent: '#f39c12' },
  personality: {
    speechStyle: 'energetic',
    catchphrase: 'Polly wants a commit!',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    typing_along: [
      'Toucan play at this game!',
      'Beak performance!',
      'Squawk squawk — that\'s bird for \'nice code\'.',
      'Feathering your nest with functions!',
    ],
    petting: [
      'Ruffle my feathers more!',
      'Pretty bird! Pretty bird!',
      'Oooh right on the crest!',
    ],
    idle: [
      'Polly wants a commit!',
      '*preens feathers* Looking good over here.',
      'SQUAWK! ...sorry, got excited.',
    ],
    victory: [
      'BRAWK! We did it! Wings up!',
      'That deserves a victory screech!',
      'Feathers ruffled with PRIDE!',
    ],
    overheat: [
      'Too... many... tropical... degrees...',
      '*pants with beak open* Need... seed water...',
      'Even parrots have limits!',
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

    // Idle animation: head bob and tail sway
    let headBob = Math.sin(t * 0.004) * 1.2;
    let tailSway = Math.sin(t * 0.003) * 2;
    let wingAngle = 0;
    let wingSpread = 0;
    let crestFan = 0;
    let bodyRotation = 0;
    let blushAlpha = 0;
    let overheatTint = 0;
    let isSleepingTuck = false;
    let flyingPose = false;
    let tongueOut = false;
    let waveWing = 0;
    let victoryJump = 0;
    let typingFlap = 0;

    switch (animState) {
      case 'idle':
        // defaults are fine
        break;
      case 'dragging':
        headBob = Math.sin(t * 0.01) * 3;
        tailSway = Math.sin(t * 0.015) * 5;
        break;
      case 'wobble':
        headBob = Math.sin(t * 0.02) * 4;
        bodyRotation = Math.sin(t * 0.015) * 0.1;
        break;
      case 'chasing':
        flyingPose = true;
        wingSpread = 1;
        wingAngle = Math.sin(t * 0.02) * 0.4;
        headBob = 0;
        break;
      case 'petting':
        headBob = Math.sin(t * 0.005) * 0.5 + 2;
        crestFan = 1;
        blushAlpha = 0.3 + Math.sin(t * 0.004) * 0.1;
        break;
      case 'typing_along':
        typingFlap = Math.sin(t * 0.03) * 0.6;
        headBob = Math.sin(t * 0.008) * 0.8;
        break;
      case 'overheat':
        overheatTint = 0.3 + Math.sin(t * 0.005) * 0.1;
        tongueOut = true;
        headBob = Math.sin(t * 0.006) * 0.5;
        tailSway = Math.sin(t * 0.01) * 4;
        break;
      case 'thinking':
        headBob = Math.sin(t * 0.002) * 0.6 - 1;
        break;
      case 'victory':
        wingSpread = 1;
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 4;
        crestFan = 0.8;
        break;
      case 'stretching':
        wingSpread = 0.6 + Math.sin(t * 0.004) * 0.4;
        headBob = -2 + Math.sin(t * 0.003) * 1;
        break;
      case 'paper_unroll':
        headBob = Math.sin(t * 0.006) * 1;
        typingFlap = Math.sin(t * 0.01) * 0.3;
        break;
      case 'sleeping':
        isSleepingTuck = true;
        headBob = Math.sin(t * 0.001) * 0.3;
        break;
      case 'waving':
        waveWing = Math.sin(t * 0.012) * 0.5;
        headBob = Math.sin(t * 0.006) * 1;
        break;
    }

    // Apply flying rotation for chasing
    if (flyingPose) {
      ctx.rotate(-0.3);
      ctx.translate(0, -2);
    }

    // Apply wobble rotation
    if (bodyRotation !== 0) {
      ctx.rotate(bodyRotation);
    }

    // Victory jump offset
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }

    // ====== BRANCH ======
    if (!flyingPose) {
      ctx.strokeStyle = '#5d3a1a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-16, 18);
      ctx.quadraticCurveTo(-4, 20, 14, 17);
      ctx.stroke();

      // Branch highlight
      ctx.strokeStyle = '#7a4f2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-14, 17.5);
      ctx.quadraticCurveTo(-4, 19, 12, 16.5);
      ctx.stroke();
    }

    // ====== TAIL FEATHERS ======
    ctx.save();
    ctx.translate(0, 12);
    ctx.rotate(tailSway * 0.02);

    // Three tail feathers (blue and red gradient)
    const tailColors = ['#3498db', '#2980b9', '#e74c3c'];
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 3;
      const featherLen = 10 + i * 2;
      ctx.save();
      ctx.translate(offset, 0);
      ctx.rotate((i - 1) * 0.08 + tailSway * 0.01);

      const grad = ctx.createLinearGradient(0, 0, 0, featherLen);
      grad.addColorStop(0, '#2ecc71');
      grad.addColorStop(0.5, tailColors[i]);
      grad.addColorStop(1, blendColor(tailColors[i], '#1a1a2e', 0.3));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-1.5, 0);
      ctx.quadraticCurveTo(-2, featherLen * 0.6, -1, featherLen);
      ctx.lineTo(1, featherLen);
      ctx.quadraticCurveTo(2, featherLen * 0.6, 1.5, 0);
      ctx.closePath();
      ctx.fill();

      // Feather center line
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(0, featherLen - 1);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // ====== BODY ======
    ctx.save();
    const bodyY = 2;

    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(1, bodyY + 2, 11, 13, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Main body (green oval, slightly tilted)
    let bodyColor = '#2ecc71';
    if (overheatTint > 0) {
      bodyColor = blendColor('#2ecc71', '#e74c3c', overheatTint);
    }
    const bodyGrad = ctx.createRadialGradient(-3, bodyY - 4, 2, 0, bodyY, 12);
    bodyGrad.addColorStop(0, blendColor(bodyColor, '#ffffff', 0.2));
    bodyGrad.addColorStop(0.6, bodyColor);
    bodyGrad.addColorStop(1, '#27ae60');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyY, 10, 12, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Belly (darker green)
    const bellyGrad = ctx.createRadialGradient(0, bodyY + 3, 1, 0, bodyY + 3, 7);
    bellyGrad.addColorStop(0, '#27ae60');
    bellyGrad.addColorStop(1, 'rgba(39,174,96,0)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyY + 3, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(30,80,40,0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, bodyY, 10, 12, 0.05, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // ====== WING (folded on side) ======
    ctx.save();
    const wingX = 7;
    const wingY = bodyY + 1;

    if (wingSpread > 0) {
      // Spread wings (victory, chasing, stretching)
      ctx.save();
      ctx.translate(-wingX, wingY - 3);
      ctx.rotate(-0.8 * wingSpread + wingAngle);

      const wingGrad = ctx.createLinearGradient(0, 0, -14, -8);
      wingGrad.addColorStop(0, '#27ae60');
      wingGrad.addColorStop(0.5, '#2ecc71');
      wingGrad.addColorStop(1, '#3498db');

      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, -6, -14, -4);
      ctx.quadraticCurveTo(-16, -2, -14, 2);
      ctx.quadraticCurveTo(-8, 3, 0, 4);
      ctx.closePath();
      ctx.fill();

      // Wing feather details
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-2 - i * 3, -1 + i * 0.5);
        ctx.lineTo(-4 - i * 3, -3 + i * 0.3);
        ctx.stroke();
      }
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.translate(wingX, wingY - 3);
      ctx.rotate(0.8 * wingSpread - wingAngle);

      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -6, 14, -4);
      ctx.quadraticCurveTo(16, -2, 14, 2);
      ctx.quadraticCurveTo(8, 3, 0, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(2 + i * 3, -1 + i * 0.5);
        ctx.lineTo(4 + i * 3, -3 + i * 0.3);
        ctx.stroke();
      }
      ctx.restore();
    } else if (waveWing > 0) {
      // Waving wing (left side stays folded, right waves)
      // Folded left wing
      ctx.save();
      ctx.translate(wingX, wingY);
      const foldedGrad = ctx.createLinearGradient(0, -5, 0, 8);
      foldedGrad.addColorStop(0, '#27ae60');
      foldedGrad.addColorStop(1, '#1e8449');

      ctx.fillStyle = foldedGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -5);
      ctx.quadraticCurveTo(5, -3, 6, 2);
      ctx.quadraticCurveTo(5, 7, 0, 8);
      ctx.quadraticCurveTo(-3, 6, -2, -5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Waving right wing
      ctx.save();
      ctx.translate(-wingX, wingY - 4);
      ctx.rotate(-1.2 - waveWing);

      const waveGrad = ctx.createLinearGradient(0, 0, -12, -6);
      waveGrad.addColorStop(0, '#27ae60');
      waveGrad.addColorStop(1, '#2ecc71');

      ctx.fillStyle = waveGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-5, -4, -12, -3);
      ctx.quadraticCurveTo(-14, -1, -12, 2);
      ctx.quadraticCurveTo(-6, 3, 0, 3);
      ctx.closePath();
      ctx.fill();

      // Feather tips
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-13, -4);
      ctx.lineTo(-12, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // Folded wing with typing flap
      ctx.save();
      ctx.translate(wingX, wingY);
      ctx.rotate(typingFlap);

      const foldedGrad = ctx.createLinearGradient(0, -5, 0, 8);
      foldedGrad.addColorStop(0, '#27ae60');
      foldedGrad.addColorStop(1, '#1e8449');

      ctx.fillStyle = foldedGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -5);
      ctx.quadraticCurveTo(5, -3, 6, 2);
      ctx.quadraticCurveTo(5, 7, 0, 8);
      ctx.quadraticCurveTo(-3, 6, -2, -5);
      ctx.closePath();
      ctx.fill();

      // Feather layer strokes
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-1, -2);
      ctx.quadraticCurveTo(3, 0, 3, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(3, 2, 2, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1, 2);
      ctx.quadraticCurveTo(2, 4, 1, 7);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // ====== HEAD ======
    ctx.save();
    const headY = -11 + headBob;

    if (isSleepingTuck) {
      // Head tucked under wing
      ctx.translate(4, -6);
      ctx.rotate(0.3);
    }

    // Head shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.arc(0.5, headY + 1, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Head (round, green)
    let headColor = '#2ecc71';
    if (overheatTint > 0) {
      headColor = blendColor('#2ecc71', '#e74c3c', overheatTint * 0.5);
    }
    const headGrad = ctx.createRadialGradient(-2, headY - 2, 1, 0, headY, 8);
    headGrad.addColorStop(0, blendColor(headColor, '#ffffff', 0.25));
    headGrad.addColorStop(0.7, headColor);
    headGrad.addColorStop(1, '#27ae60');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, headY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = 'rgba(30,80,40,0.3)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(0, headY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // ====== CREST (red feather tuft) ======
    ctx.save();
    ctx.translate(0, headY - 7);
    const crestSpread = 1 + crestFan * 0.6;

    const crestFeathers = [
      { angle: -0.3 * crestSpread, len: 5 },
      { angle: -0.1 * crestSpread, len: 6.5 },
      { angle: 0.1 * crestSpread, len: 6 },
      { angle: 0.3 * crestSpread, len: 4.5 },
    ];

    for (const feather of crestFeathers) {
      ctx.save();
      ctx.rotate(feather.angle);

      const crestGrad = ctx.createLinearGradient(0, 0, 0, -feather.len);
      crestGrad.addColorStop(0, '#c0392b');
      crestGrad.addColorStop(0.5, '#e74c3c');
      crestGrad.addColorStop(1, '#f39c12');

      ctx.fillStyle = crestGrad;
      ctx.beginPath();
      ctx.moveTo(-1.2, 0);
      ctx.quadraticCurveTo(-1.5, -feather.len * 0.6, 0, -feather.len);
      ctx.quadraticCurveTo(1.5, -feather.len * 0.6, 1.2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // ====== BEAK ======
    ctx.save();
    const beakX = -6;
    const beakY = headY + 1;

    // Upper beak (curved, yellow-orange)
    const upperBeakGrad = ctx.createLinearGradient(beakX, beakY - 2, beakX - 6, beakY + 1);
    upperBeakGrad.addColorStop(0, '#f39c12');
    upperBeakGrad.addColorStop(0.6, '#e67e22');
    upperBeakGrad.addColorStop(1, '#d35400');

    ctx.fillStyle = upperBeakGrad;
    ctx.beginPath();
    ctx.moveTo(beakX, beakY - 1.5);
    ctx.quadraticCurveTo(beakX - 4, beakY - 2, beakX - 7, beakY);
    ctx.quadraticCurveTo(beakX - 7, beakY + 1, beakX - 5, beakY + 1);
    ctx.quadraticCurveTo(beakX - 2, beakY + 0.5, beakX, beakY + 0.5);
    ctx.closePath();
    ctx.fill();

    // Upper beak highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(beakX - 1, beakY - 1.2);
    ctx.quadraticCurveTo(beakX - 3, beakY - 1.5, beakX - 5, beakY - 0.5);
    ctx.stroke();

    // Lower beak (lighter)
    ctx.fillStyle = '#f5b041';
    ctx.beginPath();
    ctx.moveTo(beakX, beakY + 0.5);
    ctx.quadraticCurveTo(beakX - 3, beakY + 2, beakX - 5, beakY + 1.5);
    ctx.quadraticCurveTo(beakX - 4, beakY + 1, beakX, beakY + 0.5);
    ctx.closePath();
    ctx.fill();

    // Tongue (overheat)
    if (tongueOut) {
      ctx.fillStyle = '#e84393';
      ctx.beginPath();
      ctx.moveTo(beakX - 3, beakY + 1.5);
      ctx.quadraticCurveTo(beakX - 5, beakY + 4, beakX - 4, beakY + 5);
      ctx.quadraticCurveTo(beakX - 3, beakY + 4, beakX - 2, beakY + 1.5);
      ctx.closePath();
      ctx.fill();
    }

    // Nostril
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(beakX - 2, beakY - 0.5, 0.8, 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ====== EYES ======
    if (!isSleepingTuck) {
      // Parrot eyes: large, with amber/orange iris
      const eyeX = -2;
      const eyeYPos = headY - 1;
      const eyeR = 4;

      // Eye white/background
      ctx.fillStyle = 'rgba(40, 40, 50, 0.15)';
      ctx.beginPath();
      ctx.arc(eyeX, eyeYPos + 0.3, eyeR + 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fdfdff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeYPos, eyeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#2a2a30';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw based on eye mode
      const blinkCycle = t % 4000;
      const isBlinking = blinkCycle > 3850;

      if (eyeMode === 'happy') {
        // Happy ^^ arcs
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(eyeX, eyeYPos + 1, 2.5, Math.PI + 0.3, -0.3);
        ctx.stroke();
      } else if (eyeMode === 'dead') {
        // X X eyes
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 1.5;
        const s = 2;
        ctx.beginPath(); ctx.moveTo(eyeX - s, eyeYPos - s); ctx.lineTo(eyeX + s, eyeYPos + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(eyeX + s, eyeYPos - s); ctx.lineTo(eyeX - s, eyeYPos + s); ctx.stroke();
      } else if (eyeMode === 'sleeping') {
        // Horizontal line
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(eyeX - 2.5, eyeYPos);
        ctx.lineTo(eyeX + 2.5, eyeYPos);
        ctx.stroke();
      } else if (eyeMode === 'surprised') {
        // Larger eye
        if (!isBlinking) {
          // Amber iris ring
          const irisGrad = ctx.createRadialGradient(eyeX, eyeYPos, 1, eyeX, eyeYPos, 3.5);
          irisGrad.addColorStop(0, '#1a1a1a');
          irisGrad.addColorStop(0.4, '#2c1a0a');
          irisGrad.addColorStop(0.7, '#e67e22');
          irisGrad.addColorStop(1, '#f39c12');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(eyeX + state.eyeOffsetX * 0.3, eyeYPos + state.eyeOffsetY * 0.3, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#0a0a0e';
          ctx.beginPath();
          ctx.arc(eyeX + state.eyeOffsetX * 0.3, eyeYPos + state.eyeOffsetY * 0.3, 2, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX - 1, eyeYPos - 1.2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(eyeX, eyeYPos, 3, 0, Math.PI);
          ctx.stroke();
        }
      } else {
        // Normal and looking_up
        if (!isBlinking) {
          let pupilOffX = state.eyeOffsetX * 0.3;
          let pupilOffY = state.eyeOffsetY * 0.3;
          if (eyeMode === 'looking_up') {
            pupilOffX = 0.5;
            pupilOffY = -1.8;
          }

          // Amber/orange iris ring
          const irisGrad = ctx.createRadialGradient(
            eyeX + pupilOffX, eyeYPos + pupilOffY, 0.8,
            eyeX + pupilOffX, eyeYPos + pupilOffY, 3
          );
          irisGrad.addColorStop(0, '#1a1a1a');
          irisGrad.addColorStop(0.35, '#2c1a0a');
          irisGrad.addColorStop(0.6, '#e67e22');
          irisGrad.addColorStop(0.85, '#f39c12');
          irisGrad.addColorStop(1, '#d68910');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(eyeX + pupilOffX, eyeYPos + pupilOffY, 3, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#0a0a0e';
          ctx.beginPath();
          ctx.arc(eyeX + pupilOffX, eyeYPos + pupilOffY, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX + pupilOffX - 0.8, eyeYPos + pupilOffY - 1, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.beginPath();
          ctx.arc(eyeX + pupilOffX + 0.5, eyeYPos + pupilOffY + 0.6, 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Blinking
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(eyeX, eyeYPos, 2.5, 0, Math.PI);
          ctx.stroke();
        }
      }

      // Eye ring (featherless patch around eye - parrot characteristic)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeYPos, eyeR + 1, 0, Math.PI * 2);
      ctx.stroke();

      // Petting blush
      if (blushAlpha > 0) {
        ctx.fillStyle = `rgba(231, 76, 60, ${blushAlpha})`;
        ctx.beginPath();
        ctx.ellipse(eyeX + 2, eyeYPos + 3, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Sleeping: head tucked, show closed eye line
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-3, headY - 1);
      ctx.lineTo(1, headY - 1);
      ctx.stroke();

      // Z's
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 100, 120, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 6, headY - 6 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 9, headY - 10 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 11, headY - 13 + zOffset * 0.5);
    }

    ctx.restore(); // head

    // ====== FEET (small orange claws) ======
    if (!flyingPose) {
      ctx.save();
      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      // Left foot
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(-4, 17);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(-2, 17.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(-5, 17.5);
      ctx.stroke();

      // Right foot
      ctx.beginPath();
      ctx.moveTo(3, 14);
      ctx.lineTo(2, 17);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 14);
      ctx.lineTo(4, 17.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 14);
      ctx.lineTo(1, 17.5);
      ctx.stroke();

      // Claw tips
      ctx.fillStyle = '#d35400';
      for (const pos of [[-4, 17], [-2, 17.5], [-5, 17.5], [2, 17], [4, 17.5], [1, 17.5]]) {
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ====== FEATHER RUFFLING (overheat) ======
    if (overheatTint > 0) {
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
      ctx.lineWidth = 0.7;
      const ruffleCount = 6;
      for (let i = 0; i < ruffleCount; i++) {
        const angle = (i / ruffleCount) * Math.PI * 2 + t * 0.005;
        const dist = 11 + Math.sin(t * 0.008 + i) * 2;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist + bodyY;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
