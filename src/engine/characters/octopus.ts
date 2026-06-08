import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const octopus: CharacterStyle = {
  id: 'octopus',
  name: 'Octopus',
  description: 'A clever purple octopus with eight wavy tentacles. Casual, multitasking master, and surprisingly good at debugging.',
  colors: { primary: '#9370DB', secondary: '#B19CD9', accent: '#E6E6FA' },
  personality: {
    speechStyle: 'casual',
    catchphrase: 'Eight arms, zero bugs. Okay maybe one bug.',
  },
  eyeStyle: 'wide',
  nativeSize: 48,
  speechOverrides: {
    typing_along: [
      'Eight arms, eight monitors. Living the dream.',
      "I'm literally built for multitasking.",
      'Ctrl+C, Ctrl+V, Ctrl+C, Ctrl+V — all at once.',
      'Typing at 800 WPM. Per tentacle.',
    ],
    overheat: [
      'INK INK INK — I mean, HELP!',
      'All eight arms are on fire!',
      'Somebody call the aquarium!',
    ],
    idle: [
      'Tentacle five is getting restless.',
      'You think git merge is hard? Try coordinating 8 arms.',
      "Eight arms, zero bugs. Okay maybe one bug.",
      '*waves tentacle lazily*',
    ],
    petting: [
      'Ooh that hits different with all these nerve endings...',
      'Careful, I might ink from excitement.',
      'Right on the mantle. Perfect.',
    ],
    victory: [
      'ALL TENTACLES UP! We did it!',
      '*squirts celebratory ink*',
      'Eight high-fives coming your way!',
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

    // Animation parameters
    let bodyBob = Math.sin(t * 0.003) * 1.5;
    let colorPulse = 0;
    let tentacleSpeed = 0.004;
    let tentacleAmplitude = 3;
    let blushAlpha = 0;
    let overheatTint = 0;
    let victoryJump = 0;
    let inkSquirts: boolean = false;
    let tentaclesCurlIn = false;
    let tentaclesUp = false;
    let tentaclesFlail = false;
    let tentaclesWrap = false;
    let jetPose = false;
    let typingTap = false;
    let waveIndex = -1; // which tentacle waves (-1 = none)
    let sleepingZs = false;

    switch (animState) {
      case 'idle':
        colorPulse = Math.sin(t * 0.002) * 0.05;
        break;
      case 'dragging':
        bodyBob = Math.sin(t * 0.01) * 3;
        tentacleAmplitude = 6;
        tentacleSpeed = 0.012;
        break;
      case 'wobble':
        bodyBob = Math.sin(t * 0.015) * 4;
        tentacleAmplitude = 5;
        tentacleSpeed = 0.015;
        break;
      case 'chasing':
        jetPose = true;
        bodyBob = 0;
        tentacleAmplitude = 2;
        tentacleSpeed = 0.02;
        break;
      case 'petting':
        tentaclesCurlIn = true;
        blushAlpha = 0.3 + Math.sin(t * 0.004) * 0.1;
        bodyBob = Math.sin(t * 0.003) * 0.5;
        break;
      case 'typing_along':
        typingTap = true;
        tentacleSpeed = 0.04;
        tentacleAmplitude = 2;
        bodyBob = Math.sin(t * 0.006) * 0.5;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.006) * 0.15;
        tentaclesFlail = true;
        tentacleSpeed = 0.025;
        tentacleAmplitude = 7;
        bodyBob = Math.sin(t * 0.008) * 2;
        break;
      case 'thinking':
        bodyBob = Math.sin(t * 0.002) * 0.8;
        tentacleAmplitude = 1.5;
        tentacleSpeed = 0.002;
        break;
      case 'victory':
        tentaclesUp = true;
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 4;
        inkSquirts = true;
        break;
      case 'stretching':
        tentacleAmplitude = 5 + Math.sin(t * 0.003) * 3;
        tentacleSpeed = 0.005;
        bodyBob = Math.sin(t * 0.003) * 1;
        break;
      case 'paper_unroll':
        tentacleAmplitude = 2;
        tentacleSpeed = 0.006;
        bodyBob = Math.sin(t * 0.005) * 0.8;
        break;
      case 'sleeping':
        tentaclesWrap = true;
        sleepingZs = true;
        bodyBob = Math.sin(t * 0.001) * 0.3;
        break;
      case 'waving':
        waveIndex = 0; // first tentacle waves
        bodyBob = Math.sin(t * 0.004) * 1;
        break;
    }

    // Victory jump offset
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }

    // Jet propulsion rotation for chasing
    if (jetPose) {
      ctx.rotate(-0.4);
      ctx.translate(0, -3);
    }

    // Body bob translation
    ctx.translate(0, bodyBob);

    // ====== INK SQUIRTS (behind body) ======
    if (inkSquirts) {
      ctx.save();
      const inkCount = 5;
      for (let i = 0; i < inkCount; i++) {
        const angle = (i / inkCount) * Math.PI * 2 + t * 0.003;
        const dist = 18 + Math.sin(t * 0.01 + i * 1.3) * 4;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist + 5;
        const size = 1.5 + Math.sin(t * 0.008 + i) * 0.8;
        ctx.fillStyle = `rgba(30, 20, 50, ${0.4 + Math.sin(t * 0.006 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ====== TENTACLES ======
    const tentacleConfigs = [
      { baseX: -8, baseY: 8, angle: -0.6, phase: 0 },      // left outer
      { baseX: -4, baseY: 10, angle: -0.25, phase: 0.8 },   // left inner
      { baseX: 4, baseY: 10, angle: 0.25, phase: 1.6 },     // right inner
      { baseX: 8, baseY: 8, angle: 0.6, phase: 2.4 },       // right outer
    ];

    for (let ti = 0; ti < tentacleConfigs.length; ti++) {
      const tc = tentacleConfigs[ti];
      ctx.save();
      ctx.translate(tc.baseX, tc.baseY);

      let tentLen = 14;
      let curlFactor = 0;

      // State-based modifications
      if (tentaclesCurlIn) {
        curlFactor = 0.15;
        tentLen = 11;
      }
      if (tentaclesUp) {
        ctx.rotate(-tc.angle * 1.8);
        tentLen = 12;
      }
      if (tentaclesWrap) {
        curlFactor = 0.3;
        tentLen = 10;
        ctx.rotate(tc.angle * 0.5);
      }

      // Waving tentacle
      const isWaving = (waveIndex === ti);
      if (isWaving) {
        ctx.rotate(-0.6);
        tentLen = 13;
      }

      // Draw tentacle as a bezier with wave
      const segments = 8;
      const segLen = tentLen / segments;

      // Determine base color
      let baseColor = '#9370DB';
      if (overheatTint > 0) {
        baseColor = blendColor('#9370DB', '#e74c3c', overheatTint);
      }
      if (colorPulse !== 0) {
        baseColor = blendColor('#9370DB', '#B19CD9', 0.5 + colorPulse);
      }

      // Compute tentacle points
      const points: { x: number; y: number }[] = [];
      for (let s = 0; s <= segments; s++) {
        const frac = s / segments;
        let waveOffset: number;

        if (typingTap) {
          // Rapid tap motion
          waveOffset = Math.sin(t * tentacleSpeed + tc.phase + s * 0.8) * tentacleAmplitude * (1 - frac * 0.3);
          // Add a "tap" at the end
          if (frac > 0.7) {
            waveOffset += Math.sin(t * 0.06 + ti * 1.5) * 2;
          }
        } else if (tentaclesFlail) {
          waveOffset = Math.sin(t * tentacleSpeed + tc.phase + s * 0.6) * tentacleAmplitude * (0.5 + frac);
        } else if (isWaving && frac > 0.4) {
          waveOffset = Math.sin(t * 0.012 + s * 0.5) * 4;
        } else {
          waveOffset = Math.sin(t * tentacleSpeed + tc.phase + s * 0.7) * tentacleAmplitude * frac;
        }

        // Curl inward
        waveOffset -= curlFactor * s * s * (tc.baseX > 0 ? -1 : 1);

        const x = waveOffset;
        const y = s * segLen;
        points.push({ x, y });
      }

      // Draw tentacle body (thick to thin)
      for (let s = 0; s < segments; s++) {
        const frac = s / segments;
        const thickness = 3.5 * (1 - frac * 0.8); // taper from 3.5 to ~0.7

        const grad = ctx.createLinearGradient(
          points[s].x, points[s].y,
          points[s + 1].x, points[s + 1].y
        );
        const lightColor = blendColor(baseColor, '#E6E6FA', 0.2 - frac * 0.15);
        const darkColor = blendColor(baseColor, '#4B0082', frac * 0.3);
        grad.addColorStop(0, lightColor);
        grad.addColorStop(1, darkColor);

        ctx.strokeStyle = grad;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[s].x, points[s].y);

        // Use quadratic curve for smoothness
        if (s < segments - 1) {
          const midX = (points[s].x + points[s + 1].x) / 2;
          const midY = (points[s].y + points[s + 1].y) / 2;
          ctx.quadraticCurveTo(points[s + 1].x, points[s + 1].y, midX, midY);
        } else {
          ctx.lineTo(points[s + 1].x, points[s + 1].y);
        }
        ctx.stroke();
      }

      // Draw suction cups on underside
      ctx.fillStyle = blendColor('#B19CD9', '#E6E6FA', 0.3);
      for (let s = 1; s < segments - 1; s += 2) {
        const frac = s / segments;
        const cupSize = 1.2 * (1 - frac * 0.5);
        const cupX = points[s].x + (tc.baseX > 0 ? -1.5 : 1.5);
        const cupY = points[s].y;

        ctx.beginPath();
        ctx.arc(cupX, cupY, cupSize, 0, Math.PI * 2);
        ctx.fill();

        // Cup inner shadow
        ctx.fillStyle = 'rgba(75, 0, 130, 0.2)';
        ctx.beginPath();
        ctx.arc(cupX, cupY, cupSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = blendColor('#B19CD9', '#E6E6FA', 0.3);
      }

      ctx.restore();
    }

    // ====== DOME HEAD (BODY) ======
    ctx.save();
    const domeY = -6;

    // Dome shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(1, domeY + 2, 13, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main dome gradient (lighter on top, darker at edges)
    let domeColor = '#9370DB';
    if (overheatTint > 0) {
      domeColor = blendColor('#9370DB', '#e74c3c', overheatTint);
    }
    if (colorPulse !== 0) {
      domeColor = blendColor('#9370DB', '#B19CD9', 0.5 + colorPulse);
    }

    const domeGrad = ctx.createRadialGradient(-3, domeY - 6, 2, 0, domeY, 14);
    domeGrad.addColorStop(0, blendColor(domeColor, '#ffffff', 0.35));
    domeGrad.addColorStop(0.4, blendColor(domeColor, '#E6E6FA', 0.15));
    domeGrad.addColorStop(0.8, domeColor);
    domeGrad.addColorStop(1, blendColor(domeColor, '#4B0082', 0.3));

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    // Dome shape: wider at bottom, rounded top
    ctx.moveTo(-12, 8);
    ctx.bezierCurveTo(-13, 2, -12, -8, -8, -14);
    ctx.bezierCurveTo(-4, -19, 4, -19, 8, -14);
    ctx.bezierCurveTo(12, -8, 13, 2, 12, 8);
    ctx.bezierCurveTo(10, 11, -10, 11, -12, 8);
    ctx.closePath();
    ctx.fill();

    // Dome outline
    ctx.strokeStyle = 'rgba(75, 0, 130, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.bezierCurveTo(-13, 2, -12, -8, -8, -14);
    ctx.bezierCurveTo(-4, -19, 4, -19, 8, -14);
    ctx.bezierCurveTo(12, -8, 13, 2, 12, 8);
    ctx.bezierCurveTo(10, 11, -10, 11, -12, 8);
    ctx.closePath();
    ctx.stroke();

    // Top highlight (specular)
    const highlightGrad = ctx.createRadialGradient(-3, domeY - 8, 1, -2, domeY - 6, 6);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-2, domeY - 8, 5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Secondary highlight
    const highlight2 = ctx.createRadialGradient(4, domeY - 4, 0.5, 4, domeY - 3, 3);
    highlight2.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlight2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight2;
    ctx.beginPath();
    ctx.ellipse(4, domeY - 4, 3, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ====== EYES ======
    if (!tentaclesWrap) {
      // Large eyes on lower half of dome
      const eyeY = -2;
      const eyeSpacing = 7;
      const eyeRadius = 8;

      // Eye whites with shadow — sclera shifts slightly with gaze
      const scleraShiftX = state.eyeOffsetX * 0.15;
      const scleraShiftY = state.eyeOffsetY * 0.15;
      for (const side of [-1, 1]) {
        const ex = side * eyeSpacing + scleraShiftX;
        const ey = eyeY + scleraShiftY;

        // Outer shadow
        ctx.fillStyle = 'rgba(30, 0, 60, 0.2)';
        ctx.beginPath();
        ctx.arc(ex + 0.5, ey + 0.5, eyeRadius + 1, 0, Math.PI * 2);
        ctx.fill();

        // White
        ctx.fillStyle = '#fdfdff';
        ctx.beginPath();
        ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(75, 0, 130, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Draw eye contents based on mode
      const blinkCycle = t % 4000;
      const isBlinking = blinkCycle > 3850;

      if (eyeMode === 'happy') {
        // ^^ arcs
        ctx.strokeStyle = '#4B0082';
        ctx.lineWidth = 2;
        for (const side of [-1, 1]) {
          const ex = side * eyeSpacing;
          ctx.beginPath();
          ctx.arc(ex, eyeY + 2, 4, Math.PI + 0.4, -0.4);
          ctx.stroke();
        }
      } else if (eyeMode === 'dead') {
        // X X eyes
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2;
        const s = 4;
        for (const side of [-1, 1]) {
          const cx = side * eyeSpacing;
          ctx.beginPath(); ctx.moveTo(cx - s, eyeY - s); ctx.lineTo(cx + s, eyeY + s); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + s, eyeY - s); ctx.lineTo(cx - s, eyeY + s); ctx.stroke();
        }
      } else if (eyeMode === 'sleeping') {
        // Horizontal lines
        ctx.strokeStyle = '#4B0082';
        ctx.lineWidth = 2;
        for (const side of [-1, 1]) {
          const ex = side * eyeSpacing;
          ctx.beginPath();
          ctx.moveTo(ex - 5, eyeY);
          ctx.lineTo(ex + 5, eyeY);
          ctx.stroke();
        }
      } else {
        // Normal, surprised, looking_up
        if (!isBlinking) {
          const maxPupilShift = eyeRadius - 4;
          let pupilOffX = Math.max(-maxPupilShift, Math.min(maxPupilShift, state.eyeOffsetX));
          let pupilOffY = Math.max(-maxPupilShift, Math.min(maxPupilShift, state.eyeOffsetY));
          if (eyeMode === 'looking_up') {
            pupilOffX = 1;
            pupilOffY = -3;
          }

          const irisRadius = eyeMode === 'surprised' ? 6 : 5;
          const pupilRadius = eyeMode === 'surprised' ? 3.5 : 3;

          for (const side of [-1, 1]) {
            const ex = side * eyeSpacing + pupilOffX;
            const ey = eyeY + pupilOffY;

            // Dark purple iris ring
            const irisGrad = ctx.createRadialGradient(ex, ey, pupilRadius - 1, ex, ey, irisRadius);
            irisGrad.addColorStop(0, '#1a0a2e');
            irisGrad.addColorStop(0.5, '#4B0082');
            irisGrad.addColorStop(0.8, '#6A0DAD');
            irisGrad.addColorStop(1, '#9370DB');
            ctx.fillStyle = irisGrad;
            ctx.beginPath();
            ctx.arc(ex, ey, irisRadius, 0, Math.PI * 2);
            ctx.fill();

            // Pupil (black)
            ctx.fillStyle = '#0a0a0e';
            ctx.beginPath();
            ctx.arc(ex, ey, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            // Primary highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 1.5, ey - 2, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Secondary highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(ex + 1, ey + 1.2, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Blinking
          ctx.strokeStyle = '#4B0082';
          ctx.lineWidth = 2;
          for (const side of [-1, 1]) {
            const ex = side * eyeSpacing;
            ctx.beginPath();
            ctx.arc(ex, eyeY, 5, 0, Math.PI);
            ctx.stroke();
          }
        }
      }

      // Petting blush
      if (blushAlpha > 0) {
        ctx.fillStyle = `rgba(219, 112, 147, ${blushAlpha})`;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(side * eyeSpacing, eyeY + 7, 4, 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Sleeping wrapped — show closed eye lines on top of wrap
      ctx.strokeStyle = '#4B0082';
      ctx.lineWidth = 1.5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 5 - 3, -3);
        ctx.lineTo(side * 5 + 3, -3);
        ctx.stroke();
      }
    }

    // ====== BEAK/MOUTH ======
    if (!tentaclesWrap) {
      // Small "w" shaped beak between tentacles
      const mouthY = 8;
      ctx.strokeStyle = blendColor('#4B0082', '#2a1a3e', 0.5);
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2.5, mouthY);
      ctx.quadraticCurveTo(-1.2, mouthY + 1.5, 0, mouthY);
      ctx.quadraticCurveTo(1.2, mouthY + 1.5, 2.5, mouthY);
      ctx.stroke();
    }

    // ====== SLEEPING Z's ======
    if (sleepingZs) {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(147, 112, 219, 0.6)';
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('z', 12, -10 + zOffset);
      ctx.font = 'bold 4px sans-serif';
      ctx.fillText('z', 15, -15 + zOffset * 0.7);
      ctx.font = 'bold 3px sans-serif';
      ctx.fillText('z', 17, -19 + zOffset * 0.5);
    }

    // ====== OVERHEAT STEAM ======
    if (overheatTint > 0) {
      ctx.strokeStyle = 'rgba(200, 50, 50, 0.4)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        const sx = -6 + i * 4;
        const sy = -18 - Math.sin(t * 0.005 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + 1, sy - 3, sx - 1, sy - 5);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
