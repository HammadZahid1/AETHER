import { describe, expect, it } from 'vitest';
import { createPrecipitationField, precipitationCategory } from '@/simulations/precipitation/field';
import { PrecipitationSimulation, RAIN_TOP_ALTITUDE } from '@/simulations/precipitation/PrecipitationSimulation';
import { DEFAULT_PRECIPITATION } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const center = { latitude: 20, longitude: -60 };
const config = { ...DEFAULT_PRECIPITATION, enabled: true, intensity: 1 };
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('precipitation field', () => {
  it('concentrates rain around the configured center', () => {
    const field = createPrecipitationField(config, center);
    expect(field.sample(center.latitude, center.longitude, 0)).toBeGreaterThan(field.sample(0, 150, 0));
  });

  it('is stronger with higher intensity', () => {
    const weak = createPrecipitationField({ ...config, intensity: 0.2 }, center);
    const strong = createPrecipitationField({ ...config, intensity: 1 }, center);
    expect(strong.sample(center.latitude, center.longitude, 0)).toBeGreaterThan(weak.sample(center.latitude, center.longitude, 0));
  });

  it('covers the globe in global distribution mode', () => {
    const field = createPrecipitationField({ ...config, distribution: 'global' }, center);
    expect(field.sample(-60, 120, 0)).toBeGreaterThan(0);
  });

  it('classifies intensity', () => {
    expect(precipitationCategory(0.9)).toBe('Torrential');
    expect(precipitationCategory(0.4)).toBe('Moderate');
    expect(precipitationCategory(0.01)).toBe('None');
  });
});

describe('PrecipitationSimulation', () => {
  it('spawns rain drops above the surface', () => {
    const simulation = new PrecipitationSimulation(config, center);
    expect(simulation.particleSystem.capacity).toBeGreaterThan(0);
    const b = simulation.particleSystem.buffers;
    let above = 0;
    for (let i = 0; i < b.capacity.length; i += 1) {
      if (!b.alive[i]) continue;
      const p = i * 3;
      expect(Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2])).toBeGreaterThan(1);
      above += 1;
    }
    expect(above).toBeGreaterThan(0);
    simulation.dispose();
  });

  it('moves drops toward the surface', () => {
    const simulation = new PrecipitationSimulation(config, center);
    const b = simulation.particleSystem.buffers;
    let index = 0;
    for (let i = 0; i < b.alive.length; i += 1) {
      if (b.alive[i]) { index = i; break; }
    }
    const before = Math.hypot(b.position[index * 3], b.position[index * 3 + 1], b.position[index * 3 + 2]);
    simulation.update({ ...context, delta: 0.02 });
    const after = Math.hypot(b.position[index * 3], b.position[index * 3 + 1], b.position[index * 3 + 2]);
    expect(before).toBeLessThanOrEqual(RAIN_TOP_ALTITUDE);
    expect(after).toBeLessThanOrEqual(before + 0.0001);
  });

  it('responds to a new storm center', () => {
    const simulation = new PrecipitationSimulation(config, center);
    simulation.setCenter({ latitude: -30, longitude: 100 });
    expect(simulation.sample(-30, 100, 0)).toBeGreaterThan(simulation.sample(20, -60, 0));
  });

  it('exposes inspection data', () => {
    const simulation = new PrecipitationSimulation(config, center);
    const result = simulation.inspect(center.latitude, center.longitude, 0);
    expect(result.value).toBeGreaterThan(0);
    expect(result.category.length).toBeGreaterThan(0);
  });

  it('skips updates while disabled', () => {
    const simulation = new PrecipitationSimulation({ ...config, enabled: false }, center);
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    simulation.update(context);
    expect(Array.from(simulation.particleSystem.buffers.position.slice(0, 3))).toEqual(before);
  });
});