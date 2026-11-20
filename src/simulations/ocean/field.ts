import { DEG_TO_RAD, clamp, geoToCartesian } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';
import type { VectorField, ScalarField } from '@/engine/fields';
import type { OceanConfig } from '@/types/config';

export interface OceanSample {
  u: number;
  v: number;
  speed: number;
  temperature: number;
}

/** Simplified subtropical gyre circulation. */
export function gyreFlow(latitude: number, longitude: number): { u: number; v: number } {
  const lat = latitude * DEG_TO_RAD;
  const lon = longitude * DEG_TO_RAD;
  const u = -Math.sin(lat * 2) * 0.8 + Math.cos(lon * 2) * 0.25;
  const v = Math.cos(lat) * Math.sin(lon * 2) * 0.6;
  return { u, v };
}

/** Equatorial current and counter-current bands. */
export function equatorialCurrent(latitude: number): number {
  const eastward = Math.exp(-((latitude / 4) ** 2)) * 1.2;
  const counter = Math.exp(-((((Math.abs(latitude) - 8) / 3) ** 2))) * -0.5;
  return eastward + counter;
}

/** Ocean vector field with gyres, equatorial bands and noise. */
export function createOceanField(config: OceanConfig): VectorField & { sampleOcean: (lat: number, lon: number, time?: number) => OceanSample } {
  const sampleOcean = (latitude: number, longitude: number, time = 0): OceanSample => {
    const gyre = gyreFlow(latitude, longitude);
    const equatorial = equatorialCurrent(latitude);
    const point = geoToCartesian(latitude, longitude);
    const noise = fbm3D(point.x * 2.8, point.y * 2.8, point.z * 2.8 + time * 0.001, 3, 881);
    const u = (gyre.u + equatorial + noise * 0.35) * config.currentSpeed;
    const v = (gyre.v + noise * 0.2) * config.currentSpeed;
    const latitudeTemperature = clamp(config.temperature - Math.abs(latitude) * 0.42, -2, 32);
    const variation = noise * 2.4;
    return { u, v, speed: Math.hypot(u, v), temperature: latitudeTemperature + variation };
  };
  return {
    id: 'ocean',
    sample: (latitude, longitude, time) => {
      const { u, v } = sampleOcean(latitude, longitude, time);
      return { u, v };
    },
    sampleOcean,
  };
}

/** Sea-surface temperature field derived from the ocean model. */
export function createOceanTemperatureField(config: OceanConfig): ScalarField {
  const field = createOceanField(config);
  return { id: 'ocean-temperature', sample: (lat, lon, time) => field.sampleOcean(lat, lon, time).temperature };
}

/** Trace an ocean current streamline from a seed point. */
export function traceOceanStreamline(
  field: VectorField,
  latitude: number,
  longitude: number,
  steps = 40,
  stepSize = 1.5,
): Array<{ latitude: number; longitude: number }> {
  const path = [{ latitude, longitude }];
  let lat = latitude;
  let lon = longitude;
  for (let i = 0; i < steps; i += 1) {
    const { u, v } = field.sample(lat, lon);
    const speed = Math.hypot(u, v);
    if (speed < 0.001) break;
    lat += (v / speed) * stepSize;
    lon += (u / (speed * Math.max(0.25, Math.cos(lat * DEG_TO_RAD)))) * stepSize;
    if (Math.abs(lat) > 88) break;
    path.push({ latitude: lat, longitude: ((lon + 180) % 360 + 360) % 360 - 180 });
  }
  return path;
}