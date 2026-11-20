import { describe, expect, it } from 'vitest';
import { createDefaultSettings } from '@/data/defaults';
import { QUALITY_PRESETS, applyQualityPreset } from '@/renderer/quality';

describe('quality presets', () => {
  it('defines low, balanced and high presets', () => {
    expect(Object.keys(QUALITY_PRESETS).sort()).toEqual(['balanced', 'high', 'low']);
  });

  it('applies a preset without dropping the quality setting', () => {
    const rendering = createDefaultSettings().rendering;
    const low = applyQualityPreset(rendering, 'low');
    expect(low.quality).toBe('low');
    expect(low.pixelRatioCap).toBe(1);
    expect(low.antialias).toBe(false);
  });

  it('enables shadows only in high mode', () => {
    const rendering = createDefaultSettings().rendering;
    expect(applyQualityPreset(rendering, 'balanced').shadows).toBe(false);
    expect(applyQualityPreset(rendering, 'high').shadows).toBe(true);
  });
});
