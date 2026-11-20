import { useEffect } from 'react';
import type { SimulationControls } from '@/hooks/useSimulationEngine';
import { useAetherStore } from '@/state/store';

interface ShortcutOptions {
  controls: SimulationControls;
  onResetCamera: () => void;
  onOpenScenarios: () => void;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

/** Global keyboard shortcuts for playback, navigation and dialogs. */
export function useKeyboardShortcuts({ controls, onResetCamera, onOpenScenarios }: ShortcutOptions): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const store = useAetherStore.getState();

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        store.setCommandPaletteOpen(true);
        return;
      }
      if (event.key === 'Escape') {
        store.setCommandPaletteOpen(false);
        store.setSettingsOpen(false);
        store.setHelpOpen(false);
        store.setLayersPanelOpen(false);
        return;
      }
      if (isEditable(event.target)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        if (store.status === 'running') controls.pause();
        else controls.play();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        controls.step(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        controls.step(1);
      } else if (event.key.toLowerCase() === 'r') {
        onResetCamera();
      } else if (event.key.toLowerCase() === 'l') {
        store.setLayersPanelOpen(!store.layersPanelOpen);
      } else if (event.key === '?') {
        store.setHelpOpen(!store.helpOpen);
      } else if (event.key.toLowerCase() === 's') {
        onOpenScenarios();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [controls, onOpenScenarios, onResetCamera]);
}
