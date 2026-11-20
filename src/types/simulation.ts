/** Identifiers for the simulation modules exposed in the navigation. */
export type SimulationModuleId =
  | 'earth'
  | 'atmosphere'
  | 'wind'
  | 'temperature'
  | 'pressure'
  | 'clouds'
  | 'precipitation'
  | 'storm'
  | 'ocean'
  | 'climate';

/** Identifiers for independently toggleable visualization layers. */
export type LayerId =
  | 'surface'
  | 'atmosphere'
  | 'grid'
  | 'wind'
  | 'temperature'
  | 'pressure'
  | 'clouds'
  | 'precipitation'
  | 'storm'
  | 'ocean'
  | 'climate';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'error';
export type PlaybackDirection = 1 | -1;
export type QualityMode = 'low' | 'balanced' | 'high';
export type WindVisualizationMode = 'particles' | 'streamlines' | 'vectors' | 'density' | 'directional';
export type TemperatureVisualizationMode = 'heatmap' | 'bands' | 'gradient';

/** Mutable clock state shared between the engine and UI. */
export interface SimulationClockState {
  elapsed: number;
  speed: number;
  direction: PlaybackDirection;
  status: SimulationStatus;
  frame: number;
  delta: number;
  timeline: number;
}

/** Per-frame context passed to every registered simulation module. */
export interface SimulationContext {
  time: number;
  delta: number;
  speed: number;
  direction: PlaybackDirection;
  frame: number;
  timeline: number;
}

export interface LayerConfig {
  visible: boolean;
  opacity: number;
  intensity: number;
}

export type LayerState = Record<LayerId, LayerConfig>;

/** A generic simulated module with a deterministic update step. */
export interface SimulationModule<TConfig = unknown> {
  readonly id: SimulationModuleId;
  readonly name: string;
  config: TConfig;
  update(context: SimulationContext): void;
  reset(): void;
  dispose(): void;
}

/** A numeric sample of a field at a geographic position. */
export interface FieldSample {
  value: number;
  latitude: number;
  longitude: number;
}

export interface SimulationError {
  module: SimulationModuleId;
  message: string;
  at: number;
}

/** Lightweight engine health summary for diagnostics overlays. */
export interface EngineDiagnostics {
  registeredModules: number;
  activeModules: number;
  errors: number;
  latestError: SimulationError | null;
  running: boolean;
}

export const MODULE_IDS: readonly SimulationModuleId[] = [
  'earth',
  'atmosphere',
  'wind',
  'temperature',
  'pressure',
  'clouds',
  'precipitation',
  'storm',
  'ocean',
  'climate',
] as const;

export const LAYER_IDS: readonly LayerId[] = [
  'surface',
  'atmosphere',
  'grid',
  'wind',
  'temperature',
  'pressure',
  'clouds',
  'precipitation',
  'storm',
  'ocean',
  'climate',
] as const;