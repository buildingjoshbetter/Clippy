import { useRef, useEffect } from 'react';
import { useClippyStore } from '../store';
import { getCharacter } from '../engine/characters';
import { ParticleSystem } from '../engine/ParticleSystem';

export function ClippyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    const particles = particleSystemRef.current;
    let animFrame: number;
    let lastTime = 0;

    const MIN_FRAME_DT = 33;

    const render = (time: number) => {
      const dt = time - lastTime;

      if (dt < MIN_FRAME_DT) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      const state = useClippyStore.getState();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;

      const character = getCharacter(state.characterVariant);
      const nativeSize = character.nativeSize;
      const drawSize = nativeSize * state.scale;

      ctx.save();
      ctx.translate(state.characterX, state.characterY);
      ctx.scale(state.scale, state.scale);

      const drawState = {
        eyeOffsetX: state.eyeOffsetX,
        eyeOffsetY: state.eyeOffsetY,
        bodyTilt: state.bodyTilt,
        bodySquash: state.bodySquash,
        bodyStretch: state.bodyStretch,
        animState: state.animState,
        time,
      };

      character.draw(ctx, drawState);
      ctx.restore();

      const centerX = state.characterX;
      const centerY = state.characterY;
      particles.emitForState(state.animState, centerX, centerY, time);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
    />
  );
}
