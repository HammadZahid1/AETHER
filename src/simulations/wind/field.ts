import { DEG_TO_RAD, clamp, normalizeLatitude } from '@/engine/coordinates';
import { fbm3D, valueNoise3D } from '@/engine/noise';
import { geoToCartesian } from '@/engine/coordinates';
import type { WindConfig } from '@/types/config';
import type { VectorField } from '@/engine/fields';

export interface WindSample {
  /** Eastward component in arbitrary simulated metres per second. */
  u: number;
  /** Northward component in arbitrary simulated metres per second. */
  v: number;
  speed: number;
  /** Direction in degrees clockwise from north. */
  direction: number;
}

/** Sample a pressure-like auxiliary field, injected to avoid module coupling. */
export type PressureSampler = (latitude: number, longitude: number, time?: number) => number;

/** Smooth global circulation band based on latitude. */
export function circulationBands(latitude: number): { u: number; v: number } {
  const lat = normalizeLatitude(latitude);
  const absLat = Math.abs(lat);
  const sign = lat >= 0 ? 1 : -1;
  let u: number;
  if (absLat < 30) {
    u = -7 * Math.cos((absLat / 30) * Math.PI * 0.5);
  } else if (absLat < 60) {
    u = 9 * Math.sin(((absLat - 30) / 30) * Math.PI * 0.5);
  } else {
    u = -5 * Math.cos(((absLat - 60) / 30) * Math.PI * 0.5);
  }
  const v = sign * 0.6 * Math.sin(absLat * DEG_TO_RAD * 2);
  return { u, v };
}

/** Deterministic local variability sampled on the sphere. */
export function windNoise(latitude: number, longitude: number, time: number, seed = 11): { u: number; v: number } {
  const point = geoToCartesian(latitude, longitude);
  const drift = time * 0.015;
  const scale = 2.4;
  const u = fbm3D(point.x * scale + drift, point.y * scale, point.z * scale, 3, seed);
  const v = fbm3D(point.x * scale, point.y * scale + drift, point.z * scale, 3, seed + 101);
  return { u: u * 5.5, v: v * 5.5 };
}

/** Geostrophic-inspired deflection from a pressure gradient. */
export function pressureDeflection(
  latitude: number,
  longitude: number,
  sampler: PressureSampler,
  time: number,
): { u: number; v: number } {
  const step = 1.5;
  const dLat = (sampler(latitude + step, longitude, time) - sampler(latitude - step, longitude, time)) / (2 * step);
  const dLon = (sampler(latitude, longitude + step, time) - sampler(latitude, longitude - step, time)) / (2 * step);
  const coriolis = clamp(Math.abs(latitude) / 30, 0.2, 1) * (latitude >= 0 ? 1 : -1);
  return {
    u: -dLat * coriolis * 3,
    v: dLon * coriolis * 3,
  };
}

/** Build a reusable vector field from a wind configuration. */
export function createWindField(config: WindConfig, pressure?: PressureSampler): VectorField & { sampleWind: (lat: number, lon: number, time?: number) => WindSample } {
  const sampleWind = (latitude: number, longitude: number, time = 0): WindSample => {
    const base = circulationBands(latitude);
    const noise = windNoise(latitude, longitude, time);
    const flow = pressure ? pressureDeflection(latitude, longitude, pressure, time) : { u: 0, v: 0 };
    const intensity = config.intensity;
    const u = (base.u + noise.u * intensity + flow.u * intensity) * config.speed;
    const v = (base.v + noise.v * intensity + flow.v * intensity) * config.speed;
    const speed = Math.hypot(u, v);
    const direction = (Math.atan2(u, v) / DEG_TO_RAD + 360) % 360;
    return { u, v, speed, direction };
  };

  return {
    id: 'wind',
    sample: (latitude, longitude, time) => {
      const { u, v } = sampleWind(latitude, longitude, time);
      return { u, v };
    },
    sampleWind,
  };
}

/** Stable jet-stream band used for wind field presets. */
export function jetStreamBoost(latitude: number, longitude: number, time: number): number {
  const north = Math.exp(-((latitude - 45) / 9) ** 2);
  const south = Math.exp(-((latitude + 45) / 9) ** 2);
  const wobble = valueNoise3D(longitude * DEG_TO_RAD * 2, time * 0.02, 0.5, 7) * 0.35 + 1;
  return (north + south) * wobble;
}