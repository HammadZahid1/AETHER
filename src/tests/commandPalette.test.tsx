import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '@/components/overlays/CommandPalette';
import { useAetherStore } from '@/state/store';
import type { SimulationControls } from '@/hooks/useSimulationEngine';

const controls: SimulationControls = {
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  step: vi.fn(),
  reset: vi.fn(),
};

describe('CommandPalette', () => {
  beforeEach(() => {
    useAetherStore.setState({ commandPaletteOpen: true, activeModule: 'earth', savedViews: [] });
  });

  it('filters commands and navigates to a module', () => {
    render(<CommandPalette controls={controls} onResetCamera={vi.fn()} />);
    const input = screen.getByLabelText('Search commands');
    fireEvent.change(input, { target: { value: 'Open Storm' } });
    const option = screen.getByRole('option', { name: /Open Storm Lab/ });
    fireEvent.click(option);
    expect(useAetherStore.getState().activeModule).toBe('storm');
    expect(useAetherStore.getState().commandPaletteOpen).toBe(false);
  });

  it('runs playback commands from the palette', () => {
    render(<CommandPalette controls={controls} onResetCamera={vi.fn()} />);
    fireEvent.click(screen.getByRole('option', { name: /Play simulation/ }));
    expect(controls.play).toHaveBeenCalledOnce();
  });

  it('toggles the diagnostics overlay', () => {
    render(<CommandPalette controls={controls} onResetCamera={vi.fn()} />);
    fireEvent.click(screen.getByRole('option', { name: /Toggle engine diagnostics/ }));
    expect(useAetherStore.getState().diagnosticsOpen).toBe(true);
  });

  it('loads a saved camera view', () => {
    useAetherStore.setState({
      savedViews: [{
        id: 'view-42',
        name: 'Storm watch',
        target: { latitude: 30, longitude: -70 },
        distance: 1.8,
        createdAt: 1,
      }],
    });
    render(<CommandPalette controls={controls} onResetCamera={vi.fn()} />);
    fireEvent.click(screen.getByRole('option', { name: /Load saved view: Storm watch/ }));
    expect(useAetherStore.getState().camera.preset).toBe('Storm watch');
    expect(useAetherStore.getState().commandPaletteOpen).toBe(false);
  });
});
