import { DEFAULT_ATMOSPHERE, DEFAULT_CLOUDS, DEFAULT_CLIMATE, DEFAULT_OCEAN, DEFAULT_PRECIPITATION, DEFAULT_PRESSURE, DEFAULT_STORM, DEFAULT_TEMPERATURE, DEFAULT_WIND, createDefaultLayerState } from '@/data/defaults';
import { clampConfigurations } from '@/engine/configValidation';
import { LAYER_IDS, MODULE_IDS } from '@/types/simulation';
import type { LayerState } from '@/types/simulation';
import type { SimulationConfigurations } from '@/types/config';
import type { SavedConfiguration, Scenario } from '@/types/scenario';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate a scenario before applying it, including imported configurations. */
export function validateScenario(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') return { valid: false, errors: ['Scenario must be an object'] };
  const scenario = value as Partial<Scenario>;
  if (typeof scenario.id !== 'string' || !scenario.id) errors.push('Missing id');
  if (typeof scenario.name !== 'string' || !scenario.name) errors.push('Missing name');
  if (typeof scenario.description !== 'string') errors.push('Missing description');
  if (!scenario.module || !MODULE_IDS.includes(scenario.module)) errors.push('Invalid module');
  if (!Array.isArray(scenario.layers) || !scenario.layers.every((layer) => LAYER_IDS.includes(layer))) errors.push('Invalid layers');
  if (!scenario.camera || !Number.isFinite(scenario.camera.distance)) errors.push('Invalid camera');
  if (!Number.isFinite(scenario.camera?.target?.latitude) || !Number.isFinite(scenario.camera?.target?.longitude)) errors.push('Invalid camera target');
  if (!Number.isFinite(scenario.speed) || (scenario.speed ?? 0) < 0) errors.push('Invalid speed');
  if (scenario.time !== undefined && !Number.isFinite(scenario.time)) errors.push('Invalid time');
  return { valid: errors.length === 0, errors };
}

/** Deep-merge a scenario configuration onto the default configuration set. */
export function mergeConfigurations(scenario: Scenario): SimulationConfigurations {
  const patch = scenario.configurations ?? {};
  return clampConfigurations({
    wind: { ...DEFAULT_WIND, ...patch.wind },
    temperature: { ...DEFAULT_TEMPERATURE, ...patch.temperature },
    pressure: { ...DEFAULT_PRESSURE, ...patch.pressure, regions: patch.pressure?.regions ?? DEFAULT_PRESSURE.regions.map((region) => ({ ...region })) },
    clouds: { ...DEFAULT_CLOUDS, ...patch.clouds },
    precipitation: { ...DEFAULT_PRECIPITATION, ...patch.precipitation },
    storm: { ...DEFAULT_STORM, ...patch.storm, center: patch.storm?.center ?? { ...DEFAULT_STORM.center } },
    ocean: { ...DEFAULT_OCEAN, ...patch.ocean },
    climate: { ...DEFAULT_CLIMATE, ...patch.climate },
    atmosphere: { ...DEFAULT_ATMOSPHERE, ...patch.atmosphere },
  });
}

/** Build a layer state where only the scenario layers are visible. */
export function layersFromScenario(scenario: Scenario): LayerState {
  const layers = createDefaultLayerState();
  for (const id of LAYER_IDS) {
    layers[id] = { ...layers[id], visible: scenario.layers.includes(id) };
  }
  return layers;
}

/** Serialize a scenario to a portable JSON string. */
export function exportScenario(scenario: Scenario, name?: string): string {
  const saved: SavedConfiguration = {
    id: scenario.id,
    name: name ?? scenario.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scenario,
  };
  return JSON.stringify(saved, null, 2);
}

/** Clamp imported values into supported ranges and fill missing defaults. */
export function sanitizeScenario(saved: SavedConfiguration): SavedConfiguration {
  const scenario = saved.scenario;
  const latitude = Math.min(Math.max(scenario.camera.target.latitude, -90), 90);
  const longitude = ((((scenario.camera.target.longitude + 180) % 360) + 360) % 360) - 180;
  const clean: Scenario = {
    ...scenario,
    name: String(scenario.name).trim().slice(0, 80),
    description: String(scenario.description ?? '').slice(0, 500),
    layers: LAYER_IDS.filter((layer) => scenario.layers.includes(layer)),
    camera: {
      ...scenario.camera,
      name: String(scenario.camera.name ?? 'Imported view').slice(0, 80),
      target: { latitude, longitude },
      distance: Math.min(Math.max(scenario.camera.distance, 0.5), 20),
    },
    time: Math.max(0, scenario.time ?? 0),
    speed: Math.min(Math.max(scenario.speed, 0), 16),
    configurations: mergeConfigurations(scenario),
  };
  return { ...saved, name: String(saved.name).trim().slice(0, 80) || clean.name, scenario: clean };
}

/** Parse and validate an exported configuration. */
export function importScenario(json: string): { saved?: SavedConfiguration; errors: string[] } {
  try {
    const parsed = JSON.parse(json) as SavedConfiguration;
    const result = validateScenario(parsed.scenario);
    if (!result.valid) return { errors: result.errors };
    if (typeof parsed.name !== 'string') return { errors: ['Missing saved configuration name'] };
    return { saved: sanitizeScenario(parsed), errors: [] };
  } catch (error) {
    return { errors: [error instanceof Error ? error.message : 'Invalid JSON'] };
  }
}

/** Safely clone a scenario so edits never mutate bundled definitions. */
export function cloneScenario(scenario: Scenario, id?: string, name?: string): Scenario {
  return {
    ...structuredClone(scenario),
    id: id ?? `${scenario.id}-copy-${Date.now()}`,
    name: name ?? `${scenario.name} Copy`,
  };
}