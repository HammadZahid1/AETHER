import { SimulationEngine } from '@/engine/engine';
import { ClimateSimulation } from '@/simulations/climate/ClimateSimulation';
import { CloudSimulation } from '@/simulations/clouds/CloudSimulation';
import { OceanSimulation } from '@/simulations/ocean/OceanSimulation';
import { PressureSimulation } from '@/simulations/pressure/PressureSimulation';
import { PrecipitationSimulation } from '@/simulations/precipitation/PrecipitationSimulation';
import { StormSimulation } from '@/simulations/storm/StormSimulation';
import { TemperatureSimulation } from '@/simulations/temperature/TemperatureSimulation';
import { WindSimulation } from '@/simulations/wind/WindSimulation';
import type { SimulationConfigurations } from '@/types/config';
import type { SimulationModule } from '@/types/simulation';
/** All stateful simulations that produce renderer-consumable output. */
export interface SimulationModules {
  wind: WindSimulation;
  temperature: TemperatureSimulation;
  pressure: PressureSimulation;
  clouds: CloudSimulation;
  precipitation: PrecipitationSimulation;
  storm: StormSimulation;
  ocean: OceanSimulation;
  climate: ClimateSimulation;
}

export type SimulationBundleId = keyof SimulationModules;

export const SIMULATION_MODULE_IDS: readonly SimulationBundleId[] = [
  'wind', 'temperature', 'pressure', 'clouds', 'precipitation', 'storm', 'ocean', 'climate',
];

let current: SimulationModules | null = null;

/** Create simulations once and register them with an engine. */
export function registerSimulationModules(
  engine: SimulationEngine,
  configurations: SimulationConfigurations,
): SimulationModules {
  if (current) return current;

  const pressure = new PressureSimulation(configurations.pressure);
  const storm = new StormSimulation(configurations.storm);
  const wind = new WindSimulation(configurations.wind, pressure.sampler());
  const temperature = new TemperatureSimulation(configurations.temperature);
  const clouds = new CloudSimulation(configurations.clouds);
  const precipitation = new PrecipitationSimulation(configurations.precipitation);
  const ocean = new OceanSimulation(configurations.ocean);
  const climate = new ClimateSimulation(configurations.climate);

  current = { wind, temperature, pressure, clouds, precipitation, storm, ocean, climate };
  for (const id of SIMULATION_MODULE_IDS) {
    engine.register(current[id] as SimulationModule<unknown>);
    engine.activate(id);
  }

  pressure.rasterize(0);
  pressure.generateContours(0);
  temperature.rasterize(0);
  ocean.rasterize();
  climate.rasterize(configurations.climate.season);
  return current;
}

/** Return the singleton module bundle, if it has been registered. */
export function getSimulationModules(): SimulationModules | null {
  return current;
}

/** Push updated panel configuration into every simulation instance. */
export function syncSimulationConfigurations(configurations: SimulationConfigurations): void {
  if (!current) return;
  current.wind.setConfig(configurations.wind);
  current.temperature.setConfig(configurations.temperature);
  current.pressure.setConfig(configurations.pressure);
  current.clouds.setConfig(configurations.clouds);
  current.precipitation.setConfig(configurations.precipitation);
  current.storm.setConfig(configurations.storm);
  current.ocean.setConfig(configurations.ocean);
  current.climate.setConfig(configurations.climate);
  current.wind.setPressureSampler(current.pressure.sampler());
}

/** Reset all simulations without replacing their instances. */
export function resetSimulationModules(): void {
  if (!current) return;
  for (const id of SIMULATION_MODULE_IDS) current[id].reset();
}

/** Release singleton references during application teardown. */
export function disposeSimulationModules(): void {
  current = null;
}
