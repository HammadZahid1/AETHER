import type { GeoCoordinates } from '@/types/geo';
import type { QualityMode, WindVisualizationMode, TemperatureVisualizationMode } from '@/types/simulation';

export interface PressureRegion {
  id: string;
  label: string;
  center: GeoCoordinates;
  /** Positive for a high, negative for a low. */
  strength: number;
  radius: number;
}

export interface WindConfig {
  enabled: boolean;
  speed: number;
  intensity: number;
  particleCount: number;
  particleSize: number;
  trailLength: number;
  lifetime: number;
  acceleration: number;
  flowVisible: boolean;
  vectorsVisible: boolean;
  mode: WindVisualizationMode;
}

export interface TemperatureConfig {
  enabled: boolean;
  globalTemperature: number;
  seasonalIntensity: number;
  latitudeInfluence: number;
  dayNightInfluence: number;
  variation: number;
  opacity: number;
  scaleMin: number;
  scaleMax: number;
  mode: TemperatureVisualizationMode;
}

export interface PressureConfig {
  enabled: boolean;
  intensity: number;
  gradient: number;
  fieldVisible: boolean;
  contoursVisible: boolean;
  contourCount: number;
  scale: number;
  regions: PressureRegion[];
}

export interface CloudConfig {
  enabled: boolean;
  density: number;
  coverage: number;
  height: number;
  opacity: number;
  size: number;
  movementSpeed: number;
  layerCount: number;
}

export interface PrecipitationConfig {
  enabled: boolean;
  density: number;
  intensity: number;
  speed: number;
  particleSize: number;
  regionRadius: number;
  distribution: 'global' | 'regional';
}

export interface StormConfig {
  enabled: boolean;
  center: GeoCoordinates;
  intensity: number;
  radius: number;
  rotation: number;
  movementDirection: number;
  movementSpeed: number;
  cloudDensity: number;
  windIntensity: number;
  rainIntensity: number;
  trajectoryVisible: boolean;
}

export interface OceanConfig {
  enabled: boolean;
  currentSpeed: number;
  particleCount: number;
  particleSize: number;
  streamlinesVisible: boolean;
  temperatureOverlay: boolean;
  temperature: number;
}

export type ClimateDatasetId = 'temperature' | 'rainfall' | 'zones' | 'ocean';

export interface ClimateConfig {
  enabled: boolean;
  dataset: ClimateDatasetId;
  season: number;
  temperatureScale: number;
  rainfallIntensity: number;
  zonesVisible: boolean;
  comparisonMode: boolean;
}

export interface AtmosphereConfig {
  visible: boolean;
  layerId: string;
  opacity: number;
  height: number;
  glow: number;
  transitionSpeed: number;
}

export interface SimulationConfigurations {
  wind: WindConfig;
  temperature: TemperatureConfig;
  pressure: PressureConfig;
  clouds: CloudConfig;
  precipitation: PrecipitationConfig;
  storm: StormConfig;
  ocean: OceanConfig;
  climate: ClimateConfig;
  atmosphere: AtmosphereConfig;
}

export interface RenderingConfig {
  quality: QualityMode;
  particleScale: number;
  animationQuality: number;
  pixelRatioCap: number;
  antialias: boolean;
  shadows: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'midnight' | 'slate';
  reducedMotion: boolean;
  showTooltips: boolean;
  showGrid: boolean;
  defaultCamera: string;
  defaultModule: string;
  autoRotate: boolean;
  sidebarCollapsed: boolean;
  rendering: RenderingConfig;
}