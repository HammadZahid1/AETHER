import { SimulationEngine } from '@/engine/engine';
import type { WindConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { createWindField, type PressureSampler, type WindSample } from '@/simulations/wind/field';
import { WindParticles } from '@/simulations/wind/particles';

/** Wind Lab module: couples the analytic wind field with its particle layer. */
export class WindSimulation implements SimulationModule<WindConfig> {
  readonly id = 'wind' as const;
  readonly name = 'Wind Flow Lab';
  private field = createWindField(this.config);
  private particles: WindParticles;

  constructor(public config: WindConfig, private readonly pressure?: PressureSampler) {
    this.field = createWindField(config, pressure);
    this.particles = new WindParticles(config, this.field.sampleWind);
  }

  /** Connect pressure systems to the wind field after both modules exist. */
  setPressureSampler(sampler: PressureSampler): void {
    this.field = createWindField(this.config, sampler);
    this.particles.setField(this.field.sampleWind);
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    this.particles.update(context);
  }

  sample(latitude: number, longitude: number, time = 0): WindSample {
    return this.field.sampleWind(latitude, longitude, time);
  }

  get vectorField() {
    return this.field;
  }

  get particleSystem(): WindParticles {
    return this.particles;
  }

  setConfig(config: WindConfig): void {
    this.config = config;
    this.field = createWindField(config, this.pressure);
    this.particles.setConfig(config);
    this.particles.setField(this.field.sampleWind);
  }

  reset(): void {
    this.particles.reset();
  }

  dispose(): void {
    this.particles.particles.clear();
  }
}

/** Register the wind module with the shared engine. */
export function registerWindSimulation(engine: SimulationEngine, config: WindConfig, pressure?: PressureSampler): WindSimulation {
  const simulation = new WindSimulation(config, pressure);
  engine.register(simulation);
  return simulation;
}

/** Generate a polyline streamline by integrating the wind field. */
export function traceStreamline(
  sample: (lat: number, lon: number, time?: number) => WindSample,
  latitude: number,
  longitude: number,
  steps = 48,
  stepSize = 1.1,
  time = 0,
): Array<{ latitude: number; longitude: number }> {
  const path = [{ latitude, longitude }];
  let lat = latitude;
  let lon = longitude;
  for (let i = 0; i < steps; i += 1) {
    const { u, v, speed } = sample(lat, lon, time);
    if (speed < 0.001) break;
    lat += (v / speed) * stepSize;
    lon += (u / (speed * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))) * stepSize;
    if (Math.abs(lat) > 89) break;
    path.push({ latitude: lat, longitude: ((lon + 180) % 360 + 360) % 360 - 180 });
  }
  return path;
}