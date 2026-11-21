import { describe, expect, it } from 'vitest';
import { createDefaultLayerState } from '@/data/defaults';
import { LAYER_PRESETS } from '@/data/presets';
import { SCENARIOS, getScenario, scenariosByCategory } from '@/data/scenarios';
import { LayerManager } from '@/engine/layers';
import { LAYER_IDS, MODULE_IDS } from '@/types/simulation';

const categories = ['circulation', 'thermal', 'atmospheric', 'marine', 'climate', 'extreme'] as const;

describe('layer presets', () => {
  it('defines unique presets that describe every layer', () => {
    const ids = LAYER_PRESETS.map((definition) => definition.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const definition of LAYER_PRESETS) {
      expect(definition.name.length).toBeGreaterThan(0);
      expect(definition.description.length).toBeGreaterThan(20);
      expect(MODULE_IDS).toContain(definition.module);
      expect(Object.keys(definition.preset.layers).sort()).toEqual([...LAYER_IDS].sort());
      expect(definition.preset.id).toBe(definition.id);
    }
  });

  it('keeps the surface visible in every preset while hiding at least one overlay', () => {
    for (const definition of LAYER_PRESETS) {
      expect(definition.preset.layers.surface?.visible).toBe(true);
      expect(LAYER_IDS.some((id) => definition.preset.layers[id]?.visible === false)).toBe(true);
    }
  });

  it('applies a preset to a layer manager', () => {
    const definition = LAYER_PRESETS.find((item) => item.id === 'storm-visualization');
    if (!definition) throw new Error('Missing storm-visualization preset');

    const manager = new LayerManager(createDefaultLayerState());
    manager.applyPreset(definition.preset);

    for (const id of ['surface', 'storm', 'clouds', 'precipitation', 'wind', 'grid'] as const) {
      expect(manager.isVisible(id)).toBe(true);
    }
    expect(manager.isVisible('atmosphere')).toBe(false);
    expect(manager.getActivePreset()).toBe('storm-visualization');
  });
});

describe('bundled scenarios', () => {
  it('defines unique scenarios with valid metadata and layers', () => {
    const ids = SCENARIOS.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const item of SCENARIOS) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(20);
      expect(categories).toContain(item.category);
      expect(MODULE_IDS).toContain(item.module);
      expect(item.layers.length).toBeGreaterThan(0);
      for (const layer of item.layers) {
        expect(LAYER_IDS).toContain(layer);
      }
      expect(item.camera.distance).toBeGreaterThan(0);
      expect(Number.isFinite(item.camera.target.latitude)).toBe(true);
      expect(Number.isFinite(item.camera.target.longitude)).toBe(true);
      expect(item.speed).toBeGreaterThan(0);
      expect(Object.keys(item.configurations).length).toBeGreaterThan(0);
    }
  });

  it('looks up scenarios by id and returns undefined for unknown ids', () => {
    expect(getScenario('storm-simulation')?.configurations.storm?.enabled).toBe(true);
    expect(getScenario('unknown')).toBeUndefined();
  });

  it('filters scenarios by category', () => {
    const atmospheric = scenariosByCategory('atmospheric');

    expect(atmospheric.length).toBeGreaterThan(0);
    expect(atmospheric.every((item) => item.category === 'atmospheric')).toBe(true);
    expect(atmospheric.map((item) => item.id)).toContain('pressure-systems');
  });
});
