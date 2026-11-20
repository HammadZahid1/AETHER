import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAetherStore } from '@/state/store';
import type { SimulationControls } from '@/hooks/useSimulationEngine';

const controls: SimulationControls = {
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  step: vi.fn(),
  reset: vi.fn(),
};

describe('keyboard shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAetherStore.setState({ status: 'paused', commandPaletteOpen: false, layersPanelOpen: false });
  });

  it('opens the command palette with Ctrl+K', () => {
    renderHook(() => useKeyboardShortcuts({ controls, onResetCamera: vi.fn(), onOpenScenarios: vi.fn() }));
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(useAetherStore.getState().commandPaletteOpen).toBe(true);
  });

  it('toggles playback and layers', () => {
    renderHook(() => useKeyboardShortcuts({ controls, onResetCamera: vi.fn(), onOpenScenarios: vi.fn() }));
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(controls.play).toHaveBeenCalledOnce();
    fireEvent.keyDown(window, { key: 'l' });
    expect(useAetherStore.getState().layersPanelOpen).toBe(true);
  });

  it('ignores shortcuts while typing in a field', () => {
    renderHook(() => useKeyboardShortcuts({ controls, onResetCamera: vi.fn(), onOpenScenarios: vi.fn() }));
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { code: 'Space', key: ' ' });
    expect(controls.play).not.toHaveBeenCalled();
    input.remove();
  });
});
