import type { ParticleSystem } from '@/engine/particles';

/** Compact GPU buffers used by the particle point-cloud renderer. */
export interface ParticleGeometryBuffers {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
}

/** Allocate GPU-ready buffers with the same capacity as a particle system. */
export function createParticleGeometryBuffers(capacity: number): ParticleGeometryBuffers {
  return {
    positions: new Float32Array(capacity * 3),
    colors: new Float32Array(capacity * 3),
    sizes: new Float32Array(capacity),
    opacities: new Float32Array(capacity),
  };
}

/**
 * Copy live particles into compact geometry buffers.
 * Age-based fading makes recycled particles disappear smoothly.
 */
export function writeParticleBuffers(
  system: ParticleSystem,
  target: ParticleGeometryBuffers,
  fadeWithAge = true,
): number {
  const source = system.buffers;
  let write = 0;
  for (let index = 0; index < system.capacity && write < system.capacity; index += 1) {
    if (!source.alive[index]) continue;
    const from = index * 3;
    const to = write * 3;
    target.positions[to] = source.position[from];
    target.positions[to + 1] = source.position[from + 1];
    target.positions[to + 2] = source.position[from + 2];
    target.colors[to] = source.color[from];
    target.colors[to + 1] = source.color[from + 1];
    target.colors[to + 2] = source.color[from + 2];
    target.sizes[write] = source.size[index];
    const lifetime = Math.max(0.0001, source.lifetime[index]);
    const fade = fadeWithAge ? Math.max(0, 1 - source.age[index] / lifetime) : 1;
    target.opacities[write] = source.opacity[index] * fade;
    write += 1;
  }
  return write;
}
