export interface DrawState {
  eyeOffsetX: number;
  eyeOffsetY: number;
  bodyTilt: number;
  bodySquash: number;
  bodyStretch: number;
  animState: string;
  time: number;
}

export type EyeMode = 'normal' | 'happy' | 'dead' | 'sleeping' | 'surprised' | 'looking_up';

export interface CharacterStyle {
  id: string;
  name: string;
  description: string;
  draw: (ctx: CanvasRenderingContext2D, state: DrawState) => void;
  colors: { primary: string; secondary: string; accent: string };
  personality: {
    speechStyle: 'formal' | 'casual' | 'sarcastic' | 'energetic' | 'zen' | 'nerdy';
    catchphrase: string;
  };
  eyeStyle: 'round' | 'oval' | 'dot' | 'anime' | 'sleepy' | 'wide';
  nativeSize: number;
  speechOverrides?: Partial<Record<string, string[]>>;
}

import { clippy } from './clippy';
import { clippyGold } from './clippy-gold';
import { clippyNeon } from './clippy-neon';
import { clippyDark } from './clippy-dark';
import { parrot } from './parrot';
import { owl } from './owl';
import { cat } from './cat';
import { dog } from './dog';
import { penguin } from './penguin';
import { fox } from './fox';
import { robot } from './robot';
import { ghost } from './ghost';
import { cactus } from './cactus';
import { mushroom } from './mushroom';
import { rubberDuck } from './rubber-duck';
import { octopus } from './octopus';
import { ufo } from './ufo';
import { coffee } from './coffee';
import { lightbulb } from './lightbulb';
import { dice } from './dice';

const CHARACTERS: CharacterStyle[] = [
  clippy, clippyGold, clippyNeon, clippyDark,
  parrot, owl, cat, dog, penguin, fox,
  robot, ghost, cactus, mushroom, rubberDuck,
  octopus, ufo, coffee, lightbulb, dice,
];

const CHARACTER_MAP = new Map<string, CharacterStyle>();
for (const c of CHARACTERS) CHARACTER_MAP.set(c.id, c);

const LEGACY_MAP: Record<string, string> = {
  classic: 'clippy',
  gold: 'clippy-gold',
  dark: 'clippy-dark',
  neon: 'clippy-neon',
  rusty: 'clippy',
  rainbow: 'clippy',
};

export function getCharacter(id: string): CharacterStyle {
  const resolved = LEGACY_MAP[id] || id;
  return CHARACTER_MAP.get(resolved) || clippy;
}

export function getAllCharacters(): CharacterStyle[] {
  return CHARACTERS;
}
