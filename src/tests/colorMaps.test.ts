import { describe, expect, it } from 'vitest';
import { CLIMATE_RAMP, ColorRamp, OCEAN_RAMP, PRESSURE_RAMP, TEMPERATURE_RAMP, WIND_RAMP, pressureToRamp, temperatureToRamp } from '@/engine/colorMaps';

describe('color ramps', () => {
  it('clamps to endpoint colors', () => {
    const ramp = new ColorRamp([[0, [0, 0, 0]], [1, [1, 1, 1]]]);
    expect(ramp.sample(-1)).toEqual([0, 0, 0]);
    expect(ramp.sample(2)).toEqual([1, 1, 1]);
  });

  it('interpolates between stops', () => {
    const ramp = new ColorRamp([[0, [0, 0, 0]], [1, [1, 1, 1]]]);
    expect(ramp.sample(0.5)[0]).toBeCloseTo(0.5, 6);
  });

  it('writes sampled colors into buffers', () => {
    const buffer = new Float32Array(6);
    WIND_RAMP.writeTo(buffer, 1, 1);
    const sampled = WIND_RAMP.sample(1);
    Array.from(buffer.slice(3)).forEach((value, index) => expect(value).toBeCloseTo(sampled[index], 6));
  });

  it('maps domain values into normalized ramp coordinates', () => {
    expect(temperatureToRamp(-40)).toBe(0);
    expect(temperatureToRamp(45)).toBe(1);
    expect(pressureToRamp(1000)).toBeCloseTo(0.5, 6);
  });

  it('provides ramps for every scalar visualization', () => {
    for (const ramp of [TEMPERATURE_RAMP, PRESSURE_RAMP, OCEAN_RAMP, CLIMATE_RAMP]) {
      expect(ramp.sample(0.5).every(Number.isFinite)).toBe(true);
    }
  });
});
