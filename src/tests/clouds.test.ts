import { describe, expect, it } from 'vitest';
import { cloudAltitude, cloudLatitudeWeight, sampleCloudDensity } from '@/simulations/clouds/field';
import { CloudSimulation } from '@/simulations/clouds/CloudSimulation';
import { DEFAULT_CLOUDS } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = { ...DEFAULT_CLOUDS, enabled: true };
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('cloud field', () => {
  it('responds to coverage and density settings', () => {
    const sparse = sampleCloudDensity(20, 30, 0, { ...config, coverage: 0.1, density: 0.1 });
    const dense = sampleCloudDensity(20, 30, 0, { ...config, coverage: 0.95, density: 1 });
    expect(dense).toBeGreaterThan(sparse);
  });

  it('returns bounded density values', () => {
    for (let lat = -80; lat <= 80; lat += 20) {
      const value = sampleCloudDensity(lat, 40, 12, config);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('changes over time and across layers', () => {
    const samplesAt = (time: number, layer: number) =>
      Array.from({ length: 12 }, (_, i) => sampleCloudDensity(-60 + i * 10, i * 30, time, config, layer));
    expect(samplesAt(0, 0)).not.toEqual(samplesAt(500, 0));
    expect(samplesAt(0, 0)).not.toEqual(samplesAt(0, 1));
  });

  it('raises upper cloud layers', () => {
    expect(cloudAltitude(config, 1)).toBeGreaterThan(cloudAltitude(config, 0));
  });

  it('weights tropical and mid-latitude formation', () => {
    expect(cloudLatitudeWeight(0)).toBeGreaterThan(cloudLatitudeWeight(80));
    expect(cloudLatitudeWeight(50)).toBeGreaterThan(cloudLatitudeWeight(30));
  });
});

describe('CloudSimulation', () => {
  it('generates cloud puffs on spherical shells', () => {
    const simulation = new CloudSimulation(config);
    expect(simulation.particleSystem.count).toBeGreaterThan(0);
    const b = simulation.particleSystem.buffers;
    for (let i = 0; i < simulation.particleSystem.count; i += 1) {
      const p = i * 3;
      expect(Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2])).toBeGreaterThan(1);
    }
    simulation.dispose();
  });

  it('drifts clouds while preserving altitude', () => {
    const simulation = new CloudSimulation(config);
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    for (let i = 0; i < 4; i += 1) simulation.update(context);
    const after = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    expect(after).not.toEqual(before);
    expect(Math.hypot(after[0], after[1], after[2])).toBeGreaterThan(1);
  });

  it('exposes density inspection data', () => {
    const simulation = new CloudSimulation(config);
    const result = simulation.inspect(45, -20, 0);
    expect(result.density).toBeGreaterThanOrEqual(0);
    expect(result.density).toBeLessThanOrEqual(1);
    expect(result.altitude).toBeGreaterThan(1);
  });

  it('skips updates while disabled', () => {
    const simulation = new CloudSimulation({ ...config, enabled: false });
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    simulation.update(context);
    expect(Array.from(simulation.particleSystem.buffers.position.slice(0, 3))).toEqual(before);
  });

  it('rebuilds puff capacity when density changes', () => {
    const simulation = new CloudSimulation(config);
    const original = simulation.particleSystem.capacity;
    simulation.setConfig({ ...config, density: 1 });
    expect(simulation.particleSystem.capacity).toBeGreaterThan(original);
  });
});