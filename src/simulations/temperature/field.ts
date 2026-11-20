import { DEG_TO_RAD, normalizeLatitude, geoToCartesian, clamp } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';
import type { ScalarField } from '@/engine/fields';
import type { TemperatureConfig } from '@/types/config';

/** Position of the subsolar longitude for a simulated time in seconds. */
export function subsolarLongitude(time: number): number {
  return ((time * 0.004 + 180) % 360 + 360) % 360 - 180;
}

/** Solar declination in degrees for a simulated time in seconds. */
export function solarDeclination(time: number): number {
  return 23.44 * Math.sin(time * 0.000017);
}

/** Baseline latitude-driven temperature in Celsius. */
export function latitudeTemperature(latitude: number, globalTemperature: number, influence: number): number {
  const lat = Math.abs(normalizeLatitude(latitude)) / 90;
  return globalTemperature - influence * 48 * lat ** 1.35;
}

/** Build a deterministic simulated temperature field in Celsius. */
export function createTemperatureField(config: TemperatureConfig): ScalarField & {
  sampleDetailed: (latitude: number, longitude: number, time?: number) => {
    temperature: number; base: number; seasonal: number; dayNight: number; local: number;
  };
} {
  const sampleDetailed = (latitude: number, longitude: number, time = 0) => {
    const lat = normalizeLatitude(latitude);
    const base = latitudeTemperature(lat, config.globalTemperature, config.latitudeInfluence);
    const declination = solarDeclination(time) * DEG_TO_RAD;
    const seasonal =
      config.seasonalIntensity * 16 *
      Math.sin(declination) * Math.sign(lat || 1) * Math.abs(lat) / 90;
    const sunLon = subsolarLongitude(time) * DEG_TO_RAD;
    const dayNight =
      config.dayNightInfluence * 9 *
      Math.cos((longitude * DEG_TO_RAD) - sunLon) * Math.cos(lat * DEG_TO_RAD);
    const point = geoToCartesian(lat, longitude);
    const local = config.variation * 11 * fbm3D(point.x * 3.2, point.y * 3.2, point.z * 3.2, 4, 71);
    const temperature = clamp(base + seasonal + dayNight + local, -90, 60);
    return { temperature, base, seasonal, dayNight, local };
  };

  return {
    id: 'temperature',
    sample: (latitude, longitude, time) => sampleDetailed(latitude, longitude, time).temperature,
    sampleDetailed,
  };
}

/** Classify a temperature into a broad climate band. */
export function temperatureBand(temperature: number): string {
  if (temperature >= 30) return 'Tropical';
  if (temperature >= 20) return 'Subtropical';
  if (temperature >= 10) return 'Temperate';
  if (temperature >= 0) return 'Cool';
  if (temperature >= -20) return 'Polar';
  return 'Extreme polar';
}