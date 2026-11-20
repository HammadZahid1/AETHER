import { ParticleSystem } from '@/engine/particles';
import { WIND_RAMP, temperatureToRamp } from '@/engine/colorMaps';
import { cartesianToGeo, DEG_TO_RAD, geoToCartesian, normalizeLongitude } from '@/engine/coordinates';
import type { WindConfig } from '@/types/config';
import type { SimulationContext } from '@/types/simulation';
import type { WindSample } from '@/simulations/wind/field';

export type WindFieldSampler = (latitude: number, longitude: number, time?: number) => WindSample;

/** Radius above the surface at which wind particles are drawn. */
export const WIND_LAYER_RADIUS = 1.025;

/**
 * Particle visualization for the wind field. Particles live on a thin shell
 * above the globe and are reprojected each frame so they follow the surface.
 */
export class WindParticles {
  private system: ParticleSystem;
  private field: WindFieldSampler;
  private config: WindConfig;
  private spawnAccumulator = 0;

  constructor(config: WindConfig, field: WindFieldSampler, seed = 4242) {
    this.config = config;
    this.field = field;
    this.system = new ParticleSystem({ capacity: Math.max(64, config.particleCount), defaultLifetime: config.lifetime, seed });
    this.reseed();
  }

  get particles(): ParticleSystem {
    return this.system;
  }

  setField(field: WindFieldSampler): void {
    this.field = field;
  }

  setConfig(config: WindConfig): void {
    const countChanged = config.particleCount !== this.config.particleCount;
    this.config = config;
    if (countChanged) {
      this.system.clear();
      this.system = new ParticleSystem({ capacity: Math.max(64, config.particleCount), defaultLifetime: config.lifetime, seed: 4242 });
      this.reseed();
    }
  }

  /** Populate the shell with uniformly distributed particles. */
  reseed(): void {
    this.system.clear();
    for (let i = 0; i < this.config.particleCount; i += 1) this.spawnParticle(this.system.getRandom() * this.config.lifetime);
  }

  private spawnParticle(ageOffset = 0): void {
    const random = this.system.getRandom;
    const u = random() * 2 - 1;
    const longitude = random() * 360 - 180;
    const latitude = Math.asin(u) / DEG_TO_RAD;
    const point = geoToCartesian(latitude, longitude, WIND_LAYER_RADIUS);
    this.system.spawn({
      x: point.x,
      y: point.y,
      z: point.z,
      vx: 0,
      vy: 0,
      vz: 0,
      r: 0.3,
      g: 0.8,
      b: 1,
      size: this.config.particleSize,
      lifetime: this.config.lifetime,
    });
    if (ageOffset > 0) {
      const index = this.findLastSpawned();
      this.system.buffers.age[index] = Math.min(ageOffset, this.config.lifetime * 0.95);
    }
  }

  private findLastSpawned(): number {
    const b = this.system.buffers;
    for (let i = this.system.capacity - 1; i >= 0; i -= 1) {
      if (b.alive[i] && b.age[i] === 0) return i;
    }
    return 0;
  }

  /** Compute the local east and north unit vectors for a geographic point. */
  private tangentBasis(latitude: number, longitude: number): { east: [number, number, number]; north: [number, number, number] } {
    const phi = latitude * DEG_TO_RAD;
    const lambda = longitude * DEG_TO_RAD;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    return {
      east: [-sinLambda, 0, -cosLambda],
      north: [-sinPhi * cosLambda, cosPhi, sinPhi * sinLambda],
    };
  }

  update(context: SimulationContext): void {
    const b = this.system.buffers;
    const speedScale = 0.00035 * this.config.speed;
    this.system.update(context.delta, ({ index, dt }) => {
      const p = index * 3;
      const geo = cartesianToGeo({ x: b.position[p], y: b.position[p + 1], z: b.position[p + 2] });
      const sample = this.field(geo.latitude, normalizeLongitude(geo.longitude), context.time);
      const { east, north } = this.tangentBasis(geo.latitude, geo.longitude);
      const targetX = (sample.u * east[0] + sample.v * north[0]) * speedScale;
      const targetY = (sample.u * east[1] + sample.v * north[1]) * speedScale;
      const targetZ = (sample.u * east[2] + sample.v * north[2]) * speedScale;
      const blend = Math.min(1, dt * (2 + this.config.acceleration * 8));
      b.velocity[p] += (targetX - b.velocity[p]) * blend;
      b.velocity[p + 1] += (targetY - b.velocity[p + 1]) * blend;
      b.velocity[p + 2] += (targetZ - b.velocity[p + 2]) * blend;
      const rampValue = temperatureToRamp(sample.speed, 0, 26);
      WIND_RAMP.writeTo(b.color, index, rampValue);
    });

    // Reproject onto the atmospheric shell and recycle expired particles.
    for (let i = 0; i < this.system.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      const scale = WIND_LAYER_RADIUS / length;
      b.position[p] *= scale;
      b.position[p + 1] *= scale;
      b.position[p + 2] *= scale;
      if (b.age[i] >= b.lifetime[i] * 0.99) this.spawnParticle();
    }

    this.spawnAccumulator += context.delta;
    if (this.spawnAccumulator > 0.5) {
      this.spawnAccumulator = 0;
      const missing = this.config.particleCount - this.system.count;
      for (let i = 0; i < Math.min(missing, 32); i += 1) this.spawnParticle();
    }
  }

  reset(): void {
    this.reseed();
  }
}