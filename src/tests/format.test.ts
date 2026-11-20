import { describe, expect, it } from 'vitest';
import { formatCoordinate, formatPercent, formatPressure, formatTemperature, formatWindSpeed, wrapLongitude } from '@/utils/format';

describe('simulated value formatting', () => {
  it('formats coordinates with hemispheres', () => {
    expect(formatCoordinate(18.5, -55.25)).toBe('18.50° N, 55.25° W');
    expect(formatCoordinate(-33.9, 151.2)).toBe('33.90° S, 151.20° E');
  });

  it('wraps longitudes into the canonical range', () => {
    expect(wrapLongitude(190)).toBe(-170);
    expect(wrapLongitude(-190)).toBe(170);
    expect(wrapLongitude(180)).toBe(-180);
  });

  it('formats temperature, wind, pressure and percent values', () => {
    expect(formatTemperature(12.34)).toBe('12.3 °C');
    expect(formatWindSpeed(7.56)).toBe('7.6 m/s');
    expect(formatPressure(1008.6)).toBe('1009 hPa');
    expect(formatPercent(0.725, 1)).toBe('72.5%');
  });

  it('falls back safely for invalid values', () => {
    expect(formatCoordinate(Number.NaN, Number.NaN)).toBe('0.00° N, 0.00° E');
    expect(formatTemperature(Number.POSITIVE_INFINITY)).toBe('0.0 °C');
    expect(formatWindSpeed(-5)).toBe('0.0 m/s');
    expect(formatPercent(4)).toBe('100%');
  });
});
