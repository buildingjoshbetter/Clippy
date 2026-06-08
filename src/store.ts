import { create } from 'zustand';

export type AnimState =
  | 'idle' | 'eye_follow' | 'dragging' | 'wobble'
  | 'chasing' | 'petting' | 'typing_along' | 'overheat'
  | 'thinking' | 'victory' | 'stretching' | 'paper_unroll'
  | 'waving' | 'sleeping';

export type SpeechVariant = 'tip' | 'reminder' | 'alert' | 'note';

export type PomodoroPhase = 'idle' | 'focus' | 'break' | 'longBreak';

interface SpeechBubbleState {
  text: string;
  variant: SpeechVariant;
}

interface Reminder {
  id: string;
  message: string;
  triggerAt: number;
  delivered: boolean;
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
  setUserName: (name: string) => void;
  characterVariant: string;
  setCharacterVariant: (variant: string) => void;
  scale: number;
  setScale: (scale: number) => void;

  // Settings panel
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Context menu
  contextMenuOpen: boolean;
  contextMenuX: number;
  contextMenuY: number;
  openContextMenu: (x: number, y: number) => void;
  closeContextMenu: () => void;

  // Pomodoro state
  pomodoroPhase: PomodoroPhase;
  pomodoroRemainingMs: number;
  setPomodoroState: (phase: PomodoroPhase, remainingMs: number) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (message: string, triggerAt: number) => void;
  dismissReminder: (id: string) => void;

  // Active reminder (currently showing)
  activeReminder: { id: string; message: string } | null;
  setActiveReminder: (reminder: { id: string; message: string } | null) => void;

  // Pinned note
  pinnedNote: string;
  setPinnedNote: (note: string) => void;

  // Stretch overlay
  stretchActive: boolean;
  setStretchActive: (active: boolean) => void;
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
  setUserName: (name) => set({ userName: name }),
  characterVariant: 'classic',
  setCharacterVariant: (variant) => set({ characterVariant: variant }),
  scale: 3,
  setScale: (scale) => set({ scale }),

  // Settings panel
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  // Context menu
  contextMenuOpen: false,
  contextMenuX: 0,
  contextMenuY: 0,
  openContextMenu: (x, y) => set({ contextMenuOpen: true, contextMenuX: x, contextMenuY: y }),
  closeContextMenu: () => set({ contextMenuOpen: false }),

  // Pomodoro state
  pomodoroPhase: 'idle',
  pomodoroRemainingMs: 0,
  setPomodoroState: (phase, remainingMs) => set({ pomodoroPhase: phase, pomodoroRemainingMs: remainingMs }),

  // Reminders
  reminders: [],
  addReminder: (message, triggerAt) => {
    const id = `reminder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      reminders: [...state.reminders, { id, message, triggerAt, delivered: false }],
    }));
  },
  dismissReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, delivered: true } : r
      ),
      activeReminder: state.activeReminder?.id === id ? null : state.activeReminder,
    }));
  },

  // Active reminder
  activeReminder: null,
  setActiveReminder: (reminder) => set({ activeReminder: reminder }),

  // Pinned note
  pinnedNote: '',
  setPinnedNote: (note) => set({ pinnedNote: note }),

  // Stretch overlay
  stretchActive: false,
  setStretchActive: (active) => set({ stretchActive: active }),
}));
