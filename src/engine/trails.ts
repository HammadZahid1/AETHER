import type { ParticleSystem } from '@/engine/particles';

/**
 * Ring-buffer trail storage for a particle system. Each particle owns a fixed
 * number of historical positions which can be expanded into line segments.
 */
export class TrailBuffer {
  private readonly data: Float32Array;
  private readonly heads: Uint16Array;
  private readonly lengths: Uint16Array;

  constructor(
    private readonly system: ParticleSystem,
    readonly trailLength: number,
  ) {
    this.data = new Float32Array(system.capacity * trailLength * 3);
    this.heads = new Uint16Array(system.capacity);
    this.lengths = new Uint16Array(system.capacity);
  }

  /** Record current positions into the trail history. */
  record(): void {
    const positions = this.system.buffers.position;
    const alive = this.system.buffers.alive;
    for (let i = 0; i < this.system.capacity; i += 1) {
      if (!alive[i]) {
        this.lengths[i] = 0;
        continue;
      }
      const head = this.heads[i];
      const offset = (i * this.trailLength + head) * 3;
      const p = i * 3;
      this.data[offset] = positions[p];
      this.data[offset + 1] = positions[p + 1];
      this.data[offset + 2] = positions[p + 2];
      this.heads[i] = (head + 1) % this.trailLength;
      this.lengths[i] = Math.min(this.lengths[i] + 1, this.trailLength);
    }
  }

  /**
   * Expand trails into line-segment vertices. Returns the number of vertices
   * written into the target buffer (two per segment).
   */
  writeSegments(target: Float32Array, maxVertices: number): number {
    let write = 0;
    for (let i = 0; i < this.system.capacity && write + 6 <= maxVertices * 3; i += 1) {
      const length = this.lengths[i];
      if (length < 2) continue;
      const head = this.heads[i];
      for (let step = 0; step < length - 1; step += 1) {
        const older = (head - length + step + this.trailLength * 2) % this.trailLength;
        const newer = (older + 1) % this.trailLength;
        const a = (i * this.trailLength + older) * 3;
        const b = (i * this.trailLength + newer) * 3;
        const o = write * 3;
        target[o] = this.data[a];
        target[o + 1] = this.data[a + 1];
        target[o + 2] = this.data[a + 2];
        target[o + 3] = this.data[b];
        target[o + 4] = this.data[b + 1];
        target[o + 5] = this.data[b + 2];
        write += 2;
      }
    }
    return write;
  }

  reset(): void {
    this.heads.fill(0);
    this.lengths.fill(0);
    this.data.fill(0);
  }
}