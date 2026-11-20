import { SimulationEngine } from '@/engine/engine';
import { rasterizeField } from '@/engine/fields';
import { TEMPERATURE_RAMP, temperatureToRamp } from '@/engine/colorMaps';
import type { TemperatureConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { createTemperatureField, temperatureBand } from '@/simulations/temperature/field';

/** Default resolution of the generated temperature texture. */
export const TEMPERATURE_TEXTURE_WIDTH = 128;
export const TEMPERATURE_TEXTURE_HEIGHT = 64;

/** Temperature Lab module producing a rasterized thermal field. */
export class TemperatureSimulation implements SimulationModule<TemperatureConfig> {
  readonly id = 'temperature' as const;
  readonly name = 'Temperature Lab';
  private field: ReturnType<typeof createTemperatureField>;
  private textureData = new Uint8Array(TEMPERATURE_TEXTURE_WIDTH * TEMPERATURE_TEXTURE_HEIGHT * 4);
  private lastRasterTime = Number.NaN;

  constructor(public config: TemperatureConfig) {
    this.field = createTemperatureField(config);
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    if (Math.abs(context.time - this.lastRasterTime) < 0.25) return;
    this.rasterize(context.time);
    this.lastRasterTime = context.time;
  }

  /** Generate RGBA bytes for a DataTexture on the globe surface. */
  rasterize(time: number): Uint8Array {
    const values = rasterizeField(this.field, TEMPERATURE_TEXTURE_WIDTH, TEMPERATURE_TEXTURE_HEIGHT, time);
    for (let i = 0; i < values.length; i += 1) {
      const rampValue = temperatureToRamp(values[i], this.config.scaleMin, this.config.scaleMax);
      const [r, g, b] = TEMPERATURE_RAMP.sample(rampValue);
      const offset = i * 4;
      this.textureData[offset] = Math.round(r * 255);
      this.textureData[offset + 1] = Math.round(g * 255);
      this.textureData[offset + 2] = Math.round(b * 255);
      this.textureData[offset + 3] = Math.round(this.config.opacity * 255);
    }
    return this.textureData;
  }

  get texture(): Uint8Array {
    return this.textureData;
  }

  get width(): number {
    return TEMPERATURE_TEXTURE_WIDTH;
  }

  get height(): number {
    return TEMPERATURE_TEXTURE_HEIGHT;
  }

  sample(latitude: number, longitude: number, time = 0): number {
    return this.field.sample(latitude, longitude, time);
  }

  describe(latitude: number, longitude: number, time = 0): { temperature: number; band: string } {
    const temperature = this.sample(latitude, longitude, time);
    return { temperature, band: temperatureBand(temperature) };
  }

  setConfig(config: TemperatureConfig): void {
    this.config = config;
    this.field = createTemperatureField(config);
    this.lastRasterTime = Number.NaN;
  }

  reset(): void {
    this.lastRasterTime = Number.NaN;
  }

  dispose(): void {
    this.textureData = new Uint8Array(0);
  }
}

export function registerTemperatureSimulation(engine: SimulationEngine, config: TemperatureConfig): TemperatureSimulation {
  const simulation = new TemperatureSimulation(config);
  engine.register(simulation);
  return simulation;
}