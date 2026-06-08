import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClippyStore } from '../store';
import { AppConfig } from '../config/defaults';

export function useConfig() {
  const store = useClippyStore();
  const loaded = useRef(false);

  // Load config on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    (async () => {
      try {
        const raw = await invoke<string | null>('load_config');
        if (raw) {
          const config = JSON.parse(raw) as Partial<AppConfig>;
          // Apply loaded config to store
          if (config.userName) store.setUserName(config.userName);
          if (config.characterVariant) store.setCharacterVariant(config.characterVariant);
          if (config.characterScale) store.setScale(config.characterScale);
          if (config.lastX != null && config.lastY != null) {
            store.setPosition(config.lastX, config.lastY);
          }
          if (config.pinnedNote) store.setPinnedNote(config.pinnedNote);
          if (config.reminders) {
            // Load non-delivered reminders
            config.reminders
              .filter(r => !r.delivered && r.triggerAt > Date.now())
              .forEach(r => store.addReminder(r.message, r.triggerAt));
          }
        }
      } catch {
        // No config file yet — use defaults
      }
    })();
  }, []);

  // Save config periodically (every 30 seconds) and on important changes
  useEffect(() => {
    const saveConfig = async () => {
      const state = useClippyStore.getState();
      const config: Partial<AppConfig> = {
        userName: state.userName,
        characterVariant: state.characterVariant,
        characterScale: state.scale,
        lastX: state.characterX,
        lastY: state.characterY,
        pinnedNote: state.pinnedNote,
        reminders: state.reminders,
      };
      try {
        await invoke('save_config', { config: JSON.stringify(config) });
      } catch {
        // Ignore save errors in dev
      }
    };

    const interval = setInterval(saveConfig, 30000);

    // Also save on beforeunload
    const onUnload = () => { saveConfig(); };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [store.userName, store.characterVariant, store.scale, store.pinnedNote]);
}
