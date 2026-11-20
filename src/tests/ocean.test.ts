import { describe, expect, it } from 'vitest';
import { createOceanField, createOceanTemperatureField, equatorialCurrent, gyreFlow, traceOceanStreamline } from '@/simulations/ocean/field';
import { OceanSimulation, OCEAN_LAYER_RADIUS } from '@/simulations/ocean/OceanSimulation';
import { DEFAULT_OCEAN } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = { ...DEFAULT_OCEAN, enabled: true };
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('ocean field', () => {
  it('creates eastward equatorial flow and a westward counter-current', () => {
    expect(equatorialCurrent(0)).toBeGreaterThan(0);
    expect(equatorialCurrent(8)).toBeLessThan(0);
  });

  it('generates gyre circulation', () => {
    const flow = gyreFlow(30, -120);
    expect(Number.isFinite(flow.u)).toBe(true);
    expect(Number.isFinite(flow.v)).toBe(true);
  });

  it('reduces sea temperature toward the poles', () => {
    const field = createOceanTemperatureField(config);
    expect(field.sample(0, 0, 0)).toBeGreaterThan(field.sample(70, 0, 0));
  });

  it('scales currents with configured speed', () => {
    const slow = createOceanField({ ...config, currentSpeed: 0.2 }).sampleOcean(20, 30, 0);
    const fast = createOceanField({ ...config, currentSpeed: 2 }).sampleOcean(20, 30, 0);
    expect(fast.speed).toBeGreaterThan(slow.speed);
  });

  it('traces streamlines', () => {
    const path = traceOceanStreamline(createOceanField(config), 20, -40);
    expect(path.length).toBeGreaterThan(1);
  });
});

describe('OceanSimulation', () => {
  it('seeds particles on the ocean shell', () => {
    const simulation = new OceanSimulation(config);
    expect(simulation.particleSystem.count).toBe(config.particleCount);
    const b = simulation.particleSystem.buffers;
    const p = 0;
    expect(Math.hypot(b.position[p], b.position[p + 1], b.position[p + 2])).toBeCloseTo(OCEAN_LAYER_RADIUS, 4);
    simulation.dispose();
  });

  it('advects particles and maintains their shell', () => {
    const simulation = new OceanSimulation(config);
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    for (let i = 0; i < 4; i += 1) simulation.update(context);
    const after = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    expect(after).not.toEqual(before);
    expect(Math.hypot(after[0], after[1], after[2])).toBeCloseTo(OCEAN_LAYER_RADIUS, 3);
  });

  it('rasterizes sea-surface temperature', () => {
    const simulation = new OceanSimulation(config);
    expect(simulation.textureData.some((value) => value > 0)).toBe(true);
    expect(simulation.textureData[3]).toBe(130);
  });

  it('generates named streamline sets', () => {
    const simulation = new OceanSimulation(config);
    expect(simulation.streamlines()).toHaveLength(4);
  });

  it('skips updates while disabled', () => {
    const simulation = new OceanSimulation({ ...config, enabled: false });
    const before = Array.from(simulation.particleSystem.buffers.position.slice(0, 3));
    simulation.update(context);
    expect(Array.from(simulation.particleSystem.buffers.position.slice(0, 3))).toEqual(before);
  });
});