import { angularDistance } from '@/simulations/pressure/field';
import { clamp, geoToCartesian, smoothstep } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';
import type { PrecipitationConfig } from '@/types/config';
import type { ScalarField } from '@/engine/fields';
import type { GeoCoordinates } from '@/types/geo';

/** Build a simplified precipitation probability field in [0, 1]. */
export function createPrecipitationField(
  config: PrecipitationConfig,
  center: GeoCoordinates,
): ScalarField {
  return {
    id: 'precipitation',
    sample: (latitude, longitude, time = 0) => {
      const distance = angularDistance(latitude, longitude, center.latitude, center.longitude);
      const regional = Math.exp(-((distance / Math.max(1, config.regionRadius)) ** 2));
      const weight = config.distribution === 'global' ? 1 : regional;
      const point = geoToCartesian(latitude, longitude);
      const variability = fbm3D(point.x * 4, point.y * 4, point.z * 4 + time * 0.004, 4, 517) * 0.5 + 0.5;
      const value = smoothstep(0.12, 0.8, variability) * weight * config.intensity;
      return clamp(value, 0, 1);
    },
  };
}

/** Categorize precipitation intensity into a descriptive class. */
export function precipitationCategory(value: number): string {
  if (value >= 0.8) return 'Torrential';
  if (value >= 0.55) return 'Heavy';
  if (value >= 0.3) return 'Moderate';
  if (value >= 0.08) return 'Light';
  return 'None';
}