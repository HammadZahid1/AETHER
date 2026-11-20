import { ParticleSystem } from '@/engine/particles';
import { cartesianToGeo, DEG_TO_RAD, geoToCartesian } from '@/engine/coordinates';
import { SimulationEngine } from '@/engine/engine';
import type { CloudConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { cloudAltitude, cloudLatitudeWeight, sampleCloudDensity } from '@/simulations/clouds/field';

export interface CloudLayerBuffers {
  position: Float32Array;
  size: Float32Array;
  opacity: Float32Array;
}

/** Cloud Laboratory module managing layered procedural cloud puffs. */
export class CloudSimulation implements SimulationModule<CloudConfig> {
  readonly id = 'clouds' as const;
  readonly name = 'Cloud Laboratory';
  private particles: ParticleSystem;
  private count: number;

  constructor(public config: CloudConfig) {
    this.count = Math.round(400 + config.density * 1600);
    this.particles = new ParticleSystem({ capacity: this.count, defaultLifetime: 22, seed: 909 });
    this.reseed();
  }

  get particleSystem(): ParticleSystem {
    return this.particles;
  }

  /** Rebuild cloud puffs using rejection sampling against the density field. */
  reseed(): void {
    this.particles.clear();
    const random = this.particles.getRandom;
    let attempts = 0;
    while (this.particles.count < this.count && attempts < this.count * 12) {
      attempts += 1;
      const u = random() * 2 - 1;
      const latitude = Math.asin(u) / DEG_TO_RAD;
      const longitude = random() * 360 - 180;
      const layer = Math.floor(random() * Math.max(1, this.config.layerCount));
      const density = sampleCloudDensity(latitude, longitude, 0, this.config, layer);
      if (density < 0.18 || random() > density * cloudLatitudeWeight(latitude) + 0.15) continue;
      const radius = cloudAltitude(this.config, layer);
      const point = geoToCartesian(latitude, longitude, radius);
      this.particles.spawn({
        x: point.x,
        y: point.y,
        z: point.z,
        vx: 0,
        vy: 0,
        vz: 0,
        r: 0.86,
        g: 0.93,
        b: 1,
        size: this.config.size * (0.7 + random() * 0.8),
        lifetime: 14 + random() * 20,
        opacity: this.config.opacity * (0.4 + density * 0.6),
      });
    }
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    const b = this.particles.buffers;
    const drift = 0.00018 * this.config.movementSpeed * Math.max(0.1, context.delta * 20);
    this.particles.update(context.delta, ({ index, time }) => {
      const p = index * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      const nx = b.position[p] / length;
      const ny = b.position[p + 1] / length;
      const nz = b.position[p + 2] / length;
      b.velocity[p] = -nz * drift;
      b.velocity[p + 1] = Math.sin(time * 0.01 + index) * drift * 0.05;
      b.velocity[p + 2] = nx * drift;
      void ny;
    });

    for (let i = 0; i < this.particles.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      const target = cloudAltitude(this.config, i % Math.max(1, this.config.layerCount));
      const scale = target / length;
      b.position[p] *= scale;
      b.position[p + 1] *= scale;
      b.position[p + 2] *= scale;
      if (b.age[i] >= b.lifetime[i] * 0.99) this.respawn(i);
    }
  }

  private respawn(index: number): void {
    const random = this.particles.getRandom;
    const latitude = (random() * 2 - 1) * 80;
    const longitude = random() * 360 - 180;
    const layer = Math.floor(random() * Math.max(1, this.config.layerCount));
    const point = geoToCartesian(latitude, longitude, cloudAltitude(this.config, layer));
    const b = this.particles.buffers;
    const p = index * 3;
    b.position[p] = point.x;
    b.position[p + 1] = point.y;
    b.position[p + 2] = point.z;
    b.age[index] = 0;
    b.lifetime[index] = 14 + random() * 20;
    b.opacity[index] = this.config.opacity * (0.5 + random() * 0.5);
    b.alive[index] = 1;
  }

  densityAt(latitude: number, longitude: number, time = 0): number {
    let total = 0;
    for (let layer = 0; layer < Math.max(1, this.config.layerCount); layer += 1) {
      total += sampleCloudDensity(latitude, longitude, time, this.config, layer);
    }
    return Math.min(1, total / Math.max(1, this.config.layerCount));
  }

  inspect(latitude: number, longitude: number, time = 0) {
    return {
      density: this.densityAt(latitude, longitude, time),
      altitude: cloudAltitude(this.config, 0),
      latitudeWeight: cloudLatitudeWeight(latitude),
      cartesian: geoToCartesian(latitude, longitude),
      geographic: cartesianToGeo(geoToCartesian(latitude, longitude)),
    };
  }

  setConfig(config: CloudConfig): void {
    const rebuild = config.density !== this.config.density || config.layerCount !== this.config.layerCount;
    this.config = config;
    if (rebuild) {
      this.count = Math.round(400 + config.density * 1600);
      this.particles = new ParticleSystem({ capacity: this.count, defaultLifetime: 22, seed: 909 });
      this.reseed();
    }
  }

  reset(): void {
    this.reseed();
  }

  dispose(): void {
    this.particles.clear();
  }
}

export function registerCloudSimulation(engine: SimulationEngine, config: CloudConfig): CloudSimulation {
  const simulation = new CloudSimulation(config);
  engine.register(simulation);
  return simulation;
}