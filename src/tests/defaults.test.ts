import { describe, expect, it } from 'vitest';
import {
  createDefaultConfigurations,
  createDefaultLayerState,
  createDefaultSettings,
  isLayerId,
} from '@/data/defaults';
import { LAYER_IDS } from '@/types/simulation';

describe('default application data', () => {
  it('provides every simulation configuration section', () => {
    const configurations = createDefaultConfigurations();

    expect(Object.keys(configurations).sort()).toEqual([
      'atmosphere',
      'climate',
      'clouds',
      'ocean',
      'precipitation',
      'pressure',
      'storm',
      'temperature',
      'wind',
    ]);
  });

  it('does not share nested configuration objects between instances', () => {
    const first = createDefaultConfigurations();
    const second = createDefaultConfigurations();

    expect(first).not.toBe(second);
    expect(first.wind).not.toBe(second.wind);

    first.pressure.regions[0].center.latitude = 0;
    expect(second.pressure.regions[0].center.latitude).toBe(35);

    first.storm.center.longitude = 0;
    expect(second.storm.center.longitude).toBe(-55);
  });

  it('builds a layer state for every layer id with documented defaults', () => {
    const layers = createDefaultLayerState();
    const expectedVisible = new Set(['surface', 'atmosphere', 'grid', 'wind', 'temperature', 'clouds']);

    expect(Object.keys(layers).sort()).toEqual([...LAYER_IDS].sort());
    for (const id of LAYER_IDS) {
      expect(layers[id].visible).toBe(expectedVisible.has(id));
      expect(layers[id].opacity).toBe(id === 'surface' ? 1 : 0.7);
      expect(layers[id].intensity).toBe(1);
    }
  });

  it('creates isolated settings with conservative defaults', () => {
    const first = createDefaultSettings();
    const second = createDefaultSettings();

    expect(first.theme).toBe('dark');
    expect(first.defaultModule).toBe('earth');
    expect(first.rendering.quality).toBe('balanced');
    expect(first.rendering.pixelRatioCap).toBe(1.75);

    first.rendering.quality = 'high';
    expect(second.rendering.quality).toBe('balanced');
  });

  it('recognises only known layer ids', () => {
    expect(isLayerId('surface')).toBe(true);
    expect(isLayerId('climate')).toBe(true);
    expect(isLayerId('unknown')).toBe(false);
  });
});
