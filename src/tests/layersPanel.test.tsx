import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LayersPanel } from '@/components/overlays/LayersPanel';
import { useAetherStore } from '@/state/store';

describe('LayersPanel', () => {
  beforeEach(() => useAetherStore.setState({ layersPanelOpen: true }));

  it('applies a layer preset', () => {
    render(<LayersPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Clean Globe/ }));
    const layers = useAetherStore.getState().layers;
    expect(layers.surface.visible).toBe(true);
    expect(layers.wind.visible).toBe(false);
    expect(layers.clouds.visible).toBe(false);
  });

  it('toggles layer visibility directly', () => {
    render(<LayersPanel />);
    const before = useAetherStore.getState().layers.grid.visible;
    fireEvent.click(screen.getAllByRole('switch', { name: 'Grid' })[0]);
    expect(useAetherStore.getState().layers.grid.visible).toBe(!before);
  });
});
