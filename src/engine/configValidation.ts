import { createDefaultConfigurations } from '@/data/defaults';
import type { SimulationConfigurations } from '@/types/config';

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(Math.max(numeric, min), max);
};

const bool = (value: unknown, fallback: boolean): boolean => typeof value === 'boolean' ? value : fallback;

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? value as T : fallback;

/** Normalize simulation configurations so invalid values cannot destabilize rendering. */
export function clampConfigurations(input: Partial<SimulationConfigurations>): SimulationConfigurations {
  const defaults = createDefaultConfigurations();
  const wind = input.wind ?? defaults.wind;
  const temperature = input.temperature ?? defaults.temperature;
  const pressure = input.pressure ?? defaults.pressure;
  const clouds = input.clouds ?? defaults.clouds;
  const precipitation = input.precipitation ?? defaults.precipitation;
  const storm = input.storm ?? defaults.storm;
  const ocean = input.ocean ?? defaults.ocean;
  const climate = input.climate ?? defaults.climate;
  const atmosphere = input.atmosphere ?? defaults.atmosphere;

  return {
    wind: {
      enabled: bool(wind.enabled, defaults.wind.enabled),
      speed: clamp(wind.speed, 0, 8, defaults.wind.speed),
      intensity: clamp(wind.intensity, 0, 2, defaults.wind.intensity),
      particleCount: Math.round(clamp(wind.particleCount, 100, 12000, defaults.wind.particleCount)),
      particleSize: clamp(wind.particleSize, 0.5, 8, defaults.wind.particleSize),
      trailLength: clamp(wind.trailLength, 1, 40, defaults.wind.trailLength),
      lifetime: clamp(wind.lifetime, 0.5, 30, defaults.wind.lifetime),
      acceleration: clamp(wind.acceleration, 0, 4, defaults.wind.acceleration),
      flowVisible: bool(wind.flowVisible, defaults.wind.flowVisible),
      vectorsVisible: bool(wind.vectorsVisible, defaults.wind.vectorsVisible),
      mode: oneOf(wind.mode, ['particles', 'streamlines', 'vectors', 'density', 'directional'] as const, defaults.wind.mode),
    },
    temperature: {
      enabled: bool(temperature.enabled, defaults.temperature.enabled),
      globalTemperature: clamp(temperature.globalTemperature, -60, 60, defaults.temperature.globalTemperature),
      seasonalIntensity: clamp(temperature.seasonalIntensity, 0, 2, defaults.temperature.seasonalIntensity),
      latitudeInfluence: clamp(temperature.latitudeInfluence, 0, 2, defaults.temperature.latitudeInfluence),
      dayNightInfluence: clamp(temperature.dayNightInfluence, 0, 2, defaults.temperature.dayNightInfluence),
      variation: clamp(temperature.variation, 0, 2, defaults.temperature.variation),
      opacity: clamp(temperature.opacity, 0, 1, defaults.temperature.opacity),
      scaleMin: clamp(temperature.scaleMin, -80, 30, defaults.temperature.scaleMin),
      scaleMax: clamp(temperature.scaleMax, 0, 80, defaults.temperature.scaleMax),
      mode: oneOf(temperature.mode, ['heatmap', 'bands', 'gradient'] as const, defaults.temperature.mode),
    },
    pressure: {
      enabled: bool(pressure.enabled, defaults.pressure.enabled),
      intensity: clamp(pressure.intensity, 0, 2, defaults.pressure.intensity),
      gradient: clamp(pressure.gradient, 0, 3, defaults.pressure.gradient),
      fieldVisible: bool(pressure.fieldVisible, defaults.pressure.fieldVisible),
      contoursVisible: bool(pressure.contoursVisible, defaults.pressure.contoursVisible),
      contourCount: Math.round(clamp(pressure.contourCount, 1, 24, defaults.pressure.contourCount)),
      scale: clamp(pressure.scale, 0.5, 3, defaults.pressure.scale),
      regions: Array.isArray(pressure.regions) ? pressure.regions.slice(0, 16) : defaults.pressure.regions,
    },
    clouds: {
      enabled: bool(clouds.enabled, defaults.clouds.enabled),
      density: clamp(clouds.density, 0, 1, defaults.clouds.density),
      coverage: clamp(clouds.coverage, 0, 1, defaults.clouds.coverage),
      height: clamp(clouds.height, 0.01, 0.4, defaults.clouds.height),
      opacity: clamp(clouds.opacity, 0, 1, defaults.clouds.opacity),
      size: clamp(clouds.size, 0.5, 12, defaults.clouds.size),
      movementSpeed: clamp(clouds.movementSpeed, 0, 4, defaults.clouds.movementSpeed),
      layerCount: Math.round(clamp(clouds.layerCount, 1, 8, defaults.clouds.layerCount)),
    },
    precipitation: {
      enabled: bool(precipitation.enabled, defaults.precipitation.enabled),
      density: clamp(precipitation.density, 0, 1, defaults.precipitation.density),
      intensity: clamp(precipitation.intensity, 0, 2, defaults.precipitation.intensity),
      speed: clamp(precipitation.speed, 0, 6, defaults.precipitation.speed),
      particleSize: clamp(precipitation.particleSize, 0.5, 8, defaults.precipitation.particleSize),
      regionRadius: clamp(precipitation.regionRadius, 1, 90, defaults.precipitation.regionRadius),
      distribution: oneOf(precipitation.distribution, ['global', 'regional'] as const, defaults.precipitation.distribution),
    },
    storm: {
      enabled: bool(storm.enabled, defaults.storm.enabled),
      center: {
        latitude: clamp(storm.center?.latitude, -90, 90, defaults.storm.center.latitude),
        longitude: clamp(storm.center?.longitude, -180, 180, defaults.storm.center.longitude),
      },
      intensity: clamp(storm.intensity, 0, 2, defaults.storm.intensity),
      radius: clamp(storm.radius, 1, 90, defaults.storm.radius),
      rotation: clamp(storm.rotation, -4, 4, defaults.storm.rotation),
      movementDirection: clamp(storm.movementDirection, -180, 180, defaults.storm.movementDirection),
      movementSpeed: clamp(storm.movementSpeed, 0, 6, defaults.storm.movementSpeed),
      cloudDensity: clamp(storm.cloudDensity, 0, 1, defaults.storm.cloudDensity),
      windIntensity: clamp(storm.windIntensity, 0, 2, defaults.storm.windIntensity),
      rainIntensity: clamp(storm.rainIntensity, 0, 2, defaults.storm.rainIntensity),
      trajectoryVisible: bool(storm.trajectoryVisible, defaults.storm.trajectoryVisible),
    },
    ocean: {
      enabled: bool(ocean.enabled, defaults.ocean.enabled),
      currentSpeed: clamp(ocean.currentSpeed, 0, 6, defaults.ocean.currentSpeed),
      particleCount: Math.round(clamp(ocean.particleCount, 100, 10000, defaults.ocean.particleCount)),
      particleSize: clamp(ocean.particleSize, 0.5, 8, defaults.ocean.particleSize),
      streamlinesVisible: bool(ocean.streamlinesVisible, defaults.ocean.streamlinesVisible),
      temperatureOverlay: bool(ocean.temperatureOverlay, defaults.ocean.temperatureOverlay),
      temperature: clamp(ocean.temperature, -5, 40, defaults.ocean.temperature),
    },
    climate: {
      enabled: bool(climate.enabled, defaults.climate.enabled),
      dataset: oneOf(climate.dataset, ['temperature', 'rainfall', 'zones', 'ocean'] as const, defaults.climate.dataset),
      season: clamp(climate.season, 0, 3.999, defaults.climate.season),
      temperatureScale: clamp(climate.temperatureScale, 0, 3, defaults.climate.temperatureScale),
      rainfallIntensity: clamp(climate.rainfallIntensity, 0, 2, defaults.climate.rainfallIntensity),
      zonesVisible: bool(climate.zonesVisible, defaults.climate.zonesVisible),
      comparisonMode: bool(climate.comparisonMode, defaults.climate.comparisonMode),
    },
    atmosphere: {
      visible: bool(atmosphere.visible, defaults.atmosphere.visible),
      layerId: typeof atmosphere.layerId === 'string' ? atmosphere.layerId : defaults.atmosphere.layerId,
      opacity: clamp(atmosphere.opacity, 0, 1, defaults.atmosphere.opacity),
      height: clamp(atmosphere.height, 0.01, 0.6, defaults.atmosphere.height),
      glow: clamp(atmosphere.glow, 0, 2, defaults.atmosphere.glow),
      transitionSpeed: clamp(atmosphere.transitionSpeed, 0, 4, defaults.atmosphere.transitionSpeed),
    },
  };
}
