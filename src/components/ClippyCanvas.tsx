import { useRef, useEffect } from 'react';
import { useClippyStore } from '../store';
import { drawClippy } from '../engine/ClippyRenderer';
import { ParticleSystem } from '../engine/ParticleSystem';

export function ClippyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const {
    characterX,
    characterY,
    eyeOffsetX,
    eyeOffsetY,
    bodyTilt,
    bodySquash,
    bodyStretch,
    animState,
    scale,
    characterVariant,
  } = useClippyStore();

  const NATIVE_SIZE = 48;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    const particles = particleSystemRef.current;
    let animFrame: number;
    let lastTime = 0;

    const MIN_FRAME_DT = 33; // ~30fps cap

    const render = (time: number) => {
      const dt = time - lastTime;

      // Frame-limit to 30fps — skip if too soon
      if (dt < MIN_FRAME_DT) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw character directly at full resolution for smooth vector look
      ctx.imageSmoothingEnabled = true;
      const drawSize = NATIVE_SIZE * scale;
      ctx.save();
      ctx.translate(characterX, characterY);
      ctx.scale(scale, scale);
      drawClippy(ctx, {
        eyeOffsetX,
        eyeOffsetY,
        bodyTilt,
        bodySquash,
        bodyStretch,
        animState,
        time,
      }, characterVariant);
      ctx.restore();

      // Particle system — emit, update, draw in world space
      const centerX = characterX + drawSize / 2;
      const centerY = characterY + drawSize / 2;
      particles.emitForState(animState, centerX, centerY, time);
      particles.update(dt);
      particles.draw(ctx);

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [characterX, characterY, eyeOffsetX, eyeOffsetY, bodyTilt, bodySquash, bodyStretch, animState, scale, characterVariant]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
    />
  );
}
