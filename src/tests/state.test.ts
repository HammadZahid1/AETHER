import { beforeEach, describe, expect, it } from 'vitest';
import { getScenario, SCENARIOS, scenariosByCategory } from '@/data/scenarios';
import { cloneScenario, exportScenario, importScenario, layersFromScenario, mergeConfigurations, validateScenario } from '@/engine/scenarios';
import { clearAllPersistedData, deleteConfiguration, loadSavedConfigurations, loadSettings, loadSavedViews, renameConfiguration, saveSavedView, saveSettings, upsertConfiguration } from '@/state/persistence';
import { useAetherStore } from '@/state/store';
import { createDefaultSettings } from '@/data/defaults';
import type { SavedConfiguration } from '@/types/scenario';

describe('scenario system', () => {
  it('provides scenarios across categories', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(10);
    expect(scenariosByCategory('extreme').length).toBeGreaterThan(0);
    expect(getScenario('storm-simulation')?.module).toBe('storm');
    expect(getScenario('missing')).toBeUndefined();
  });

  it('validates scenarios strictly', () => {
    expect(validateScenario(SCENARIOS[0]).valid).toBe(true);
    expect(validateScenario({ id: 'x' }).valid).toBe(false);
    expect(validateScenario(null).valid).toBe(false);
    expect(validateScenario({ ...SCENARIOS[0], module: 'invalid' }).errors).toContain('Invalid module');
  });

  it('merges configurations with defaults', () => {
    const merged = mergeConfigurations(SCENARIOS[6]);
    expect(merged.storm.enabled).toBe(true);
    expect(merged.wind).toBeDefined();
  });

  it('derives visible layers from a scenario', () => {
    const layers = layersFromScenario(SCENARIOS[6]);
    expect(layers.storm.visible).toBe(true);
    expect(layers.ocean.visible).toBe(false);
  });

  it('round-trips exported scenarios', () => {
    const json = exportScenario(SCENARIOS[6], 'My Storm');
    const result = importScenario(json);
    expect(result.errors).toHaveLength(0);
    expect(result.saved?.name).toBe('My Storm');
    expect(importScenario('not json').errors.length).toBeGreaterThan(0);
  });

  it('clones scenarios without sharing nested data', () => {
    const clone = cloneScenario(SCENARIOS[6]);
    expect(clone.id).not.toBe(SCENARIOS[6].id);
    expect(clone.configurations.storm?.center).not.toBe(SCENARIOS[6].configurations.storm?.center);
  });
});

describe('local persistence', () => {
  beforeEach(() => clearAllPersistedData());

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(createDefaultSettings());
    expect(loadSavedConfigurations()).toEqual([]);
    expect(loadSavedViews()).toEqual([]);
  });

  it('persists and reloads settings', () => {
    const settings = { ...createDefaultSettings(), theme: 'slate' as const };
    expect(saveSettings(settings)).toBe(true);
    expect(loadSettings().theme).toBe('slate');
  });

  it('upserts, renames and deletes configurations', () => {
    const saved: SavedConfiguration = {
      id: 'a', name: 'A', createdAt: 1, updatedAt: 1,
      scenario: SCENARIOS[0],
    };
    expect(upsertConfiguration(saved)).toHaveLength(1);
    expect(renameConfiguration('a', 'Renamed')[0].name).toBe('Renamed');
    expect(deleteConfiguration('a')).toHaveLength(0);
  });

  it('persists saved camera views', () => {
    saveSavedView({ id: 'v1', name: 'North', target: { latitude: 80, longitude: 0 }, distance: 2, createdAt: 1 });
    expect(loadSavedViews()[0].name).toBe('North');
  });
});

describe('application store', () => {
  it('switches modules and updates layered configuration', () => {
    const store = useAetherStore.getState();
    store.setModule('storm');
    expect(useAetherStore.getState().activeModule).toBe('storm');
    store.updateConfig('storm', { intensity: 0.4 });
    expect(useAetherStore.getState().configurations.storm.intensity).toBe(0.4);
  });

  it('toggles layers and replaces layer state', () => {
    const store = useAetherStore.getState();
    const before = useAetherStore.getState().layers.ocean.visible;
    store.toggleLayer('ocean');
    expect(useAetherStore.getState().layers.ocean.visible).toBe(!before);
  });

  it('loads scenarios into every state slice', () => {
    useAetherStore.getState().loadScenarioById('ocean-currents');
    const state = useAetherStore.getState();
    expect(state.activeModule).toBe('ocean');
    expect(state.configurations.ocean.enabled).toBe(true);
    expect(state.layers.ocean.visible).toBe(true);
    expect(state.status).toBe('running');
  });

  it('saves, renames and removes configurations', () => {
    useAetherStore.getState().saveCurrentConfiguration('Test config');
    let state = useAetherStore.getState();
    expect(state.savedConfigurations.length).toBeGreaterThan(0);
    const id = state.savedConfigurations[0].id;
    state.renameSavedConfiguration(id, 'Renamed config');
    expect(useAetherStore.getState().savedConfigurations[0].name).toBe('Renamed config');
    state.removeSavedConfiguration(id);
    expect(useAetherStore.getState().savedConfigurations.some((item) => item.id === id)).toBe(false);
  });

  it('manages playback state and notifications', () => {
    const store = useAetherStore.getState();
    store.setStatus('paused');
    store.setSpeed(99);
    expect(useAetherStore.getState().speed).toBe(16);
    store.setDirection(-1);
    expect(useAetherStore.getState().direction).toBe(-1);
    store.seek(2);
    expect(useAetherStore.getState().timeline).toBeLessThan(1);
    store.notify('Hello', 'success');
    expect(useAetherStore.getState().notifications.length).toBeGreaterThan(0);
  });

  it('applies camera presets and resets simulation', () => {
    const store = useAetherStore.getState();
    store.applyCameraPreset({ name: 'Polar', target: { latitude: 85, longitude: 0 }, distance: 3 });
    expect(useAetherStore.getState().camera.preset).toBe('Polar');
    store.resetSimulation();
    expect(useAetherStore.getState().status).toBe('idle');
  });
});