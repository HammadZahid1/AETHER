import { contourSegments, fieldGradient, rasterizeField } from '@/engine/fields';
import { PRESSURE_RAMP, pressureToRamp } from '@/engine/colorMaps';
import { SimulationEngine } from '@/engine/engine';
import type { PressureConfig, PressureRegion } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { createPressureField, pressureCategory, REFERENCE_PRESSURE_HPA } from '@/simulations/pressure/field';

export const PRESSURE_TEXTURE_WIDTH = 96;
export const PRESSURE_TEXTURE_HEIGHT = 48;

export interface ContourLine {
  level: number;
  segments: Array<[number, number, number, number]>;
}

/** Pressure Systems lab module with field rasterization and contour extraction. */
export class PressureSimulation implements SimulationModule<PressureConfig> {
  readonly id = 'pressure' as const;
  readonly name = 'Pressure Systems';
  private field: ReturnType<typeof createPressureField>;
  private textureData = new Uint8Array(PRESSURE_TEXTURE_WIDTH * PRESSURE_TEXTURE_HEIGHT * 4);
  private contours: ContourLine[] = [];
  private lastUpdate = Number.NaN;

  constructor(public config: PressureConfig) {
    this.field = createPressureField(config);
  }

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    if (Math.abs(context.time - this.lastUpdate) < 0.5) return;
    this.field = createPressureField(this.config);
    this.rasterize(context.time);
    if (this.config.contoursVisible) this.generateContours(context.time);
    this.lastUpdate = context.time;
  }

  rasterize(time: number): Uint8Array {
    const values = rasterizeField(this.field, PRESSURE_TEXTURE_WIDTH, PRESSURE_TEXTURE_HEIGHT, time);
    for (let i = 0; i < values.length; i += 1) {
      const [r, g, b] = PRESSURE_RAMP.sample(pressureToRamp(values[i], 975, 1050));
      const offset = i * 4;
      this.textureData[offset] = Math.round(r * 255);
      this.textureData[offset + 1] = Math.round(g * 255);
      this.textureData[offset + 2] = Math.round(b * 255);
      this.textureData[offset + 3] = Math.round(this.config.fieldVisible ? 160 : 0);
    }
    return this.textureData;
  }

  generateContours(time: number, columns = 36, rows = 18): ContourLine[] {
    const min = REFERENCE_PRESSURE_HPA - 40 * this.config.intensity;
    const max = REFERENCE_PRESSURE_HPA + 40 * this.config.intensity;
    const lines: ContourLine[] = [];
    for (let i = 0; i < this.config.contourCount; i += 1) {
      const level = min + ((max - min) * (i + 1)) / (this.config.contourCount + 1);
      lines.push({ level, segments: contourSegments(this.field, level, columns, rows, time) });
    }
    this.contours = lines;
    return lines;
  }

  get contourLines(): readonly ContourLine[] {
    return this.contours;
  }

  get texture(): Uint8Array {
    return this.textureData;
  }

  sample(latitude: number, longitude: number, time = 0): number {
    return this.field.sample(latitude, longitude, time);
  }

  sampler(): (latitude: number, longitude: number, time?: number) => number {
    return (latitude, longitude, time) => this.field.sample(latitude, longitude, time);
  }

  gradient(latitude: number, longitude: number, time = 0) {
    return fieldGradient(this.field, { latitude, longitude }, time);
  }

  inspect(latitude: number, longitude: number, time = 0) {
    const value = this.sample(latitude, longitude, time);
    const gradient = this.gradient(latitude, longitude, time);
    return { value, category: pressureCategory(value), gradient };
  }

  addRegion(region: PressureRegion): void {
    this.config.regions.push(region);
    this.invalidate();
  }

  removeRegion(id: string): void {
    this.config.regions = this.config.regions.filter((region) => region.id !== id);
    this.invalidate();
  }

  updateRegion(id: string, patch: Partial<PressureRegion>): void {
    const region = this.config.regions.find((item) => item.id === id);
    if (region) Object.assign(region, patch);
    this.invalidate();
  }

  setConfig(config: PressureConfig): void {
    this.config = config;
    this.invalidate();
  }

  private invalidate(): void {
    this.field = createPressureField(this.config);
    this.lastUpdate = Number.NaN;
  }

  reset(): void {
    this.lastUpdate = Number.NaN;
  }

  dispose(): void {
    this.textureData = new Uint8Array(0);
    this.contours = [];
  }
}

export function registerPressureSimulation(engine: SimulationEngine, config: PressureConfig): PressureSimulation {
  const simulation = new PressureSimulation(config);
  engine.register(simulation);
  return simulation;
}