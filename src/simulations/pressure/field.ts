import { DEG_TO_RAD, clamp, geoToCartesian, normalizeLongitude } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';
import type { ScalarField } from '@/engine/fields';
import type { PressureConfig, PressureRegion } from '@/types/config';

/** Reference sea-level pressure in hectopascals. */
export const REFERENCE_PRESSURE_HPA = 1013;

/** Angular separation between two coordinates in degrees. */
export function angularDistance(
  latA: number, lonA: number,
  latB: number, lonB: number,
): number {
  const a = geoToCartesian(latA, lonA);
  const b = geoToCartesian(latB, lonB);
  const dot = clamp(a.x * b.x + a.y * b.y + a.z * b.z, -1, 1);
  return Math.acos(dot) / DEG_TO_RAD;
}

/** Contribution of a single pressure region at a location. */
export function regionContribution(region: PressureRegion, latitude: number, longitude: number, time: number): number {
  const centerLon = region.center.longitude + Math.sin(time * 0.00002) * region.radius * 0.1;
  const distance = angularDistance(latitude, longitude, region.center.latitude, centerLon);
  const spread = Math.max(1, region.radius);
  const profile = Math.exp(-((distance / spread) ** 2));
  const wobble = 1 + 0.12 * Math.sin(time * 0.00005 + distance * 0.2);
  return region.strength * 26 * profile * wobble;
}

/** Global background pressure pattern (subtropical highs, subpolar lows). */
export function backgroundPressure(latitude: number, longitude: number, time: number): number {
  const absLat = Math.abs(latitude);
  const subtropical = 7 * Math.exp(-(((absLat - 30) / 12) ** 2));
  const subpolar = -9 * Math.exp(-(((absLat - 60) / 12) ** 2));
  const point = geoToCartesian(latitude, longitude);
  const noise = fbm3D(point.x * 2.1, point.y * 2.1, point.z * 2.1 + time * 0.002, 3, 37) * 4;
  return subtropical + subpolar + noise;
}

/** Build the sea-level pressure field in hectopascals. */
export function createPressureField(config: PressureConfig): ScalarField {
  return {
    id: 'pressure',
    sample: (latitude, longitude, time = 0) => {
      const regions = config.regions.reduce(
        (sum, region) => sum + regionContribution(region, latitude, normalizeLongitude(longitude), time),
        0,
      );
      return REFERENCE_PRESSURE_HPA + config.intensity * (regions + backgroundPressure(latitude, longitude, time));
    },
  };
}

/** Classify a pressure reading into a synoptic category. */
export function pressureCategory(value: number): string {
  if (value >= 1025) return 'Strong high';
  if (value >= 1015) return 'High';
  if (value >= 1005) return 'Normal';
  if (value >= 990) return 'Low';
  return 'Deep low';
}