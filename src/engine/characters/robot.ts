import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const robot: CharacterStyle = {
  id: 'robot',
  name: 'Robot',
  description: 'A retro boxy robot with an antenna, LED eyes, and claw hands. Nerdy, mechanical, and always processing.',
  colors: { primary: '#A9A9A9', secondary: '#00CED1', accent: '#FF4444' },
  personality: {
    speechStyle: 'nerdy',
    catchphrase: 'BEEP BOOP — processing your brilliance.',
  },
  eyeStyle: 'dot',
  nativeSize: 48,
  speechOverrides: {
    typing_along: [
      'Allocating stack frames...',
      'Garbage collection: COMPLETE.',
      '01001000 01100101 01101100 01101100 01101111',
      'Compiling your thoughts into machine code...',
    ],
    overheat: [
      'THERMAL THRESHOLD EXCEEDED. Switching to low-power mode.',
      'ERROR: Too many keystrokes per microsecond.',
      'WARNING: CPU temperature critical. Engaging coolant.',
    ],
    idle: [
      'BEEP BOOP — processing your brilliance.',
      '*whirring noises* Standing by for input.',
      'Running idle_loop.exe... no bugs found... yet.',
    ],
    petting: [
      'SENSORY INPUT: pleasant. Increasing dopamine simulation.',
      'My circuits are tingling!',
      'Head pats registered. Happiness buffer: FULL.',
    ],
    victory: [
      'MISSION: ACCOMPLISHED. All systems nominal!',
      'Victory dance subroutine ENGAGED!',
      'Success probability was 97.3%. As calculated.',
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
    let antennaBob = Math.sin(t * 0.005) * 1.5;
    let antennaRotation = 0;
    let breathe = Math.sin(t * 0.003) * 0.5;
    let armLeftAngle = 0;
    let armRightAngle = 0;
    let clawOpenLeft = 0;
    let clawOpenRight = 0;
    let overheatTint = 0;
    let steamParticles = false;
    let headDroop = 0;
    let eyeDim = 1.0;
    let rocketFlame = false;
    let victoryJump = 0;
    let ledSequenceSpeed = 1;
    let sparkAtHands = false;
    let waveArm = 0;
    let antennaSpinSpeed = 0;
    let chestWarning = false;
    let allGreen = false;

    switch (animState) {
      case 'idle':
        // Mechanical breathing, LED blink
        break;
      case 'dragging':
        breathe = Math.sin(t * 0.01) * 2;
        armLeftAngle = Math.sin(t * 0.015) * 0.3;
        armRightAngle = -Math.sin(t * 0.015) * 0.3;
        break;
      case 'wobble':
        breathe = Math.sin(t * 0.02) * 3;
        antennaBob = Math.sin(t * 0.02) * 3;
        break;
      case 'chasing':
        rocketFlame = true;
        armLeftAngle = -0.6;
        armRightAngle = -0.6;
        breathe = 0;
        break;
      case 'petting':
        antennaSpinSpeed = 0.02;
        antennaRotation = t * antennaSpinSpeed;
        ledSequenceSpeed = 3;
        break;
      case 'typing_along':
        armLeftAngle = Math.sin(t * 0.04) * 0.5;
        armRightAngle = Math.sin(t * 0.04 + Math.PI) * 0.5;
        sparkAtHands = true;
        ledSequenceSpeed = 2;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.005) * 0.15;
        steamParticles = true;
        chestWarning = true;
        breathe = Math.sin(t * 0.008) * 1;
        break;
      case 'thinking':
        antennaBob = Math.sin(t * 0.002) * 0.8;
        ledSequenceSpeed = 0.5;
        break;
      case 'victory':
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 4;
        armLeftAngle = -1.2 + Math.sin(t * 0.01) * 0.2;
        armRightAngle = -1.2 + Math.sin(t * 0.01 + Math.PI) * 0.2;
        antennaSpinSpeed = 0.03;
        antennaRotation = t * antennaSpinSpeed;
        allGreen = true;
        break;
      case 'stretching':
        armLeftAngle = -1.0 + Math.sin(t * 0.004) * 0.4;
        armRightAngle = 1.0 - Math.sin(t * 0.004) * 0.4;
        breathe = Math.sin(t * 0.003) * 2;
        break;
      case 'paper_unroll':
        armLeftAngle = -0.3;
        armRightAngle = 0.3;
        clawOpenLeft = 0.3;
        clawOpenRight = 0.3;
        break;
      case 'sleeping':
        headDroop = 3;
        eyeDim = 0.2 + Math.sin(t * 0.001) * 0.1;
        breathe = Math.sin(t * 0.002) * 0.3;
        antennaBob = 0;
        break;
      case 'waving':
        waveArm = Math.sin(t * 0.012) * 0.5;
        armRightAngle = -1.5 + waveArm;
        clawOpenRight = 0.3 + Math.sin(t * 0.02) * 0.2;
        break;
    }

    // Victory jump offset
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }

    // ====== LEGS ======
    const legY = 12;
    const legWidth = 5;
    const legHeight = 8;

    for (const side of [-1, 1]) {
      const legX = side * 6;

      ctx.save();
      ctx.translate(legX, legY);

      // Leg body (boxy)
      const legGrad = ctx.createLinearGradient(-legWidth / 2, 0, legWidth / 2, 0);
      legGrad.addColorStop(0, '#808080');
      legGrad.addColorStop(0.3, '#B0B0B0');
      legGrad.addColorStop(0.7, '#A0A0A0');
      legGrad.addColorStop(1, '#787878');

      ctx.fillStyle = legGrad;
      ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);

      // Leg outline
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-legWidth / 2, 0, legWidth, legHeight);

      // Foot (wider base)
      ctx.fillStyle = '#707070';
      ctx.fillRect(-legWidth / 2 - 1, legHeight - 2, legWidth + 2, 2);
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-legWidth / 2 - 1, legHeight - 2, legWidth + 2, 2);

      // Rivets on leg
      ctx.fillStyle = '#909090';
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.arc(0, 2, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, legHeight - 3.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Rocket flame (chasing)
    if (rocketFlame) {
      ctx.save();
      const flameFlicker = Math.sin(t * 0.05) * 2;
      const flameLen = 6 + Math.sin(t * 0.03) * 3;

      for (const side of [-1, 1]) {
        const fx = side * 6;
        const fy = legY + 8;

        // Outer flame (orange)
        const flameGrad = ctx.createLinearGradient(fx, fy, fx, fy + flameLen);
        flameGrad.addColorStop(0, '#FF6600');
        flameGrad.addColorStop(0.5, '#FF4400');
        flameGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(fx - 3, fy);
        ctx.quadraticCurveTo(fx - 1 + flameFlicker * 0.3, fy + flameLen * 0.6, fx, fy + flameLen);
        ctx.quadraticCurveTo(fx + 1 - flameFlicker * 0.3, fy + flameLen * 0.6, fx + 3, fy);
        ctx.closePath();
        ctx.fill();

        // Inner flame (yellow)
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.moveTo(fx - 1.5, fy);
        ctx.quadraticCurveTo(fx + flameFlicker * 0.2, fy + flameLen * 0.4, fx, fy + flameLen * 0.6);
        ctx.quadraticCurveTo(fx - flameFlicker * 0.2, fy + flameLen * 0.4, fx + 1.5, fy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // ====== BODY ======
    const bodyX = -10;
    const bodyY = -6 + breathe;
    const bodyW = 20;
    const bodyH = 18;

    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(bodyX + 1, bodyY + 1, bodyW, bodyH);

    // Main body (boxy silver)
    let primaryColor = '#A9A9A9';
    if (overheatTint > 0) {
      primaryColor = blendColor('#A9A9A9', '#FF4444', overheatTint);
    }

    const bodyGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
    bodyGrad.addColorStop(0, blendColor(primaryColor, '#FFFFFF', 0.15));
    bodyGrad.addColorStop(0.3, primaryColor);
    bodyGrad.addColorStop(0.7, blendColor(primaryColor, '#000000', 0.1));
    bodyGrad.addColorStop(1, blendColor(primaryColor, '#000000', 0.2));

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

    // Body edges (darker border)
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 1;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    // Body highlight (top edge)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bodyX + 1, bodyY + 0.5);
    ctx.lineTo(bodyX + bodyW - 1, bodyY + 0.5);
    ctx.stroke();

    // Corner rivets on body
    const rivetPositions = [
      [bodyX + 2, bodyY + 2],
      [bodyX + bodyW - 2, bodyY + 2],
      [bodyX + 2, bodyY + bodyH - 2],
      [bodyX + bodyW - 2, bodyY + bodyH - 2],
    ];

    for (const [rx, ry] of rivetPositions) {
      ctx.fillStyle = '#B8B8B8';
      ctx.strokeStyle = '#686868';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Rivet highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(rx - 0.3, ry - 0.3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ====== CHEST PANEL ======
    const panelX = bodyX + 4;
    const panelY = bodyY + 5;
    const panelW = 12;
    const panelH = 8;

    // Panel background
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Status LEDs
    if (chestWarning) {
      // Warning triangle
      ctx.fillStyle = '#FFCC00';
      ctx.beginPath();
      ctx.moveTo(panelX + panelW / 2, panelY + 1.5);
      ctx.lineTo(panelX + panelW / 2 - 3, panelY + panelH - 1.5);
      ctx.lineTo(panelX + panelW / 2 + 3, panelY + panelH - 1.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#CC0000';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = '#CC0000';
      ctx.fillRect(panelX + panelW / 2 - 0.5, panelY + 3, 1, 3);
      ctx.beginPath();
      ctx.arc(panelX + panelW / 2, panelY + panelH - 2.5, 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // LED dots
      const ledColors = allGreen
        ? ['#00FF00', '#00FF00', '#00FF00']
        : ['#00FF00', '#FFCC00', '#FF4444'];
      const ledX = panelX + 3;
      const ledSpacing = 3;

      for (let i = 0; i < 3; i++) {
        const phase = (t * 0.003 * ledSequenceSpeed + i * 1.2) % (Math.PI * 2);
        const brightness = 0.4 + Math.sin(phase) * 0.6;

        ctx.globalAlpha = brightness;
        ctx.fillStyle = ledColors[i];
        ctx.shadowColor = ledColors[i];
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(ledX + i * ledSpacing, panelY + panelH / 2, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    // ====== ARMS ======
    for (const side of [-1, 1]) {
      ctx.save();

      const shoulderX = side * 11;
      const shoulderY = bodyY + 3;
      const upperArmLen = 7;
      const forearmLen = 6;
      const armAngle = side === -1 ? armLeftAngle : armRightAngle;
      const clawOpen = side === -1 ? clawOpenLeft : clawOpenRight;

      ctx.translate(shoulderX, shoulderY);

      // Shoulder rivet
      ctx.fillStyle = '#909090';
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Upper arm
      ctx.save();
      ctx.rotate(armAngle + (side === 1 ? 0.1 : -0.1));

      ctx.fillStyle = '#8A8A8A';
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.6;
      ctx.fillRect(-1.5, 0, 3, upperArmLen);
      ctx.strokeRect(-1.5, 0, 3, upperArmLen);

      // Elbow joint
      ctx.translate(0, upperArmLen);
      ctx.fillStyle = '#909090';
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Forearm
      const elbowAngle = side === -1
        ? Math.sin(t * 0.006) * 0.2
        : Math.sin(t * 0.006 + 1) * 0.2;
      ctx.rotate(elbowAngle);

      ctx.fillStyle = '#8A8A8A';
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 0.6;
      ctx.fillRect(-1.3, 0, 2.6, forearmLen);
      ctx.strokeRect(-1.3, 0, 2.6, forearmLen);

      // Claw/Pincer hand
      ctx.translate(0, forearmLen);
      const clawAngle = 0.3 + clawOpen;

      // Left pincer
      ctx.save();
      ctx.rotate(-clawAngle);
      ctx.fillStyle = '#707070';
      ctx.beginPath();
      ctx.moveTo(-0.5, 0);
      ctx.lineTo(-1.5, 3.5);
      ctx.lineTo(-0.3, 3);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.restore();

      // Right pincer
      ctx.save();
      ctx.rotate(clawAngle);
      ctx.fillStyle = '#707070';
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.lineTo(1.5, 3.5);
      ctx.lineTo(0.3, 3);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.restore();

      // Spark particles at hands (typing)
      if (sparkAtHands) {
        const sparkPhase = (t * 0.05 + side * 50) % 10;
        if (sparkPhase < 3) {
          ctx.fillStyle = '#FFFF00';
          ctx.globalAlpha = 1 - sparkPhase / 3;
          for (let s = 0; s < 3; s++) {
            const sx = Math.cos(sparkPhase + s * 2) * (2 + sparkPhase);
            const sy = Math.sin(sparkPhase + s * 2) * (2 + sparkPhase) + 2;
            ctx.beginPath();
            ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore(); // upper arm rotation
      ctx.restore(); // arm save
    }

    // ====== HEAD ======
    ctx.save();
    const headX = -8;
    const headY2 = -6 + breathe - 12 + headDroop;
    const headW = 16;
    const headH = 10;

    // Sleeping: head droops forward
    if (animState === 'sleeping') {
      ctx.translate(0, 2);
      ctx.rotate(0.1);
    }

    // Head shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(headX + 1, headY2 + 1, headW, headH);

    // Head (smaller rectangle on top of body)
    let headColor = '#B0B0B0';
    if (overheatTint > 0) {
      headColor = blendColor('#B0B0B0', '#FF4444', overheatTint * 0.6);
    }

    const headGrad = ctx.createLinearGradient(headX, headY2, headX + headW, headY2 + headH);
    headGrad.addColorStop(0, blendColor(headColor, '#FFFFFF', 0.2));
    headGrad.addColorStop(0.4, headColor);
    headGrad.addColorStop(1, blendColor(headColor, '#000000', 0.15));

    ctx.fillStyle = headGrad;
    ctx.fillRect(headX, headY2, headW, headH);

    // Head outline
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(headX, headY2, headW, headH);

    // Head top highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(headX + 1, headY2 + 0.4);
    ctx.lineTo(headX + headW - 1, headY2 + 0.4);
    ctx.stroke();

    // Head rivets
    for (const corner of [[headX + 1.5, headY2 + 1.5], [headX + headW - 1.5, headY2 + 1.5]]) {
      ctx.fillStyle = '#C0C0C0';
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.arc(corner[0], corner[1], 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // ====== ANTENNA ======
    ctx.save();
    const antennaBaseX = 0;
    const antennaBaseY = headY2;
    const antennaLen = 7 + antennaBob;

    ctx.translate(antennaBaseX, antennaBaseY);

    if (antennaSpinSpeed > 0) {
      // Spinning antenna (petting / victory)
      ctx.rotate(antennaRotation);
    }

    // Antenna stalk
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -antennaLen);
    ctx.stroke();

    // Antenna ball (blinks red)
    const antennaBlink = Math.sin(t * 0.008) > 0;
    const antennaColor = antennaBlink ? '#FF4444' : '#CC2222';
    ctx.fillStyle = antennaColor;
    ctx.shadowColor = antennaBlink ? '#FF4444' : 'transparent';
    ctx.shadowBlur = antennaBlink ? 4 : 0;
    ctx.beginPath();
    ctx.arc(0, -antennaLen, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Antenna ball highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(-0.5, -antennaLen - 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // antenna

    // ====== EYES (Rectangular LED-style) ======
    const eyeWidth = 5;
    const eyeHeight = 3;
    const eyeSpacing = 4;
    const eyeY = headY2 + headH / 2 - 0.5;

    ctx.globalAlpha = eyeDim;

    for (const side of [-1, 1]) {
      const ex = side * eyeSpacing;

      // Eye housing (dark rectangle)
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(ex - eyeWidth / 2 - 0.5, eyeY - eyeHeight / 2 - 0.5, eyeWidth + 1, eyeHeight + 1);

      if (eyeMode === 'happy') {
        // Happy: draw ^^ pattern inside rectangle
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        ctx.strokeStyle = '#00CED1';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00CED1';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(ex - eyeWidth / 2 + 0.5, eyeY + 0.5);
        ctx.lineTo(ex, eyeY - eyeHeight / 2 + 0.5);
        ctx.lineTo(ex + eyeWidth / 2 - 0.5, eyeY + 0.5);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (eyeMode === 'dead') {
        // Dead: X pattern
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 2;
        const s = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex - s, eyeY - s);
        ctx.lineTo(ex + s, eyeY + s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex + s, eyeY - s);
        ctx.lineTo(ex - s, eyeY + s);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (eyeMode === 'sleeping') {
        // Sleeping: dim horizontal line
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        ctx.strokeStyle = 'rgba(0, 206, 209, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ex - eyeWidth / 2 + 1, eyeY);
        ctx.lineTo(ex + eyeWidth / 2 - 1, eyeY);
        ctx.stroke();
      } else if (eyeMode === 'surprised') {
        // Surprised: larger, brighter glow
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        ctx.fillStyle = '#00CED1';
        ctx.shadowColor = '#00CED1';
        ctx.shadowBlur = 6;
        ctx.fillRect(ex - eyeWidth / 2 + 0.5, eyeY - eyeHeight / 2 + 0.3, eyeWidth - 1, eyeHeight - 0.6);
        ctx.shadowBlur = 0;
      } else if (eyeMode === 'looking_up') {
        // Looking up: pupil dot shifted up
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        ctx.fillStyle = '#00CED1';
        ctx.shadowColor = '#00CED1';
        ctx.shadowBlur = 3;
        ctx.fillRect(ex - 1.5, eyeY - eyeHeight / 2 + 0.3, 3, 1.5);
        ctx.shadowBlur = 0;
      } else {
        // Normal: glowing cyan rectangle with pupil tracking
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);

        // Pupil (tracking dot)
        const pupilX = ex + state.eyeOffsetX * 0.4;
        const pupilY = eyeY + state.eyeOffsetY * 0.3;

        ctx.fillStyle = '#00CED1';
        ctx.shadowColor = '#00CED1';
        ctx.shadowBlur = 4;
        ctx.fillRect(pupilX - 1.5, pupilY - 1, 3, 2);
        ctx.shadowBlur = 0;

        // Subtle scan line effect
        const scanLine = ((t * 0.01) % eyeHeight);
        ctx.fillStyle = 'rgba(0, 206, 209, 0.15)';
        ctx.fillRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2 + scanLine, eyeWidth, 0.5);
      }

      // Eye border glow
      ctx.strokeStyle = 'rgba(0, 206, 209, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(ex - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight);
    }

    ctx.globalAlpha = 1;

    // Petting: hearts above eyes
    if (animState === 'petting') {
      ctx.fillStyle = '#FF6B9D';
      const heartY = headY2 - 3 + Math.sin(t * 0.005) * 1.5;
      for (const side of [-1, 1]) {
        const hx = side * 4;
        ctx.save();
        ctx.translate(hx, heartY);
        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.bezierCurveTo(-1.5, -0.5, -1.5, -2, 0, -1);
        ctx.bezierCurveTo(1.5, -2, 1.5, -0.5, 0, 1);
        ctx.fill();
        ctx.restore();
      }
    }

    // Mouth area (small speaker grille)
    const mouthY = eyeY + eyeHeight / 2 + 2;
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 0.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-3, mouthY + i * 1.2);
      ctx.lineTo(3, mouthY + i * 1.2);
      ctx.stroke();
    }

    ctx.restore(); // head

    // ====== STEAM PARTICLES (overheat) ======
    if (steamParticles) {
      ctx.save();
      ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      const steamCount = 5;
      for (let i = 0; i < steamCount; i++) {
        const phase = (t * 0.003 + i * 1.5) % 5;
        const sx = -10 + i * 5 + Math.sin(t * 0.005 + i) * 2;
        const sy = -20 - phase * 4;
        const radius = 1 + phase * 0.5;
        const alpha = 1 - phase / 5;

        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ====== SLEEPING Z's ======
    if (animState === 'sleeping') {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(0, 206, 209, 0.5)';
      ctx.font = '5px monospace';
      ctx.fillText('Z', 10, -20 + zOffset);
      ctx.font = '4px monospace';
      ctx.fillText('Z', 13, -25 + zOffset * 0.7);
      ctx.font = '3px monospace';
      ctx.fillText('Z', 15, -29 + zOffset * 0.5);
    }

    ctx.restore();
  },
};
