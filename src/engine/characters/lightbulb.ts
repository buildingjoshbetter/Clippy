import { CharacterStyle, DrawState, EyeMode } from './index';
import { drawStandardEyes, blendColor, getEyeMode } from './utils';

export const lightbulb: CharacterStyle = {
  id: 'lightbulb',
  name: 'Lightbulb',
  description: 'A glowing lightbulb with a visible filament and Edison screw base. Energetic, bright, and full of ideas.',
  colors: { primary: '#FFFACD', secondary: '#FF8C00', accent: '#808080' },
  personality: {
    speechStyle: 'energetic',
    catchphrase: 'I just had an IDEA!',
  },
  eyeStyle: 'round',
  nativeSize: 48,
  speechOverrides: {
    greeting: [
      'Bright ideas start NOW!',
      'I just had an IDEA!',
      "Let's light up this code!",
    ],
    typing_along: [
      'Every keystroke is enlightening. Get it?',
      '*glows brighter* Ooh that\'s a good line of code.',
      'The filament of inspiration is ON.',
      'Watt a beautiful function you\'re writing!',
    ],
    idle: [
      'Watt are you waiting for?',
      "I'm not just a lightbulb. I'm an LED. Way more efficient.",
      'Just hanging here, radiating brilliance.',
    ],
    overheat: [
      "I'M GONNA BLOW! Turn me off! TURN ME OFF!",
      '*flickers violently* This is NOT sustainable wattage!',
      'THERMAL RUNAWAY! Who set the dimmer to MAX?!',
    ],
    victory: [
      'EUREKA! I mean... nice commit.',
      '*BLINDING FLASH* That was BRILLIANT!',
      'Edison would be proud. Tesla too.',
    ],
    petting: [
      'Mmm... warm and cozy...',
      '*dims to a comfortable glow*',
      "Careful, I'm still warm to the touch.",
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
    let glowIntensity = 0.5;
    let glowPulseSpeed = 0.003;
    let filamentFlicker = 1.0;
    let blushAlpha = 0;
    let victoryFlash = 0;
    let swingAngle = 0;
    let bodyWave = 0;
    let dimLevel = 1.0;
    let smokeWisps = false;
    let flickerRapid = false;
    let brightenPulse = 0;
    let particleChance = 0;

    switch (animState) {
      case 'idle':
        // Gentle glow pulse
        glowIntensity = 0.4 + Math.sin(t * glowPulseSpeed) * 0.15;
        filamentFlicker = 0.9 + Math.sin(t * 0.017) * 0.1;
        break;
      case 'dragging':
        swingAngle = Math.sin(t * 0.012) * 0.15;
        glowIntensity = 0.3;
        break;
      case 'wobble':
        bodyWave = Math.sin(t * 0.015) * 0.12;
        glowIntensity = 0.5 + Math.sin(t * 0.008) * 0.1;
        break;
      case 'chasing':
        // Swings on cord/pendulum arc motion
        swingAngle = Math.sin(t * 0.01) * 0.25;
        glowIntensity = 0.6;
        break;
      case 'petting':
        // Warms and dims slightly (comfortable)
        blushAlpha = 0.2 + Math.sin(t * 0.004) * 0.08;
        glowIntensity = 0.35;
        dimLevel = 0.85;
        break;
      case 'typing_along':
        // Brightens with each keystroke
        brightenPulse = Math.abs(Math.sin(t * 0.025)) * 0.4;
        glowIntensity = 0.5 + brightenPulse;
        particleChance = 0.6;
        break;
      case 'overheat':
        // Flickers rapidly, about to blow
        flickerRapid = true;
        smokeWisps = true;
        filamentFlicker = Math.random() > 0.3 ? 1.0 : 0.2;
        glowIntensity = 0.3 + Math.random() * 0.6;
        break;
      case 'thinking':
        glowIntensity = 0.55 + Math.sin(t * 0.005) * 0.1;
        filamentFlicker = 0.95;
        break;
      case 'victory':
        // BRIGHT FLASH then steady
        const victoryPhase = (t % 3000) / 3000;
        if (victoryPhase < 0.15) {
          victoryFlash = 1.0 - (victoryPhase / 0.15);
        }
        glowIntensity = 0.8;
        dimLevel = 1.2;
        break;
      case 'stretching':
        bodyWave = Math.sin(t * 0.006) * 0.08;
        glowIntensity = 0.45;
        break;
      case 'paper_unroll':
        glowIntensity = 0.5;
        break;
      case 'sleeping':
        // Dims to very low glow (night light mode)
        dimLevel = 0.2;
        glowIntensity = 0.08 + Math.sin(t * 0.001) * 0.03;
        filamentFlicker = 0.15;
        break;
      case 'waving':
        // Whole bulb rocks side to side
        bodyWave = Math.sin(t * 0.012) * 0.2;
        glowIntensity = 0.5;
        break;
    }

    // Apply transforms
    if (bodyWave !== 0) {
      ctx.rotate(bodyWave);
    }
    if (swingAngle !== 0) {
      ctx.rotate(swingAngle);
    }

    // ====== OUTER GLOW (radial, emanating from bulb) ======
    const glowAlpha = glowIntensity * dimLevel * 0.35;
    const outerGlow = ctx.createRadialGradient(0, -8, 4, 0, -8, 24);
    outerGlow.addColorStop(0, `rgba(255, 250, 205, ${glowAlpha})`);
    outerGlow.addColorStop(0.4, `rgba(255, 240, 180, ${glowAlpha * 0.5})`);
    outerGlow.addColorStop(0.7, `rgba(255, 220, 130, ${glowAlpha * 0.2})`);
    outerGlow.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, -8, 24, 0, Math.PI * 2);
    ctx.fill();

    // ====== VICTORY FLASH (white-out overlay) ======
    if (victoryFlash > 0) {
      const flashGrad = ctx.createRadialGradient(0, -8, 0, 0, -8, 22);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${victoryFlash})`);
      flashGrad.addColorStop(0.5, `rgba(255, 255, 240, ${victoryFlash * 0.7})`);
      flashGrad.addColorStop(1, `rgba(255, 250, 205, ${victoryFlash * 0.3})`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(0, -8, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // ====== GLASS BULB (rounded top) ======
    // The bulb shape: rounded top, tapering to neck
    const bulbCenterY = -10;
    const bulbRadius = 12;
    const neckY = 4;
    const neckWidth = 6;

    // Bulb glass fill with gradient (inner glow)
    const bulbGlowAlpha = Math.min(1, glowIntensity * dimLevel + 0.3);
    const bulbGrad = ctx.createRadialGradient(0, bulbCenterY, 1, 0, bulbCenterY, bulbRadius);
    bulbGrad.addColorStop(0, `rgba(255, 255, 240, ${bulbGlowAlpha})`);
    bulbGrad.addColorStop(0.4, `rgba(255, 250, 205, ${bulbGlowAlpha * 0.9})`);
    bulbGrad.addColorStop(0.7, `rgba(255, 245, 180, ${bulbGlowAlpha * 0.7})`);
    bulbGrad.addColorStop(1, `rgba(255, 240, 160, ${bulbGlowAlpha * 0.5})`);

    // Draw bulb shape using bezier curves
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.moveTo(-neckWidth, neckY);
    ctx.bezierCurveTo(-neckWidth - 2, neckY - 4, -bulbRadius, bulbCenterY + 4, -bulbRadius, bulbCenterY);
    ctx.bezierCurveTo(-bulbRadius, bulbCenterY - 8, -8, bulbCenterY - 13, 0, bulbCenterY - 13);
    ctx.bezierCurveTo(8, bulbCenterY - 13, bulbRadius, bulbCenterY - 8, bulbRadius, bulbCenterY);
    ctx.bezierCurveTo(bulbRadius, bulbCenterY + 4, neckWidth + 2, neckY - 4, neckWidth, neckY);
    ctx.closePath();
    ctx.fill();

    // Bulb outline
    ctx.strokeStyle = 'rgba(200, 180, 100, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-neckWidth, neckY);
    ctx.bezierCurveTo(-neckWidth - 2, neckY - 4, -bulbRadius, bulbCenterY + 4, -bulbRadius, bulbCenterY);
    ctx.bezierCurveTo(-bulbRadius, bulbCenterY - 8, -8, bulbCenterY - 13, 0, bulbCenterY - 13);
    ctx.bezierCurveTo(8, bulbCenterY - 13, bulbRadius, bulbCenterY - 8, bulbRadius, bulbCenterY);
    ctx.bezierCurveTo(bulbRadius, bulbCenterY + 4, neckWidth + 2, neckY - 4, neckWidth, neckY);
    ctx.stroke();

    // ====== FILAMENT (thin curved line, glowing orange) ======
    const filAlpha = filamentFlicker * dimLevel;
    ctx.strokeStyle = `rgba(255, 140, 0, ${filAlpha})`;
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Support posts from base
    ctx.moveTo(-2, neckY - 2);
    ctx.lineTo(-2, bulbCenterY + 2);
    ctx.moveTo(2, neckY - 2);
    ctx.lineTo(2, bulbCenterY + 2);
    ctx.stroke();

    // Coiled filament between supports
    ctx.strokeStyle = `rgba(255, 140, 0, ${filAlpha * 0.9})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2, bulbCenterY + 2);
    ctx.bezierCurveTo(-3, bulbCenterY - 1, -1, bulbCenterY - 3, 0, bulbCenterY - 2);
    ctx.bezierCurveTo(1, bulbCenterY - 1, 3, bulbCenterY - 3, 2, bulbCenterY + 2);
    ctx.stroke();

    // Filament glow halo
    if (dimLevel > 0.3) {
      ctx.shadowColor = `rgba(255, 140, 0, ${filAlpha * 0.4})`;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = `rgba(255, 180, 60, ${filAlpha * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-2, bulbCenterY + 2);
      ctx.bezierCurveTo(-3, bulbCenterY - 1, -1, bulbCenterY - 3, 0, bulbCenterY - 2);
      ctx.bezierCurveTo(1, bulbCenterY - 1, 3, bulbCenterY - 3, 2, bulbCenterY + 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    // ====== GLASS REFLECTION ARC (upper left highlight) ======
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * dimLevel})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-5, bulbCenterY - 5, 6, -Math.PI * 0.8, -Math.PI * 0.3);
    ctx.stroke();

    // Smaller secondary reflection
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * dimLevel})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(-3, bulbCenterY - 2, 3, -Math.PI * 0.7, -Math.PI * 0.2);
    ctx.stroke();

    // ====== NECK (taper from bulb to base) ======
    const neckGrad = ctx.createLinearGradient(0, neckY, 0, neckY + 5);
    neckGrad.addColorStop(0, 'rgba(255, 250, 220, 0.6)');
    neckGrad.addColorStop(1, 'rgba(180, 180, 180, 0.7)');
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(-neckWidth, neckY);
    ctx.lineTo(-5, neckY + 5);
    ctx.lineTo(5, neckY + 5);
    ctx.lineTo(neckWidth, neckY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 140, 100, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ====== EDISON SCREW BASE ======
    const baseTop = neckY + 5;
    const baseBottom = 20;
    const baseWidth = 5;

    // Main base body (metallic gray)
    const baseGrad = ctx.createLinearGradient(-baseWidth, baseTop, baseWidth, baseTop);
    baseGrad.addColorStop(0, '#6a6a6a');
    baseGrad.addColorStop(0.3, '#a0a0a0');
    baseGrad.addColorStop(0.5, '#b0b0b0');
    baseGrad.addColorStop(0.7, '#909090');
    baseGrad.addColorStop(1, '#606060');

    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.moveTo(-baseWidth, baseTop);
    ctx.lineTo(-baseWidth + 0.5, baseBottom - 2);
    ctx.quadraticCurveTo(0, baseBottom + 1, baseWidth - 0.5, baseBottom - 2);
    ctx.lineTo(baseWidth, baseTop);
    ctx.closePath();
    ctx.fill();

    // Base outline
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Thread detail lines (horizontal ridges on the screw base)
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.35)';
    ctx.lineWidth = 0.6;
    const threadCount = 5;
    for (let i = 0; i < threadCount; i++) {
      const ty = baseTop + 2 + i * ((baseBottom - baseTop - 4) / threadCount);
      const tw = baseWidth - 0.5 - (i * 0.1);
      ctx.beginPath();
      ctx.moveTo(-tw, ty);
      ctx.lineTo(tw, ty);
      ctx.stroke();
      // Highlight below each thread
      ctx.strokeStyle = 'rgba(180, 180, 180, 0.2)';
      ctx.beginPath();
      ctx.moveTo(-tw + 0.5, ty + 0.8);
      ctx.lineTo(tw - 0.5, ty + 0.8);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.35)';
    }

    // Contact point at bottom
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(0, baseBottom - 1, 2, 0, Math.PI * 2);
    ctx.fill();

    // ====== EYES ======
    // Position eyes in the upper-middle of the glass bulb
    // Using darker outlines so they're visible against the glow
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(255, 160, 100, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-7, bulbCenterY + 3, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, bulbCenterY + 3, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStandardEyes(ctx, state, eyeMode, {
      eyeY: bulbCenterY + 1,
      eyeSpacing: 5,
      eyeRadius: 4,
      pupilRadius: 2,
      outlineColor: '#2a2a30',
      irisColor: '#1a1a20',
    });

    // ====== SMALL MOUTH ======
    if (animState !== 'sleeping') {
      ctx.strokeStyle = '#4a3a20';
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';

      const mouthY = bulbCenterY + 7;

      if (eyeMode === 'happy') {
        ctx.beginPath();
        ctx.arc(0, mouthY, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (eyeMode === 'surprised') {
        ctx.fillStyle = '#4a3a20';
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 1.8, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (eyeMode === 'dead') {
        // Wavy distressed mouth
        ctx.beginPath();
        ctx.moveTo(-3, mouthY);
        ctx.quadraticCurveTo(-1.5, mouthY - 1, 0, mouthY);
        ctx.quadraticCurveTo(1.5, mouthY + 1, 3, mouthY);
        ctx.stroke();
      } else {
        // Small content smile
        ctx.beginPath();
        ctx.arc(0, mouthY - 0.5, 2, 0.3, Math.PI - 0.3);
        ctx.stroke();
      }
    }

    // ====== TYPING PARTICLES (! and ? sparkles) ======
    if (particleChance > 0 && animState === 'typing_along') {
      ctx.font = '4px sans-serif';
      const symbols = ['!', '?', '*', '!'];
      for (let i = 0; i < 3; i++) {
        const phase = (t * 0.004 + i * 2.1) % (Math.PI * 2);
        const px = Math.sin(phase + i) * (bulbRadius + 3);
        const py = bulbCenterY - 4 - Math.abs(Math.sin(phase)) * 8;
        const pAlpha = Math.max(0, 0.7 - Math.abs(Math.sin(phase)) * 1.0);
        if (pAlpha > 0.05) {
          ctx.fillStyle = `rgba(255, 180, 0, ${pAlpha})`;
          ctx.fillText(symbols[i % symbols.length], px, py);
        }
      }
    }

    // ====== SMOKE WISPS (overheat) ======
    if (smokeWisps) {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 0.7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sPhase = (t * 0.005 + i * 1.2) % 1;
        const sx = (i - 1) * 3;
        const sStartY = baseBottom;
        const sEndY = sStartY + 4 + sPhase * 6;
        const sAlpha = Math.max(0, 0.3 * (1 - sPhase));
        if (sAlpha > 0.02) {
          ctx.strokeStyle = `rgba(100, 100, 100, ${sAlpha})`;
          ctx.beginPath();
          ctx.moveTo(sx, sStartY);
          ctx.quadraticCurveTo(
            sx + Math.sin(t * 0.003 + i) * 3,
            (sStartY + sEndY) / 2,
            sx + Math.sin(t * 0.004 + i) * 2,
            sEndY
          );
          ctx.stroke();
        }
      }

      // Rapid flicker overlay (red tint flashes)
      if (flickerRapid && Math.random() > 0.5) {
        ctx.fillStyle = 'rgba(255, 60, 20, 0.08)';
        ctx.beginPath();
        ctx.moveTo(-neckWidth, neckY);
        ctx.bezierCurveTo(-neckWidth - 2, neckY - 4, -bulbRadius, bulbCenterY + 4, -bulbRadius, bulbCenterY);
        ctx.bezierCurveTo(-bulbRadius, bulbCenterY - 8, -8, bulbCenterY - 13, 0, bulbCenterY - 13);
        ctx.bezierCurveTo(8, bulbCenterY - 13, bulbRadius, bulbCenterY - 8, bulbRadius, bulbCenterY);
        ctx.bezierCurveTo(bulbRadius, bulbCenterY + 4, neckWidth + 2, neckY - 4, neckWidth, neckY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // ====== SLEEPING Z's ======
    if (animState === 'sleeping') {
      const zOffset = Math.sin(t * 0.002) * 2;
      ctx.fillStyle = 'rgba(100, 100, 120, 0.5)';
      ctx.font = '5px sans-serif';
      ctx.fillText('z', bulbRadius + 2, bulbCenterY - 6 + zOffset);
      ctx.font = '4px sans-serif';
      ctx.fillText('z', bulbRadius + 5, bulbCenterY - 11 + zOffset * 0.7);
      ctx.font = '3px sans-serif';
      ctx.fillText('z', bulbRadius + 7, bulbCenterY - 15 + zOffset * 0.5);
    }

    // ====== CHASING CORD HINT (short line above bulb implying pendulum) ======
    if (animState === 'chasing') {
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, bulbCenterY - 13);
      ctx.lineTo(Math.sin(swingAngle) * 3, bulbCenterY - 20);
      ctx.stroke();
    }

    ctx.restore();
  },
};
