import { DEG_TO_RAD, angularDistance } from '@/engine/coordinates';
import { angularDistance as geoAngularDistance } from '@/simulations/pressure/field';
import { clamp } from '@/engine/coordinates';
import type { StormConfig } from '@/types/config';
import type { GeoCoordinates } from '@/types/geo';

export interface StormSample {
  radius: number;
  normalizedRadius: number;
  bearing: number;
  tangential: number;
  radial: number;
  pressureAnomaly: number;
  cloud: number;
  rain: number;
}

/** Move a storm center along its configured heading over simulated time. */
export function stormCenterAt(config: StormConfig, time: number): GeoCoordinates {
  const distanceDegrees = config.movementSpeed * time * 0.02;
  const heading = config.movementDirection * DEG_TO_RAD;
  const latRad = config.center.latitude * DEG_TO_RAD;
  const lonRad = config.center.longitude * DEG_TO_RAD;
  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(distanceDegrees * DEG_TO_RAD) +
      Math.cos(latRad) * Math.sin(distanceDegrees * DEG_TO_RAD) * Math.cos(heading),
  ) / DEG_TO_RAD;
  const lon2 = lonRad + Math.atan2(
    Math.sin(heading) * Math.sin(distanceDegrees * DEG_TO_RAD) * Math.cos(latRad),
    Math.cos(distanceDegrees * DEG_TO_RAD) - Math.sin(latRad) * Math.sin(lat2 * DEG_TO_RAD),
  );
  return {
    latitude: clamp(lat2, -85, 85),
    longitude: (((lon2 / DEG_TO_RAD + 180) % 360) + 360) % 360 - 180,
  };
}

/** Bearing from the storm center to a point, in degrees clockwise from north. */
export function stormBearing(center: GeoCoordinates, latitude: number, longitude: number): number {
  const lat1 = center.latitude * DEG_TO_RAD;
  const lat2 = latitude * DEG_TO_RAD;
  const dLon = (longitude - center.longitude) * DEG_TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) / DEG_TO_RAD + 360) % 360;
}

/** Sample the simplified storm structure at a geographic position. */
export function sampleStorm(config: StormConfig, latitude: number, longitude: number, time = 0): StormSample {
  const center = stormCenterAt(config, time);
  const radius = geoAngularDistance(latitude, longitude, center.latitude, center.longitude);
  const normalizedRadius = clamp(radius / Math.max(1, config.radius), 0, 4);
  const bearing = stormBearing(center, latitude, longitude);
  const spiralPhase = bearing * DEG_TO_RAD - normalizedRadius * 3.2 * config.rotation;
  const envelope = Math.exp(-((normalizedRadius / 0.85) ** 2));
  const eyewall = Math.exp(-(((normalizedRadius - 0.22) / 0.18) ** 2));
  const tangential = (eyewall * 1.4 + envelope * 0.6) * config.intensity * config.rotation;
  const radial = -envelope * 0.55 * config.intensity;
  const pressureAnomaly = -Math.exp(-((normalizedRadius / 0.6) ** 2)) * 48 * config.intensity;
  const cloud = clamp((envelope * 0.7 + Math.max(0, Math.sin(spiralPhase * 2)) * eyewall * 0.6) * config.cloudDensity, 0, 1);
  const rain = clamp((eyewall * 0.8 + envelope * 0.4) * config.rainIntensity, 0, 1);
  return { radius, normalizedRadius, bearing, tangential, radial, pressureAnomaly, cloud, rain };
}

/** Generate the projected storm track over a number of simulated seconds. */
export function stormTrajectory(config: StormConfig, steps = 24, stepSeconds = 900): GeoCoordinates[] {
  const points: GeoCoordinates[] = [];
  for (let i = 0; i <= steps; i += 1) points.push(stormCenterAt(config, i * stepSeconds));
  return points;
}

/** Categorize storm intensity using a simplified scale. */
export function stormCategory(intensity: number): string {
  if (intensity >= 0.9) return 'Major system';
  if (intensity >= 0.65) return 'Severe system';
  if (intensity >= 0.35) return 'Developing system';
  return 'Weak system';
}