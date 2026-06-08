import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const coffee: CharacterStyle = {
  id: 'coffee',
  name: 'Coffee',
  description: 'A cheerful ceramic coffee mug with a face. Energetic, warm, and always steaming with enthusiasm for your code.',
  colors: { primary: '#FFFFFF', secondary: '#4a2c10', accent: '#D2691E' },
  personality: {
    speechStyle: 'energetic',
    catchphrase: "I'm not a dependency. I'm a FEATURE.",
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      "Good morning! Or evening. I don't judge caffeine timing.",
      "Fresh brew reporting for duty!",
      "Pour yourself into that code!",
    ],
    typing_along: [
      "Pour one out for the lines you're about to delete.",
      "*slurp* Keep coding. I'll keep you warm.",
      "Every semicolon deserves a sip.",
      "Brewing up some beautiful logic!",
    ],
    idle: [
      "Getting cold over here. Drink me before I become iced coffee.",
      "*steam rises* Still hot. Still here.",
      "I'm not a dependency. I'm a FEATURE.",
    ],
    overheat: [
      "I'M BOILING. This is NOT pour-over temperature!",
      "TOO HOT! Even for me! And I'm LITERALLY coffee!",
      "Someone turn down the thermostat on this build!",
    ],
    victory: [
      "CHEERS! *coffee splashes everywhere*",
      "That deserves a double shot celebration!",
      "Brewed to perfection, just like that code!",
    ],
    petting: [
      "Mmm, warming my ceramic...",
      "Hold me like your favorite mug.",
      "Careful, I'm still hot!",
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
    let steamIntensity = 1.0;
    let steamSpeed = 0.003;
    let liquidSlosh = Math.sin(t * 0.003) * 0.5;
    let blushAlpha = 0;
    let overheatTint = 0;
    let mugShake = 0;
    let tiltForward = 0;
    let victoryJump = 0;
    let splashParticles: { x: number; y: number; alpha: number }[] = [];
    let bubbleCount = 0;
    let heartSteam = false;
    let waveNubAngle = 0;
    let coffeeColor = '#4a2c10';
    let bodyRotation = 0;

    switch (animState) {
      case 'idle':
        // gentle liquid slosh, normal steam
        break;
      case 'dragging':
        liquidSlosh = Math.sin(t * 0.015) * 3;
        mugShake = Math.sin(t * 0.02) * 1.5;
        steamIntensity = 1.5;
        break;
      case 'wobble':
        bodyRotation = Math.sin(t * 0.015) * 0.12;
        liquidSlosh = Math.sin(t * 0.012) * 2;
        break;
      case 'chasing':
        tiltForward = -0.2;
        liquidSlosh = Math.sin(t * 0.02) * 3;
        steamIntensity = 2.0;
        steamSpeed = 0.006;
        break;
      case 'petting':
        blushAlpha = 0.25 + Math.sin(t * 0.004) * 0.1;
        heartSteam = true;
        steamIntensity = 0.8;
        break;
      case 'typing_along':
        mugShake = Math.sin(t * 0.04) * 0.8;
        liquidSlosh = Math.sin(t * 0.03) * 1.5;
        steamIntensity = 1.5;
        steamSpeed = 0.005;
        break;
      case 'overheat':
        overheatTint = 0.4 + Math.sin(t * 0.005) * 0.15;
        bubbleCount = 8;
        steamIntensity = 3.0;
        steamSpeed = 0.008;
        coffeeColor = '#5c3518';
        break;
      case 'thinking':
        steamIntensity = 0.6;
        liquidSlosh = Math.sin(t * 0.002) * 0.3;
        break;
      case 'victory':
        victoryJump = Math.abs(Math.sin(t * 0.008)) * 5;
        steamIntensity = 2.5;
        steamSpeed = 0.007;
        liquidSlosh = Math.sin(t * 0.015) * 2;
        break;
      case 'stretching':
        mugShake = Math.sin(t * 0.005) * 0.5;
        steamIntensity = 1.2;
        break;
      case 'paper_unroll':
        mugShake = Math.sin(t * 0.008) * 0.5;
        break;
      case 'sleeping':
        steamIntensity = 0;
        coffeeColor = '#3a2008';
        liquidSlosh = 0;
        break;
      case 'waving':
        waveNubAngle = Math.sin(t * 0.012) * 0.6;
        steamIntensity = 1.0;
        break;
    }

    // Apply transforms
    if (bodyRotation !== 0) {
      ctx.rotate(bodyRotation);
    }
    if (tiltForward !== 0) {
      ctx.rotate(tiltForward);
    }
    if (victoryJump > 0) {
      ctx.translate(0, -victoryJump);
    }
    if (mugShake !== 0) {
      ctx.translate(mugShake, 0);
    }

    // ====== COFFEE STAIN RING (subtle, beneath mug) ======
    ctx.fillStyle = 'rgba(180, 140, 90, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 10, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 120, 70, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 20, 11, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ====== MUG BODY ======
    // The mug has a slight taper (wider at top than bottom)
    const mugTop = -14;
    const mugBottom = 18;
    const mugWidthTop = 13;
    const mugWidthBottom = 10;

    // Mug shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.moveTo(-mugWidthTop - 1, mugTop + 2);
    ctx.lineTo(-mugWidthBottom - 1, mugBottom + 1);
    ctx.lineTo(mugWidthBottom + 1, mugBottom + 1);
    ctx.lineTo(mugWidthTop + 1, mugTop + 2);
    ctx.closePath();
    ctx.fill();

    // Main mug body
    let mugColor = '#FFFFFF';
    if (overheatTint > 0) {
      mugColor = blendColor('#FFFFFF', '#ff4444', overheatTint);
    }

    const mugGrad = ctx.createLinearGradient(-mugWidthTop, 0, mugWidthTop, 0);
    mugGrad.addColorStop(0, blendColor(mugColor, '#e8e8e8', 0.15));
    mugGrad.addColorStop(0.3, mugColor);
    mugGrad.addColorStop(0.7, mugColor);
    mugGrad.addColorStop(1, blendColor(mugColor, '#cccccc', 0.2));

    ctx.fillStyle = mugGrad;
    ctx.beginPath();
    ctx.moveTo(-mugWidthTop, mugTop);
    ctx.lineTo(-mugWidthBottom, mugBottom);
    ctx.quadraticCurveTo(0, mugBottom + 3, mugWidthBottom, mugBottom);
    ctx.lineTo(mugWidthTop, mugTop);
    ctx.closePath();
    ctx.fill();

    // Mug outline
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-mugWidthTop, mugTop);
    ctx.lineTo(-mugWidthBottom, mugBottom);
    ctx.quadraticCurveTo(0, mugBottom + 3, mugWidthBottom, mugBottom);
    ctx.lineTo(mugWidthTop, mugTop);
    ctx.stroke();

    // Subtle side shadow on the right
    const sideShadow = ctx.createLinearGradient(mugWidthTop - 4, 0, mugWidthTop, 0);
    sideShadow.addColorStop(0, 'rgba(0,0,0,0)');
    sideShadow.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = sideShadow;
    ctx.beginPath();
    ctx.moveTo(mugWidthTop - 4, mugTop);
    ctx.lineTo(mugWidthBottom - 3, mugBottom);
    ctx.lineTo(mugWidthBottom, mugBottom);
    ctx.lineTo(mugWidthTop, mugTop);
    ctx.closePath();
    ctx.fill();

    // ====== MUG RIM ======
    // Elliptical top rim
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.ellipse(0, mugTop, mugWidthTop, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Inner rim shadow
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    ctx.ellipse(0, mugTop, mugWidthTop - 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // ====== COFFEE LIQUID ======
    const liquidLevel = mugTop + 1 + liquidSlosh * 0.3;
    const liquidGrad = ctx.createLinearGradient(0, liquidLevel, 0, liquidLevel + 5);
    liquidGrad.addColorStop(0, coffeeColor);
    liquidGrad.addColorStop(0.5, blendColor(coffeeColor, '#2a1805', 0.3));
    liquidGrad.addColorStop(1, '#2a1805');

    ctx.fillStyle = liquidGrad;
    ctx.beginPath();
    ctx.ellipse(0, liquidLevel, mugWidthTop - 2, 2.5 + liquidSlosh * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Liquid highlight (reflection)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.ellipse(-3, liquidLevel - 0.5, 4, 1, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // ====== BUBBLES (overheat / victory) ======
    if (bubbleCount > 0) {
      for (let i = 0; i < bubbleCount; i++) {
        const bx = Math.sin(t * 0.005 + i * 1.3) * (mugWidthTop - 4);
        const by = liquidLevel - 1 + Math.sin(t * 0.008 + i * 0.9) * 1.5;
        const br = 0.8 + Math.sin(t * 0.01 + i) * 0.4;
        ctx.strokeStyle = 'rgba(100, 60, 20, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.stroke();
        // Bubble highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Victory splash particles
    if (animState === 'victory') {
      const splashCount = 5;
      for (let i = 0; i < splashCount; i++) {
        const phase = (t * 0.006 + i * 1.2) % (Math.PI * 2);
        const sx = Math.sin(phase + i) * (6 + i * 2);
        const sy = liquidLevel - 3 - Math.abs(Math.sin(phase)) * (4 + i);
        const sAlpha = Math.max(0, 0.6 - Math.abs(Math.sin(phase)) * 0.8);
        if (sAlpha > 0.05) {
          ctx.fillStyle = `rgba(74, 44, 16, ${sAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ====== HANDLE (right side) ======
    ctx.save();
    const handleX = mugWidthTop - 1;
    const handleY = mugTop + 8;

    // Handle shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(handleX, handleY + 1);
    ctx.quadraticCurveTo(handleX + 9, handleY + 1, handleX + 9, handleY + 9);
    ctx.quadraticCurveTo(handleX + 9, handleY + 17, handleX, handleY + 16);
    ctx.stroke();

    // Handle body
    const handleGrad = ctx.createLinearGradient(handleX, handleY, handleX + 9, handleY);
    handleGrad.addColorStop(0, mugColor);
    handleGrad.addColorStop(0.5, blendColor(mugColor, '#e0e0e0', 0.1));
    handleGrad.addColorStop(1, blendColor(mugColor, '#cccccc', 0.2));

    ctx.strokeStyle = handleGrad;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handleX, handleY);
    ctx.quadraticCurveTo(handleX + 8, handleY, handleX + 8, handleY + 8);
    ctx.quadraticCurveTo(handleX + 8, handleY + 16, handleX, handleY + 15);
    ctx.stroke();

    // Handle outline
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(handleX, handleY);
    ctx.quadraticCurveTo(handleX + 9.5, handleY - 0.5, handleX + 9.5, handleY + 8);
    ctx.quadraticCurveTo(handleX + 9.5, handleY + 16.5, handleX, handleY + 15.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(handleX, handleY + 1);
    ctx.quadraticCurveTo(handleX + 6, handleY + 1, handleX + 6, handleY + 8);
    ctx.quadraticCurveTo(handleX + 6, handleY + 14.5, handleX, handleY + 14);
    ctx.stroke();

    ctx.restore();

    // ====== WAVING NUB (left side, only during waving) ======
    if (animState === 'waving') {
      ctx.save();
      const nubX = -mugWidthTop + 1;
      const nubY = mugTop + 12;
      ctx.translate(nubX, nubY);
      ctx.rotate(waveNubAngle - 0.3);

      // Small arm/nub
      ctx.fillStyle = mugColor;
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -1.5);
      ctx.quadraticCurveTo(-5, -2, -7, -1);
      ctx.quadraticCurveTo(-8, 0, -7, 1);
      ctx.quadraticCurveTo(-5, 2, 0, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tiny hand at the end
      ctx.fillStyle = blendColor(mugColor, '#f5e6d3', 0.3);
      ctx.beginPath();
      ctx.arc(-7.5, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.stroke();

      ctx.restore();
    }

    // ====== EYES (on mug body) ======
    // Blush (petting)
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(255, 130, 130, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-7, 2, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, 2, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: -2,
      eyeSpacing: 5,
      eyeRadius: 4.5,
      pupilRadius: 2,
      irisColor: '#6b3a1a',
      outlineColor: '#3a2a1a',
    });

    // ====== SMALL MOUTH ======
    if (animState !== 'sleeping') {
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';

      if (eyeMode === 'happy') {
        // Happy smile
        ctx.beginPath();
        ctx.arc(0, 5, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (eyeMode === 'surprised') {
        // O mouth
        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.ellipse(0, 5, 2, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (eyeMode === 'dead') {
        // Wavy overheat mouth
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.quadraticCurveTo(-1.5, 5, 0, 6);
        ctx.quadraticCurveTo(1.5, 7, 3, 6);
        ctx.stroke();
      } else {
        // Slight default smile
        ctx.beginPath();
        ctx.arc(0, 4, 2.5, 0.3, Math.PI - 0.3);
        ctx.stroke();
      }
    }

    // ====== STEAM ======
    if (steamIntensity > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (heartSteam) {
        // Heart-shaped steam for petting
        const heartPhase = (t * 0.002) % 1;
        const heartY = mugTop - 5 - heartPhase * 12;
        const heartAlpha = Math.max(0, 0.5 - heartPhase * 0.6);

        if (heartAlpha > 0) {
          ctx.strokeStyle = `rgba(200, 200, 210, ${heartAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Simple heart shape
          ctx.moveTo(0, heartY + 2);
          ctx.bezierCurveTo(-3, heartY - 1, -5, heartY + 1, -3, heartY + 4);
          ctx.lineTo(0, heartY + 6);
          ctx.moveTo(0, heartY + 2);
          ctx.bezierCurveTo(3, heartY - 1, 5, heartY + 1, 3, heartY + 4);
          ctx.lineTo(0, heartY + 6);
          ctx.stroke();
        }
      }

      // Regular steam wisps (2-3 curved lines)
      const steamCount = steamIntensity > 2 ? 4 : 3;
      for (let i = 0; i < steamCount; i++) {
        const baseX = (i - (steamCount - 1) / 2) * 5;
        const phase = (t * steamSpeed + i * 0.8) % (Math.PI * 2);
        const rise = (t * steamSpeed * 0.5 + i * 0.4) % 1;
        const yStart = mugTop - 3;
        const yEnd = yStart - 8 - rise * 6;
        const alpha = Math.max(0, (0.4 * steamIntensity) * (1 - rise));

        if (alpha > 0.02) {
          ctx.strokeStyle = `rgba(200, 200, 210, ${Math.min(alpha, 0.6)})`;
          ctx.lineWidth = 0.8 + (1 - rise) * 0.5;
          ctx.beginPath();
          ctx.moveTo(baseX, yStart);
          ctx.quadraticCurveTo(
            baseX + Math.sin(phase) * 3 * steamIntensity,
            (yStart + yEnd) / 2,
            baseX + Math.sin(phase + 1) * 2,
            yEnd
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // ====== SLEEPING Z's ======
    if (animState === 'sleeping') {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 100, 120, 0.5)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', 10, mugTop - 4 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', 13, mugTop - 9 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', 15, mugTop - 13 + zOffset * 0.5);
    }

    // ====== CHASING SPLASH ======
    if (animState === 'chasing') {
      const splashCount = 4;
      for (let i = 0; i < splashCount; i++) {
        const phase = (t * 0.008 + i * 1.5) % (Math.PI * 2);
        const sx = 5 + Math.sin(phase) * 3;
        const sy = liquidLevel - 2 - Math.abs(Math.sin(phase * 0.7)) * 3;
        const sAlpha = 0.4 * Math.abs(Math.sin(phase));
        if (sAlpha > 0.05) {
          ctx.fillStyle = `rgba(74, 44, 16, ${sAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ====== OVERHEAT HEAT WAVES ======
    if (overheatTint > 0) {
      ctx.strokeStyle = 'rgba(255, 80, 30, 0.15)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 4; i++) {
        const wavePhase = (t * 0.004 + i * 0.8) % (Math.PI * 2);
        const dist = mugWidthTop + 2 + Math.sin(wavePhase) * 1.5;
        const waveY = mugTop + 5 + i * 7;
        ctx.beginPath();
        ctx.moveTo(-dist, waveY);
        ctx.quadraticCurveTo(-dist - 2, waveY - 2 + Math.sin(wavePhase) * 2, -dist - 1, waveY - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dist, waveY);
        ctx.quadraticCurveTo(dist + 2, waveY - 2 + Math.sin(wavePhase) * 2, dist + 1, waveY - 4);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
