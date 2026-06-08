import { getRandomLine } from '../config/speechLines';

export interface IdleAction {
  type: 'speech' | 'look' | 'yawn' | 'tap' | 'sleep';
  speech?: string;
}

let lastIdleAction = 0;
let idleTier = 0; // tracks which idle tier we've reached

export function getIdleAction(idleDurationMs: number, userName: string): IdleAction | null {
  const now = Date.now();

  // Tier 0: 30s — occasional look around
  if (idleDurationMs > 30000 && idleTier < 1) {
    if (now - lastIdleAction > 15000) { // every 15s at most
      lastIdleAction = now;
      idleTier = 1;
      return { type: 'look' };
    }
  }

  // Tier 1: 60s — yawn + speech
  if (idleDurationMs > 60000 && idleTier < 2) {
    idleTier = 2;
    lastIdleAction = now;
    return { type: 'speech', speech: getRandomLine('idle', userName) };
  }

  // Tier 2: 180s — tap foot
  if (idleDurationMs > 180000 && idleTier < 3) {
    idleTier = 3;
    lastIdleAction = now;
    return { type: 'tap' };
  }

  // Tier 3: 300s — fall asleep
  if (idleDurationMs > 300000 && idleTier < 4) {
    idleTier = 4;
    lastIdleAction = now;
    return { type: 'sleep' };
  }

  // Random periodic speech during idle (every 2-3 minutes after initial idle)
  if (idleDurationMs > 30000 && idleTier >= 1 && idleTier < 4 && now - lastIdleAction > 120000 + Math.random() * 60000) {
    lastIdleAction = now;
    return { type: 'speech', speech: getRandomLine('idle', userName) };
  }

  return null;
}

export function resetIdleTier() {
  idleTier = 0;
  lastIdleAction = 0;
}
