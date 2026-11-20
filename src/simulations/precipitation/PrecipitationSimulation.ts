import { ParticleSystem } from '@/engine/particles';
import { DEG_TO_RAD, geoToCartesian } from '@/engine/coordinates';
import { SimulationEngine } from '@/engine/engine';
import type { PrecipitationConfig } from '@/types/config';
import type { GeoCoordinates } from '@/types/geo';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { createPrecipitationField, precipitationCategory } from '@/simulations/precipitation/field';

export const RAIN_TOP_ALTITUDE = 1.12;
export const RAIN_SURFACE = 1.005;

/** Precipitation Lab module with falling rain particles. */
export class PrecipitationSimulation implements SimulationModule<PrecipitationConfig> {
  readonly id = 'precipitation' as const;
  readonly name = 'Precipitation Lab';
  private particles: ParticleSystem;
  private field: ReturnType<typeof createPrecipitationField>;

  constructor(
    public config: PrecipitationConfig,
    private center: GeoCoordinates = { latitude: 20, longitude: -60 },
  ) {
    this.field = createPrecipitationField(config, center);
    const count = Math.round(240 + config.density * 2200);
    this.particles = new ParticleSystem({ capacity: count, defaultLifetime: 8, seed: 1717 });
    this.reseed();
  }

  get particleSystem(): ParticleSystem {
    return this.particles;
  }

  setCenter(center: GeoCoordinates): void {
    this.center = center;
    this.field = createPrecipitationField(this.config, center);
    this.reseed();
  }

  reseed(): void {
    this.particles.clear();
    const random = this.particles.getRandom;
    for (let i = 0; i < this.particles.capacity; i += 1) {
      this.spawnDrop(i, random() * 0.1, random);
    }
  }

  private spawnDrop(index: number, ageOffset = 0, random: () => number = this.particles.getRandom): void {
    let latitude = this.center.latitude + (random() * 2 - 1) * this.config.regionRadius;
    let longitude = this.center.longitude + (random() * 2 - 1) * this.config.regionRadius;
    if (this.config.distribution === 'global') {
      latitude = Math.asin(random() * 2 - 1) / DEG_TO_RAD;
      longitude = random() * 360 - 180;
    }
    const intensity = this.field.sample(latitude, longitude, 0);
    if (random() > intensity * 1.4 + 0.05) {
      this.particles.setAlive(index, false);
      return;
    }
    const point = geoToCartesian(latitude, longitude, RAIN_TOP_ALTITUDE - random() * 0.03);
    const b = this.particles.buffers;
    const p = index * 3;
    b.position[p] = point.x;
    b.position[p + 1] = point.y;
    b.position[p + 2] = point.z;
    b.velocity[p] = 0;
    b.velocity[p + 1] = 0;
    b.velocity[p + 2] = 0;
    b.color[p] = 0.55;
    b.color[p + 1] = 0.78;
    b.color[p + 2] = 1;
    b.size[index] = this.config.particleSize * (0.6 + random() * 0.8);
    b.opacity[index] = 0.35 + intensity * 0.55;
    b.age[index] = ageOffset;
    b.lifetime[index] = 6;
    this.particles.setAlive(index, true);
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    const b = this.particles.buffers;
    const fallSpeed = 0.00016 * this.config.speed;
    this.particles.update(context.delta, ({ index }) => {
      const p = index * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      b.velocity[p] = (-b.position[p] / length) * fallSpeed;
      b.velocity[p + 1] = (-b.position[p + 1] / length) * fallSpeed;
      b.velocity[p + 2] = (-b.position[p + 2] / length) * fallSpeed;
    });

    for (let i = 0; i < this.particles.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]);
      if (length <= RAIN_SURFACE || b.age[i] >= b.lifetime[i]) this.spawnDrop(i);
    }
  }

  sample(latitude: number, longitude: number, time = 0): number {
    return this.field.sample(latitude, longitude, time);
  }

  inspect(latitude: number, longitude: number, time = 0) {
    const value = this.sample(latitude, longitude, time);
    return { value, category: precipitationCategory(value) };
  }

  setConfig(config: PrecipitationConfig): void {
    const rebuild = config.density !== this.config.density || config.distribution !== this.config.distribution;
    this.config = config;
    this.field = createPrecipitationField(config, this.center);
    if (rebuild) {
      const count = Math.round(240 + config.density * 2200);
      this.particles = new ParticleSystem({ capacity: count, defaultLifetime: 8, seed: 1717 });
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

export function registerPrecipitationSimulation(
  engine: SimulationEngine,
  config: PrecipitationConfig,
  center?: GeoCoordinates,
): PrecipitationSimulation {
  const simulation = new PrecipitationSimulation(config, center);
  engine.register(simulation);
  return simulation;
}