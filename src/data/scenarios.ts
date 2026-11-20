import { DEFAULT_ATMOSPHERE, DEFAULT_CLOUDS, DEFAULT_CLIMATE, DEFAULT_OCEAN, DEFAULT_PRECIPITATION, DEFAULT_PRESSURE, DEFAULT_STORM, DEFAULT_TEMPERATURE, DEFAULT_WIND } from '@/data/defaults';
import type { Scenario } from '@/types/scenario';

const base = {
  wind: DEFAULT_WIND,
  temperature: DEFAULT_TEMPERATURE,
  pressure: DEFAULT_PRESSURE,
  clouds: DEFAULT_CLOUDS,
  precipitation: DEFAULT_PRECIPITATION,
  storm: DEFAULT_STORM,
  ocean: DEFAULT_OCEAN,
  climate: DEFAULT_CLIMATE,
  atmosphere: DEFAULT_ATMOSPHERE,
};

function scenario(
  id: string,
  name: string,
  description: string,
  category: Scenario['category'],
  module: Scenario['module'],
  layers: Scenario['layers'],
  target: { latitude: number; longitude: number },
  distance: number,
  configurations: Scenario['configurations'],
  speed = 1,
): Scenario {
  return {
    id,
    name,
    description,
    category,
    module,
    layers,
    camera: { name: `${name} view`, target, distance },
    time: 0,
    speed,
    configurations: { ...base, ...configurations },
  };
}

export const SCENARIOS: readonly Scenario[] = [
  scenario('global-wind', 'Global Wind Circulation', 'Trade winds, westerlies and polar easterlies visualized as animated particle flow.', 'circulation', 'wind',
    ['surface', 'grid', 'wind', 'atmosphere'], { latitude: 12, longitude: -25 }, 2.8,
    { wind: { ...DEFAULT_WIND, enabled: true, mode: 'particles', intensity: 0.8 }, temperature: { ...DEFAULT_TEMPERATURE, enabled: false }, clouds: { ...DEFAULT_CLOUDS, enabled: false } }),
  scenario('equatorial-wind', 'Equatorial Wind Belt', 'Close inspection of the tropical easterly flow and its deterministic variability.', 'circulation', 'wind',
    ['surface', 'wind', 'grid'], { latitude: 0, longitude: -40 }, 2.1,
    { wind: { ...DEFAULT_WIND, speed: 1.6, particleCount: 4200, intensity: 0.9 }, clouds: { ...DEFAULT_CLOUDS, enabled: false } }),
  scenario('equatorial-temperature', 'Equatorial Temperature', 'Thermal distribution across low latitudes with seasonal and diurnal terms.', 'thermal', 'temperature',
    ['surface', 'temperature', 'grid'], { latitude: 0, longitude: 20 }, 2.3,
    { temperature: { ...DEFAULT_TEMPERATURE, globalTemperature: 22, latitudeInfluence: 0.9 }, wind: { ...DEFAULT_WIND, enabled: false } }),
  scenario('polar-temperature', 'Polar Temperature', 'Cold polar thermal field with amplified seasonal variation.', 'thermal', 'temperature',
    ['surface', 'temperature', 'grid', 'atmosphere'], { latitude: 78, longitude: 0 }, 2.2,
    { temperature: { ...DEFAULT_TEMPERATURE, seasonalIntensity: 1, dayNightInfluence: 0.6 } }),
  scenario('pressure-systems', 'Atmospheric Pressure', 'Simulated high- and low-pressure centers with contour lines and coupled wind.', 'atmospheric', 'pressure',
    ['surface', 'pressure', 'wind', 'grid'], { latitude: 40, longitude: -30 }, 2.6,
    { pressure: { ...DEFAULT_PRESSURE, enabled: true, contoursVisible: true }, wind: { ...DEFAULT_WIND, intensity: 0.7 } }),
  scenario('cloud-formation', 'Cloud Formation', 'Layered procedural cloud cover with density and altitude controls.', 'atmospheric', 'clouds',
    ['surface', 'clouds', 'atmosphere', 'grid'], { latitude: 25, longitude: -60 }, 2.5,
    { clouds: { ...DEFAULT_CLOUDS, enabled: true, density: 0.8, coverage: 0.68, layerCount: 3 } }),
  scenario('storm-simulation', 'Storm Simulation', 'Illustrative tropical cyclone with spiral flow, pressure core, rain and track.', 'extreme', 'storm',
    ['surface', 'storm', 'clouds', 'precipitation', 'wind', 'grid'], { latitude: 18, longitude: -55 }, 2.4,
    { storm: { ...DEFAULT_STORM, enabled: true, intensity: 0.9, radius: 26 }, precipitation: { ...DEFAULT_PRECIPITATION, enabled: true }, clouds: { ...DEFAULT_CLOUDS, enabled: true, density: 0.85 } }, 1.5),
  scenario('ocean-currents', 'Ocean Currents', 'Simplified gyres and equatorial currents with a sea-surface temperature overlay.', 'marine', 'ocean',
    ['surface', 'ocean', 'grid'], { latitude: 10, longitude: -100 }, 2.6,
    { ocean: { ...DEFAULT_OCEAN, enabled: true, particleCount: 2400 }, wind: { ...DEFAULT_WIND, enabled: false } }),
  scenario('seasonal-climate', 'Seasonal Climate', 'Illustrative temperature dataset cycling through seasonal states.', 'climate', 'climate',
    ['surface', 'climate', 'grid'], { latitude: 20, longitude: 0 }, 2.7,
    { climate: { ...DEFAULT_CLIMATE, enabled: true, dataset: 'temperature' } }),
  scenario('atmospheric-layers', 'Atmospheric Layers', 'Inspect the layered atmosphere with orbital camera framing.', 'atmospheric', 'atmosphere',
    ['surface', 'atmosphere', 'grid'], { latitude: 0, longitude: 0 }, 3.4,
    { atmosphere: { ...DEFAULT_ATMOSPHERE, visible: true, glow: 0.9 } }),
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenarioItem) => scenarioItem.id === id);
}

export function scenariosByCategory(category: Scenario['category']): Scenario[] {
  return SCENARIOS.filter((scenarioItem) => scenarioItem.category === category);
}