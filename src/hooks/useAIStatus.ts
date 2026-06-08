import { useEffect, useState } from 'react';
import { AIToolState, pollAIStatus } from '../systems/AIStatusSystem';
import { useClippyStore } from '../store';

export function useAIStatus() {
  const [aiState, setAIState] = useState<AIToolState>({ tool: 'none', status: 'idle', timestamp: 0 });
  const store = useClippyStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await pollAIStatus();
      setAIState(status);

      // Trigger character reactions
      if (status.status === 'thinking' && store.animState !== 'thinking') {
        store.setAnimState('thinking');
      } else if (status.status === 'done' && store.animState === 'thinking') {
        store.setAnimState('victory');
        store.showSpeech('Done! Task complete!', 'tip', 3000);
        setTimeout(() => {
          if (store.animState === 'victory') {
            store.setAnimState('idle');
          }
        }, 2500);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return aiState;
}
