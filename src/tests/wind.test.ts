import { describe, expect, it } from 'vitest';
import { circulationBands, createWindField, jetStreamBoost, windNoise } from '@/simulations/wind/field';
import { traceStreamline, WindSimulation } from '@/simulations/wind/WindSimulation';
import { WindParticles, WIND_LAYER_RADIUS } from '@/simulations/wind/particles';
import { DEFAULT_WIND } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = { ...DEFAULT_WIND, particleCount: 64 };

const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('wind field generation', () => {
  it('produces easterly trades and mid-latitude westerlies', () => {
    expect(circulationBands(15).u).toBeLessThan(0);
    expect(circulationBands(45).u).toBeGreaterThan(0);
    expect(circulationBands(-45).u).toBeGreaterThan(0);
    expect(circulationBands(75).u).toBeLessThan(0);
  });

  it('is deterministic for the same inputs', () => {
    const a = windNoise(20, 30, 5);
    const b = windNoise(20, 30, 5);
    expect(a).toEqual(b);
    expect(windNoise(20, 30, 5)).not.toEqual(windNoise(20, 31, 5));
  });

  it('scales with speed and intensity settings', () => {
    const weak = createWindField({ ...config, speed: 0.5, intensity: 0 });
    const strong = createWindField({ ...config, speed: 2, intensity: 0 });
    expect(strong.sampleWind(45, 0).speed).toBeGreaterThan(weak.sampleWind(45, 0).speed);
  });

  it('reacts to pressure gradients', () => {
    const plain = createWindField(config);
    const withPressure = createWindField(config, (lat) => (lat - 30) ** 2);
    const a = plain.sampleWind(40, 10);
    const b = withPressure.sampleWind(40, 10);
    expect(a.u).not.toBeCloseTo(b.u, 3);
  });

  it('derives speed and direction from vector components', () => {
    const sample = createWindField(config).sampleWind(45, 10);
    expect(sample.speed).toBeCloseTo(Math.hypot(sample.u, sample.v), 6);
    expect(sample.direction).toBeGreaterThanOrEqual(0);
    expect(sample.direction).toBeLessThan(360);
  });

  it('boosts jet-stream latitudes', () => {
    expect(jetStreamBoost(45, 0, 0)).toBeGreaterThan(jetStreamBoost(0, 0, 0));
  });
});

describe('wind particles', () => {
  it('spawns the configured number of particles on the atmospheric shell', () => {
    const field = createWindField(config);
    const particles = new WindParticles(config, field.sampleWind);
    expect(particles.particles.count).toBe(config.particleCount);
    for (let i = 0; i < particles.particles.count; i += 1) {
      const p = i * 3;
      const b = particles.particles.buffers;
      expect(Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2])).toBeCloseTo(WIND_LAYER_RADIUS, 4);
    }
  });

  it('moves particles when updated', () => {
    const field = createWindField(config);
    const particles = new WindParticles(config, field.sampleWind);
    const before = particles.particles.buffers.position.slice(0, 3);
    for (let i = 0; i < 5; i += 1) particles.update(context);
    const after = particles.particles.buffers.position.slice(0, 3);
    expect(Array.from(after)).not.toEqual(Array.from(before));
    expect(Math.hypot(after[0], after[1], after[2])).toBeCloseTo(WIND_LAYER_RADIUS, 4);
  });
});

describe('WindSimulation', () => {
  it('registers as a simulation module and exposes field samples', () => {
    const simulation = new WindSimulation({ ...config });
    expect(simulation.id).toBe('wind');
    expect(simulation.sample(30, 0).speed).toBeGreaterThan(0);
    simulation.update(context);
    expect(simulation.particleSystem.particles.count).toBeGreaterThan(0);
    simulation.reset();
    simulation.dispose();
  });

  it('skips updates when disabled', () => {
    const simulation = new WindSimulation({ ...config, enabled: false });
    simulation.update(context);
    expect(simulation.particleSystem.particles.count).toBe(config.particleCount);
  });

  it('rebuilds the field when configuration changes', () => {
    const simulation = new WindSimulation({ ...config });
    simulation.setConfig({ ...config, speed: 3 });
    expect(simulation.sample(45, 0).speed).toBeGreaterThan(0);
  });

  it('traces streamlines across the globe', () => {
    const field = createWindField(config);
    const path = traceStreamline(field.sampleWind, 10, -20, 24);
    expect(path.length).toBeGreaterThan(1);
    expect(path.every((point) => Math.abs(point.latitude) <= 90)).toBe(true);
  });
});