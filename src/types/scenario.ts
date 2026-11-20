import type { GeoCoordinates } from '@/types/geo';
import type { LayerId, SimulationModuleId } from '@/types/simulation';
import type { SimulationConfigurations } from '@/types/config';

/** A named camera preset referencing a target coordinate and distance. */
export interface CameraPreset {
  name: string;
  target: GeoCoordinates;
  distance: number;
}

/** A complete, reproducible simulation setup. */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'circulation' | 'thermal' | 'atmospheric' | 'marine' | 'climate' | 'extreme';
  module: SimulationModuleId;
  layers: LayerId[];
  camera: CameraPreset;
  time: number;
  speed: number;
  configurations: Partial<SimulationConfigurations>;
}

/** A user-authored saved configuration stored locally. */
export interface SavedConfiguration {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  scenario: Scenario;
}