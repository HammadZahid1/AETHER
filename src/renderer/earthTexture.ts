import { DEG_TO_RAD } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';

export const EARTH_TEXTURE_WIDTH = 256;
export const EARTH_TEXTURE_HEIGHT = 128;

export interface EarthTextureOptions {
  width?: number;
  height?: number;
  seed?: number;
  seaLevel?: number;
}

const OCEAN_DEEP: readonly [number, number, number] = [8, 28, 58];
const OCEAN_SHALLOW: readonly [number, number, number] = [20, 82, 118];
const LOWLAND: readonly [number, number, number] = [44, 96, 72];
const HIGHLAND: readonly [number, number, number] = [122, 106, 78];
const ICE: readonly [number, number, number] = [224, 238, 244];

function mix(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function blendColor(
  first: readonly [number, number, number],
  second: readonly [number, number, number],
  amount: number,
): readonly [number, number, number] {
  return [mix(first[0], second[0], amount), mix(first[1], second[1], amount), mix(first[2], second[2], amount)];
}

/**
 * Generate a deterministic illustrative Earth surface raster.
 * The output is not geographic cartography; it provides plausible continents
 * and ocean shading for the interactive globe.
 */
export function generateEarthTexture(options: EarthTextureOptions = {}): Uint8Array {
  const width = options.width ?? EARTH_TEXTURE_WIDTH;
  const height = options.height ?? EARTH_TEXTURE_HEIGHT;
  const seed = options.seed ?? 91;
  const seaLevel = options.seaLevel ?? 0.51;
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const latitude = 90 - (y / (height - 1)) * 180;
    const phi = latitude * DEG_TO_RAD;
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < width; x += 1) {
      const longitude = (x / (width - 1)) * 360;
      const lambda = longitude * DEG_TO_RAD;
      const nx = cosPhi * Math.cos(lambda);
      const ny = Math.sin(phi);
      const nz = cosPhi * Math.sin(lambda);
      const elevation = fbm3D(nx * 2.4 + 4, ny * 2.4 + 4, nz * 2.4 + 4, 5, seed);
      const detail = fbm3D(nx * 7.5 + 11, ny * 7.5 + 11, nz * 7.5 + 11, 3, seed + 17);
      const adjusted = elevation + (detail - 0.5) * 0.12;
      const ice = Math.max(0, (Math.abs(latitude) - 66) / 24);
      let color: readonly [number, number, number];

      if (adjusted < seaLevel) {
        const depth = Math.min(1, (seaLevel - adjusted) / 0.25);
        color = blendColor(OCEAN_SHALLOW, OCEAN_DEEP, depth);
      } else {
        const heightFactor = Math.min(1, (adjusted - seaLevel) / 0.22);
        color = blendColor(LOWLAND, HIGHLAND, heightFactor);
      }
      if (ice > 0) color = blendColor(color, ICE, Math.min(1, ice));

      const offset = (y * width + x) * 4;
      data[offset] = Math.round(color[0]);
      data[offset + 1] = Math.round(color[1]);
      data[offset + 2] = Math.round(color[2]);
      data[offset + 3] = 255;
    }
  }
  return data;
}

/** Count land-like pixels in a generated raster for diagnostics and tests. */
export function countLandPixels(data: Uint8Array): number {
  let count = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 1] > data[offset + 2]) count += 1;
  }
  return count;
}
