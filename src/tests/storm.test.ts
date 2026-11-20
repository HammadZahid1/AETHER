import { describe, expect, it } from 'vitest';
import { sampleStorm, stormBearing, stormCategory, stormCenterAt, stormTrajectory } from '@/simulations/storm/field';
import { StormSimulation, STORM_LAYER_RADIUS } from '@/simulations/storm/StormSimulation';
import { DEFAULT_STORM } from '@/data/defaults';
import { REFERENCE_PRESSURE_HPA } from '@/simulations/pressure/field';
import type { SimulationContext } from '@/types/simulation';

const config = { ...DEFAULT_STORM, enabled: true, center: { ...DEFAULT_STORM.center } };
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('storm field', () => {
  it('moves the center over time', () => {
    const start = stormCenterAt(config, 0);
    const later = stormCenterAt(config, 5000);
    expect(start.latitude).toBeCloseTo(config.center.latitude, 4);
    expect(start.longitude).toBeCloseTo(config.center.longitude, 4);
    expect(later.latitude).not.toBeCloseTo(start.latitude, 2);
  });

  it('computes bearings around the center', () => {
    const center = { latitude: 0, longitude: 0 };
    expect(stormBearing(center, 10, 0)).toBeCloseTo(0, 0);
    expect(stormBearing(center, 0, 10)).toBeCloseTo(90, 0);
  });

  it('creates a low-pressure core with eyewall cloud and rain', () => {
    const core = sampleStorm(config, config.center.latitude, config.center.longitude, 0);
    const far = sampleStorm(config, config.center.latitude + 60, config.center.longitude, 0);
    expect(core.pressureAnomaly).toBeLessThan(far.pressureAnomaly);
    expect(core.cloud).toBeGreaterThanOrEqual(0);
    expect(core.rain).toBeGreaterThan(far.rain);
    expect(core.normalizedRadius).toBeCloseTo(0, 4);
  });

  it('scales tangential flow with intensity and rotation', () => {
    const weak = sampleStorm({ ...config, intensity: 0.2 }, config.center.latitude + 3, config.center.longitude, 0);
    const strong = sampleStorm({ ...config, intensity: 1 }, config.center.latitude + 3, config.center.longitude, 0);
    expect(Math.abs(strong.tangential)).toBeGreaterThan(Math.abs(weak.tangential));
  });

  it('generates a trajectory of finite coordinates', () => {
    const path = stormTrajectory(config, 8);
    expect(path).toHaveLength(9);
    expect(path.every((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude))).toBe(true);
  });

  it('categorizes intensity', () => {
    expect(stormCategory(0.95)).toBe('Major system');
    expect(stormCategory(0.2)).toBe('Weak system');
  });
});

describe('StormSimulation', () => {
  it('spawns spiral particles on the storm shell', () => {
    const simulation = new StormSimulation(config);
    expect(simulation.particleSystem.count).toBeGreaterThan(0);
    const b = simulation.particleSystem.buffers;
    for (let i = 0; i < simulation.particleSystem.count; i += 1) {
      const p = i * 3;
      expect(Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2])).toBeCloseTo(STORM_LAYER_RADIUS, 3);
    }
    simulation.dispose();
  });

  it('advects particles while enabled', () => {
    const simulation = new StormSimulation(config);
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    for (let i = 0; i < 5; i += 1) simulation.update(context);
    expect(Array.from(simulation.particleSystem.buffers.position.slice(0, 3))).not.toEqual(before);
  });

  it('exposes a pressure sampler below the reference pressure', () => {
    const simulation = new StormSimulation(config);
    expect(simulation.pressureSampler()(config.center.latitude, config.center.longitude, 0)).toBeLessThan(REFERENCE_PRESSURE_HPA);
  });

  it('produces inspection output and trajectory', () => {
    const simulation = new StormSimulation(config);
    const result = simulation.inspect(config.center.latitude, config.center.longitude, 0);
    expect(result.category.length).toBeGreaterThan(0);
    expect(result.pressure).toBeLessThan(REFERENCE_PRESSURE_HPA);
    expect(simulation.trajectory.length).toBeGreaterThan(0);
    expect(result.center.latitude).toBeCloseTo(config.center.latitude, 3);
  });

  it('skips updates while disabled', () => {
    const simulation = new StormSimulation({ ...config, enabled: false });
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    simulation.update(context);
    expect(Array.from(simulation.particleSystem.buffers.position.slice(0, 3))).toEqual(before);
  });

  it('hides the trajectory when disabled', () => {
    const simulation = new StormSimulation({ ...config, trajectoryVisible: false });
    expect(simulation.trajectory).toHaveLength(0);
  });
});