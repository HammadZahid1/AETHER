import type { AppSettings, SimulationConfigurations } from '@/types/config';
import type { LayerId, LayerState } from '@/types/simulation';
import { LAYER_IDS } from '@/types/simulation';

export const DEFAULT_WIND = {
  enabled: true,
  speed: 1.1,
  intensity: 0.65,
  particleCount: 3200,
  particleSize: 0.012,
  trailLength: 8,
  lifetime: 4.5,
  acceleration: 0.18,
  flowVisible: true,
  vectorsVisible: false,
  mode: 'particles',
} as const;

export const DEFAULT_TEMPERATURE = {
  enabled: true,
  globalTemperature: 15,
  seasonalIntensity: 0.5,
  latitudeInfluence: 1,
  dayNightInfluence: 0.35,
  variation: 0.35,
  opacity: 0.72,
  scaleMin: -40,
  scaleMax: 45,
  mode: 'heatmap',
} as const;

export const DEFAULT_PRESSURE = {
  enabled: false,
  intensity: 1,
  gradient: 0.65,
  fieldVisible: true,
  contoursVisible: true,
  contourCount: 6,
  scale: 1,
  regions: [
    { id: 'h1', label: 'Azores High', center: { latitude: 35, longitude: -28 }, strength: 1, radius: 28 },
    { id: 'l1', label: 'Icelandic Low', center: { latitude: 63, longitude: -22 }, strength: -1, radius: 24 },
  ],
} as const;

export const DEFAULT_CLOUDS = {
  enabled: true,
  density: 0.5,
  coverage: 0.52,
  height: 0.035,
  opacity: 0.65,
  size: 0.09,
  movementSpeed: 0.4,
  layerCount: 2,
} as const;

export const DEFAULT_PRECIPITATION = {
  enabled: false,
  density: 0.35,
  intensity: 0.5,
  speed: 1.4,
  particleSize: 0.008,
  regionRadius: 18,
  distribution: 'regional',
} as const;

export const DEFAULT_STORM = {
  enabled: false,
  center: { latitude: 18, longitude: -55 },
  intensity: 0.75,
  radius: 22,
  rotation: 1,
  movementDirection: 300,
  movementSpeed: 0.35,
  cloudDensity: 0.7,
  windIntensity: 0.85,
  rainIntensity: 0.65,
  trajectoryVisible: true,
} as const;

export const DEFAULT_OCEAN = {
  enabled: false,
  currentSpeed: 0.8,
  particleCount: 1800,
  particleSize: 0.01,
  streamlinesVisible: true,
  temperatureOverlay: true,
  temperature: 18,
} as const;

export const DEFAULT_CLIMATE = {
  enabled: false,
  dataset: 'temperature',
  season: 0,
  temperatureScale: 1,
  rainfallIntensity: 0.6,
  zonesVisible: true,
  comparisonMode: false,
} as const;

export const DEFAULT_ATMOSPHERE = {
  visible: true,
  layerId: 'troposphere',
  opacity: 0.55,
  height: 0.06,
  glow: 0.7,
  transitionSpeed: 1,
} as const;

export function createDefaultConfigurations(): SimulationConfigurations {
  return {
    wind: { ...DEFAULT_WIND, mode: 'particles' },
    temperature: { ...DEFAULT_TEMPERATURE, mode: 'heatmap' },
    pressure: {
      ...DEFAULT_PRESSURE,
      regions: DEFAULT_PRESSURE.regions.map((region) => ({ ...region, center: { ...region.center } })),
    },
    clouds: { ...DEFAULT_CLOUDS },
    precipitation: { ...DEFAULT_PRECIPITATION },
    storm: { ...DEFAULT_STORM, center: { ...DEFAULT_STORM.center } },
    ocean: { ...DEFAULT_OCEAN },
    climate: { ...DEFAULT_CLIMATE },
    atmosphere: { ...DEFAULT_ATMOSPHERE },
  };
}

export function createDefaultLayerState(): LayerState {
  const state = {} as LayerState;
  for (const id of LAYER_IDS) {
    state[id] = {
      visible: id === 'surface' || id === 'atmosphere' || id === 'grid' || id === 'wind' || id === 'temperature' || id === 'clouds',
      opacity: id === 'surface' ? 1 : 0.7,
      intensity: 1,
    };
  }
  return state;
}

export function createDefaultSettings(): AppSettings {
  return {
    theme: 'dark',
    reducedMotion: false,
    showTooltips: true,
    showGrid: true,
    defaultCamera: 'Global View',
    defaultModule: 'earth',
    autoRotate: false,
    sidebarCollapsed: false,
    rendering: {
      quality: 'balanced',
      particleScale: 1,
      animationQuality: 1,
      pixelRatioCap: 1.75,
      antialias: true,
      shadows: false,
    },
  };
}

export function isLayerId(value: string): value is LayerId {
  return (LAYER_IDS as readonly string[]).includes(value);
}