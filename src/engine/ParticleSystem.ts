export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
  char?: string;
  rotation?: number;
  rotationSpeed?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitTimers: Record<string, number> = {};

  emit(p: Particle) {
    this.particles.push(p);
  }

  emitBurst(count: number, factory: () => Particle) {
    for (let i = 0; i < count; i++) {
      this.particles.push(factory());
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life));
      ctx.globalAlpha = alpha;

      if (p.char) {
        ctx.save();
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillStyle = p.color;
        if (p.rotation) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillText(p.char, 0, 0);
        } else {
          ctx.fillText(p.char, p.x, p.y);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Called each frame with current animState and character center position.
   * Handles automatic emission based on state.
   */
  emitForState(animState: string, cx: number, cy: number, time: number) {
    const now = time;

    switch (animState) {
      case 'overheat': {
        // Steam particles — white/gray dots rising
        const lastSteam = this.emitTimers['steam'] || 0;
        if (now - lastSteam > 120) {
          this.emit({
            x: cx + (Math.random() - 0.5) * 12,
            y: cy - 14,
            vx: (Math.random() - 0.5) * 0.01,
            vy: -0.04 - Math.random() * 0.02,
            life: 1,
            decay: 0.0015,
            color: Math.random() > 0.5 ? '#ffffff' : '#cccccc',
            size: 2 + Math.random() * 1.5,
          });
          this.emitTimers['steam'] = now;
        }
        break;
      }

      case 'petting': {
        // Heart particles
        const lastHeart = this.emitTimers['heart'] || 0;
        if (now - lastHeart > 400) {
          this.emit({
            x: cx + (Math.random() - 0.5) * 10,
            y: cy - 10,
            vx: (Math.random() - 0.5) * 0.015,
            vy: -0.03 - Math.random() * 0.01,
            life: 1,
            decay: 0.001,
            color: '#ff6b8a',
            size: 6,
            char: '♥',
          });
          this.emitTimers['heart'] = now;
        }
        break;
      }

      case 'victory': {
        // Sparkle particles — yellow stars bursting
        const lastSparkle = this.emitTimers['sparkle'] || 0;
        if (now - lastSparkle > 80) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.03 + Math.random() * 0.04;
          this.emit({
            x: cx + (Math.random() - 0.5) * 8,
            y: cy - 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.02,
            life: 1,
            decay: 0.002,
            color: Math.random() > 0.5 ? '#ffd700' : '#ffaa00',
            size: 5 + Math.random() * 3,
            char: '✦',
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.005,
          });
          this.emitTimers['sparkle'] = now;
        }
        break;
      }

      case 'sleeping': {
        // Z particles floating up
        const lastZ = this.emitTimers['z'] || 0;
        if (now - lastZ > 900) {
          this.emit({
            x: cx + 8,
            y: cy - 12,
            vx: 0.005 + Math.random() * 0.005,
            vy: -0.02 - Math.random() * 0.01,
            life: 1,
            decay: 0.0008,
            color: '#7799cc',
            size: 5 + Math.random() * 3,
            char: 'Z',
          });
          this.emitTimers['z'] = now;
        }
        break;
      }

      case 'thinking': {
        // Thought dots — three dots appearing above head in bubble
        const lastDot = this.emitTimers['thought'] || 0;
        if (now - lastDot > 1500) {
          for (let i = 0; i < 3; i++) {
            this.emit({
              x: cx + 6 + i * 4,
              y: cy - 18 - i * 2,
              vx: 0,
              vy: -0.005,
              life: 1,
              decay: 0.0007,
              color: '#888888',
              size: 2 - i * 0.4,
            });
          }
          this.emitTimers['thought'] = now;
        }
        break;
      }
    }
  }

  clear() {
    this.particles = [];
    this.emitTimers = {};
  }

  get count() {
    return this.particles.length;
  }
}
