import { describe, expect, it } from 'vitest';
import { countLandPixels, EARTH_TEXTURE_HEIGHT, EARTH_TEXTURE_WIDTH, generateEarthTexture } from '@/renderer/earthTexture';

describe('Earth surface texture', () => {
  it('generates a deterministic RGBA raster', () => {
    const first = generateEarthTexture({ width: 32, height: 16 });
    const second = generateEarthTexture({ width: 32, height: 16 });
    expect(Array.from(first)).toEqual(Array.from(second));
    expect(first).toHaveLength(32 * 16 * 4);
    expect(first.every((_, index) => index % 4 !== 3 || first[index] === 255)).toBe(true);
  });

  it('contains both ocean and land-like pixels', () => {
    const data = generateEarthTexture({ width: 64, height: 32 });
    const land = countLandPixels(data);
    expect(land).toBeGreaterThan(0);
    expect(land).toBeLessThan(64 * 32);
  });

  it('uses bright polar shading', () => {
    const data = generateEarthTexture({ width: 16, height: 8 });
    const northPole = 0;
    expect(data[northPole]).toBeGreaterThan(150);
    expect(EARTH_TEXTURE_WIDTH).toBeGreaterThan(EARTH_TEXTURE_HEIGHT);
  });
});
