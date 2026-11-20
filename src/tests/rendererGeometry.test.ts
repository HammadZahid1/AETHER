import { describe, expect, it } from 'vitest';
import {
  contourSegmentsToPositions,
  geographicGridSegments,
  geoPathToPositions,
  geoPathsToSegments,
  markerPosition,
} from '@/renderer/geometry';

describe('renderer geometry', () => {
  it('projects geographic paths onto a spherical shell', () => {
    const positions = geoPathToPositions([{ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 90 }], 1.02);
    expect(positions).toHaveLength(6);
    expect(positions[0]).toBeCloseTo(1.02, 5);
    expect(Math.hypot(positions[3], positions[4], positions[5])).toBeCloseTo(1.02, 5);
  });

  it('expands multiple paths into line segments', () => {
    const path = [{ latitude: -10, longitude: 0 }, { latitude: 0, longitude: 0 }, { latitude: 10, longitude: 0 }];
    const segments = geoPathsToSegments([path]);
    expect(segments).toHaveLength(12);
    expect(Array.from(segments).every(Number.isFinite)).toBe(true);
  });

  it('builds a usable geographic grid buffer', () => {
    const segments = geographicGridSegments(30, 45);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.length % 6).toBe(0);
  });

  it('projects normalized contour endpoints into XYZ pairs', () => {
    const positions = contourSegmentsToPositions([[0.25, 0.5, 0.5, 0.5]], 1.01);
    expect(positions).toHaveLength(6);
    expect(Math.hypot(positions[0], positions[1], positions[2])).toBeCloseTo(1.01, 5);
  });

  it('returns a marker tuple at the requested radius', () => {
    const [x, y, z] = markerPosition({ latitude: 90, longitude: 0 }, 1.1);
    expect(y).toBeCloseTo(1.1, 5);
    expect(Math.hypot(x, y, z)).toBeCloseTo(1.1, 5);
  });
});
