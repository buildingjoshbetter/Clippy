import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClippyStore } from '../store';
import { playMarioCoin } from '../systems/SoundSystem';

export interface AIToolState {
  tool: string;
  status: string;
  timestamp: number;
}

export function useAIStatus() {
  const [aiState, setAIState] = useState<AIToolState>({ tool: 'none', status: 'idle', timestamp: 0 });
  const lastTimestamp = useRef(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const raw = await invoke<string | null>('read_ai_status');
        if (!raw) return;
        const status = JSON.parse(raw) as AIToolState;
        setAIState(status);

        if (status.timestamp !== lastTimestamp.current && status.status === 'done') {
          lastTimestamp.current = status.timestamp;
          useClippyStore.getState().setAnimState('victory');
          useClippyStore.getState().showSpeech('Done! Task complete!', 'tip', 3000);
          playMarioCoin();
          setTimeout(() => {
            if (useClippyStore.getState().animState === 'victory') {
              useClippyStore.getState().setAnimState('idle');
            }
          }, 2500);
        } else if (status.timestamp !== lastTimestamp.current) {
          lastTimestamp.current = status.timestamp;
        }
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return aiState;
}
