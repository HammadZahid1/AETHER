import { geoToCartesian, clamp, smoothstep } from '@/engine/coordinates';
import { fbm3D, ridgedNoise3D } from '@/engine/noise';
import type { CloudConfig } from '@/types/config';

/** Sample procedural cloud density in [0, 1] at a geographic position. */
export function sampleCloudDensity(
  latitude: number,
  longitude: number,
  time: number,
  config: CloudConfig,
  layer = 0,
): number {
  const point = geoToCartesian(latitude, longitude);
  const drift = time * 0.003 * config.movementSpeed;
  const scale = 2.6 + layer * 0.7;
  const base = fbm3D(point.x * scale + drift, point.y * scale, point.z * scale, 5, 211 + layer * 13);
  const detail = ridgedNoise3D(point.x * scale * 2.4, point.y * scale * 2.4, point.z * scale * 2.4, 3, 97 + layer);
  const combined = clamp(base * 0.72 + (detail - 0.5) * 0.5 + 0.5, 0, 1);
  const threshold = 1 - clamp(config.coverage, 0, 1);
  return smoothstep(threshold - 0.14, threshold + 0.22, combined) * clamp(config.density, 0, 1);
}

/** Cloud top altitude expressed as a fraction of the Earth radius. */
export function cloudAltitude(config: CloudConfig, layer: number): number {
  return 1 + config.height * (1 + layer * 0.45);
}

/** Broad latitudinal distribution weight for cloud formation. */
export function cloudLatitudeWeight(latitude: number): number {
  const absLat = Math.abs(latitude);
  const equator = Math.exp(-((absLat / 12) ** 2));
  const midLatitude = Math.exp(-(((absLat - 50) / 22) ** 2));
  return clamp(0.25 + equator * 0.5 + midLatitude * 0.7, 0, 1);
}