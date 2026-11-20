import type { GeoCoordinates } from '@/types/geo';
import { normalizeLatitude, normalizeLongitude } from '@/engine/coordinates';

/** A deterministic scalar field sampled over geographic coordinates and time. */
export interface ScalarField {
  readonly id: string;
  sample(latitude: number, longitude: number, time?: number): number;
}

/** A vector field sampled over geographic coordinates and time. */
export interface VectorField {
  readonly id: string;
  sample(latitude: number, longitude: number, time?: number): { u: number; v: number };
}

/** Build a scalar field from a pure sampling function. */
export function createScalarField(id: string, sampler: (lat: number, lon: number, time: number) => number): ScalarField {
  return { id, sample: sampler };
}

/** Build a vector field from a pure sampling function. */
export function createVectorField(
  id: string,
  sampler: (lat: number, lon: number, time: number) => { u: number; v: number },
): VectorField {
  return { id, sample: sampler };
}

/** Clamp a field sample to a range. */
export function clampSample(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalize a value from [min, max] into [0, 1]. */
export function normalizeSample(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clampSample((value - min) / (max - min), 0, 1);
}

/** Bilinear interpolation over a regular grid of scalar values. */
export function bilinearGrid(
  grid: Float32Array,
  columns: number,
  rows: number,
  u: number,
  v: number,
): number {
  const x = Math.min(Math.max(u, 0), 1) * (columns - 1);
  const y = Math.min(Math.max(v, 0), 1) * (rows - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, columns - 1);
  const y1 = Math.min(y0 + 1, rows - 1);
  const tx = x - x0;
  const ty = y - y0;
  const a = grid[y0 * columns + x0];
  const b = grid[y0 * columns + x1];
  const c = grid[y1 * columns + x0];
  const d = grid[y1 * columns + x1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

/** Estimate the spatial gradient of a scalar field with central differences. */
export function fieldGradient(
  field: ScalarField,
  coords: GeoCoordinates,
  time = 0,
  step = 0.5,
): { dLat: number; dLon: number; magnitude: number } {
  const lat = normalizeLatitude(coords.latitude);
  const lon = normalizeLongitude(coords.longitude);
  const north = field.sample(Math.min(90, lat + step), lon, time);
  const south = field.sample(Math.max(-90, lat - step), lon, time);
  const east = field.sample(lat, lon + step, time);
  const west = field.sample(lat, lon - step, time);
  const dLat = (north - south) / (2 * step);
  const dLon = (east - west) / (2 * step);
  return { dLat, dLon, magnitude: Math.hypot(dLat, dLon) };
}

/** Generate contour segments using a simplified marching-squares approach. */
export function contourSegments(
  field: ScalarField,
  threshold: number,
  columns: number,
  rows: number,
  time = 0,
): Array<[number, number, number, number]> {
  const segments: Array<[number, number, number, number]> = [];
  const values = new Float32Array((columns + 1) * (rows + 1));
  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= columns; x += 1) {
      values[y * (columns + 1) + x] = field.sample((y / rows) * 180 - 90, (x / columns) * 360 - 180, time);
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const tl = values[y * (columns + 1) + x];
      const tr = values[y * (columns + 1) + x + 1];
      const bl = values[(y + 1) * (columns + 1) + x];
      const br = values[(y + 1) * (columns + 1) + x + 1];
      const u0 = x / columns;
      const u1 = (x + 1) / columns;
      const v0 = y / rows;
      const v1 = (y + 1) / rows;
      const above = (value: number) => value >= threshold;
      const mask =
        (above(tl) ? 1 : 0) | (above(tr) ? 2 : 0) | (above(br) ? 4 : 0) | (above(bl) ? 8 : 0);
      if (mask === 0 || mask === 15) continue;
      const top = () => [u0 + (u1 - u0) * ((threshold - tl) / (tr - tl || 1)), v0] as const;
      const right = () => [u1, v0 + (v1 - v0) * ((threshold - tr) / (br - tr || 1))] as const;
      const bottom = () => [u0 + (u1 - u0) * ((threshold - bl) / (br - bl || 1)), v1] as const;
      const left = () => [u0, v0 + (v1 - v0) * ((threshold - tl) / (bl - tl || 1))] as const;
      const push = (a: readonly [number, number], b: readonly [number, number]) => {
        segments.push([a[0], a[1], b[0], b[1]]);
      };
      switch (mask) {
        case 1: case 14: push(left(), top()); break;
        case 2: case 13: push(top(), right()); break;
        case 3: case 12: push(left(), right()); break;
        case 4: case 11: push(right(), bottom()); break;
        case 5: push(left(), top()); push(right(), bottom()); break;
        case 6: case 9: push(top(), bottom()); break;
        case 7: case 8: push(left(), bottom()); break;
        case 10: push(left(), bottom()); push(top(), right()); break;
        default: break;
      }
    }
  }
  return segments;
}

/** Sample a field into a Float32Array heatmap at the requested resolution. */
export function rasterizeField(
  field: ScalarField,
  columns: number,
  rows: number,
  time = 0,
): Float32Array {
  const data = new Float32Array(columns * rows);
  for (let y = 0; y < rows; y += 1) {
    const latitude = (y / (rows - 1)) * 180 - 90;
    for (let x = 0; x < columns; x += 1) {
      const longitude = (x / (columns - 1)) * 360 - 180;
      data[y * columns + x] = field.sample(latitude, longitude, time);
    }
  }
  return data;
}