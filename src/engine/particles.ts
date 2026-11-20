import { createRandom } from '@/engine/noise';

/** Mutable per-particle state stored in structure-of-arrays form. */
export interface ParticleBuffers {
  position: Float32Array;
  velocity: Float32Array;
  acceleration: Float32Array;
  color: Float32Array;
  size: Float32Array;
  age: Float32Array;
  lifetime: Float32Array;
  opacity: Float32Array;
  alive: Uint8Array;
}

export interface ParticleSpawn {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  size?: number;
  lifetime?: number;
  opacity?: number;
}

export interface ParticleUpdateContext {
  index: number;
  dt: number;
  time: number;
  buffers: ParticleBuffers;
}

export interface ParticleSystemOptions {
  capacity: number;
  defaultLifetime?: number;
  defaultSize?: number;
  seed?: number;
}

/**
 * A fixed-capacity, allocation-free particle pool. Domain simulations supply
 * an updater callback; this class only manages storage, integration, lifetime
 * and recycling.
 */
export class ParticleSystem {
  readonly capacity: number;
  readonly buffers: ParticleBuffers;
  private readonly random: () => number;
  private readonly defaultLifetime: number;
  private readonly defaultSize: number;
  private cursor = 0;
  private liveCount = 0;
  private time = 0;

  constructor(options: ParticleSystemOptions) {
    this.capacity = Math.max(1, Math.floor(options.capacity));
    this.defaultLifetime = options.defaultLifetime ?? 4;
    this.defaultSize = options.defaultSize ?? 1;
    this.random = createRandom(options.seed ?? 1337);
    this.buffers = {
      position: new Float32Array(this.capacity * 3),
      velocity: new Float32Array(this.capacity * 3),
      acceleration: new Float32Array(this.capacity * 3),
      color: new Float32Array(this.capacity * 3),
      size: new Float32Array(this.capacity),
      age: new Float32Array(this.capacity),
      lifetime: new Float32Array(this.capacity),
      opacity: new Float32Array(this.capacity),
      alive: new Uint8Array(this.capacity),
    };
  }

  get count(): number {
    return this.liveCount;
  }

  get elapsed(): number {
    return this.time;
  }

  getRandom = (): number => this.random();

  /** Insert a particle, recycling the oldest slot when the pool is full. */
  spawn(particle: ParticleSpawn): number {
    const index = this.findFreeSlot();
    const p = index * 3;
    const b = this.buffers;
    b.position[p] = particle.x;
    b.position[p + 1] = particle.y;
    b.position[p + 2] = particle.z;
    b.velocity[p] = particle.vx;
    b.velocity[p + 1] = particle.vy;
    b.velocity[p + 2] = particle.vz;
    b.acceleration[p] = 0;
    b.acceleration[p + 1] = 0;
    b.acceleration[p + 2] = 0;
    b.color[p] = particle.r;
    b.color[p + 1] = particle.g;
    b.color[p + 2] = particle.b;
    b.size[index] = particle.size ?? this.defaultSize;
    b.lifetime[index] = particle.lifetime ?? this.defaultLifetime;
    b.opacity[index] = particle.opacity ?? 1;
    b.age[index] = 0;
    if (!b.alive[index]) this.liveCount += 1;
    b.alive[index] = 1;
    return index;
  }

  kill(index: number): void {
    if (this.buffers.alive[index]) {
      this.buffers.alive[index] = 0;
      this.liveCount -= 1;
    }
  }

  /** Set the alive flag directly while keeping the live count consistent. */
  setAlive(index: number, alive: boolean): void {
    const wasAlive = this.buffers.alive[index] === 1;
    if (alive === wasAlive) return;
    this.buffers.alive[index] = alive ? 1 : 0;
    this.liveCount += alive ? 1 : -1;
  }

  clear(): void {
    this.buffers.alive.fill(0);
    this.liveCount = 0;
    this.cursor = 0;
    this.time = 0;
  }

  /**
   * Advance all live particles. The updater can modify velocity, acceleration,
   * color and lifetime. Integration and aging happen afterwards in one pass.
   */
  update(dt: number, updater?: (context: ParticleUpdateContext) => void): void {
    if (dt <= 0) return;
    this.time += dt;
    const b = this.buffers;
    for (let i = 0; i < this.capacity; i += 1) {
      if (!b.alive[i]) continue;
      if (updater) updater({ index: i, dt, time: this.time, buffers: b });
      const p = i * 3;
      b.velocity[p] += b.acceleration[p] * dt;
      b.velocity[p + 1] += b.acceleration[p + 1] * dt;
      b.velocity[p + 2] += b.acceleration[p + 2] * dt;
      b.position[p] += b.velocity[p] * dt;
      b.position[p + 1] += b.velocity[p + 1] * dt;
      b.position[p + 2] += b.velocity[p + 2] * dt;
      b.acceleration[p] = 0;
      b.acceleration[p + 1] = 0;
      b.acceleration[p + 2] = 0;
      b.age[i] += dt;
      if (b.age[i] >= b.lifetime[i]) this.kill(i);
    }
  }

  /** Interpolate a particle position at a fractional time offset. */
  interpolate(index: number, alpha: number): { x: number; y: number; z: number } {
    const p = index * 3;
    const b = this.buffers;
    return {
      x: b.position[p] + b.velocity[p] * alpha,
      y: b.position[p + 1] + b.velocity[p + 1] * alpha,
      z: b.position[p + 2] + b.velocity[p + 2] * alpha,
    };
  }

  /** Fill a compact buffer with only live particles for GPU upload. */
  writeCompactPositions(target: Float32Array): number {
    const b = this.buffers;
    let write = 0;
    for (let i = 0; i < this.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      target[write] = b.position[p];
      target[write + 1] = b.position[p + 1];
      target[write + 2] = b.position[p + 2];
      write += 3;
    }
    return write / 3;
  }

  private findFreeSlot(): number {
    const alive = this.buffers.alive;
    for (let offset = 0; offset < this.capacity; offset += 1) {
      const index = (this.cursor + offset) % this.capacity;
      if (!alive[index]) {
        this.cursor = (index + 1) % this.capacity;
        return index;
      }
    }
    const index = this.cursor;
    this.cursor = (this.cursor + 1) % this.capacity;
    this.kill(index);
    return index;
  }
}