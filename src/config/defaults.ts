export interface AppConfig {
  characterScale: number;
  characterVariant: string;
  showSpeechBubbles: boolean;
  enableSounds: boolean;
  soundVolume: number;

  enableEyeFollow: boolean;
  enableChase: boolean;
  enableOverheat: boolean;
  enablePaperUnroll: boolean;
  idleTimeoutMin: number;

  stretchEnabled: boolean;
  stretchIntervalMin: number;

  pomodoroFocusMin: number;
  pomodoroBreakMin: number;
  pomodoroLongBreakMin: number;
  sessionsBeforeLongBreak: number;

  enableAIIntegration: boolean;
  aiTools: string[];

  userName: string;
  pinnedNote: string;

  reminders: Array<{ id: string; message: string; triggerAt: number; delivered: boolean }>;

  lastX: number;
  lastY: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  characterScale: 3,
  characterVariant: 'classic',
  showSpeechBubbles: true,
  enableSounds: true,
  soundVolume: 50,

  enableEyeFollow: true,
  enableChase: true,
  enableOverheat: true,
  enablePaperUnroll: true,
  idleTimeoutMin: 5,

  stretchEnabled: true,
  stretchIntervalMin: 45,

  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  pomodoroLongBreakMin: 15,
  sessionsBeforeLongBreak: 4,

  enableAIIntegration: true,
  aiTools: ['claude-code', 'codex', 'cursor', 'kiro'],

  userName: '',
  pinnedNote: '',

  reminders: [],

  lastX: 800,
  lastY: 600,
};
