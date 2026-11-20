import { describe, expect, it } from 'vitest';
import { angularDistance, backgroundPressure, createPressureField, pressureCategory, regionContribution, REFERENCE_PRESSURE_HPA } from '@/simulations/pressure/field';
import { PressureSimulation } from '@/simulations/pressure/PressureSimulation';
import { DEFAULT_PRESSURE } from '@/data/defaults';
import type { SimulationContext } from '@/types/simulation';

const config = () => ({
  ...DEFAULT_PRESSURE,
  regions: DEFAULT_PRESSURE.regions.map((region) => ({ ...region, center: { ...region.center } })),
});
const context: SimulationContext = { time: 0, delta: 0.05, speed: 1, direction: 1, frame: 1, timeline: 0 };

describe('pressure field', () => {
  it('computes angular distances on the sphere', () => {
    expect(angularDistance(0, 0, 0, 90)).toBeCloseTo(90, 4);
    expect(angularDistance(0, 0, 0, 0)).toBeCloseTo(0, 4);
  });

  it('makes high regions raise pressure and low regions lower it', () => {
    const high = config().regions[0];
    const low = config().regions[1];
    expect(regionContribution(high, high.center.latitude, high.center.longitude, 0)).toBeGreaterThan(0);
    expect(regionContribution(low, low.center.latitude, low.center.longitude, 0)).toBeLessThan(0);
  });

  it('produces a bounded background pattern', () => {
    for (const lat of [-90, -30, 0, 30, 90]) {
      expect(Math.abs(backgroundPressure(lat, 0, 0))).toBeLessThan(30);
    }
  });

  it('centres the field around the reference pressure', () => {
    const field = createPressureField(config());
    const remote = field.sample(0, 150, 0);
    expect(Math.abs(remote - REFERENCE_PRESSURE_HPA)).toBeLessThan(40);
  });

  it('classifies synoptic categories', () => {
    expect(pressureCategory(1030)).toBe('Strong high');
    expect(pressureCategory(1010)).toBe('Normal');
    expect(pressureCategory(980)).toBe('Deep low');
  });
});

describe('PressureSimulation', () => {
  it('rasterizes the field and generates contours', () => {
    const simulation = new PressureSimulation(config());
    simulation.update(context);
    expect(simulation.texture).toHaveLength(96 * 48 * 4);
    expect(simulation.contourLines.length).toBe(DEFAULT_PRESSURE.contourCount);
    expect(simulation.contourLines.some((line) => line.segments.length > 0)).toBe(true);
    simulation.dispose();
  });

  it('inspects value, category and gradient', () => {
    const simulation = new PressureSimulation(config());
    const result = simulation.inspect(35, -28, 0);
    expect(result.value).toBeGreaterThan(REFERENCE_PRESSURE_HPA);
    expect(result.category.length).toBeGreaterThan(0);
    expect(Number.isFinite(result.gradient.magnitude)).toBe(true);
  });

  it('adds, updates and removes pressure regions', () => {
    const simulation = new PressureSimulation(config());
    simulation.addRegion({ id: 'x', label: 'Test', center: { latitude: 0, longitude: 0 }, strength: -1, radius: 10 });
    expect(simulation.config.regions).toHaveLength(3);
    simulation.updateRegion('x', { strength: -2 });
    expect(simulation.config.regions.find((r) => r.id === 'x')?.strength).toBe(-2);
    simulation.removeRegion('x');
    expect(simulation.config.regions).toHaveLength(2);
  });

  it('honours field visibility in the alpha channel', () => {
    const simulation = new PressureSimulation({ ...config(), fieldVisible: false });
    simulation.rasterize(0);
    expect(simulation.texture[3]).toBe(0);
  });

  it('provides a sampler compatible with the wind module', () => {
    const simulation = new PressureSimulation(config());
    expect(simulation.sampler()(35, -28, 0)).toBeGreaterThan(1000);
  });
});