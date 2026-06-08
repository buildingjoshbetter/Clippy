import { useRef, useEffect } from 'react';
import { useClippyStore } from '../store';
import { drawClippy } from '../engine/ClippyRenderer';

export function ClippyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { characterX, characterY, eyeOffsetX, eyeOffsetY, bodyTilt, bodySquash, bodyStretch, animState, scale } = useClippyStore();

  const NATIVE_SIZE = 48;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    let animFrame: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create offscreen canvas for pixel art
      const offscreen = new OffscreenCanvas(NATIVE_SIZE, NATIVE_SIZE);
      const offCtx = offscreen.getContext('2d')!;
      offCtx.clearRect(0, 0, NATIVE_SIZE, NATIVE_SIZE);

      drawClippy(offCtx, {
        eyeOffsetX,
        eyeOffsetY,
        bodyTilt,
        bodySquash,
        bodyStretch,
        animState,
        time,
      });

      // Scale up with nearest-neighbor
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        offscreen,
        characterX, characterY,
        NATIVE_SIZE * scale,
        NATIVE_SIZE * scale
      );

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [characterX, characterY, eyeOffsetX, eyeOffsetY, bodyTilt, bodySquash, bodyStretch, animState, scale]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
    />
  );
}
