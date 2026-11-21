import { describe, expect, it } from 'vitest';
import { MODULES, MODULE_GROUPS, MODULE_MAP, moduleLabel } from '@/data/modules';
import { SIMULATION_MODULE_IDS } from '@/engine/simulationModules';
import { MODULE_IDS } from '@/types/simulation';

describe('module metadata', () => {
  it('describes every navigation module exactly once', () => {
    const ids = MODULES.map((module) => module.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...MODULE_IDS].sort());
  });

  it('provides complete display and explainer metadata', () => {
    for (const module of MODULES) {
      expect(module.label.length).toBeGreaterThan(0);
      expect(module.shortLabel.length).toBeGreaterThan(0);
      expect(module.icon.length).toBeGreaterThan(0);
      expect(module.description.length).toBeGreaterThan(10);
      expect(module.explainer.length).toBeGreaterThan(20);
      expect(module.units.length).toBeGreaterThan(0);
      expect(module.group in MODULE_GROUPS).toBe(true);
      expect(MODULE_GROUPS[module.group].length).toBeGreaterThan(0);
    }
  });

  it('maps ids to the same metadata records', () => {
    for (const module of MODULES) {
      expect(MODULE_MAP[module.id]).toBe(module);
      expect(moduleLabel(module.id)).toBe(module.label);
    }
  });

  it('distinguishes output-producing modules from visual explorers', () => {
    const outputIds: readonly string[] = SIMULATION_MODULE_IDS;
    const outputModules = MODULES.filter((module) => outputIds.includes(module.id));

    expect(outputModules).toHaveLength(8);
    expect(MODULE_MAP.wind.units).toContain('m/s (simulated)');
    expect(MODULE_MAP.climate.explainer).toMatch(/not observational data/i);
  });
});
