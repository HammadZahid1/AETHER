import { ParticleSystem } from '@/engine/particles';
import { cartesianToGeo, DEG_TO_RAD, geoToCartesian } from '@/engine/coordinates';
import { OCEAN_RAMP, temperatureToRamp } from '@/engine/colorMaps';
import { rasterizeField } from '@/engine/fields';
import { SimulationEngine } from '@/engine/engine';
import type { OceanConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { createOceanField, createOceanTemperatureField, traceOceanStreamline } from '@/simulations/ocean/field';

export const OCEAN_LAYER_RADIUS = 1.012;
export const OCEAN_TEXTURE_WIDTH = 96;
export const OCEAN_TEXTURE_HEIGHT = 48;

/** Ocean Explorer module with surface current particles and temperature overlay. */
export class OceanSimulation implements SimulationModule<OceanConfig> {
  readonly id = 'ocean' as const;
  readonly name = 'Ocean Explorer';
  private field: ReturnType<typeof createOceanField>;
  private temperatureField: ReturnType<typeof createOceanTemperatureField>;
  private particles: ParticleSystem;
  private texture = new Uint8Array(OCEAN_TEXTURE_WIDTH * OCEAN_TEXTURE_HEIGHT * 4);

  constructor(public config: OceanConfig) {
    this.field = createOceanField(config);
    this.temperatureField = createOceanTemperatureField(config);
    this.particles = new ParticleSystem({ capacity: config.particleCount, defaultLifetime: 9, seed: 3301 });
    this.reseed();
    this.rasterize();
  }

  get particleSystem(): ParticleSystem {
    return this.particles;
  }

  get textureData(): Uint8Array {
    return this.texture;
  }

  reseed(): void {
    this.particles.clear();
    for (let i = 0; i < this.particles.capacity; i += 1) {
      const u = this.particles.getRandom() * 2 - 1;
      const latitude = Math.asin(u) / DEG_TO_RAD;
      const longitude = this.particles.getRandom() * 360 - 180;
      const point = geoToCartesian(latitude, longitude, OCEAN_LAYER_RADIUS);
      this.particles.spawn({
        x: point.x, y: point.y, z: point.z,
        vx: 0, vy: 0, vz: 0,
        r: 0.2, g: 0.8, b: 0.9,
        size: this.config.particleSize,
        lifetime: 6 + this.particles.getRandom() * 8,
      });
    }
  }

  private tangentBasis(latitude: number, longitude: number) {
    const phi = latitude * DEG_TO_RAD;
    const lambda = longitude * DEG_TO_RAD;
    return {
      east: [-Math.sin(lambda), 0, -Math.cos(lambda)] as const,
      north: [-Math.sin(phi) * Math.cos(lambda), Math.cos(phi), Math.sin(phi) * Math.sin(lambda)] as const,
    };
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    const b = this.particles.buffers;
    const scale = 0.0003 * this.config.currentSpeed;
    this.particles.update(context.delta, ({ index, dt }) => {
      const p = index * 3;
      const geo = cartesianToGeo({ x: b.position[p], y: b.position[p + 1], z: b.position[p + 2] });
      const sample = this.field.sampleOcean(geo.latitude, geo.longitude, context.time);
      const { east, north } = this.tangentBasis(geo.latitude, geo.longitude);
      const tx = (sample.u * east[0] + sample.v * north[0]) * scale;
      const ty = (sample.u * east[1] + sample.v * north[1]) * scale;
      const tz = (sample.u * east[2] + sample.v * north[2]) * scale;
      const blend = Math.min(1, dt * 3);
      b.velocity[p] += (tx - b.velocity[p]) * blend;
      b.velocity[p + 1] += (ty - b.velocity[p + 1]) * blend;
      b.velocity[p + 2] += (tz - b.velocity[p + 2]) * blend;
      OCEAN_RAMP.writeTo(b.color, index, temperatureToRamp(sample.temperature, -2, 32));
    });

    for (let i = 0; i < this.particles.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      const factor = OCEAN_LAYER_RADIUS / length;
      b.position[p] *= factor;
      b.position[p + 1] *= factor;
      b.position[p + 2] *= factor;
      if (b.age[i] >= b.lifetime[i] * 0.99) {
        const latitude = (this.particles.getRandom() * 2 - 1) * 80;
        const longitude = this.particles.getRandom() * 360 - 180;
        const point = geoToCartesian(latitude, longitude, OCEAN_LAYER_RADIUS);
        b.position[p] = point.x;
        b.position[p + 1] = point.y;
        b.position[p + 2] = point.z;
        b.age[i] = 0;
      }
    }

    if (this.config.temperatureOverlay) this.rasterize();
  }

  rasterize(): Uint8Array {
    const values = rasterizeField(this.temperatureField, OCEAN_TEXTURE_WIDTH, OCEAN_TEXTURE_HEIGHT);
    for (let i = 0; i < values.length; i += 1) {
      const [r, g, b] = OCEAN_RAMP.sample(temperatureToRamp(values[i], -2, 32));
      const o = i * 4;
      this.texture[o] = Math.round(r * 255);
      this.texture[o + 1] = Math.round(g * 255);
      this.texture[o + 2] = Math.round(b * 255);
      this.texture[o + 3] = this.config.temperatureOverlay ? 130 : 0;
    }
    return this.texture;
  }

  sample(latitude: number, longitude: number, time = 0) {
    return this.field.sampleOcean(latitude, longitude, time);
  }

  streamlines(seeds: Array<{ latitude: number; longitude: number }> = []) {
    const defaults = seeds.length ? seeds : [
      { latitude: 30, longitude: -140 }, { latitude: -30, longitude: -20 },
      { latitude: 10, longitude: 60 }, { latitude: -10, longitude: 140 },
    ];
    return defaults.map((seed) => traceOceanStreamline(this.field, seed.latitude, seed.longitude));
  }

  setConfig(config: OceanConfig): void {
    const rebuild = config.particleCount !== this.config.particleCount;
    this.config = config;
    this.field = createOceanField(config);
    this.temperatureField = createOceanTemperatureField(config);
    if (rebuild) {
      this.particles = new ParticleSystem({ capacity: config.particleCount, defaultLifetime: 9, seed: 3301 });
      this.reseed();
    }
    this.rasterize();
  }

  reset(): void {
    this.reseed();
  }

  dispose(): void {
    this.particles.clear();
    this.texture = new Uint8Array(0);
  }
}

export function registerOceanSimulation(engine: SimulationEngine, config: OceanConfig): OceanSimulation {
  const simulation = new OceanSimulation(config);
  engine.register(simulation);
  return simulation;
}