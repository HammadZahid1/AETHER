import { clamp, lerp } from '@/engine/coordinates';

export type RGB = readonly [number, number, number];
export type ColorRampStop = readonly [number, RGB];

/** A reusable ramp for mapping scalar samples to colors. */
export class ColorRamp {
  constructor(readonly stops: readonly ColorRampStop[]) {}

  sample(value: number): RGB {
    if (this.stops.length === 0) return [1, 1, 1];
    if (value <= this.stops[0][0]) return this.stops[0][1];
    const last = this.stops[this.stops.length - 1];
    if (value >= last[0]) return last[1];
    for (let i = 0; i < this.stops.length - 1; i += 1) {
      const [t0, c0] = this.stops[i];
      const [t1, c1] = this.stops[i + 1];
      if (value >= t0 && value <= t1) {
        const t = (value - t0) / (t1 - t0 || 1);
        return [
          lerp(c0[0], c1[0], t),
          lerp(c0[1], c1[1], t),
          lerp(c0[2], c1[2], t),
        ];
      }
    }
    return last[1];
  }

  /** Write a sampled color into an RGB buffer at the given particle index. */
  writeTo(buffer: Float32Array, index: number, value: number): void {
    const [r, g, b] = this.sample(value);
    const p = index * 3;
    buffer[p] = r;
    buffer[p + 1] = g;
    buffer[p + 2] = b;
  }
}

export const WIND_RAMP = new ColorRamp([
  [0, [0.13, 0.35, 0.75]],
  [0.35, [0.15, 0.72, 0.86]],
  [0.65, [0.48, 0.94, 0.82]],
  [0.85, [0.98, 0.82, 0.42]],
  [1, [1, 0.42, 0.35]],
]);

export const TEMPERATURE_RAMP = new ColorRamp([
  [0, [0.22, 0.36, 0.85]],
  [0.25, [0.3, 0.72, 0.92]],
  [0.5, [0.55, 0.86, 0.7]],
  [0.7, [0.98, 0.82, 0.4]],
  [0.88, [0.98, 0.48, 0.26]],
  [1, [0.78, 0.16, 0.3]],
]);

export const PRESSURE_RAMP = new ColorRamp([
  [0, [0.35, 0.24, 0.78]],
  [0.4, [0.22, 0.62, 0.88]],
  [0.5, [0.6, 0.78, 0.82]],
  [0.6, [0.96, 0.74, 0.42]],
  [1, [0.86, 0.28, 0.36]],
]);

export const OCEAN_RAMP = new ColorRamp([
  [0, [0.08, 0.22, 0.5]],
  [0.4, [0.1, 0.48, 0.66]],
  [0.7, [0.16, 0.76, 0.72]],
  [1, [0.62, 0.94, 0.86]],
]);

export const CLIMATE_RAMP = new ColorRamp([
  [0, [0.2, 0.28, 0.55]],
  [0.35, [0.22, 0.62, 0.55]],
  [0.65, [0.72, 0.78, 0.36]],
  [1, [0.92, 0.42, 0.28]],
]);

/** Map a temperature in Celsius to a normalized ramp coordinate. */
export function temperatureToRamp(value: number, min = -40, max = 45): number {
  return clamp((value - min) / (max - min), 0, 1);
}

/** Map a pressure in hPa to a normalized ramp coordinate. */
export function pressureToRamp(value: number, min = 960, max = 1040): number {
  return clamp((value - min) / (max - min), 0, 1);
}