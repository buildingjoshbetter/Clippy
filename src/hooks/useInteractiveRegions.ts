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

  useEffect(() => {
    const regions: Region[] = [];

    const size = 48 * store.scale;
    const half = size / 2;
    regions.push({
      x: store.characterX - half,
      y: store.characterY - half,
      w: size,
      h: size,
    });

    if (store.contextMenuOpen) {
      regions.push({
        x: store.contextMenuX - 10,
        y: store.contextMenuY - 10,
        w: 220,
        h: 300,
      });
    }

    if (store.settingsOpen) {
      regions.push({
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight,
      });
    }

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
        x: store.characterX - 110,
        y: store.characterY - half - 80,
        w: 240,
        h: 60,
      });
    }

    if (store.stretchActive) {
      regions.push({
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight,
      });
    }

    const json = JSON.stringify(regions);
    if (json !== lastJson.current) {
      lastJson.current = json;
      invoke('update_interactive_regions', { regions }).catch(() => {});
    }
  }, [
    store.characterX, store.characterY, store.scale,
    store.contextMenuOpen, store.contextMenuX, store.contextMenuY,
    store.settingsOpen,
    store.pomodoroPhase,
    store.activeReminder,
    store.pinnedNote,
    store.speechBubble,
    store.stretchActive,
  ]);
}
