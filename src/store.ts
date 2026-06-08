import { create } from 'zustand';

export type AnimState =
  | 'idle' | 'eye_follow' | 'dragging' | 'wobble'
  | 'chasing' | 'petting' | 'typing_along' | 'overheat'
  | 'thinking' | 'victory' | 'stretching' | 'paper_unroll'
  | 'waving' | 'sleeping';

export type SpeechVariant = 'tip' | 'reminder' | 'alert' | 'note';

interface SpeechBubbleState {
  text: string;
  variant: SpeechVariant;
}

interface ClippyStore {
  // Position
  characterX: number;
  characterY: number;
  setPosition: (x: number, y: number) => void;

  // Animation
  animState: AnimState;
  setAnimState: (state: AnimState) => void;

  // Eyes
  eyeOffsetX: number;
  eyeOffsetY: number;
  setEyeOffset: (x: number, y: number) => void;

  // Body
  bodyTilt: number;
  bodySquash: number;
  bodyStretch: number;
  setBodyTransform: (tilt: number, squash: number, stretch: number) => void;

  // Speech
  speechBubble: SpeechBubbleState | null;
  showSpeech: (text: string, variant?: SpeechVariant, durationMs?: number) => void;
  hideSpeech: () => void;

  // Config
  userName: string;
  characterVariant: string;
  scale: number;
}

export const useClippyStore = create<ClippyStore>((set, get) => ({
  characterX: 800,
  characterY: 600,
  setPosition: (x, y) => set({ characterX: x, characterY: y }),

  animState: 'idle',
  setAnimState: (state) => set({ animState: state }),

  eyeOffsetX: 0,
  eyeOffsetY: 0,
  setEyeOffset: (x, y) => set({ eyeOffsetX: x, eyeOffsetY: y }),

  bodyTilt: 0,
  bodySquash: 1,
  bodyStretch: 1,
  setBodyTransform: (tilt, squash, stretch) => set({ bodyTilt: tilt, bodySquash: squash, bodyStretch: stretch }),

  speechBubble: null,
  showSpeech: (text, variant = 'tip', durationMs = 5000) => {
    set({ speechBubble: { text, variant } });
    if (durationMs > 0) {
      setTimeout(() => {
        if (get().speechBubble?.text === text) {
          set({ speechBubble: null });
        }
      }, durationMs);
    }
  },
  hideSpeech: () => set({ speechBubble: null }),

  userName: '',
  characterVariant: 'classic',
  scale: 3,
}));
