import { invoke } from '@tauri-apps/api/core';

export type AIStatus = 'idle' | 'thinking' | 'done' | 'error';

export interface AIToolState {
  tool: string;
  status: AIStatus;
  timestamp: number;
  task?: string;
}

let lastStatus: AIToolState = { tool: 'none', status: 'idle', timestamp: 0 };
let onStatusChange: ((state: AIToolState) => void) | null = null;

export function setAIStatusListener(listener: (state: AIToolState) => void) {
  onStatusChange = listener;
}

export function getAIStatus(): AIToolState {
  return lastStatus;
}

// This will be called periodically from a hook
export async function pollAIStatus(): Promise<AIToolState> {
  try {
    const result = await invoke<string>('read_ai_status');
    if (result) {
      const parsed = JSON.parse(result) as AIToolState;
      if (parsed.status !== lastStatus.status || parsed.tool !== lastStatus.tool) {
        lastStatus = parsed;
        onStatusChange?.(parsed);
      }
      return parsed;
    }
  } catch {
    // File doesn't exist or can't be read — that's fine
  }
  return lastStatus;
}
