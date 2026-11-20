import { normalizeLongitude } from '@/engine/coordinates';
import { geoPathsToSegments } from '@/renderer/geometry';
import { traceStreamline } from '@/simulations/wind/WindSimulation';
import type { WindSample } from '@/simulations/wind/field';

export type WindSampler = (latitude: number, longitude: number, time?: number) => WindSample;

export const DEFAULT_STREAMLINE_SEEDS: readonly { latitude: number; longitude: number }[] = [
  { latitude: 55, longitude: -140 }, { latitude: 35, longitude: -60 },
  { latitude: 10, longitude: -20 }, { latitude: -10, longitude: 40 },
  { latitude: -35, longitude: 110 }, { latitude: 60, longitude: 20 },
];

/** Integrate several wind streamlines into spherical line segments. */
export function buildWindStreamlineSegments(
  sample: WindSampler,
  time = 0,
  seeds: readonly { latitude: number; longitude: number }[] = DEFAULT_STREAMLINE_SEEDS,
  steps = 24,
  stepSize = 1.4,
): Float32Array {
  const paths = seeds.map((seed) => traceStreamline(sample, seed.latitude, seed.longitude, steps, stepSize, time));
  return geoPathsToSegments(paths, 1.03);
}

/** Build short direction vectors on a regular geographic lattice. */
export function buildWindVectorSegments(
  sample: WindSampler,
  time = 0,
  latitudeStep = 20,
  longitudeStep = 24,
  length = 3,
): Float32Array {
  const paths: Array<Array<{ latitude: number; longitude: number }>> = [];
  for (let latitude = -60; latitude <= 60; latitude += latitudeStep) {
    for (let longitude = -180; longitude < 180; longitude += longitudeStep) {
      const { u, v } = sample(latitude, longitude, time);
      const endLatitude = Math.max(-89, Math.min(89, latitude + v * length));
      const endLongitude = normalizeLongitude(longitude + u * length);
      paths.push([
        { latitude, longitude },
        { latitude: endLatitude, longitude: endLongitude },
      ]);
    }
  }
  return geoPathsToSegments(paths, 1.03);
}
