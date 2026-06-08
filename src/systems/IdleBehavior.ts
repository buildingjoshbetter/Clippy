import { getRandomLine } from '../config/speechLines';

export interface IdleAction {
  type: 'speech' | 'look' | 'yawn' | 'tap' | 'sleep';
  speech?: string;
}

let lastIdleAction = 0;
let idleTier = 0; // tracks which idle tier we've reached

export function getIdleAction(idleDurationMs: number, userName: string, overrides?: Partial<Record<string, string[]>>): IdleAction | null {
  const now = Date.now();

  // Tier 0: 2 min — occasional look around
  if (idleDurationMs > 120000 && idleTier < 1) {
    idleTier = 1;
    lastIdleAction = now;
    return { type: 'look' };
  }

  // Tier 1: 4 min — speech
  if (idleDurationMs > 240000 && idleTier < 2) {
    idleTier = 2;
    lastIdleAction = now;
    return { type: 'speech', speech: getRandomLine('idle', userName, overrides) };
  }

  // Tier 2: 5 min — fall asleep
  if (idleDurationMs > 300000 && idleTier < 3) {
    idleTier = 3;
    lastIdleAction = now;
    return { type: 'sleep' };
  }

  // Random periodic speech during idle (every 5-8 minutes)
  if (idleDurationMs > 120000 && idleTier >= 1 && idleTier < 3 && now - lastIdleAction > 300000 + Math.random() * 180000) {
    lastIdleAction = now;
    return { type: 'speech', speech: getRandomLine('idle', userName, overrides) };
  }

  return null;
}

export function resetIdleTier() {
  idleTier = 0;
  lastIdleAction = 0;
}
