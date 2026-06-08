import { useEffect, useRef } from 'react';
import { useClippyStore } from '../store';
import { invoke } from '@tauri-apps/api/core';

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useInteractiveRegions() {
  const store = useClippyStore();
  const lastJson = useRef('');
  const lastForce = useRef(false);

  const hasModal = store.settingsOpen || store.stretchActive || store.contextMenuOpen;

  useEffect(() => {
    if (hasModal !== lastForce.current) {
      lastForce.current = hasModal;
      invoke('set_force_interactive', { force: hasModal }).catch(() => {});
    }
  }, [hasModal]);

  useEffect(() => {
    if (hasModal) return;

    const regions: Region[] = [];

    const size = 48 * store.scale;
    const half = size / 2;
    regions.push({
      x: store.characterX - half,
      y: store.characterY - half,
      w: size,
      h: size,
    });

    if (store.pomodoroPhase !== 'idle') {
      regions.push({
        x: store.characterX + half + 8,
        y: store.characterY - half - 10,
        w: 110,
        h: 80,
      });
    }

    if (store.activeReminder) {
      regions.push({
        x: store.characterX + half + 8,
        y: store.characterY + half - 30,
        w: 240,
        h: 100,
      });
    }

    if (store.pinnedNote) {
      regions.push({
        x: store.characterX - 90,
        y: store.characterY - half - 54,
        w: 200,
        h: 44,
      });
    }

    if (store.speechBubble) {
      regions.push({
        x: store.characterX - half - 230,
        y: store.characterY - half - 20,
        w: 240,
        h: 60,
      });
    }

    const json = JSON.stringify(regions);
    if (json !== lastJson.current) {
      lastJson.current = json;
      invoke('update_interactive_regions', { regions }).catch(() => {});
    }
  }, [
    hasModal,
    store.characterX, store.characterY, store.scale,
    store.pomodoroPhase,
    store.activeReminder,
    store.pinnedNote,
    store.speechBubble,
  ]);
}
