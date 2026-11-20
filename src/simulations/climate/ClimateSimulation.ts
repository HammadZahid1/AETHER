import { rasterizeField } from '@/engine/fields';
import { CLIMATE_RAMP, TEMPERATURE_RAMP } from '@/engine/colorMaps';
import { SimulationEngine } from '@/engine/engine';
import type { ClimateConfig } from '@/types/config';
import type { SimulationContext, SimulationModule } from '@/types/simulation';
import { CLIMATE_DATASETS, climateZoneLabel, seasonLabel } from '@/data/climateDatasets';

export const CLIMATE_TEXTURE_WIDTH = 128;
export const CLIMATE_TEXTURE_HEIGHT = 64;

/** Climate Lab module for exploring bundled illustrative datasets. */
export class ClimateSimulation implements SimulationModule<ClimateConfig> {
  readonly id = 'climate' as const;
  readonly name = 'Climate Lab';
  private texture = new Uint8Array(CLIMATE_TEXTURE_WIDTH * CLIMATE_TEXTURE_HEIGHT * 4);
  private lastSeason = Number.NaN;

  constructor(public config: ClimateConfig) {}

  update(context: SimulationContext): void {
    if (!this.config.enabled) return;
    const season = this.config.comparisonMode
      ? (this.config.season + context.timeline * 4) % 4
      : this.config.season;
    if (Math.abs(season - this.lastSeason) < 0.02) return;
    this.rasterize(season);
    this.lastSeason = season;
  }

  get dataset() {
    return CLIMATE_DATASETS[this.config.dataset];
  }

  get textureData(): Uint8Array {
    return this.texture;
  }

  rasterize(season = this.config.season): Uint8Array {
    const dataset = this.dataset;
    const values = rasterizeField(
      { id: dataset.id, sample: (lat, lon) => dataset.sample(lat, lon, season) },
      CLIMATE_TEXTURE_WIDTH,
      CLIMATE_TEXTURE_HEIGHT,
    );
    const ramp = dataset.id === 'temperature' || dataset.id === 'ocean' ? TEMPERATURE_RAMP : CLIMATE_RAMP;
    for (let i = 0; i < values.length; i += 1) {
      const normalized = (values[i] - dataset.min) / (dataset.max - dataset.min || 1);
      const [r, g, b] = ramp.sample(Math.min(Math.max(normalized, 0), 1));
      const o = i * 4;
      this.texture[o] = Math.round(r * 255);
      this.texture[o + 1] = Math.round(g * 255);
      this.texture[o + 2] = Math.round(b * 255);
      this.texture[o + 3] = 170;
    }
    return this.texture;
  }

  sample(latitude: number, longitude: number, season = this.config.season): number {
    const dataset = this.dataset;
    const base = dataset.sample(latitude, longitude, season);
    return base * this.config.temperatureScale;
  }

  /** Difference between the selected season and six months later. */
  compare(latitude: number, longitude: number): number {
    const dataset = this.dataset;
    const current = dataset.sample(latitude, longitude, this.config.season);
    const opposite = dataset.sample(latitude, longitude, (this.config.season + 2) % 4);
    return current - opposite;
  }

  inspect(latitude: number, longitude: number) {
    const value = this.sample(latitude, longitude);
    const zoneIndex = CLIMATE_DATASETS.zones.sample(latitude, longitude, this.config.season);
    const rainfall = CLIMATE_DATASETS.rainfall.sample(latitude, longitude, this.config.season) * this.config.rainfallIntensity;
    return {
      value,
      unit: this.dataset.unit,
      dataset: this.dataset.name,
      season: seasonLabel(this.config.season),
      zone: climateZoneLabel(zoneIndex),
      rainfall,
      comparison: this.compare(latitude, longitude),
    };
  }

  setDataset(dataset: ClimateConfig['dataset']): void {
    this.config.dataset = dataset;
    this.lastSeason = Number.NaN;
  }

  setSeason(season: number): void {
    this.config.season = ((season % 4) + 4) % 4;
    this.lastSeason = Number.NaN;
  }

  setConfig(config: ClimateConfig): void {
    this.config = config;
    this.lastSeason = Number.NaN;
  }

  reset(): void {
    this.lastSeason = Number.NaN;
  }

  dispose(): void {
    this.texture = new Uint8Array(0);
  }
}

export function registerClimateSimulation(engine: SimulationEngine, config: ClimateConfig): ClimateSimulation {
  const simulation = new ClimateSimulation(config);
  engine.register(simulation);
  return simulation;
}