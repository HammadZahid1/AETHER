import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { exportScenario, importScenario, sanitizeScenario, validateScenario } from '@/engine/scenarios';
import type { SavedConfiguration } from '@/types/scenario';

describe('scenario validation and sanitization', () => {
  it('rejects malformed scenario objects', () => {
    expect(validateScenario(null).valid).toBe(false);
    const invalid = { ...SCENARIOS[0], camera: { name: 'Bad', target: { latitude: 0, longitude: Number.NaN }, distance: 2 } };
    expect(validateScenario(invalid).errors).toContain('Invalid camera target');
  });

  it('clamps imported values and fills configuration defaults', () => {
    const scenario = {
      ...SCENARIOS[0],
      name: '  Wild values  ',
      speed: 999,
      time: -20,
      camera: { name: 'Extreme', target: { latitude: 100, longitude: 190 }, distance: 999 },
      configurations: {},
    };
    const saved: SavedConfiguration = { id: 'test', name: '  Imported  ', createdAt: 1, updatedAt: 1, scenario };
    const clean = sanitizeScenario(saved);
    expect(clean.name).toBe('Imported');
    expect(clean.scenario.camera.target.latitude).toBe(90);
    expect(clean.scenario.camera.target.longitude).toBe(-170);
    expect(clean.scenario.camera.distance).toBe(20);
    expect(clean.scenario.speed).toBe(16);
    expect(clean.scenario.time).toBe(0);
    expect(clean.scenario.configurations.wind).toBeDefined();
  });

  it('round-trips an exported scenario through import', () => {
    const result = importScenario(exportScenario(SCENARIOS[0]));
    expect(result.errors).toEqual([]);
    expect(result.saved?.scenario.id).toBe(SCENARIOS[0].id);
  });
});
