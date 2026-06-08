export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function springDamp(current: number, target: number, velocity: number, stiffness: number, damping: number): [number, number] {
  const force = (target - current) * stiffness;
  const newVel = (velocity + force) * damping;
  return [current + newVel, newVel];
}
