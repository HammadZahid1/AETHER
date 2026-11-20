import { describe, expect, it } from 'vitest';
import { altitudeToRadius, atmosphereLayerColor, atmosphereLayerRadius } from '@/renderer/atmosphere';

describe('atmosphere renderer helpers', () => {
  it('maps altitude to an exaggerated shell radius', () => {
    expect(altitudeToRadius(0)).toBe(1);
    expect(altitudeToRadius(100)).toBeGreaterThan(1);
    expect(altitudeToRadius(100, 2)).toBeGreaterThan(altitudeToRadius(100, 1));
  });

  it('finds radii and colors for known layers', () => {
    expect(atmosphereLayerRadius('troposphere')).toBeGreaterThan(1);
    expect(atmosphereLayerRadius('exosphere')).toBeGreaterThan(atmosphereLayerRadius('troposphere'));
    expect(atmosphereLayerColor('thermosphere')).toMatch(/^#/);
  });

  it('falls back safely for unknown layers', () => {
    expect(atmosphereLayerRadius('unknown')).toBeGreaterThan(1);
    expect(atmosphereLayerColor('unknown')).toBe('#48c9e8');
  });
});
