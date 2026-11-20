import { describe, expect, it } from 'vitest';
import {
  cartesianToGeo,
  formatCoordinates,
  generateGridLines,
  geoToCartesian,
  getHemispheres,
  greatCircleDistance,
  interpolateCoordinates,
  isWithinBounds,
  normalizeLatitude,
  normalizeLongitude,
} from '@/engine/coordinates';

describe('coordinate normalization', () => {
  it('clamps latitude into the valid range', () => {
    expect(normalizeLatitude(120)).toBe(90);
    expect(normalizeLatitude(-120)).toBe(-90);
    expect(normalizeLatitude(45.5)).toBe(45.5);
    expect(normalizeLatitude(Number.NaN)).toBe(0);
  });

  it('wraps longitude into [-180, 180]', () => {
    expect(normalizeLongitude(190)).toBe(-170);
    expect(normalizeLongitude(-190)).toBe(170);
    expect(normalizeLongitude(540)).toBe(180);
    expect(normalizeLongitude(0)).toBe(0);
  });
});

describe('geographic to Cartesian conversion', () => {
  it('maps the equator and prime meridian to +X', () => {
    const point = geoToCartesian(0, 0);
    expect(point.x).toBeCloseTo(1, 6);
    expect(point.y).toBeCloseTo(0, 6);
    expect(point.z).toBeCloseTo(0, 6);
  });

  it('maps the north pole to +Y', () => {
    const point = geoToCartesian(90, 0);
    expect(point.y).toBeCloseTo(1, 6);
  });

  it('maps east longitude toward -Z', () => {
    const point = geoToCartesian(0, 90);
    expect(point.z).toBeCloseTo(-1, 6);
  });

  it('honours a custom radius', () => {
    expect(geoToCartesian(0, 0, 5).x).toBeCloseTo(5, 6);
  });

  it('round-trips through Cartesian conversion', () => {
    const samples = [
      { latitude: 0, longitude: 0 },
      { latitude: 51.5, longitude: -0.127 },
      { latitude: -33.87, longitude: 151.21 },
      { latitude: 89.9, longitude: 179.9 },
    ];
    for (const sample of samples) {
      const roundTrip = cartesianToGeo(geoToCartesian(sample.latitude, sample.longitude));
      expect(roundTrip.latitude).toBeCloseTo(sample.latitude, 6);
      expect(roundTrip.longitude).toBeCloseTo(sample.longitude, 6);
    }
  });

  it('returns the origin for a zero vector', () => {
    expect(cartesianToGeo({ x: 0, y: 0, z: 0 })).toEqual({ latitude: 0, longitude: 0 });
  });
});

describe('geodesic helpers', () => {
  it('computes a known great-circle distance', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const newYork = { latitude: 40.7128, longitude: -74.006 };
    const result = greatCircleDistance(london, newYork);
    expect(result.kilometres).toBeGreaterThan(5500);
    expect(result.kilometres).toBeLessThan(5600);
  });

  it('returns zero distance for identical points', () => {
    const point = { latitude: 10, longitude: 20 };
    expect(greatCircleDistance(point, point).kilometres).toBeCloseTo(0, 6);
  });

  it('formats coordinates with hemispheres', () => {
    expect(formatCoordinates({ latitude: -33.87, longitude: 151.21 }, 1)).toBe('33.9°S 151.2°E');
  });

  it('reports hemispheres', () => {
    expect(getHemispheres({ latitude: 1, longitude: -2 })).toEqual({ latitude: 'N', longitude: 'W' });
  });

  it('interpolates across the antimeridian', () => {
    const result = interpolateCoordinates({ latitude: 0, longitude: 170 }, { latitude: 0, longitude: -170 }, 0.5);
    expect(Math.abs(result.longitude)).toBeCloseTo(180, 6);
  });

  it('checks bounding boxes', () => {
    const bounds = { minLatitude: -10, maxLatitude: 10, minLongitude: -20, maxLongitude: 20 };
    expect(isWithinBounds({ latitude: 0, longitude: 0 }, bounds)).toBe(true);
    expect(isWithinBounds({ latitude: 40, longitude: 0 }, bounds)).toBe(false);
  });
});

describe('grid generation', () => {
  it('generates the requested number of parallels and meridians', () => {
    const { parallels, meridians } = generateGridLines(30, 45);
    expect(parallels).toHaveLength(5);
    expect(meridians).toHaveLength(8);
    expect(parallels[0][0].latitude).toBe(-60);
  });
});