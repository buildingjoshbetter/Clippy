import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const cactus: CharacterStyle = {
  id: 'cactus',
  name: 'Cactus',
  description: 'A happy saguaro cactus in a terracotta pot. Zen, low-maintenance, and surprisingly sharp-witted.',
  colors: { primary: '#228B22', secondary: '#32CD32', accent: '#CD853F' },
  personality: {
    speechStyle: 'zen',
    catchphrase: 'Stay sharp. Get it? Because... spines.',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    idle: [
      'Just vibing. Photosynthesizing. You know how it is.',
      'I\'m a succulent programmer. Very low maintenance.',
      'Stay sharp. Get it? Because... spines.',
      'Did you know I can survive 2 years without water? Same energy as your code reviews.',
    ],
    petting: [
      'Careful! Actually wait, in this reality I have no thorns. Pet away.',
      'Water me. I mean, figuratively. Compliments are my water.',
      'Ooh, that tickles my spines.',
    ],
    typing_along: [
      'Root, branch, commit. I speak tree.',
      'Branching logic? I literally have branches.',
      'Growing code like I grow arms — slowly, beautifully.',
    ],
    victory: [
      'Bloom where you\'re planted. And we just BLOOMED.',
      'Desert victory dance! ...I can\'t move my feet but the vibe is there.',
      'Flower power activated!',
    ],
    overheat: [
      'Even desert plants have limits...',
      'I\'m... dehydrating... need... water...',
      'This is worse than a Phoenix summer.',
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
    let bodySway = Math.sin(t * 0.002) * 0.03;
    let flowerBob = Math.sin(t * 0.003) * 1;
    let flowerScale = 1;
    let flowerSpin = 0;
    let armBounceL = 0;
    let armBounceR = 0;
    let armDroopL = 0;
    let armDroopR = 0;
    let blushAlpha = 0;
    let overheatTint = 0;
    let potBounce = 0;
    let flowerClosed = false;
    let spineRetract = 0;
    let waveExtend = 0;
    let victoryBurst = false;
    let bodyBob = 0;

    switch (animState) {
      case 'idle':
        // Gentle sway like a breeze
        bodySway = Math.sin(t * 0.002) * 0.03;
        flowerBob = Math.sin(t * 0.003) * 1.5;
        break;
      case 'dragging':
        bodySway = Math.sin(t * 0.015) * 0.08;
        break;
      case 'wobble':
        bodySway = Math.sin(t * 0.02) * 0.12;
        break;
      case 'chasing':
        potBounce = Math.abs(Math.sin(t * 0.015)) * 3;
        bodySway = Math.sin(t * 0.01) * 0.05;
        break;
      case 'petting':
        flowerScale = 1.3 + Math.sin(t * 0.004) * 0.15;
        blushAlpha = 0.35 + Math.sin(t * 0.005) * 0.1;
        spineRetract = 0.5;
        break;
      case 'typing_along':
        armBounceL = Math.sin(t * 0.025) * 3;
        armBounceR = Math.sin(t * 0.025 + Math.PI) * 3;
        bodyBob = Math.sin(t * 0.012) * 1.5;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.005) * 0.1;
        bodySway = Math.sin(t * 0.001) * 0.06;
        armDroopL = 4;
        armDroopR = 4;
        break;
      case 'thinking':
        bodySway = Math.sin(t * 0.0015) * 0.02;
        flowerBob = Math.sin(t * 0.002) * 0.5;
        break;
      case 'victory':
        flowerSpin = t * 0.01;
        flowerScale = 1.2;
        victoryBurst = true;
        bodyBob = Math.abs(Math.sin(t * 0.008)) * 2;
        break;
      case 'stretching':
        armBounceL = -3 + Math.sin(t * 0.003) * 2;
        armBounceR = -3 + Math.sin(t * 0.003 + 1) * 2;
        bodySway = Math.sin(t * 0.002) * 0.04;
        break;
      case 'paper_unroll':
        armBounceL = Math.sin(t * 0.008) * 2;
        bodyBob = Math.sin(t * 0.005) * 1;
        break;
      case 'sleeping':
        flowerClosed = true;
        armDroopL = 5;
        armDroopR = 5;
        bodySway = Math.sin(t * 0.001) * 0.01;
        break;
      case 'waving':
        waveExtend = Math.sin(t * 0.01) * 3 + 3;
        break;
    }

    // Apply body sway
    ctx.rotate(bodySway);

    // Apply pot bounce (chasing)
    if (potBounce > 0) {
      ctx.translate(0, -potBounce);
    }

    // Apply body bob
    if (bodyBob !== 0) {
      ctx.translate(0, -bodyBob);
    }

    // ====== TERRACOTTA POT ======
    ctx.save();
    const potY = 10;
    const potTopW = 12;
    const potBottomW = 9;
    const potH = 11;

    // Pot shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(1, potY + potH - 1, potBottomW + 1, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main pot body (trapezoid)
    const potGrad = ctx.createLinearGradient(-potTopW, potY, potTopW, potY);
    potGrad.addColorStop(0, '#A0522D');
    potGrad.addColorStop(0.3, '#CD853F');
    potGrad.addColorStop(0.6, '#DEB887');
    potGrad.addColorStop(0.85, '#CD853F');
    potGrad.addColorStop(1, '#8B4513');

    ctx.fillStyle = potGrad;
    ctx.beginPath();
    ctx.moveTo(-potTopW, potY);
    ctx.lineTo(-potBottomW, potY + potH);
    ctx.lineTo(potBottomW, potY + potH);
    ctx.lineTo(potTopW, potY);
    ctx.closePath();
    ctx.fill();

    // Pot outline
    ctx.strokeStyle = 'rgba(80,30,0,0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Pot rim (darker band at top)
    const rimGrad = ctx.createLinearGradient(-potTopW - 1, potY - 2, potTopW + 1, potY - 2);
    rimGrad.addColorStop(0, '#8B4513');
    rimGrad.addColorStop(0.3, '#A0522D');
    rimGrad.addColorStop(0.5, '#CD853F');
    rimGrad.addColorStop(0.7, '#A0522D');
    rimGrad.addColorStop(1, '#8B4513');

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.moveTo(-potTopW - 1, potY - 2);
    ctx.lineTo(-potTopW - 1, potY + 1);
    ctx.lineTo(potTopW + 1, potY + 1);
    ctx.lineTo(potTopW + 1, potY - 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(80,30,0,0.3)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Pot highlight
    ctx.strokeStyle = 'rgba(255,220,180,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-potTopW + 3, potY + 2);
    ctx.lineTo(-potBottomW + 2, potY + potH - 2);
    ctx.stroke();

    // Soil at top of pot
    ctx.fillStyle = '#3d2b1f';
    ctx.beginPath();
    ctx.ellipse(0, potY, potTopW - 1, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soil highlights
    ctx.fillStyle = 'rgba(80,50,30,0.6)';
    ctx.beginPath();
    ctx.ellipse(-3, potY - 0.5, 3, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ====== CACTUS BODY (main column) ======
    ctx.save();
    const bodyTopY = -16;
    const bodyBottomY = potY - 1;
    const bodyW = 8;

    // Body color with overheat tinting
    let mainGreen = '#228B22';
    let lightGreen = '#32CD32';
    if (overheatTint > 0) {
      mainGreen = blendColor('#228B22', '#9B9B22', overheatTint);
      lightGreen = blendColor('#32CD32', '#CDCD32', overheatTint);
    }

    // Body shadow
    ctx.fillStyle = 'rgba(0,60,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(-bodyW + 1, bodyBottomY);
    ctx.quadraticCurveTo(-bodyW + 1, bodyTopY + 4, 0, bodyTopY + 1);
    ctx.quadraticCurveTo(bodyW + 1, bodyTopY + 4, bodyW + 1, bodyBottomY);
    ctx.closePath();
    ctx.fill();

    // Main body gradient
    const bodyGrad = ctx.createLinearGradient(-bodyW, 0, bodyW, 0);
    bodyGrad.addColorStop(0, blendColor(mainGreen, '#004400', 0.3));
    bodyGrad.addColorStop(0.25, mainGreen);
    bodyGrad.addColorStop(0.45, lightGreen);
    bodyGrad.addColorStop(0.65, mainGreen);
    bodyGrad.addColorStop(1, blendColor(mainGreen, '#004400', 0.4));

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-bodyW, bodyBottomY);
    ctx.quadraticCurveTo(-bodyW, bodyTopY + 3, 0, bodyTopY);
    ctx.quadraticCurveTo(bodyW, bodyTopY + 3, bodyW, bodyBottomY);
    ctx.closePath();
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(0,80,0,0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Vertical ridges (characteristic cactus detail)
    ctx.strokeStyle = 'rgba(0,60,0,0.2)';
    ctx.lineWidth = 0.5;
    for (let i = -2; i <= 2; i++) {
      const rx = i * 2.8;
      ctx.beginPath();
      ctx.moveTo(rx, bodyBottomY - 1);
      ctx.quadraticCurveTo(rx, (bodyTopY + bodyBottomY) / 2, rx * 0.8, bodyTopY + 4);
      ctx.stroke();
    }

    // Spine dots (small lighter dots/dashes)
    const spineAlpha = 1 - spineRetract;
    if (spineAlpha > 0) {
      ctx.fillStyle = `rgba(200, 255, 200, ${0.7 * spineAlpha})`;
      ctx.strokeStyle = `rgba(180, 240, 180, ${0.6 * spineAlpha})`;
      ctx.lineWidth = 0.6;

      const spinePositions = [
        [-5, -8], [-3, -3], [-6, 1], [-4, 5],
        [5, -6], [3, -1], [6, 3], [4, 7],
        [-2, -12], [2, -10], [0, -5], [1, 2],
      ];

      for (const [sx, sy] of spinePositions) {
        // Small star-like spine cluster
        ctx.beginPath();
        ctx.moveTo(sx, sy - 1.2);
        ctx.lineTo(sx, sy + 1.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx - 0.8, sy);
        ctx.lineTo(sx + 0.8, sy);
        ctx.stroke();
      }
    }

    ctx.restore();

    // ====== LEFT ARM ======
    ctx.save();
    const armLX = -bodyW - 1;
    const armLY = -2 + armDroopL;
    const armLEndY = armLY - 10 + armBounceL + armDroopL;

    // Arm gradient
    const armLGrad = ctx.createLinearGradient(armLX - 5, armLY, armLX - 2, armLEndY);
    armLGrad.addColorStop(0, mainGreen);
    armLGrad.addColorStop(0.5, lightGreen);
    armLGrad.addColorStop(1, mainGreen);

    ctx.fillStyle = armLGrad;
    ctx.beginPath();
    ctx.moveTo(armLX, armLY - 2);
    ctx.quadraticCurveTo(armLX - 5, armLY - 1, armLX - 5, armLY - 5);
    ctx.quadraticCurveTo(armLX - 5, armLEndY - 2, armLX - 3, armLEndY);
    // Round top
    ctx.quadraticCurveTo(armLX - 2, armLEndY - 1.5, armLX - 1, armLEndY);
    ctx.quadraticCurveTo(armLX - 1, armLY - 4, armLX - 1, armLY - 1);
    ctx.quadraticCurveTo(armLX - 1, armLY, armLX, armLY + 1);
    ctx.closePath();
    ctx.fill();

    // Arm outline
    ctx.strokeStyle = 'rgba(0,80,0,0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Arm spines
    if (spineAlpha > 0) {
      ctx.strokeStyle = `rgba(180, 240, 180, ${0.5 * spineAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(armLX - 5.5, armLY - 3); ctx.lineTo(armLX - 6.5, armLY - 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(armLX - 4, armLEndY + 1); ctx.lineTo(armLX - 5, armLEndY); ctx.stroke();
    }

    // Wave extension for left arm (waving state)
    if (waveExtend > 0) {
      ctx.fillStyle = lightGreen;
      ctx.beginPath();
      ctx.arc(armLX - 3, armLEndY - waveExtend, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,80,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();

    // ====== RIGHT ARM ======
    ctx.save();
    const armRX = bodyW + 1;
    const armRY = -4 + armDroopR;
    const armREndY = armRY - 8 + armBounceR + armDroopR;

    const armRGrad = ctx.createLinearGradient(armRX + 2, armRY, armRX + 5, armREndY);
    armRGrad.addColorStop(0, mainGreen);
    armRGrad.addColorStop(0.5, lightGreen);
    armRGrad.addColorStop(1, mainGreen);

    ctx.fillStyle = armRGrad;
    ctx.beginPath();
    ctx.moveTo(armRX, armRY - 1);
    ctx.quadraticCurveTo(armRX + 4, armRY, armRX + 4, armRY - 4);
    ctx.quadraticCurveTo(armRX + 4, armREndY - 1, armRX + 2, armREndY);
    // Round top
    ctx.quadraticCurveTo(armRX + 1, armREndY - 1.5, armRX + 1, armREndY + 0.5);
    ctx.quadraticCurveTo(armRX + 1, armRY - 3, armRX + 1, armRY);
    ctx.quadraticCurveTo(armRX, armRY + 0.5, armRX, armRY + 1);
    ctx.closePath();
    ctx.fill();

    // Arm outline
    ctx.strokeStyle = 'rgba(0,80,0,0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Arm spines
    if (spineAlpha > 0) {
      ctx.strokeStyle = `rgba(180, 240, 180, ${0.5 * spineAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(armRX + 4.5, armRY - 2); ctx.lineTo(armRX + 5.5, armRY - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(armRX + 3, armREndY + 1); ctx.lineTo(armRX + 4, armREndY); ctx.stroke();
    }

    ctx.restore();

    // ====== VICTORY BURST (small flowers from arm tips) ======
    if (victoryBurst) {
      const burstPhase = (t * 0.005) % (Math.PI * 2);
      const burstColors = ['#FF69B4', '#FFD700', '#FF6347', '#DA70D6'];

      for (let i = 0; i < 4; i++) {
        const angle = burstPhase + (i * Math.PI / 2);
        const dist = 3 + Math.sin(t * 0.008 + i) * 2;

        // Left arm tip bursts
        const bxL = armLX - 3 + Math.cos(angle) * dist;
        const byL = armLEndY - 2 + Math.sin(angle) * dist;
        ctx.fillStyle = burstColors[i];
        ctx.beginPath();
        ctx.arc(bxL, byL, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Right arm tip bursts
        const bxR = armRX + 2 + Math.cos(angle + 1) * dist;
        const byR = armREndY - 2 + Math.sin(angle + 1) * dist;
        ctx.fillStyle = burstColors[(i + 2) % 4];
        ctx.beginPath();
        ctx.arc(bxR, byR, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ====== EYES ======
    ctx.save();
    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -6,
      eyeSpacing: 4,
      eyeRadius: 5,
      pupilRadius: 2.5,
      outlineColor: '#1a3a1a',
      irisColor: '#1a2a1a',
    });

    // Petting blush
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(255, 130, 130, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-6, -3, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, -3, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ====== FLOWER ON TOP ======
    ctx.save();
    const flowerY = -18 + flowerBob;
    ctx.translate(0, flowerY);
    ctx.scale(flowerScale, flowerScale);

    if (flowerSpin !== 0) {
      ctx.rotate(flowerSpin);
    }

    if (flowerClosed) {
      // Closed flower (sleeping) - petals folded into a bud
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.quadraticCurveTo(-2, -2, -1.5, 0);
      ctx.quadraticCurveTo(0, -1, 1.5, 0);
      ctx.quadraticCurveTo(2, -2, 0, -4);
      ctx.closePath();
      ctx.fill();

      // Bud outline
      ctx.strokeStyle = 'rgba(180,0,80,0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      // Open flower with 5 petals
      const petalCount = 5;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
        ctx.save();
        ctx.rotate(angle);

        const petalGrad = ctx.createRadialGradient(0, -3, 0.5, 0, -3, 3.5);
        petalGrad.addColorStop(0, '#FFB6C1');
        petalGrad.addColorStop(0.6, '#FF69B4');
        petalGrad.addColorStop(1, '#DB7093');

        ctx.fillStyle = petalGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-2.5, -2, -2, -4);
        ctx.quadraticCurveTo(0, -5.5, 2, -4);
        ctx.quadraticCurveTo(2.5, -2, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Petal outline
        ctx.strokeStyle = 'rgba(180,0,80,0.25)';
        ctx.lineWidth = 0.4;
        ctx.stroke();

        ctx.restore();
      }

      // Flower center (yellow)
      const centerGrad = ctx.createRadialGradient(0, 0, 0.5, 0, 0, 2.5);
      centerGrad.addColorStop(0, '#FFFF00');
      centerGrad.addColorStop(0.6, '#FFD700');
      centerGrad.addColorStop(1, '#DAA520');

      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Center dots (stamen detail)
      ctx.fillStyle = '#B8860B';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // ====== SLEEPING Z's ======
    if (animState === 'sleeping') {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 120, 100, 0.6)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 10, -14 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13, -18 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 15, -21 + zOffset * 0.5);
    }

    // ====== OVERHEAT DROOP EFFECT ======
    if (overheatTint > 0) {
      // Sweat drops
      const dropY = Math.sin(t * 0.006) * 2;
      ctx.fillStyle = `rgba(100, 200, 255, ${0.4 + Math.sin(t * 0.008) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(7, -10 + dropY);
      ctx.quadraticCurveTo(8, -9 + dropY, 7, -8 + dropY);
      ctx.quadraticCurveTo(6, -9 + dropY, 7, -10 + dropY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-6, -7 + dropY * 0.8);
      ctx.quadraticCurveTo(-5, -6 + dropY * 0.8, -6, -5 + dropY * 0.8);
      ctx.quadraticCurveTo(-7, -6 + dropY * 0.8, -6, -7 + dropY * 0.8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },
};
