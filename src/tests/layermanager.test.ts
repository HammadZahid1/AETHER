import { describe, expect, it, vi } from 'vitest';
import { LayerManager, createLayerPreset, type LayerPreset } from '@/engine/layers';
import { createDefaultLayerState } from '@/data/defaults';
import { LAYER_IDS, type LayerId } from '@/types/simulation';

describe('LayerManager', () => {
  it('clones the initial layer state instead of retaining references', () => {
    const initial = createDefaultLayerState();
    const manager = new LayerManager(initial);

    initial.surface.visible = false;
    initial.wind.opacity = 0.1;

    expect(manager.isVisible('surface')).toBe(true);
    expect(manager.get('wind').opacity).toBe(0.7);
  });

  it('clamps opacity and intensity and toggles visibility', () => {
    const manager = new LayerManager(createDefaultLayerState());

    manager.setOpacity('temperature', 1.5);
    expect(manager.get('temperature').opacity).toBe(1);
    manager.setOpacity('temperature', -0.5);
    expect(manager.get('temperature').opacity).toBe(0);

    manager.setIntensity('clouds', 4);
    expect(manager.get('clouds').intensity).toBe(2);
    manager.setIntensity('clouds', -2);
    expect(manager.get('clouds').intensity).toBe(0);

    manager.toggle('wind');
    expect(manager.isVisible('wind')).toBe(false);
    manager.setVisible('wind', true);
    expect(manager.isVisible('wind')).toBe(true);
  });

  it('shows only the requested layers', () => {
    const manager = new LayerManager(createDefaultLayerState());
    const requested = new Set<LayerId>(['surface', 'storm']);

    manager.showOnly([...requested]);

    for (const id of LAYER_IDS) {
      expect(manager.isVisible(id)).toBe(requested.has(id));
    }
  });

  it('applies presets, tracks the active preset and notifies subscribers', () => {
    const manager = new LayerManager(createDefaultLayerState());
    const preset: LayerPreset = createLayerPreset('test', 'Test', 'Test preset', ['surface', 'storm']);
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    manager.applyPreset(preset);
    expect(manager.getActivePreset()).toBe('test');
    expect(manager.isVisible('surface')).toBe(true);
    expect(manager.isVisible('storm')).toBe(true);
    expect(manager.isVisible('clouds')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);

    manager.set('wind', { opacity: 0.4 });
    expect(manager.getActivePreset()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    manager.toggle('wind');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('restores the default layer state on reset', () => {
    const initial = createDefaultLayerState();
    const manager = new LayerManager(initial);

    manager.applyPreset(createLayerPreset('test', 'Test', 'Test preset', ['surface']));
    manager.setOpacity('surface', 0.2);
    manager.reset(initial);

    expect(manager.getState()).toEqual(initial);
    expect(manager.getActivePreset()).toBeNull();
  });
});
