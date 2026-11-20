import { generateGridLines, geoToCartesian } from '@/engine/coordinates';
import type { GeoCoordinates } from '@/types/geo';

/** Convert a geographic path into a flat XYZ line-strip buffer. */
export function geoPathToPositions(path: readonly GeoCoordinates[], radius = 1.002): Float32Array {
  const positions = new Float32Array(path.length * 3);
  path.forEach((point, index) => {
    const cartesian = geoToCartesian(point.latitude, point.longitude, radius);
    positions[index * 3] = cartesian.x;
    positions[index * 3 + 1] = cartesian.y;
    positions[index * 3 + 2] = cartesian.z;
  });
  return positions;
}

/** Convert multiple geographic paths into a flat XYZ line-segment buffer. */
export function geoPathsToSegments(paths: readonly (readonly GeoCoordinates[])[], radius = 1.002): Float32Array {
  const segments: number[] = [];
  for (const path of paths) {
    const positions = geoPathToPositions(path, radius);
    for (let index = 0; index < path.length - 1; index += 1) {
      segments.push(
        positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2],
        positions[(index + 1) * 3], positions[(index + 1) * 3 + 1], positions[(index + 1) * 3 + 2],
      );
    }
  }
  return new Float32Array(segments);
}

/** Build latitude/longitude grid line segments on a spherical shell. */
export function geographicGridSegments(latitudeStep = 15, longitudeStep = 15, radius = 1.003): Float32Array {
  const grid = generateGridLines(latitudeStep, longitudeStep);
  return geoPathsToSegments([...grid.parallels, ...grid.meridians], radius);
}

/** Convert normalized contour endpoint pairs into a spherical line-segment buffer. */
export function contourSegmentsToPositions(
  segments: readonly (readonly [number, number, number, number])[],
  radius = 1.008,
): Float32Array {
  const positions = new Float32Array(segments.length * 6);
  segments.forEach(([u0, v0, u1, v1], index) => {
    const start = geoToCartesian(v0 * 180 - 90, u0 * 360 - 180, radius);
    const end = geoToCartesian(v1 * 180 - 90, u1 * 360 - 180, radius);
    const offset = index * 6;
    positions[offset] = start.x;
    positions[offset + 1] = start.y;
    positions[offset + 2] = start.z;
    positions[offset + 3] = end.x;
    positions[offset + 4] = end.y;
    positions[offset + 5] = end.z;
  });
  return positions;
}

/** Return a single XYZ tuple for a geographic marker or annotation. */
export function markerPosition(coordinates: GeoCoordinates, radius = 1.05): [number, number, number] {
  const point = geoToCartesian(coordinates.latitude, coordinates.longitude, radius);
  return [point.x, point.y, point.z];
}
