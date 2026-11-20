import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SimulationEngine } from '@/engine/engine';
import {
  disposeSimulationModules,
  getSimulationModules,
  registerSimulationModules,
  SIMULATION_MODULE_IDS,
  syncSimulationConfigurations,
} from '@/engine/simulationModules';
import { createDefaultConfigurations } from '@/data/defaults';

describe('simulation module registry', () => {
  beforeEach(() => disposeSimulationModules());
  afterEach(() => disposeSimulationModules());

  it('registers and activates the eight output-producing simulations', () => {
    const engine = new SimulationEngine();
    const configurations = createDefaultConfigurations();
    const modules = registerSimulationModules(engine, configurations);

    for (const id of SIMULATION_MODULE_IDS) {
      expect(engine.getModule(id)).toBe(modules[id]);
      expect(engine.isActive(id)).toBe(true);
    }
    expect(getSimulationModules()).toBe(modules);
  });

  it('does not replace existing module instances on repeated registration', () => {
    const configurations = createDefaultConfigurations();
    const first = registerSimulationModules(new SimulationEngine(), configurations);
    const second = registerSimulationModules(new SimulationEngine(), configurations);
    expect(second).toBe(first);
  });

  it('pushes new configurations into simulations', () => {
    const configurations = createDefaultConfigurations();
    registerSimulationModules(new SimulationEngine(), configurations);
    const wind = { ...configurations.wind, particleCount: 321 };
    const next = { ...configurations, wind };
    syncSimulationConfigurations(next);
    expect(getSimulationModules()?.wind.config.particleCount).toBe(321);
  });
});
