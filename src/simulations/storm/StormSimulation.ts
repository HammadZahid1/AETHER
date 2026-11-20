import { ParticleSystem } from '@/engine/particles';
import { cartesianToGeo, DEG_TO_RAD, geoToCartesian } from '@/engine/coordinates';
import { PRESSURE_RAMP, pressureToRamp } from '@/engine/colorMaps';
import { SimulationEngine } from '@/engine/engine';
import type { StormConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import type { GeoCoordinates } from '@/types/geo';
import { REFERENCE_PRESSURE_HPA } from '@/simulations/pressure/field';
import { sampleStorm, stormCategory, stormCenterAt, stormTrajectory, type StormSample } from '@/simulations/storm/field';

export const STORM_LAYER_RADIUS = 1.04;

/** Storm Lab module with spiral particles, moving center and trajectory. */
export class StormSimulation implements SimulationModule<StormConfig> {
  readonly id = 'storm' as const;
  readonly name = 'Storm Lab';
  private particles: ParticleSystem;
  private trajectoryCache: GeoCoordinates[] = [];

  constructor(public config: StormConfig) {
    this.particles = new ParticleSystem({
      capacity: Math.round(600 + config.intensity * 2400),
      defaultLifetime: 14,
      seed: 5150,
    });
    this.refreshTrajectory();
    this.reseed();
  }

  get particleSystem(): ParticleSystem {
    return this.particles;
  }

  get trajectory(): readonly GeoCoordinates[] {
    return this.trajectoryCache;
  }

  centerAt(time: number): GeoCoordinates {
    return stormCenterAt(this.config, time);
  }

  sample(latitude: number, longitude: number, time = 0): StormSample {
    return sampleStorm(this.config, latitude, longitude, time);
  }

  /** Pressure sampler compatible with the wind and pressure modules. */
  pressureSampler(): (latitude: number, longitude: number, time?: number) => number {
    return (latitude, longitude, time) =>
      REFERENCE_PRESSURE_HPA + this.sample(latitude, longitude, time).pressureAnomaly;
  }

  private refreshTrajectory(): void {
    this.trajectoryCache = this.config.trajectoryVisible ? stormTrajectory(this.config) : [];
  }

  private tangentBasis(latitude: number, longitude: number) {
    const phi = latitude * DEG_TO_RAD;
    const lambda = longitude * DEG_TO_RAD;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    return {
      east: [-Math.sin(lambda), 0, -Math.cos(lambda)] as const,
      north: [-sinPhi * Math.cos(lambda), cosPhi, sinPhi * Math.sin(lambda)] as const,
    };
  }

  private spawnParticle(index: number, time: number, random = this.particles.getRandom): void {
    const center = this.centerAt(time);
    const bearing = random() * 360;
    const radial = 0.08 + random() * 1.25;
    const distance = radial * this.config.radius;
    const latRad = center.latitude * DEG_TO_RAD;
    const lonRad = center.longitude * DEG_TO_RAD;
    const bearingRad = bearing * DEG_TO_RAD;
    const angular = distance / 111;
    const latitude = Math.asin(
      Math.sin(latRad) * Math.cos(angular) + Math.cos(latRad) * Math.sin(angular) * Math.cos(bearingRad),
    ) / DEG_TO_RAD;
    const longitude = (lonRad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angular) * Math.cos(latRad),
      Math.cos(angular) - Math.sin(latRad) * Math.sin(latitude * DEG_TO_RAD),
    )) / DEG_TO_RAD;
    const point = geoToCartesian(latitude, longitude, STORM_LAYER_RADIUS);
    const b = this.particles.buffers;
    const p = index * 3;
    b.position[p] = point.x;
    b.position[p + 1] = point.y;
    b.position[p + 2] = point.z;
    b.velocity[p] = 0;
    b.velocity[p + 1] = 0;
    b.velocity[p + 2] = 0;
    b.age[index] = random() * 5;
    b.lifetime[index] = 8 + random() * 10;
    b.alive[index] = 1;
  }

  reseed(): void {
    this.particles.clear();
    for (let i = 0; i < this.particles.capacity; i += 1) this.spawnParticle(i, 0);
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    const b = this.particles.buffers;
    const speedScale = 0.00042 * this.config.windIntensity;
    this.particles.update(context.delta, ({ index, dt }) => {
      const p = index * 3;
      const geo = cartesianToGeo({ x: b.position[p], y: b.position[p + 1], z: b.position[p + 2] });
      const sample = this.sample(geo.latitude, geo.longitude, context.time);
      const { east, north } = this.tangentBasis(geo.latitude, geo.longitude);
      const tx = (sample.tangential * east[0] + sample.radial * north[0]) * speedScale;
      const ty = (sample.tangential * east[1] + sample.radial * north[1]) * speedScale;
      const tz = (sample.tangential * east[2] + sample.radial * north[2]) * speedScale;
      const blend = Math.min(1, dt * 4);
      b.velocity[p] += (tx - b.velocity[p]) * blend;
      b.velocity[p + 1] += (ty - b.velocity[p + 1]) * blend;
      b.velocity[p + 2] += (tz - b.velocity[p + 2]) * blend;
      const pressure = REFERENCE_PRESSURE_HPA + sample.pressureAnomaly;
      const [r, g, blue] = PRESSURE_RAMP.sample(pressureToRamp(pressure, 975, 1050));
      b.color[p] = r;
      b.color[p + 1] = g;
      b.color[p + 2] = blue;
      b.size[index] = this.config.intensity * 0.02 + sample.cloud * 0.01;
      b.opacity[index] = 0.35 + sample.cloud * 0.6;
    });

    for (let i = 0; i < this.particles.capacity; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      const length = Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2]) || 1;
      const scale = STORM_LAYER_RADIUS / length;
      b.position[p] *= scale;
      b.position[p + 1] *= scale;
      b.position[p + 2] *= scale;
      const geo = cartesianToGeo({ x: b.position[p], y: b.position[p + 1], z: b.position[p + 2] });
      if (this.sample(geo.latitude, geo.longitude, context.time).normalizedRadius > 2.2) this.spawnParticle(i, context.time);
    }
  }

  inspect(latitude: number, longitude: number, time = 0) {
    const sample = this.sample(latitude, longitude, time);
    return {
      ...sample,
      category: stormCategory(this.config.intensity),
      pressure: REFERENCE_PRESSURE_HPA + sample.pressureAnomaly,
      center: this.centerAt(time),
    };
  }

  setConfig(config: StormConfig): void {
    const rebuild = config.intensity !== this.config.intensity;
    this.config = config;
    this.refreshTrajectory();
    if (rebuild) {
      this.particles = new ParticleSystem({
        capacity: Math.round(600 + config.intensity * 2400),
        defaultLifetime: 14,
        seed: 5150,
      });
      this.reseed();
    }
  }

  reset(): void {
    this.refreshTrajectory();
    this.reseed();
  }

  dispose(): void {
    this.particles.clear();
    this.trajectoryCache = [];
  }
}

export function registerStormSimulation(engine: SimulationEngine, config: StormConfig): StormSimulation {
  const simulation = new StormSimulation(config);
  engine.register(simulation);
  return simulation;
}