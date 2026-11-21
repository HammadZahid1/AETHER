import { describe, expect, it } from 'vitest';
import { ATMOSPHERIC_LAYERS, layerById } from '@/data/atmosphericLayers';
import {
  CLIMATE_DATASETS,
  CLIMATE_DATASET_LIST,
  climateZoneLabel,
  seasonLabel,
  seasonPhase,
} from '@/data/climateDatasets';

describe('atmospheric reference layers', () => {
  it('orders shells from the surface outward with contiguous spans', () => {
    expect(ATMOSPHERIC_LAYERS.map((layer) => layer.id)).toEqual([
      'troposphere',
      'stratosphere',
      'mesosphere',
      'thermosphere',
      'exosphere',
    ]);

    ATMOSPHERIC_LAYERS.forEach((layer, index) => {
      expect(layer.baseKm).toBeLessThan(layer.topKm);
      expect(layer.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(layer.phenomena.length).toBeGreaterThan(0);
      if (index > 0) {
        expect(layer.baseKm).toBe(ATMOSPHERIC_LAYERS[index - 1].topKm);
      }
    });
  });

  it('resolves known layers and falls back to the troposphere', () => {
    expect(layerById('mesosphere').name).toBe('Mesosphere');
    expect(layerById('unknown')).toBe(ATMOSPHERIC_LAYERS[0]);
  });
});

describe('illustrative climate datasets', () => {
  it('exposes four bundled datasets with declared value ranges', () => {
    expect(CLIMATE_DATASET_LIST).toHaveLength(4);
    expect(Object.keys(CLIMATE_DATASETS).sort()).toEqual(['ocean', 'rainfall', 'temperature', 'zones']);

    for (const dataset of CLIMATE_DATASET_LIST) {
      expect(dataset.name).toMatch(/^Illustrative/);
      expect(dataset.unit.length).toBeGreaterThan(0);
      expect(dataset.description.length).toBeGreaterThan(20);
      expect(dataset.min).toBeLessThan(dataset.max);
    }
  });

  it('maps season indices to a clamped deterministic phase', () => {
    expect(seasonPhase(0)).toBeCloseTo(0);
    expect(seasonPhase(1)).toBeCloseTo(Math.PI / 2);
    expect(seasonPhase(4)).toBeCloseTo(Math.PI * 2);
    expect(seasonPhase(5)).toBeCloseTo(Math.PI * 2);
    expect(seasonPhase(-1)).toBeCloseTo(0);
  });

  it('samples deterministically within declared ranges', () => {
    const samples = [
      { latitude: 0, longitude: 0, season: 0 },
      { latitude: 45, longitude: 120, season: 2 },
      { latitude: -80, longitude: -60, season: 3 },
    ];

    for (const dataset of CLIMATE_DATASET_LIST) {
      for (const sample of samples) {
        const value = dataset.sample(sample.latitude, sample.longitude, sample.season);

        expect(value).toBe(dataset.sample(sample.latitude, sample.longitude, sample.season));
        expect(value).toBeGreaterThanOrEqual(dataset.min);
        expect(value).toBeLessThanOrEqual(dataset.max);
      }
    }
  });

  it('applies opposite seasonal temperature effects by hemisphere', () => {
    const temperature = CLIMATE_DATASETS.temperature;

    expect(temperature.sample(60, 0, 0)).toBeLessThan(temperature.sample(60, 0, 2));
    expect(temperature.sample(-60, 0, 0)).toBeGreaterThan(temperature.sample(-60, 0, 2));
  });

  it('labels climate zones and seasons', () => {
    expect(climateZoneLabel(5)).toBe('Tropical');
    expect(climateZoneLabel(3.5)).toBe('Subtropical');
    expect(climateZoneLabel(2.5)).toBe('Temperate');
    expect(climateZoneLabel(1.5)).toBe('Boreal');
    expect(climateZoneLabel(0)).toBe('Polar');

    expect(seasonLabel(0)).toBe('Northern winter');
    expect(seasonLabel(3)).toBe('Northern autumn');
    expect(seasonLabel(4)).toBe('Northern winter');
  });
});
