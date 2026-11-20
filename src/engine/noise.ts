/** Deterministic, allocation-free noise utilities used by every field generator. */

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0 || 1), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Mix two numbers into a deterministic pseudo-random value in [0, 1). */
export function hash2(x: number, y: number, seed = 0): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Mix three numbers into a deterministic pseudo-random value in [0, 1). */
export function hash3(x: number, y: number, z: number, seed = 0): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041) ^ seed;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Two-dimensional value noise in [-1, 1]. */
export function valueNoise2D(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}

/** Three-dimensional value noise in [-1, 1]; ideal for sampling on a sphere. */
export function valueNoise3D(x: number, y: number, z: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);

  const c000 = hash3(xi, yi, zi, seed);
  const c100 = hash3(xi + 1, yi, zi, seed);
  const c010 = hash3(xi, yi + 1, zi, seed);
  const c110 = hash3(xi + 1, yi + 1, zi, seed);
  const c001 = hash3(xi, yi, zi + 1, seed);
  const c101 = hash3(xi + 1, yi, zi + 1, seed);
  const c011 = hash3(xi, yi + 1, zi + 1, seed);
  const c111 = hash3(xi + 1, yi + 1, zi + 1, seed);

  const x00 = lerp(c000, c100, u);
  const x10 = lerp(c010, c110, u);
  const x01 = lerp(c001, c101, u);
  const x11 = lerp(c011, c111, u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 2 - 1;
}

/** Fractal Brownian motion built from layered value noise. */
export function fbm2D(x: number, y: number, octaves = 4, seed = 0, lacunarity = 2, gain = 0.5): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let normalization = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += valueNoise2D(x * frequency, y * frequency, seed + i * 17) * amplitude;
    normalization += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return sum / (normalization || 1);
}

/** Fractal Brownian motion in three dimensions. */
export function fbm3D(x: number, y: number, z: number, octaves = 4, seed = 0): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let normalization = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += valueNoise3D(x * frequency, y * frequency, z * frequency, seed + i * 31) * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / (normalization || 1);
}

/** Ridged multifractal noise, useful for storm bands and cloud edges. */
export function ridgedNoise3D(x: number, y: number, z: number, octaves = 4, seed = 0): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i += 1) {
    const n = 1 - Math.abs(valueNoise3D(x * frequency, y * frequency, z * frequency, seed + i * 19));
    sum += n * n * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum;
}

/** Seeded pseudo-random generator with a stable sequence. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}