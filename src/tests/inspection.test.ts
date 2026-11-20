import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultConfigurations } from '@/data/defaults';
import { SimulationEngine } from '@/engine/engine';
import { disposeSimulationModules, registerSimulationModules } from '@/engine/simulationModules';
import { inspectActiveModule } from '@/renderer/inspection';

describe('module inspection', () => {
  afterEach(() => disposeSimulationModules());

  it('always reports the selected coordinate', () => {
    const rows = inspectActiveModule(null, 'wind', { latitude: 12.345, longitude: -55.678 });
    expect(rows[0].value).toContain('12.35');
    expect(rows).toHaveLength(1);
  });

  it('reports active module samples', () => {
    const modules = registerSimulationModules(new SimulationEngine(), createDefaultConfigurations());
    const coordinates = { latitude: 20, longitude: -60 };
    expect(inspectActiveModule(modules, 'wind', coordinates)[1].value).toMatch(/m\/s/);
    expect(inspectActiveModule(modules, 'pressure', coordinates)[1].value).toMatch(/hPa/);
    expect(inspectActiveModule(modules, 'climate', coordinates).length).toBeGreaterThan(2);
  });
});
