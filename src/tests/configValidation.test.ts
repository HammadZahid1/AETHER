import { describe, expect, it } from 'vitest';
import { clampConfigurations } from '@/engine/configValidation';
import { createDefaultConfigurations } from '@/data/defaults';

describe('configuration clamping', () => {
  it('keeps valid configurations unchanged', () => {
    const defaults = createDefaultConfigurations();
    expect(clampConfigurations(defaults)).toEqual(defaults);
  });

  it('clamps numeric values and rejects invalid enums', () => {
    const defaults = createDefaultConfigurations();
    const clean = clampConfigurations({
      ...defaults,
      wind: { ...defaults.wind, particleCount: -500, speed: 100, mode: 'invalid' as never },
      atmosphere: { ...defaults.atmosphere, opacity: 4, glow: -1 },
    });
    expect(clean.wind.particleCount).toBe(100);
    expect(clean.wind.speed).toBe(8);
    expect(clean.wind.mode).toBe(defaults.wind.mode);
    expect(clean.atmosphere.opacity).toBe(1);
    expect(clean.atmosphere.glow).toBe(0);
  });

  it('fills missing modules with defaults', () => {
    const clean = clampConfigurations({});
    expect(clean.clouds).toEqual(createDefaultConfigurations().clouds);
  });
});
