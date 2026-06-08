import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const mushroom: CharacterStyle = {
  id: 'mushroom',
  name: 'Mushroom',
  description: 'A cheerful red toadstool mushroom with white spots. Casual, friendly, and full of fungal puns.',
  colors: { primary: '#DC143C', secondary: '#FFFDD0', accent: '#228B22' },
  personality: {
    speechStyle: 'casual',
    catchphrase: "I'm a fungi to be around!",
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      "There's not mush-room for bugs in that code.",
      'Spore of the moment idea: take a break.',
      "I'm a fungi to be around!",
      '*releases spores contentedly*',
    ],
    greeting: [
      "Hey! I'm a pretty fun-gi to work with.",
      'Shiitake happens, but we got this!',
      "Let's get growing!",
    ],
    typing_along: [
      'Keep coding, no cap... well, except mine.',
      "You're really growing on me with that code.",
      'Mycelium network says: nice logic.',
    ],
    petting: [
      '*tips cap* Why thank you!',
      "Careful, I'm a delicate specimen!",
      'Aww, right on the cap!',
    ],
    victory: [
      "We're on a ROLL... a mushroom roll!",
      'Sporadic genius strikes again!',
      '*springs up tall with pride*',
    ],
    overheat: [
      "I'm getting sautéed over here...",
      'Too hot... turning into mushroom soup...',
      "*wilts* I prefer shade...",
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
    let capBob = Math.sin(t * 0.003) * 0.8;
    let capWobble = 0;
    let capTilt = 0;
    let capLift = 0;
    let capSpin = 0;
    let capDroop = 0;
    let stemExtend = 0;
    let bounceY = 0;
    let blushAlpha = 0;
    let overheatTint = 0;
    let sporeCount = 3;
    let waveArm = 0;
    let hopPhase = 0;
    let steamRise = false;

    switch (animState) {
      case 'idle':
        // Cap bobs like it's too big, spores float up
        capBob = Math.sin(t * 0.003) * 1.2;
        sporeCount = 4;
        break;
      case 'dragging':
        capBob = Math.sin(t * 0.012) * 3;
        capWobble = Math.sin(t * 0.015) * 0.15;
        break;
      case 'wobble':
        capWobble = Math.sin(t * 0.018) * 0.2;
        capBob = Math.sin(t * 0.02) * 2;
        break;
      case 'chasing':
        hopPhase = t * 0.015;
        bounceY = Math.abs(Math.sin(hopPhase)) * 5;
        capBob = Math.sin(hopPhase * 2) * 2.5;
        capWobble = Math.sin(hopPhase) * 0.12;
        break;
      case 'petting':
        capLift = 3 + Math.sin(t * 0.004) * 0.5;
        capTilt = -0.15;
        blushAlpha = 0.35 + Math.sin(t * 0.005) * 0.1;
        break;
      case 'typing_along':
        bounceY = Math.abs(Math.sin(t * 0.015)) * 2;
        capWobble = Math.sin(t * 0.02) * 0.08;
        capBob = Math.sin(t * 0.015) * 1.5;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.006) * 0.15;
        steamRise = true;
        capBob = Math.sin(t * 0.005) * 0.5;
        break;
      case 'thinking':
        capBob = Math.sin(t * 0.002) * 0.5 - 1;
        capTilt = -0.05;
        break;
      case 'victory':
        stemExtend = 4 + Math.sin(t * 0.01) * 1;
        capSpin = (t * 0.008) % (Math.PI * 2);
        bounceY = Math.abs(Math.sin(t * 0.008)) * 3;
        break;
      case 'stretching':
        stemExtend = 2 + Math.sin(t * 0.004) * 2;
        capBob = -1 + Math.sin(t * 0.003) * 1;
        break;
      case 'paper_unroll':
        capBob = Math.sin(t * 0.006) * 1;
        bounceY = Math.sin(t * 0.008) * 1;
        break;
      case 'sleeping':
        capDroop = 4 + Math.sin(t * 0.001) * 0.3;
        capTilt = 0.25;
        break;
      case 'waving':
        waveArm = Math.sin(t * 0.012) * 0.6;
        capBob = Math.sin(t * 0.006) * 0.8;
        break;
    }

    // Apply bounce
    if (bounceY > 0) {
      ctx.translate(0, -bounceY);
    }

    // Apply cap wobble rotation
    if (capWobble !== 0) {
      ctx.rotate(capWobble);
    }

    // ====== GRASS/DIRT BASE ======
    ctx.save();
    const baseY = 18 - stemExtend * 0.3;

    // Dirt mound
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.ellipse(0, baseY + 3, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grass blades
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    const grassPositions = [-8, -5, -2, 2, 5, 7];
    for (let i = 0; i < grassPositions.length; i++) {
      const gx = grassPositions[i];
      const sway = Math.sin(t * 0.003 + i * 1.2) * 1;
      ctx.beginPath();
      ctx.moveTo(gx, baseY + 2);
      ctx.quadraticCurveTo(gx + sway, baseY - 1, gx + sway * 1.5, baseY - 2.5);
      ctx.stroke();
    }

    // Darker grass accents
    ctx.strokeStyle = '#1B6B1B';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-6, baseY + 2);
    ctx.quadraticCurveTo(-7, baseY - 1, -6.5, baseY - 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, baseY + 2);
    ctx.quadraticCurveTo(5, baseY, 4.5, baseY - 2.5);
    ctx.stroke();

    ctx.restore();

    // ====== STEM ======
    ctx.save();
    const stemTop = -2 - stemExtend;
    const stemBottom = baseY;
    const stemWidth = 7;
    const stemFlareWidth = 9;

    // Stem shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(-stemWidth + 1, stemTop + 2);
    ctx.lineTo(-stemFlareWidth + 1, stemBottom + 1);
    ctx.lineTo(stemFlareWidth + 1, stemBottom + 1);
    ctx.lineTo(stemWidth + 1, stemTop + 2);
    ctx.closePath();
    ctx.fill();

    // Main stem body (cream/off-white)
    const stemGrad = ctx.createLinearGradient(-stemWidth, 0, stemWidth, 0);
    stemGrad.addColorStop(0, '#E8E0B0');
    stemGrad.addColorStop(0.3, '#FFFDD0');
    stemGrad.addColorStop(0.7, '#FFFDD0');
    stemGrad.addColorStop(1, '#E8E0B0');

    ctx.fillStyle = stemGrad;
    ctx.beginPath();
    ctx.moveTo(-stemWidth, stemTop);
    ctx.quadraticCurveTo(-stemWidth - 0.5, (stemTop + stemBottom) / 2, -stemFlareWidth, stemBottom);
    ctx.lineTo(stemFlareWidth, stemBottom);
    ctx.quadraticCurveTo(stemWidth + 0.5, (stemTop + stemBottom) / 2, stemWidth, stemTop);
    ctx.closePath();
    ctx.fill();

    // Stem outline
    ctx.strokeStyle = 'rgba(180, 160, 100, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-stemWidth, stemTop);
    ctx.quadraticCurveTo(-stemWidth - 0.5, (stemTop + stemBottom) / 2, -stemFlareWidth, stemBottom);
    ctx.lineTo(stemFlareWidth, stemBottom);
    ctx.quadraticCurveTo(stemWidth + 0.5, (stemTop + stemBottom) / 2, stemWidth, stemTop);
    ctx.closePath();
    ctx.stroke();

    // Stem vertical streaks (subtle texture)
    ctx.strokeStyle = 'rgba(200, 180, 120, 0.25)';
    ctx.lineWidth = 0.5;
    for (let i = -2; i <= 2; i++) {
      const sx = i * 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, stemTop + 3);
      ctx.lineTo(sx * 1.1, stemBottom - 2);
      ctx.stroke();
    }

    // Petting blush on stem
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(255, 100, 100, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-4, stemTop + 10, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, stemTop + 10, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ====== ARM STUBS ======
    ctx.save();
    const armY = stemTop + 12;

    if (waveArm > 0) {
      // Waving: one arm extends from behind cap
      ctx.fillStyle = '#FFFDD0';
      ctx.strokeStyle = 'rgba(180, 160, 100, 0.5)';
      ctx.lineWidth = 0.8;

      // Left arm (static)
      ctx.beginPath();
      ctx.ellipse(-stemWidth - 2, armY, 2.5, 1.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right arm (waving)
      ctx.save();
      ctx.translate(stemWidth + 2, armY - 4);
      ctx.rotate(-0.8 - waveArm);
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Normal arm stubs
      ctx.fillStyle = '#FFFDD0';
      ctx.strokeStyle = 'rgba(180, 160, 100, 0.5)';
      ctx.lineWidth = 0.8;

      // Left stub
      ctx.beginPath();
      ctx.ellipse(-stemWidth - 2, armY, 2.5, 1.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right stub
      ctx.beginPath();
      ctx.ellipse(stemWidth + 2, armY, 2.5, 1.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // ====== CAP (RED DOME WITH WHITE SPOTS) ======
    ctx.save();
    const capY = stemTop - 8 + capBob - capLift;
    const capRadius = 14;

    // Apply cap spin for victory
    if (capSpin !== 0) {
      ctx.translate(0, capY);
      ctx.rotate(capSpin);
      ctx.translate(0, -capY);
    }

    // Apply cap tilt
    if (capTilt !== 0) {
      ctx.translate(0, capY);
      ctx.rotate(capTilt);
      ctx.translate(0, -capY);
    }

    // Apply cap droop for sleeping
    if (capDroop > 0) {
      ctx.translate(0, capDroop);
    }

    // Cap shadow on stem
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, stemTop + 1, capRadius - 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cap dome - main shape
    let capColor = '#DC143C';
    if (overheatTint > 0) {
      capColor = blendColor('#DC143C', '#FF6B00', overheatTint);
    }

    // Cap gradient (lighter on top-left for shine)
    const capGrad = ctx.createRadialGradient(-4, capY - 4, 2, 0, capY, capRadius);
    capGrad.addColorStop(0, blendColor(capColor, '#ffffff', 0.35));
    capGrad.addColorStop(0.4, capColor);
    capGrad.addColorStop(0.8, blendColor(capColor, '#8B0000', 0.3));
    capGrad.addColorStop(1, '#8B0000');

    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(0, capY, capRadius, Math.PI, 0);
    // Flat bottom of cap with slight overhang
    ctx.quadraticCurveTo(capRadius + 1, capY + 2, capRadius - 2, capY + 3);
    ctx.lineTo(-capRadius + 2, capY + 3);
    ctx.quadraticCurveTo(-capRadius - 1, capY + 2, -capRadius, capY);
    ctx.closePath();
    ctx.fill();

    // Cap outline
    ctx.strokeStyle = 'rgba(100, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, capY, capRadius, Math.PI, 0);
    ctx.quadraticCurveTo(capRadius + 1, capY + 2, capRadius - 2, capY + 3);
    ctx.lineTo(-capRadius + 2, capY + 3);
    ctx.quadraticCurveTo(-capRadius - 1, capY + 2, -capRadius, capY);
    ctx.closePath();
    ctx.stroke();

    // Cap shine highlight (top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(-5, capY - 7, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // ====== WHITE SPOTS ON CAP ======
    const spots = [
      { x: -6, y: capY - 8, r: 3 },
      { x: 4, y: capY - 9, r: 2.5 },
      { x: -2, y: capY - 4, r: 2 },
      { x: 8, y: capY - 4, r: 2.2 },
      { x: -9, y: capY - 3, r: 1.8 },
      { x: 1, y: capY - 11, r: 1.5 },
      { x: -4, y: capY - 12, r: 1.2 },
    ];

    for (const spot of spots) {
      // Overheat: spots turn orange/yellow
      let spotColor = '#FFFFFF';
      if (overheatTint > 0) {
        spotColor = blendColor('#FFFFFF', '#FFA500', overheatTint * 0.8);
      }

      const spotGrad = ctx.createRadialGradient(
        spot.x - 0.3, spot.y - 0.3, 0,
        spot.x, spot.y, spot.r
      );
      spotGrad.addColorStop(0, spotColor);
      spotGrad.addColorStop(0.7, blendColor(spotColor, '#EEEECC', 0.3));
      spotGrad.addColorStop(1, 'rgba(255,255,255,0.3)');

      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();

      // Spot outline
      ctx.strokeStyle = 'rgba(200, 200, 180, 0.4)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    // Cap underside shadow line (overhang)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-capRadius + 3, capY + 3);
    ctx.lineTo(capRadius - 3, capY + 3);
    ctx.stroke();

    ctx.restore(); // cap

    // ====== EYES (on stem, just below cap) ======
    const eyeYPos = stemTop + 6;
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: eyeYPos,
      eyeSpacing: 5,
      eyeRadius: 4.5,
      pupilRadius: 2.2,
      outlineColor: '#2a2a30',
      irisColor: '#1a1a20',
    });

    // ====== SPORE PARTICLES (idle detail) ======
    if (sporeCount > 0 && animState !== 'sleeping') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < sporeCount; i++) {
        const sporePhase = (t * 0.001 + i * 1.7) % 4;
        const sporeX = Math.sin(t * 0.002 + i * 2.3) * 10;
        const sporeY = capY - 5 - sporePhase * 6;
        const sporeAlpha = Math.max(0, 1 - sporePhase / 4);
        const sporeSize = 0.8 + Math.sin(i * 3.1) * 0.3;

        ctx.globalAlpha = sporeAlpha * 0.5;
        ctx.beginPath();
        ctx.arc(sporeX, sporeY, sporeSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // ====== STEAM (overheat) ======
    if (steamRise) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sx = -5 + i * 5;
        const steamPhase = (t * 0.003 + i * 1.5) % 3;
        const sy = capY - 10 - steamPhase * 5;
        const steamAlpha = Math.max(0, 1 - steamPhase / 3);
        ctx.globalAlpha = steamAlpha * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + Math.sin(t * 0.005 + i) * 2, sy - 3, sx + Math.sin(t * 0.007 + i) * 3, sy - 5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ====== SLEEPING Z's ======
    if (animState === 'sleeping') {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 100, 120, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 10, stemTop - 2 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13, stemTop - 7 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 15, stemTop - 11 + zOffset * 0.5);
    }

    ctx.restore();
  },
};
