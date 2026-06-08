import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const dice: CharacterStyle = {
  id: 'dice',
  name: 'Dice',
  description: 'A 6-sided die in 3/4 perspective. The top two pips of the front face ARE the eyes and track the cursor. Clever and casual with a love for probability jokes.',
  colors: { primary: '#FFFFFF', secondary: '#333333', accent: '#DC143C' },
  personality: {
    speechStyle: 'casual',
    catchphrase: "Let's roll! ...I had to.",
  },
  eyeStyle: 'dot',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      'Rolling initiative! Nat 20 on vibes.',
      "Let's roll! ...I had to.",
      'The die has been cast. That die is me.',
    ],
    typing: [
      'Critical hit on that syntax!',
      'Roll for debugging... it\'s a 3. Good luck.',
      'Nat 1 on that typo. Reroll!',
    ],
    idle: [
      'The odds of you reading this are 1 in 6. Wait, no they\'re not.',
      "I'm a die, not a dice. Grammar matters.",
      'Just sitting here, being fair and balanced.',
      'Every face I show is my best face.',
    ],
    victory: [
      'NATURAL 20!!! CRITICAL SUCCESS!',
      'Rolled a 6! Wait, I always roll a 6.',
      'The RNG gods smile upon us!',
    ],
    overheat: [
      'Loaded dice get hot. I would know.',
      'Melting... my pips are running...',
      'This is NOT a fair roll temperature.',
    ],
    petting: [
      'Careful, you might bias my rolls.',
      "I'm weighted toward affection now.",
      'That tickles my corners!',
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

    // Animation variables
    let wobbleAngle = 0;
    let bounceY = 0;
    let overheatTint = 0;
    let rollPhase = 0; // 0 = not rolling, 0-1 = rolling progress
    let showHeart = false;
    let pipGlow = 0;
    let tiltAngle = 0;
    let tumbleAngle = 0;
    let sleepMode = false;
    let victoryJump = 0;
    let faceValue = 6; // front face value shown
    let stretchFactor = 1.0;

    // Idle: subtle wobble + pip glow
    const idleWobble = Math.sin(t * 0.002) * 0.02;
    pipGlow = 0.3 + Math.sin(t * 0.003) * 0.15;

    switch (animState) {
      case 'idle':
        wobbleAngle = idleWobble;
        break;
      case 'dragging':
        wobbleAngle = Math.sin(t * 0.015) * 0.15;
        break;
      case 'wobble':
        wobbleAngle = Math.sin(t * 0.012) * 0.2;
        bounceY = Math.abs(Math.sin(t * 0.008)) * 2;
        break;
      case 'chasing':
        tumbleAngle = (t * 0.012) % (Math.PI * 2);
        bounceY = Math.abs(Math.sin(t * 0.01)) * 3;
        break;
      case 'petting':
        wobbleAngle = Math.sin(t * 0.008) * 0.08;
        showHeart = true;
        break;
      case 'typing_along':
        bounceY = Math.abs(Math.sin(t * 0.015)) * 2;
        // Rapid face changes
        faceValue = (Math.floor(t * 0.015) % 6) + 1;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.006) * 0.15;
        wobbleAngle = Math.sin(t * 0.02) * 0.1;
        break;
      case 'thinking':
        wobbleAngle = Math.sin(t * 0.002) * 0.03;
        bounceY = -1;
        break;
      case 'victory':
        // Full roll animation
        rollPhase = (t * 0.005) % 1;
        faceValue = (Math.floor(t * 0.008) % 6) + 1;
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 6;
        if (rollPhase > 0.8) faceValue = 6; // always lands on 6
        break;
      case 'stretching':
        stretchFactor = 1.0 + Math.sin(t * 0.004) * 0.15;
        wobbleAngle = Math.sin(t * 0.003) * 0.05;
        break;
      case 'paper_unroll':
        wobbleAngle = -0.05;
        bounceY = Math.sin(t * 0.003) * 1;
        break;
      case 'sleeping':
        sleepMode = true;
        wobbleAngle = 0;
        bounceY = 1;
        break;
      case 'waving':
        tiltAngle = Math.sin(t * 0.008) * 0.3;
        wobbleAngle = tiltAngle;
        break;
    }

    // Apply transforms
    ctx.translate(0, -bounceY);
    if (victoryJump > 0) ctx.translate(0, -victoryJump);
    if (tumbleAngle !== 0) {
      ctx.rotate(tumbleAngle);
    } else {
      ctx.rotate(wobbleAngle);
    }
    if (stretchFactor !== 1.0) {
      ctx.scale(stretchFactor, 1.0 / stretchFactor);
    }

    // ====== DIE BODY (3/4 perspective) ======
    // The die is drawn as: front face (rectangle), top face (parallelogram), right side (thin parallelogram)
    const size = 22; // half-size of front face
    const depth = 6; // 3D depth offset
    const topSkew = 5; // vertical skew for top face

    // Compute base color with overheat
    let baseColor = '#FFFFFF';
    let pipColor = '#333333';
    if (overheatTint > 0) {
      baseColor = blendColor('#FFFFFF', '#FF3333', overheatTint);
      pipColor = blendColor('#333333', '#880000', overheatTint);
    }

    // ====== SHADOW ======
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(2, size - 2, size * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ====== RIGHT SIDE FACE (thin parallelogram) ======
    ctx.save();
    const rsGrad = ctx.createLinearGradient(size - 2, -size + topSkew, size - 2 + depth, -size + topSkew);
    rsGrad.addColorStop(0, blendColor(baseColor, '#AAAAAA', 0.3));
    rsGrad.addColorStop(1, blendColor(baseColor, '#888888', 0.4));
    ctx.fillStyle = rsGrad;
    ctx.beginPath();
    ctx.moveTo(size - 2, -size + 2); // top-right of front
    ctx.lineTo(size - 2 + depth, -size + 2 - topSkew); // top-right pushed back
    ctx.lineTo(size - 2 + depth, size - 2 - topSkew); // bottom-right pushed back
    ctx.lineTo(size - 2, size - 2); // bottom-right of front
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Right face pips (showing "3" - diagonal)
    if (!sleepMode) {
      ctx.fillStyle = pipColor;
      const rcx = size - 2 + depth * 0.5;
      const rcy = -topSkew * 0.5;
      const rpSize = 1.3;
      // Three dots diagonal
      ctx.beginPath(); ctx.arc(rcx - 0.5, rcy - 6, rpSize, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rcx, rcy, rpSize, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rcx + 0.5, rcy + 6, rpSize, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // ====== TOP FACE (parallelogram) ======
    ctx.save();
    const topGrad = ctx.createLinearGradient(-size + 2, -size - topSkew, size - 2, -size - topSkew);
    topGrad.addColorStop(0, blendColor(baseColor, '#F0F0F0', 0.1));
    topGrad.addColorStop(0.5, baseColor);
    topGrad.addColorStop(1, blendColor(baseColor, '#E8E8E8', 0.15));
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(-size + 2, -size + 2); // front top-left
    ctx.lineTo(-size + 2 + depth, -size + 2 - topSkew); // back top-left
    ctx.lineTo(size - 2 + depth, -size + 2 - topSkew); // back top-right
    ctx.lineTo(size - 2, -size + 2); // front top-right
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Top face pip (showing "1" - single center dot, or heart when petting)
    if (showHeart) {
      // Draw a small heart
      const hx = depth * 0.5;
      const hy = -size + 2 - topSkew * 0.5;
      ctx.fillStyle = '#DC143C';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 1.5);
      ctx.bezierCurveTo(hx - 2.5, hy - 1.5, hx - 4, hy + 1, hx, hy + 3.5);
      ctx.bezierCurveTo(hx + 4, hy + 1, hx + 2.5, hy - 1.5, hx, hy + 1.5);
      ctx.fill();
    } else if (!sleepMode) {
      ctx.fillStyle = pipColor;
      const tcx = depth * 0.5;
      const tcy = -size + 2 - topSkew * 0.5;
      ctx.beginPath();
      ctx.arc(tcx, tcy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ====== FRONT FACE (main rectangle with rounded corners) ======
    ctx.save();
    const frontGrad = ctx.createLinearGradient(-size + 2, -size + 2, size - 2, size - 2);
    frontGrad.addColorStop(0, baseColor);
    frontGrad.addColorStop(0.4, baseColor);
    frontGrad.addColorStop(1, blendColor(baseColor, '#E8E8E8', 0.2));
    ctx.fillStyle = frontGrad;

    // Rounded rectangle for front face
    const rx = -size + 2;
    const ry = -size + 2;
    const rw = (size - 2) * 2;
    const rh = (size - 2) * 2;
    const radius = 3;
    ctx.beginPath();
    ctx.moveTo(rx + radius, ry);
    ctx.lineTo(rx + rw - radius, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
    ctx.lineTo(rx + rw, ry + rh - radius);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
    ctx.lineTo(rx + radius, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
    ctx.lineTo(rx, ry + radius);
    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Subtle inner highlight on front face
    const highlightGrad = ctx.createLinearGradient(rx, ry, rx + rw * 0.5, ry + rh * 0.3);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.moveTo(rx + radius, ry);
    ctx.lineTo(rx + rw * 0.6, ry);
    ctx.lineTo(rx + rw * 0.3, ry + rh * 0.4);
    ctx.lineTo(rx + radius, ry + rh * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // ====== FRONT FACE PIPS ======
    // "6" arrangement: two columns of three
    // The top two pips ARE the eyes (they track cursor)
    // Layout: left column at x=-8, right column at x=8
    // Rows at y=-12 (top/eyes), y=0 (middle), y=12 (bottom)

    const pipR = 2.5;
    const leftCol = -8;
    const rightCol = 8;
    const topRow = -12;
    const midRow = 0;
    const botRow = 12;

    if (sleepMode) {
      // Sleeping: pips rearrange to "zzz" pattern, front face mostly blank
      ctx.save();
      const zFloat = Math.sin(t * 0.002) * 1.5;
      ctx.fillStyle = 'rgba(50, 50, 80, 0.7)';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('z', -4, -2 + zFloat);
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('z', 2, -8 + zFloat * 0.7);
      ctx.font = 'bold 4px sans-serif';
      ctx.fillText('z', 6, -13 + zFloat * 0.5);
      ctx.restore();

      // Draw closed eye lines where top pips would be
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftCol - 3, topRow);
      ctx.lineTo(leftCol + 3, topRow);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightCol - 3, topRow);
      ctx.lineTo(rightCol + 3, topRow);
      ctx.stroke();
    } else if (animState === 'overheat') {
      // Angry face arrangement: top two are angry eyes, middle/bottom form angry mouth
      // Eyes (top pips) - angular/angry
      ctx.save();
      ctx.strokeStyle = pipColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // Left angry eye
      ctx.beginPath();
      ctx.moveTo(leftCol - 3, topRow - 2);
      ctx.lineTo(leftCol + 3, topRow + 1);
      ctx.stroke();
      ctx.fillStyle = pipColor;
      ctx.beginPath(); ctx.arc(leftCol + state.eyeOffsetX * 0.3, topRow + 1 + state.eyeOffsetY * 0.3, pipR * 0.8, 0, Math.PI * 2); ctx.fill();
      // Right angry eye
      ctx.beginPath();
      ctx.moveTo(rightCol + 3, topRow - 2);
      ctx.lineTo(rightCol - 3, topRow + 1);
      ctx.stroke();
      ctx.fillStyle = pipColor;
      ctx.beginPath(); ctx.arc(rightCol + state.eyeOffsetX * 0.3, topRow + 1 + state.eyeOffsetY * 0.3, pipR * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Angry mouth (middle and bottom pips form a frown)
      ctx.fillStyle = pipColor;
      ctx.beginPath(); ctx.arc(leftCol, midRow, pipR * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rightCol, midRow, pipR * 0.7, 0, Math.PI * 2); ctx.fill();
      // Frown line connecting bottom pips
      ctx.strokeStyle = pipColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftCol, botRow);
      ctx.quadraticCurveTo(0, botRow + 4, rightCol, botRow);
      ctx.stroke();
    } else {
      // Normal state or animation states
      const eyeMode = getEyeMode(animState);

      // ====== TOP PIPS = EYES ======
      if (eyeMode === 'happy') {
        // ^^ arcs for eyes
        ctx.strokeStyle = pipColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(leftCol, topRow, 3, Math.PI + 0.4, -0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightCol, topRow, 3, Math.PI + 0.4, -0.4);
        ctx.stroke();
      } else if (eyeMode === 'dead') {
        // X X eyes
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        const s = 2.5;
        for (const cx of [leftCol, rightCol]) {
          ctx.beginPath(); ctx.moveTo(cx - s, topRow - s); ctx.lineTo(cx + s, topRow + s); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + s, topRow - s); ctx.lineTo(cx - s, topRow + s); ctx.stroke();
        }
      } else if (eyeMode === 'sleeping') {
        // Horizontal lines
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(leftCol - 3, topRow); ctx.lineTo(leftCol + 3, topRow); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rightCol - 3, topRow); ctx.lineTo(rightCol + 3, topRow); ctx.stroke();
      } else if (eyeMode === 'surprised') {
        // Larger eye pips
        ctx.fillStyle = pipColor;
        const bigR = pipR * 1.4;
        ctx.beginPath(); ctx.arc(leftCol + state.eyeOffsetX * 0.3, topRow + state.eyeOffsetY * 0.3, bigR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol + state.eyeOffsetX * 0.3, topRow + state.eyeOffsetY * 0.3, bigR, 0, Math.PI * 2); ctx.fill();
        // White highlights
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(leftCol - 0.8 + state.eyeOffsetX * 0.2, topRow - 1, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol - 0.8 + state.eyeOffsetX * 0.2, topRow - 1, 0.9, 0, Math.PI * 2); ctx.fill();
      } else if (eyeMode === 'looking_up') {
        // Pips shifted up
        ctx.fillStyle = pipColor;
        ctx.beginPath(); ctx.arc(leftCol + 1, topRow - 2, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol + 1, topRow - 2, pipR, 0, Math.PI * 2); ctx.fill();
        // Pip glow
        if (pipGlow > 0) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = pipGlow * 3;
        }
      } else {
        // Normal: top pips track cursor (these ARE the eyes)
        const eyeTrackX = state.eyeOffsetX * 0.4;
        const eyeTrackY = state.eyeOffsetY * 0.4;
        // Clamp movement to stay within pip area
        const clampedX = Math.max(-2, Math.min(2, eyeTrackX));
        const clampedY = Math.max(-2, Math.min(2, eyeTrackY));

        ctx.fillStyle = pipColor;
        // Pip glow effect
        if (pipGlow > 0.3) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = pipGlow * 4;
        }
        ctx.beginPath(); ctx.arc(leftCol + clampedX, topRow + clampedY, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol + clampedX, topRow + clampedY, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Tiny white highlights on eye-pips for life
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.arc(leftCol + clampedX - 0.8, topRow + clampedY - 0.8, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol + clampedX - 0.8, topRow + clampedY - 0.8, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      // ====== MIDDLE PIPS (static) ======
      ctx.fillStyle = pipColor;
      ctx.shadowBlur = 0;
      if (faceValue === 6 || faceValue === 4 || faceValue === 5) {
        ctx.beginPath(); ctx.arc(leftCol, midRow, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol, midRow, pipR, 0, Math.PI * 2); ctx.fill();
      }
      if (faceValue === 5 || faceValue === 3 || faceValue === 1) {
        ctx.beginPath(); ctx.arc(0, midRow, pipR, 0, Math.PI * 2); ctx.fill();
      }
      if (faceValue === 2) {
        ctx.beginPath(); ctx.arc(leftCol, midRow - 4, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol, midRow + 4, pipR, 0, Math.PI * 2); ctx.fill();
      }

      // ====== BOTTOM PIPS (static) ======
      if (faceValue === 6 || faceValue === 4 || faceValue === 5) {
        ctx.beginPath(); ctx.arc(leftCol, botRow, pipR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightCol, botRow, pipR, 0, Math.PI * 2); ctx.fill();
      }
      if (faceValue === 6) {
        // Already drawn all 6 positions (top as eyes + mid + bot)
      }
    }

    // ====== EDGE HIGHLIGHTS (depth effect on front face edges) ======
    ctx.save();
    // Top edge highlight
    const edgeGrad = ctx.createLinearGradient(-size + 2, -size + 2, -size + 2, -size + 5);
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    edgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(-size + 4, -size + 2, (size - 2) * 2 - 4, 3);

    // Left edge highlight
    const leftEdgeGrad = ctx.createLinearGradient(-size + 2, 0, -size + 5, 0);
    leftEdgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    leftEdgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = leftEdgeGrad;
    ctx.fillRect(-size + 2, -size + 4, 3, (size - 2) * 2 - 4);
    ctx.restore();

    // ====== TYPING FACE FLASH INDICATOR ======
    if (animState === 'typing_along') {
      // Subtle flash when face changes
      const flashPhase = (t * 0.015) % 1;
      if (flashPhase < 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * (1 - flashPhase / 0.1)})`;
        ctx.fillRect(-size + 2, -size + 2, (size - 2) * 2, (size - 2) * 2);
      }
    }

    // ====== VICTORY SPARKLES ======
    if (animState === 'victory') {
      ctx.save();
      const sparkleCount = 5;
      for (let i = 0; i < sparkleCount; i++) {
        const angle = (t * 0.003 + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2);
        const dist = 20 + Math.sin(t * 0.005 + i) * 4;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const sparkleSize = 1.5 + Math.sin(t * 0.01 + i * 2) * 0.8;
        ctx.fillStyle = `rgba(220, 20, 60, ${0.6 + Math.sin(t * 0.008 + i) * 0.3})`;
        // 4-point star
        ctx.beginPath();
        ctx.moveTo(sx, sy - sparkleSize);
        ctx.lineTo(sx + sparkleSize * 0.3, sy);
        ctx.lineTo(sx, sy + sparkleSize);
        ctx.lineTo(sx - sparkleSize * 0.3, sy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx - sparkleSize, sy);
        ctx.lineTo(sx, sy + sparkleSize * 0.3);
        ctx.lineTo(sx + sparkleSize, sy);
        ctx.lineTo(sx, sy - sparkleSize * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // ====== SLEEPING Z's ======
    if (sleepMode) {
      ctx.save();
      const zFloat = Math.sin(t * 0.0015) * 2;
      ctx.fillStyle = 'rgba(80, 80, 120, 0.6)';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('Z', 14, -10 + zFloat);
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('Z', 18, -16 + zFloat * 0.7);
      ctx.font = 'bold 3.5px sans-serif';
      ctx.fillText('Z', 21, -20 + zFloat * 0.4);
      ctx.restore();
    }

    ctx.restore();
  },
};
