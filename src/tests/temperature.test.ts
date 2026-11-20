import { describe, expect, it } from 'vitest';
import { createTemperatureField, latitudeTemperature, solarDeclination, subsolarLongitude, temperatureBand } from '@/simulations/temperature/field';
import { TemperatureSimulation } from '@/simulations/temperature/TemperatureSimulation';
import { DEFAULT_TEMPERATURE } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = { ...DEFAULT_TEMPERATURE };
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('temperature field', () => {
  it('decreases with latitude', () => {
    expect(latitudeTemperature(0, 15, 1)).toBeGreaterThan(latitudeTemperature(60, 15, 1));
    expect(latitudeTemperature(0, 15, 0)).toBe(15);
  });

  it('cycles subsolar longitude with time', () => {
    expect(subsolarLongitude(0)).toBe(0);
    expect(Math.abs(subsolarLongitude(1000))).toBeLessThanOrEqual(180);
  });

  it('produces a bounded seasonal declination', () => {
    for (const time of [0, 10000, 50000, 100000]) {
      expect(Math.abs(solarDeclination(time))).toBeLessThanOrEqual(23.44);
    }
  });

  it('separates field components', () => {
    const field = createTemperatureField({ ...config, seasonalIntensity: 1, dayNightInfluence: 1, variation: 0 });
    const detail = field.sampleDetailed(45, 0, 0);
    expect(detail.temperature).toBeCloseTo(detail.base + detail.seasonal + detail.dayNight, 4);
    expect(detail.local).toBe(0);
  });

  it('stays within physical display bounds', () => {
    const field = createTemperatureField(config);
    for (const lat of [-90, -45, 0, 45, 90]) {
      for (const lon of [-180, -90, 0, 90, 180]) {
        expect(field.sample(lat, lon, 1234)).toBeGreaterThanOrEqual(-90);
        expect(field.sample(lat, lon, 1234)).toBeLessThanOrEqual(60);
      }
    }
  });

  it('classifies climate bands', () => {
    expect(temperatureBand(35)).toBe('Tropical');
    expect(temperatureBand(15)).toBe('Temperate');
    expect(temperatureBand(-10)).toBe('Polar');
  });
});

describe('TemperatureSimulation', () => {
  it('rasterizes an RGBA heatmap', () => {
    const simulation = new TemperatureSimulation({ ...config });
    const data = simulation.rasterize(0);
    expect(data).toHaveLength(simulation.width * simulation.height * 4);
    expect(data[3]).toBeCloseTo(config.opacity * 255, 0);
  });

  it('updates its texture on simulation ticks', () => {
    const simulation = new TemperatureSimulation({ ...config });
    simulation.update(context);
    expect(simulation.texture.some((value) => value > 0)).toBe(true);
    simulation.reset();
  });

  it('exposes coherent inspection samples', () => {
    const simulation = new TemperatureSimulation({ ...config });
    const description = simulation.describe(0, 0, 0);
    expect(Number.isFinite(description.temperature)).toBe(true);
    expect(description.band.length).toBeGreaterThan(0);
    simulation.setConfig({ ...config, globalTemperature: 25 });
    expect(simulation.sample(0, 0, 0)).toBeGreaterThan(description.temperature);
  });

  it('skips work while disabled', () => {
    const simulation = new TemperatureSimulation({ ...config, enabled: false });
    simulation.update(context);
    expect(simulation.texture.every((value) => value === 0)).toBe(true);
    simulation.dispose();
  });
});