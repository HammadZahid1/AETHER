import { describe, expect, it } from 'vitest';
import { createRandom, fbm2D, fbm3D, hash2, hash3, lerp, ridgedNoise3D, smoothstep, valueNoise2D, valueNoise3D } from '@/engine/noise';
import {
  bilinearGrid,
  clampSample,
  contourSegments,
  createScalarField,
  fieldGradient,
  normalizeSample,
  rasterizeField,
} from '@/engine/fields';

describe('deterministic noise', () => {
  it('produces identical hashes for identical inputs', () => {
    expect(hash2(3, 7, 11)).toBe(hash2(3, 7, 11));
    expect(hash3(3, 7, 11, 2)).toBe(hash3(3, 7, 11, 2));
    expect(hash2(3, 7, 11)).not.toBe(hash2(3, 8, 11));
  });

  it('keeps noise values in range', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(valueNoise2D(i * 0.37, i * 0.71)).toBeGreaterThanOrEqual(-1);
      expect(valueNoise3D(i * 0.2, i * 0.3, i * 0.4)).toBeLessThanOrEqual(1);
      expect(fbm2D(i * 0.1, i * 0.2)).toBeGreaterThanOrEqual(-1);
      expect(fbm3D(i * 0.1, i * 0.2, i * 0.3)).toBeLessThanOrEqual(1);
    }
  });

  it('produces continuous noise at cell boundaries', () => {
    const left = valueNoise2D(1.999, 4);
    const right = valueNoise2D(2.001, 4);
    expect(Math.abs(left - right)).toBeLessThan(0.05);
  });

  it('returns non-negative ridged noise', () => {
    expect(ridgedNoise3D(0.5, 0.2, 0.9)).toBeGreaterThanOrEqual(0);
  });

  it('interpolates and smoothsteps predictably', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 6);
  });

  it('creates a repeatable random sequence', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('field utilities', () => {
  it('clamps and normalizes samples', () => {
    expect(clampSample(12, 0, 10)).toBe(10);
    expect(normalizeSample(5, 0, 10)).toBe(0.5);
    expect(normalizeSample(5, 5, 5)).toBe(0.5);
  });

  it('interpolates a bilinear grid', () => {
    const grid = new Float32Array([0, 10, 20, 30]);
    expect(bilinearGrid(grid, 2, 2, 0, 0)).toBe(0);
    expect(bilinearGrid(grid, 2, 2, 1, 1)).toBe(30);
    expect(bilinearGrid(grid, 2, 2, 0.5, 0.5)).toBeCloseTo(15, 6);
  });

  it('estimates a field gradient', () => {
    const field = createScalarField('linear', (lat) => lat);
    const gradient = fieldGradient(field, { latitude: 0, longitude: 0 });
    expect(gradient.dLat).toBeCloseTo(1, 6);
    expect(gradient.dLon).toBeCloseTo(0, 6);
  });

  it('extracts contour segments from a simple field', () => {
    const field = createScalarField('lat-band', (lat) => lat);
    const segments = contourSegments(field, 0, 16, 8);
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(segment).toHaveLength(4);
      expect(segment.every(Number.isFinite)).toBe(true);
    }
  });

  it('rasterizes fields at the requested resolution', () => {
    const field = createScalarField('constant', () => 7);
    const raster = rasterizeField(field, 8, 4);
    expect(raster).toHaveLength(32);
    expect(Array.from(raster).every((value) => value === 7)).toBe(true);
  });
});