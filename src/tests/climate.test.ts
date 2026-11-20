import { describe, expect, it } from 'vitest';
import { CLIMATE_DATASET_LIST, CLIMATE_DATASETS, climateZoneLabel, seasonLabel } from '@/data/climateDatasets';
import { ClimateSimulation } from '@/simulations/climate/ClimateSimulation';
import { DEFAULT_CLIMATE } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = () => ({ ...DEFAULT_CLIMATE, enabled: true });
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0.2 };

describe('climate datasets', () => {
  it('provides four distinct illustrative datasets', () => {
    expect(CLIMATE_DATASET_LIST).toHaveLength(4);
    expect(new Set(CLIMATE_DATASET_LIST.map((dataset) => dataset.id)).size).toBe(4);
  });

  it('warms tropical latitudes relative to polar latitudes', () => {
    expect(CLIMATE_DATASETS.temperature.sample(0, 0, 0)).toBeGreaterThan(CLIMATE_DATASETS.temperature.sample(80, 0, 0));
    expect(CLIMATE_DATASETS.ocean.sample(0, 0, 0)).toBeGreaterThan(CLIMATE_DATASETS.ocean.sample(70, 0, 0));
  });

  it('peaks rainfall in the tropics', () => {
    expect(CLIMATE_DATASETS.rainfall.sample(0, 0, 0)).toBeGreaterThan(CLIMATE_DATASETS.rainfall.sample(30, 0, 0));
  });

  it('varies by season', () => {
    expect(CLIMATE_DATASETS.temperature.sample(60, 0, 0)).not.toBeCloseTo(CLIMATE_DATASETS.temperature.sample(60, 0, 2), 2);
  });

  it('stays inside declared value ranges', () => {
    for (const dataset of CLIMATE_DATASET_LIST) {
      for (const lat of [-80, -40, 0, 40, 80]) {
        const value = dataset.sample(lat, 20, 1);
        expect(value).toBeGreaterThanOrEqual(dataset.min);
        expect(value).toBeLessThanOrEqual(dataset.max);
      }
    }
  });

  it('labels zones and seasons', () => {
    expect(climateZoneLabel(5)).toBe('Tropical');
    expect(climateZoneLabel(0)).toBe('Polar');
    expect(seasonLabel(0)).toBe('Northern winter');
  });
});

describe('ClimateSimulation', () => {
  it('rasterizes the selected dataset', () => {
    const simulation = new ClimateSimulation(config());
    expect(simulation.textureData).toHaveLength(128 * 64 * 4);
    expect(simulation.textureData[3]).toBe(170);
    simulation.dispose();
  });

  it('switches datasets and seasons', () => {
    const simulation = new ClimateSimulation(config());
    simulation.setDataset('rainfall');
    expect(simulation.dataset.unit).toBe('mm/month');
    simulation.setSeason(6);
    expect(simulation.config.season).toBe(2);
  });

  it('compares opposite seasons', () => {
    const simulation = new ClimateSimulation(config());
    expect(Math.abs(simulation.compare(60, 0))).toBeGreaterThan(0);
  });

  it('returns a complete inspection record', () => {
    const simulation = new ClimateSimulation(config());
    const result = simulation.inspect(20, -40);
    expect(result.dataset.length).toBeGreaterThan(0);
    expect(result.zone.length).toBeGreaterThan(0);
    expect(Number.isFinite(result.value)).toBe(true);
    expect(Number.isFinite(result.comparison)).toBe(true);
  });

  it('advances comparison mode with the timeline', () => {
    const simulation = new ClimateSimulation({ ...config(), comparisonMode: true });
    const before = simulation.textureData.slice(0, 16);
    simulation.update(context);
    expect(Array.from(simulation.textureData.slice(0, 16))).not.toEqual(Array.from(before));
  });
});