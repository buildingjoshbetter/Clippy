import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const ufo: CharacterStyle = {
  id: 'ufo',
  name: 'UFO',
  description: 'An alien flying saucer with a metallic dome, rotating ring lights, and a tractor beam. Nerdy, observant, and fascinated by Earth coding.',
  colors: { primary: '#C0C0C0', secondary: '#808080', accent: '#90EE90' },
  personality: {
    speechStyle: 'nerdy',
    catchphrase: "We've been observing your coding patterns. Fascinating.",
  },
  eyeStyle: 'anime',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      'Greetings, Earth coder. We come in peace. Mostly.',
      'Our sensors have detected elevated caffeine levels. Proceed.',
      'Initiating observation protocol. Do not be alarmed.',
    ],
    typing_along: [
      'Transmitting your keystrokes to the mothership.',
      'Your programming language is... quaint.',
      'Fascinating variable naming conventions. We are taking notes.',
      'This syntax would not pass review on Kepler-442b.',
    ],
    idle: [
      'On our planet, we use quantum entanglement to merge branches.',
      'Take me to your tech lead.',
      '*scans environment* No other intelligent life detected.',
      "We've been hovering for 3.7 Earth minutes. This is fine.",
    ],
    petting: [
      'Our hull sensors register... affection? Unusual.',
      'You are... petting a spacecraft. Noted in the log.',
      'Structural integrity at 100%. Emotional integrity at... unknown.',
    ],
    victory: [
      'Success! Transmitting results to the galactic archive.',
      'The mothership will be pleased with this data.',
      'Achievement unlocked. Earth tier: competent.',
    ],
    overheat: [
      'WARNING: Thermal regulators failing. Abort mission?',
      'Hull temperature exceeding safe parameters!',
      'Even our advanced alloys have limits...',
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
    let hoverBob = Math.sin(t * 0.003) * 2;
    let lightRotation = (t * 0.002) % (Math.PI * 2);
    let beamOpacity = 0.3;
    let beamWidth = 1;
    let beamWave = 0;
    let tiltAngle = 0;
    let spinSpeed = 0;
    let lightsColor: string[] | null = null;
    let beamActive = true;
    let smokeParticles = false;
    let sparkParticles = false;
    let blushAlpha = 0;
    let victoryJump = 0;
    let beamHeart = false;
    let settled = false;

    switch (animState) {
      case 'idle':
        // Default hover + rotating lights
        break;
      case 'dragging':
        hoverBob = Math.sin(t * 0.01) * 3;
        tiltAngle = Math.sin(t * 0.015) * 0.15;
        break;
      case 'wobble':
        hoverBob = Math.sin(t * 0.02) * 3;
        tiltAngle = Math.sin(t * 0.015) * 0.2;
        break;
      case 'chasing':
        tiltAngle = state.eyeOffsetX * 0.02;
        hoverBob = Math.sin(t * 0.005) * 1;
        lightRotation = (t * 0.006) % (Math.PI * 2);
        beamOpacity = 0.4;
        break;
      case 'petting':
        lightsColor = ['#ff69b4', '#ffb6c1', '#ff1493', '#ff69b4', '#ffb6c1', '#ff1493'];
        blushAlpha = 0.2 + Math.sin(t * 0.004) * 0.1;
        beamHeart = true;
        beamOpacity = 0.25;
        break;
      case 'typing_along':
        beamOpacity = 0.2 + Math.abs(Math.sin(t * 0.02)) * 0.3;
        lightRotation = (t * 0.005) % (Math.PI * 2);
        hoverBob = Math.sin(t * 0.004) * 1.5;
        break;
      case 'overheat':
        lightsColor = ['#ff0000', '#ff3300', '#ff0000', '#ff3300', '#ff0000', '#ff3300'];
        smokeParticles = true;
        sparkParticles = true;
        beamOpacity = 0.1;
        hoverBob = Math.sin(t * 0.006) * 1;
        break;
      case 'thinking':
        hoverBob = Math.sin(t * 0.002) * 1.5;
        beamOpacity = 0.15;
        lightRotation = (t * 0.001) % (Math.PI * 2);
        break;
      case 'victory':
        spinSpeed = t * 0.02;
        lightRotation = spinSpeed % (Math.PI * 2);
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 4;
        beamOpacity = 0.5 + Math.sin(t * 0.01) * 0.2;
        break;
      case 'stretching':
        tiltAngle = Math.sin(t * 0.003) * 0.15;
        hoverBob = Math.sin(t * 0.002) * 2.5;
        break;
      case 'paper_unroll':
        beamOpacity = 0.35;
        beamWidth = 1.2;
        hoverBob = Math.sin(t * 0.003) * 1.5;
        break;
      case 'sleeping':
        beamActive = false;
        settled = true;
        hoverBob = 0;
        lightRotation = (t * 0.0003) % (Math.PI * 2);
        break;
      case 'waving':
        beamWave = Math.sin(t * 0.008) * 6;
        beamOpacity = 0.35;
        hoverBob = Math.sin(t * 0.003) * 1.5;
        break;
    }

    // Apply victory jump
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }

    // Apply hover bob
    const baseY = settled ? 4 : hoverBob;
    ctx.translate(0, baseY);

    // Apply tilt
    if (tiltAngle !== 0) {
      ctx.rotate(tiltAngle);
    }

    // ====== TRACTOR BEAM ======
    if (beamActive) {
      ctx.save();
      const beamTopWidth = 6 * beamWidth;
      const beamBottomWidth = 14 * beamWidth;
      const beamHeight = 18;
      const beamStartY = 5;

      // Beam gradient
      const beamGrad = ctx.createLinearGradient(0, beamStartY, 0, beamStartY + beamHeight);
      beamGrad.addColorStop(0, `rgba(144, 238, 144, ${beamOpacity})`);
      beamGrad.addColorStop(0.5, `rgba(144, 238, 144, ${beamOpacity * 0.7})`);
      beamGrad.addColorStop(1, `rgba(144, 238, 144, ${beamOpacity * 0.2})`);

      ctx.fillStyle = beamGrad;
      ctx.beginPath();

      if (beamHeart) {
        // Heart-shaped beam for petting
        const pulse = 1 + Math.sin(t * 0.005) * 0.1;
        const hx = 0;
        const hy = beamStartY + 10;
        ctx.moveTo(hx, hy + 6 * pulse);
        ctx.bezierCurveTo(hx - 6 * pulse, hy + 2 * pulse, hx - 6 * pulse, hy - 3 * pulse, hx, hy - 1 * pulse);
        ctx.bezierCurveTo(hx + 6 * pulse, hy - 3 * pulse, hx + 6 * pulse, hy + 2 * pulse, hx, hy + 6 * pulse);
        ctx.closePath();
        ctx.fill();
      } else {
        // Standard inverted triangle beam
        ctx.moveTo(-beamTopWidth / 2 + beamWave * 0.3, beamStartY);
        ctx.lineTo(-beamBottomWidth / 2 + beamWave, beamStartY + beamHeight);
        ctx.lineTo(beamBottomWidth / 2 + beamWave, beamStartY + beamHeight);
        ctx.lineTo(beamTopWidth / 2 + beamWave * 0.3, beamStartY);
        ctx.closePath();
        ctx.fill();

        // Beam scan lines
        ctx.strokeStyle = `rgba(144, 238, 144, ${beamOpacity * 0.5})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const scanY = beamStartY + 4 + i * 3.5 + (t * 0.02 + i * 5) % 14;
          if (scanY < beamStartY + beamHeight) {
            const widthAtY = beamTopWidth / 2 + (beamBottomWidth / 2 - beamTopWidth / 2) * ((scanY - beamStartY) / beamHeight);
            ctx.beginPath();
            ctx.moveTo(-widthAtY + beamWave * ((scanY - beamStartY) / beamHeight), scanY);
            ctx.lineTo(widthAtY + beamWave * ((scanY - beamStartY) / beamHeight), scanY);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // ====== DISC BODY (lower saucer) ======
    ctx.save();
    const discY = 2;

    // Disc shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, discY + 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main disc body (gunmetal gradient)
    const discGrad = ctx.createLinearGradient(0, discY - 4, 0, discY + 4);
    discGrad.addColorStop(0, '#A0A0A0');
    discGrad.addColorStop(0.3, '#808080');
    discGrad.addColorStop(0.7, '#606060');
    discGrad.addColorStop(1, '#404040');

    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.ellipse(0, discY, 17, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Disc rim highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, discY - 1, 16, 3.5, 0, Math.PI + 0.3, -0.3);
    ctx.stroke();

    // Disc bottom edge
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, discY, 17, 5, 0, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();

    // ====== RING LIGHTS ======
    ctx.save();
    const numLights = 6;
    const defaultColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const colors = lightsColor || defaultColors;
    const lightRadius = 15;
    const lightSize = settled ? 1 : 1.5;
    const dimFactor = settled ? 0.3 : 1;

    for (let i = 0; i < numLights; i++) {
      const angle = lightRotation + (i / numLights) * Math.PI * 2;
      const lx = Math.cos(angle) * lightRadius;
      const ly = Math.sin(angle) * 3 + discY;

      // Only draw lights on the visible half (front)
      const colorIndex = (i + Math.floor(t * 0.003)) % colors.length;
      const lightColor = colors[colorIndex];

      // Glow
      ctx.fillStyle = `rgba(${parseInt(lightColor.slice(1, 3), 16)}, ${parseInt(lightColor.slice(3, 5), 16)}, ${parseInt(lightColor.slice(5, 7), 16)}, ${0.3 * dimFactor})`;
      ctx.beginPath();
      ctx.arc(lx, ly, lightSize + 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Light dot
      ctx.fillStyle = dimFactor < 1 ? blendColor(lightColor, '#333333', 1 - dimFactor) : lightColor;
      ctx.beginPath();
      ctx.arc(lx, ly, lightSize, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = `rgba(255,255,255,${0.5 * dimFactor})`;
      ctx.beginPath();
      ctx.arc(lx - 0.3, ly - 0.3, lightSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ====== DOME (upper half) ======
    ctx.save();
    const domeY = -4;

    // Dome shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(0.5, domeY + 1, 11, 10, 0, Math.PI, 0);
    ctx.fill();

    // Main dome (silver gradient)
    const domeGrad = ctx.createRadialGradient(-3, domeY - 4, 2, 0, domeY, 10);
    domeGrad.addColorStop(0, '#E8E8E8');
    domeGrad.addColorStop(0.4, '#C0C0C0');
    domeGrad.addColorStop(0.8, '#909090');
    domeGrad.addColorStop(1, '#707070');

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(0, domeY, 11, 9, 0, Math.PI, 0);
    ctx.fill();

    // Dome outline
    ctx.strokeStyle = 'rgba(60,60,60,0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, domeY, 11, 9, 0, Math.PI, 0);
    ctx.stroke();

    // Dome specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(-4, domeY - 5, 4, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Dome horizontal band (metallic seam)
    ctx.strokeStyle = 'rgba(80,80,80,0.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, domeY + 1, 10, 2, 0, Math.PI, 0);
    ctx.stroke();

    ctx.restore();

    // ====== PORTHOLE WINDOWS ======
    ctx.save();
    const portholes = [
      { x: -6, y: -7 },
      { x: 0, y: -9 },
      { x: 6, y: -7 },
    ];

    for (const ph of portholes) {
      // Window frame
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(ph.x, ph.y, 2.2, 0, Math.PI * 2);
      ctx.stroke();

      // Window glass (green glow)
      const windowGrad = ctx.createRadialGradient(ph.x, ph.y, 0, ph.x, ph.y, 2);
      windowGrad.addColorStop(0, 'rgba(144, 238, 144, 0.8)');
      windowGrad.addColorStop(0.6, 'rgba(60, 179, 113, 0.6)');
      windowGrad.addColorStop(1, 'rgba(34, 139, 34, 0.4)');

      ctx.fillStyle = windowGrad;
      ctx.beginPath();
      ctx.arc(ph.x, ph.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Window highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(ph.x - 0.5, ph.y - 0.5, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ====== ALIEN EYES (visible through main dome window) ======
    ctx.save();
    const eyeCenterY = -6;

    if (eyeMode === 'happy') {
      // Happy ^^ arcs (almond-shaped squints)
      ctx.strokeStyle = '#1a3a1a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5.5, eyeCenterY + 1);
      ctx.quadraticCurveTo(-4, eyeCenterY - 1.5, -2.5, eyeCenterY + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2.5, eyeCenterY + 1);
      ctx.quadraticCurveTo(4, eyeCenterY - 1.5, 5.5, eyeCenterY + 1);
      ctx.stroke();
    } else if (eyeMode === 'dead') {
      // X X eyes
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 1.5;
      const s = 2;
      for (const side of [-4, 4]) {
        ctx.beginPath(); ctx.moveTo(side - s, eyeCenterY - s); ctx.lineTo(side + s, eyeCenterY + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(side + s, eyeCenterY - s); ctx.lineTo(side - s, eyeCenterY + s); ctx.stroke();
      }
    } else if (eyeMode === 'sleeping') {
      // Horizontal lines
      ctx.strokeStyle = '#2a4a2a';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, eyeCenterY); ctx.lineTo(-2, eyeCenterY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, eyeCenterY); ctx.lineTo(6, eyeCenterY); ctx.stroke();

      // Z's floating up
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(144, 238, 144, 0.6)';
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 7, -12 + zOffset);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 9, -15 + zOffset * 0.7);
    } else {
      // Normal / surprised / looking_up — large almond-shaped alien eyes
      const blinkCycle = t % 4000;
      const isBlinking = blinkCycle > 3850;

      if (!isBlinking) {
        let pupilOffX = state.eyeOffsetX * 0.3;
        let pupilOffY = state.eyeOffsetY * 0.3;
        if (eyeMode === 'looking_up') {
          pupilOffX = 0;
          pupilOffY = -1.5;
        }

        const eyeScale = eyeMode === 'surprised' ? 1.2 : 1;

        for (const side of [-1, 1]) {
          const ex = side * 4;

          // Almond eye shape (alien style)
          ctx.save();
          ctx.translate(ex, eyeCenterY);
          ctx.scale(eyeScale, eyeScale);

          // Eye background (dark with green tint)
          const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3.5);
          eyeGrad.addColorStop(0, '#0a1a0a');
          eyeGrad.addColorStop(0.6, '#1a3a1a');
          eyeGrad.addColorStop(1, '#2a5a2a');

          ctx.fillStyle = eyeGrad;
          ctx.beginPath();
          // Almond shape using bezier curves
          ctx.moveTo(-3.5, 0);
          ctx.quadraticCurveTo(-2, -3, 0, -3.2);
          ctx.quadraticCurveTo(2, -3, 3.5, 0);
          ctx.quadraticCurveTo(2, 2.5, 0, 2.5);
          ctx.quadraticCurveTo(-2, 2.5, -3.5, 0);
          ctx.closePath();
          ctx.fill();

          // Eye outline
          ctx.strokeStyle = '#0a2a0a';
          ctx.lineWidth = 0.6;
          ctx.stroke();

          // Pupil (bright green, tracks cursor)
          const px = pupilOffX * 0.5;
          const py = pupilOffY * 0.4;
          ctx.fillStyle = '#90EE90';
          ctx.beginPath();
          ctx.ellipse(px, py, 1.2, 1.6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupil inner
          ctx.fillStyle = '#50FF50';
          ctx.beginPath();
          ctx.ellipse(px, py, 0.6, 0.9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye highlight
          ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
          ctx.beginPath();
          ctx.arc(px - 1, py - 1, 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      } else {
        // Blinking — thin lines
        ctx.strokeStyle = '#1a3a1a';
        ctx.lineWidth = 1.2;
        for (const side of [-4, 4]) {
          ctx.beginPath();
          ctx.moveTo(side - 3, eyeCenterY);
          ctx.lineTo(side + 3, eyeCenterY);
          ctx.stroke();
        }
      }
    }

    // Petting blush (green-tinted for alien)
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(144, 238, 144, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-4, eyeCenterY + 3, 2, 1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, eyeCenterY + 3, 2, 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ====== ANTENNA ======
    ctx.save();
    const antennaBaseY = -13;
    const antennaTopY = -19;
    const antennaWobble = Math.sin(t * 0.005) * 0.5;

    // Antenna stalk
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, antennaBaseY);
    ctx.quadraticCurveTo(antennaWobble, (antennaBaseY + antennaTopY) / 2, antennaWobble * 0.5, antennaTopY);
    ctx.stroke();

    // Antenna light (blinking)
    const antennaBlink = Math.sin(t * 0.008) > 0;
    const antennaColor = antennaBlink ? '#ff3333' : '#990000';
    const antennaGlow = antennaBlink ? 0.5 : 0.1;

    // Glow
    ctx.fillStyle = `rgba(255, 50, 50, ${antennaGlow})`;
    ctx.beginPath();
    ctx.arc(antennaWobble * 0.5, antennaTopY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Light bulb
    ctx.fillStyle = antennaColor;
    ctx.beginPath();
    ctx.arc(antennaWobble * 0.5, antennaTopY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlight on bulb
    if (antennaBlink) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(antennaWobble * 0.5 - 0.4, antennaTopY - 0.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ====== SMOKE PARTICLES (overheat) ======
    if (smokeParticles) {
      ctx.save();
      ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
      for (let i = 0; i < 5; i++) {
        const smokeT = (t * 0.003 + i * 1.3) % 4;
        const sx = Math.cos(i * 1.8) * 14 + Math.sin(t * 0.002 + i) * 2;
        const sy = discY - smokeT * 3;
        const sr = 1 + smokeT * 0.5;
        const sAlpha = Math.max(0, 0.4 - smokeT * 0.1);
        ctx.fillStyle = `rgba(100, 100, 100, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ====== SPARK PARTICLES (overheat) ======
    if (sparkParticles) {
      ctx.save();
      ctx.fillStyle = '#ffff00';
      for (let i = 0; i < 4; i++) {
        const sparkT = (t * 0.005 + i * 0.7) % 2;
        const spx = Math.cos(i * 2.5 + t * 0.003) * (12 + sparkT * 4);
        const spy = discY + Math.sin(i * 1.7 + t * 0.004) * 3 - sparkT * 2;
        const spAlpha = Math.max(0, 1 - sparkT);
        ctx.fillStyle = `rgba(255, 255, 0, ${spAlpha})`;
        ctx.beginPath();
        ctx.arc(spx, spy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ====== DISC EDGE DETAIL (metallic rim) ======
    ctx.save();
    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, discY - 1.5, 15, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  },
};
