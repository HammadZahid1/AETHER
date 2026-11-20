import { createLayerPreset } from '@/engine/layers';
import type { SimulationModuleId } from '@/types/simulation';

export interface LayerPresetDefinition {
  id: string;
  name: string;
  description: string;
  module: SimulationModuleId;
  preset: ReturnType<typeof createLayerPreset>;
}

const definitions: readonly [string, string, string, SimulationModuleId, string[]][] = [
  ['earth-overview', 'Earth Overview', 'Surface, grid and atmospheric context with light cloud cover.', 'earth', ['surface', 'atmosphere', 'grid', 'clouds']],
  ['atmospheric-flow', 'Atmospheric Flow', 'Wind particles above a dimmed surface with grid reference.', 'wind', ['surface', 'grid', 'wind', 'atmosphere']],
  ['temperature-explorer', 'Temperature Explorer', 'Thermal field with geographic grid and atmosphere.', 'temperature', ['surface', 'temperature', 'grid', 'atmosphere']],
  ['pressure-systems', 'Pressure Systems', 'Pressure field and contours with wind context.', 'pressure', ['surface', 'pressure', 'wind', 'grid']],
  ['storm-visualization', 'Storm Visualization', 'Storm particles, clouds and precipitation layers.', 'storm', ['surface', 'storm', 'clouds', 'precipitation', 'wind', 'grid']],
  ['ocean-currents', 'Ocean Currents', 'Surface current flow with temperature overlay.', 'ocean', ['surface', 'ocean', 'grid']],
  ['climate-view', 'Climate View', 'Climate zones with temperature and rainfall context.', 'climate', ['surface', 'climate', 'temperature', 'grid']],
  ['clean-globe', 'Clean Globe', 'Surface only, with no overlays.', 'earth', ['surface']],
];

export const LAYER_PRESETS: readonly LayerPresetDefinition[] = definitions.map(
  ([id, name, description, module, layers]) => ({
    id,
    name,
    description,
    module,
    preset: createLayerPreset(id, name, description, layers as never[]),
  }),
);