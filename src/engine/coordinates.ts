import type { GeoBounds, GeoCoordinates, GeoDistance, GeoPoint, Hemisphere, Vec3 } from '@/types/geo';

/** Radius of the Earth in kilometres (mean spherical radius). */
export const EARTH_RADIUS_KM = 6371;
/** Radius used for the unit rendering sphere. */
export const RENDER_RADIUS = 1;

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalize a latitude into [-90, 90]. */
export function normalizeLatitude(latitude: number): number {
  if (!Number.isFinite(latitude)) return 0;
  return clamp(latitude, -90, 90);
}

/** Normalize a longitude into [-180, 180]. */
export function normalizeLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) return 0;
  let lon = ((longitude + 180) % 360 + 360) % 360 - 180;
  if (lon === -180 && longitude > 0) lon = 180;
  return lon;
}

export function normalizeCoordinates(coords: GeoCoordinates): GeoCoordinates {
  return {
    latitude: normalizeLatitude(coords.latitude),
    longitude: normalizeLongitude(coords.longitude),
  };
}

/**
 * Convert geographic coordinates to a point on a sphere.
 * Convention: +Y is north, +X is longitude 0, -Z is longitude +90.
 */
export function geoToCartesian(
  latitude: number,
  longitude: number,
  radius = RENDER_RADIUS,
): Vec3 {
  const phi = normalizeLatitude(latitude) * DEG_TO_RAD;
  const lambda = normalizeLongitude(longitude) * DEG_TO_RAD;
  const cosPhi = Math.cos(phi);
  return {
    x: radius * cosPhi * Math.cos(lambda),
    y: radius * Math.sin(phi),
    z: -radius * cosPhi * Math.sin(lambda),
  };
}

/** Convert a Cartesian point on a sphere back to geographic coordinates. */
export function cartesianToGeo(vector: Vec3): GeoCoordinates {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length === 0) return { latitude: 0, longitude: 0 };
  const latitude = Math.asin(clamp(vector.y / length, -1, 1)) * RAD_TO_DEG;
  const longitude = Math.atan2(-vector.z, vector.x) * RAD_TO_DEG;
  return normalizeCoordinates({ latitude, longitude });
}

/** Great-circle distance between two coordinates using the haversine formula. */
export function greatCircleDistance(a: GeoCoordinates, b: GeoCoordinates): GeoDistance {
  const dLat = (b.latitude - a.latitude) * DEG_TO_RAD;
  const dLon = (b.longitude - a.longitude) * DEG_TO_RAD;
  const lat1 = a.latitude * DEG_TO_RAD;
  const lat2 = b.latitude * DEG_TO_RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const angle = 2 * Math.asin(clamp(Math.sqrt(h), 0, 1));
  const kilometres = EARTH_RADIUS_KM * angle;
  return { kilometres, nauticalMiles: kilometres / 1.852 };
}

export function getHemispheres(coords: GeoCoordinates): { latitude: Hemisphere; longitude: Hemisphere } {
  return {
    latitude: coords.latitude >= 0 ? 'N' : 'S',
    longitude: coords.longitude >= 0 ? 'E' : 'W',
  };
}

/** Format coordinates as a compact human-readable string. */
export function formatCoordinates(coords: GeoCoordinates, precision = 2): string {
  const { latitude, longitude } = normalizeCoordinates(coords);
  const { latitude: ns, longitude: ew } = getHemispheres({ latitude, longitude });
  return `${Math.abs(latitude).toFixed(precision)}°${ns} ${Math.abs(longitude).toFixed(precision)}°${ew}`;
}

/** Linearly interpolate between two coordinates, wrapping longitude correctly. */
export function interpolateCoordinates(a: GeoCoordinates, b: GeoCoordinates, t: number): GeoCoordinates {
  let deltaLon = b.longitude - a.longitude;
  if (deltaLon > 180) deltaLon -= 360;
  if (deltaLon < -180) deltaLon += 360;
  return normalizeCoordinates({
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + deltaLon * t,
  });
}

/** Check whether a point lies inside a geographic bounding box. */
export function isWithinBounds(coords: GeoCoordinates, bounds: GeoBounds): boolean {
  const lon = normalizeLongitude(coords.longitude);
  return (
    coords.latitude >= bounds.minLatitude &&
    coords.latitude <= bounds.maxLatitude &&
    lon >= bounds.minLongitude &&
    lon <= bounds.maxLongitude
  );
}

/** Generate evenly spaced latitude and longitude grid lines for rendering. */
export function generateGridLines(latStep = 15, lonStep = 15): { parallels: GeoPoint[][]; meridians: GeoPoint[][] } {
  const parallels: GeoPoint[][] = [];
  const meridians: GeoPoint[][] = [];

  for (let lat = -90 + latStep; lat < 90; lat += latStep) {
    const ring: GeoPoint[] = [];
    for (let lon = -180; lon <= 180; lon += lonStep) {
      ring.push({ id: `p${lat}_${lon}`, label: `${lat}°`, latitude: lat, longitude: lon });
    }
    parallels.push(ring);
  }

  for (let lon = -180; lon < 180; lon += lonStep) {
    const ring: GeoPoint[] = [];
    for (let lat = -90; lat <= 90; lat += latStep) {
      ring.push({ id: `m${lon}_${lat}`, label: `${lon}°`, latitude: lat, longitude: lon });
    }
    meridians.push(ring);
  }

  return { parallels, meridians };
}