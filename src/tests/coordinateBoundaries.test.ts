import { describe, expect, it } from 'vitest';
import { EARTH_RADIUS_KM, cartesianToGeo, geoToCartesian, getHemispheres, greatCircleDistance, interpolateCoordinates, isWithinBounds, normalizeCoordinates } from '@/engine/coordinates';

describe('coordinate boundaries', () => {
  it('normalizes wrapped coordinates', () => {
    expect(normalizeCoordinates({ latitude: 100, longitude: 190 })).toEqual({ latitude: 90, longitude: -170 });
  });

  it('round-trips geographic and Cartesian coordinates', () => {
    const original = { latitude: 37.7, longitude: -122.4 };
    const roundTrip = cartesianToGeo(geoToCartesian(original.latitude, original.longitude));
    expect(roundTrip.latitude).toBeCloseTo(original.latitude, 5);
    expect(roundTrip.longitude).toBeCloseTo(original.longitude, 5);
  });

  it('computes known great-circle distances', () => {
    const distance = greatCircleDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 });
    expect(distance.kilometres).toBeCloseTo(Math.PI * EARTH_RADIUS_KM, 3);
  });

  it('identifies hemispheres and containment', () => {
    expect(getHemispheres({ latitude: -10, longitude: 20 })).toEqual({ latitude: 'S', longitude: 'E' });
    const bounds = { minLatitude: 0, maxLatitude: 10, minLongitude: 0, maxLongitude: 10 };
    expect(isWithinBounds({ latitude: 5, longitude: 5 }, bounds)).toBe(true);
    expect(isWithinBounds({ latitude: 50, longitude: 5 }, bounds)).toBe(false);
  });

  it('interpolates along a coordinate path', () => {
    expect(interpolateCoordinates({ latitude: 0, longitude: 0 }, { latitude: 10, longitude: 20 }, 0.5))
      .toEqual({ latitude: 5, longitude: 10 });
  });
});
