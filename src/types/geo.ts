/** Geographic coordinate in degrees. */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/** Three-component vector in a right-handed Cartesian space. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Geographic bounding box. */
export interface GeoBounds {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

/** Cardinal hemisphere for a coordinate component. */
export type Hemisphere = 'N' | 'S' | 'E' | 'W';

/** Result of a geodesic calculation, in kilometres. */
export interface GeoDistance {
  kilometres: number;
  nauticalMiles: number;
}

/** A named point on the globe used by markers and scenarios. */
export interface GeoPoint extends GeoCoordinates {
  id: string;
  label: string;
}