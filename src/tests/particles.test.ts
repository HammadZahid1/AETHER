import { describe, expect, it } from 'vitest';
import { ParticleSystem } from '@/engine/particles';
import { TrailBuffer } from '@/engine/trails';
import { ColorRamp, temperatureToRamp, WIND_RAMP } from '@/engine/colorMaps';

const spawn = { x: 0, y: 0, z: 0, vx: 1, vy: 0, vz: 0, r: 1, g: 1, b: 1 };

describe('ParticleSystem', () => {
  it('initializes empty buffers of the requested capacity', () => {
    const system = new ParticleSystem({ capacity: 8 });
    expect(system.capacity).toBe(8);
    expect(system.buffers.position).toHaveLength(24);
    expect(system.count).toBe(0);
  });

  it('spawns particles and tracks the live count', () => {
    const system = new ParticleSystem({ capacity: 4 });
    system.spawn(spawn);
    system.spawn({ ...spawn, vx: 2 });
    expect(system.count).toBe(2);
    expect(system.buffers.velocity[3]).toBe(2);
  });

  it('recycles slots when capacity is exceeded', () => {
    const system = new ParticleSystem({ capacity: 2 });
    system.spawn({ ...spawn, r: 0.1 });
    system.spawn({ ...spawn, r: 0.2 });
    system.spawn({ ...spawn, r: 0.3 });
    expect(system.count).toBe(2);
  });

  it('integrates velocity and acceleration', () => {
    const system = new ParticleSystem({ capacity: 2 });
    const index = system.spawn({ ...spawn, lifetime: 10 });
    system.buffers.acceleration[index * 3] = 2;
    system.update(0.5);
    expect(system.buffers.position[index * 3]).toBeCloseTo(0.75, 6);
    expect(system.buffers.velocity[index * 3]).toBeCloseTo(2, 6);
  });

  it('applies updater callbacks', () => {
    const system = new ParticleSystem({ capacity: 2 });
    const index = system.spawn({ ...spawn, lifetime: 10 });
    system.update(0.1, ({ buffers, index: i }) => {
      buffers.color[i * 3 + 1] = 0.5;
    });
    expect(system.buffers.color[index * 3 + 1]).toBe(0.5);
  });

  it('expires particles by lifetime', () => {
    const system = new ParticleSystem({ capacity: 2 });
    system.spawn({ ...spawn, lifetime: 0.2 });
    system.update(0.25);
    expect(system.count).toBe(0);
  });

  it('supports manual kill and clear', () => {
    const system = new ParticleSystem({ capacity: 4 });
    const index = system.spawn(spawn);
    system.kill(index);
    expect(system.count).toBe(0);
    system.spawn(spawn);
    system.clear();
    expect(system.count).toBe(0);
    expect(system.elapsed).toBe(0);
  });

  it('interpolates positions', () => {
    const system = new ParticleSystem({ capacity: 1 });
    const index = system.spawn(spawn);
    expect(system.interpolate(index, 0.5).x).toBeCloseTo(0.5, 6);
  });

  it('writes only live particles to a compact buffer', () => {
    const system = new ParticleSystem({ capacity: 4 });
    system.spawn({ ...spawn, x: 1 });
    system.spawn({ ...spawn, x: 2 });
    system.kill(0);
    const target = new Float32Array(12);
    expect(system.writeCompactPositions(target)).toBe(1);
    expect(target[0]).toBe(2);
  });
});

describe('TrailBuffer', () => {
  it('records and expands trails into segments', () => {
    const system = new ParticleSystem({ capacity: 2 });
    const index = system.spawn({ ...spawn, lifetime: 10 });
    const trails = new TrailBuffer(system, 4);
    trails.record();
    system.update(0.1);
    trails.record();
    const target = new Float32Array(64);
    const vertices = trails.writeSegments(target, 32);
    expect(vertices).toBe(2);
    expect(Array.from(target.slice(0, 6)).every(Number.isFinite)).toBe(true);
    trails.reset();
    expect(trails.writeSegments(target, 32)).toBe(0);
  });
});

describe('ColorRamp', () => {
  it('clamps outside its domain and interpolates inside', () => {
    const ramp = new ColorRamp([[0, [0, 0, 0]], [1, [1, 1, 1]]]);
    expect(ramp.sample(-1)).toEqual([0, 0, 0]);
    expect(ramp.sample(2)).toEqual([1, 1, 1]);
    expect(ramp.sample(0.5)[0]).toBeCloseTo(0.5, 6);
  });

  it('writes samples into a particle color buffer', () => {
    const buffer = new Float32Array(3);
    WIND_RAMP.writeTo(buffer, 0, 0.5);
    expect(Array.from(buffer).every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it('maps temperatures to a normalized scale', () => {
    expect(temperatureToRamp(-40)).toBe(0);
    expect(temperatureToRamp(45)).toBe(1);
    expect(temperatureToRamp(2.5)).toBeCloseTo(0.5, 6);
  });
});