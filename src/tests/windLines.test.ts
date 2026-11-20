import { describe, expect, it } from 'vitest';
import { buildWindStreamlineSegments, buildWindVectorSegments, type WindSampler } from '@/renderer/windLines';

const easterly: WindSampler = () => ({ u: 1, v: 0, speed: 1, direction: 90 });

describe('wind line geometry', () => {
  it('integrates streamlines into line segments', () => {
    const segments = buildWindStreamlineSegments(easterly, 0, [{ latitude: 10, longitude: 0 }], 8, 2);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.length % 6).toBe(0);
    expect(Array.from(segments).every(Number.isFinite)).toBe(true);
  });

  it('builds a lattice of short direction vectors', () => {
    const segments = buildWindVectorSegments(easterly, 0, 40, 60, 2);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.length % 6).toBe(0);
  });
});
