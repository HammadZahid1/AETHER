import type { IconName } from '@/components/ui/Icon';
import type { SimulationModuleId } from '@/types/simulation';

export interface ModuleMeta {
  id: SimulationModuleId;
  label: string;
  shortLabel: string;
  icon: IconName;
  group: 'explore' | 'atmosphere' | 'surface' | 'advanced';
  description: string;
  explainer: string;
  units: string[];
}

export const MODULES: readonly ModuleMeta[] = [
  {
    id: 'earth', label: 'Earth Explorer', shortLabel: 'Earth', icon: 'globe', group: 'explore',
    description: 'Inspect the globe, rotate the camera and select geographic coordinates.',
    explainer: 'The globe uses a unit-sphere coordinate model. Select any surface point to inspect simulated conditions from the active modules.',
    units: ['° latitude', '° longitude', 'km'],
  },
  {
    id: 'atmosphere', label: 'Atmosphere', shortLabel: 'Atmos', icon: 'layers', group: 'atmosphere',
    description: 'Explore atmospheric shells from the troposphere to the exosphere.',
    explainer: 'Atmospheric layers are represented as scaled shells. Their heights are exaggerated so the structure is visible at planetary scale.',
    units: ['km altitude', 'relative opacity'],
  },
  {
    id: 'wind', label: 'Wind Lab', shortLabel: 'Wind', icon: 'wind', group: 'atmosphere',
    description: 'Animate a simplified global wind field with particle and streamline views.',
    explainer: 'Wind combines latitude circulation bands, deterministic noise and pressure deflection. It is illustrative, not a forecast model.',
    units: ['m/s (simulated)', 'degrees'],
  },
  {
    id: 'temperature', label: 'Temperature Lab', shortLabel: 'Thermal', icon: 'temperature', group: 'atmosphere',
    description: 'Visualize a simulated surface temperature field and its components.',
    explainer: 'Temperature combines latitude, seasonal phase, day-night forcing and deterministic regional variation.',
    units: ['°C', 'relative gradient'],
  },
  {
    id: 'pressure', label: 'Pressure Systems', shortLabel: 'Pressure', icon: 'pressure', group: 'atmosphere',
    description: 'Configure simulated highs, lows, pressure contours and gradients.',
    explainer: 'The pressure field is a sum of adjustable Gaussian centers over a zonal background pattern, expressed in hectopascals.',
    units: ['hPa', 'degrees'],
  },
  {
    id: 'clouds', label: 'Cloud Laboratory', shortLabel: 'Clouds', icon: 'cloud', group: 'atmosphere',
    description: 'Shape procedural cloud layers with density and altitude controls.',
    explainer: 'Cloud cover is generated with layered fractal noise and thresholded by coverage. No external imagery is used.',
    units: ['relative density', 'shell altitude'],
  },
  {
    id: 'precipitation', label: 'Precipitation Lab', shortLabel: 'Rain', icon: 'rain', group: 'atmosphere',
    description: 'Simulate localized or global rainfall with falling particle drops.',
    explainer: 'Precipitation intensity is sampled from a regional noise field and controls the density and opacity of falling drops.',
    units: ['relative intensity', 'mm/month (illustrative)'],
  },
  {
    id: 'storm', label: 'Storm Lab', shortLabel: 'Storm', icon: 'storm', group: 'advanced',
    description: 'Create and observe an illustrative rotating storm system on the globe.',
    explainer: 'The storm model combines a moving center, spiral tangential flow, radial inflow, a low-pressure core, cloud bands and rain.',
    units: ['hPa', 'degrees', 'relative intensity'],
  },
  {
    id: 'ocean', label: 'Ocean Explorer', shortLabel: 'Ocean', icon: 'ocean', group: 'surface',
    description: 'Explore simplified ocean gyres, equatorial currents and sea temperature.',
    explainer: 'Ocean flow combines subtropical gyres, equatorial current bands and deterministic noise on the sphere.',
    units: ['relative speed', '°C'],
  },
  {
    id: 'climate', label: 'Climate Lab', shortLabel: 'Climate', icon: 'climate', group: 'surface',
    description: 'Compare bundled illustrative climate datasets across seasons.',
    explainer: 'Climate datasets are deterministic teaching patterns generated in the browser. They are not observational data.',
    units: ['°C', 'mm/month', 'zone index'],
  },
];

export const MODULE_MAP = Object.fromEntries(MODULES.map((module) => [module.id, module])) as Record<SimulationModuleId, ModuleMeta>;

export const MODULE_GROUPS: Record<ModuleMeta['group'], string> = {
  explore: 'Explore',
  atmosphere: 'Atmosphere',
  surface: 'Surface & Climate',
  advanced: 'Advanced',
};

export function moduleLabel(id: SimulationModuleId): string {
  return MODULE_MAP[id]?.label ?? id;
}