import { describe, expect, it } from 'vitest';
import { ParticleSystem } from '@/engine/particles';
import { createParticleGeometryBuffers, writeParticleBuffers } from '@/renderer/particles';

const spawn = { x: 1, y: 2, z: 3, vx: 0, vy: 0, vz: 0, r: 0.2, g: 0.4, b: 0.6, size: 4, lifetime: 10, opacity: 0.8 };

describe('particle geometry buffers', () => {
  it('allocates buffers sized to a particle system', () => {
    const system = new ParticleSystem({ capacity: 16 });
    const buffers = createParticleGeometryBuffers(system.capacity);
    expect(buffers.positions).toHaveLength(48);
    expect(buffers.sizes).toHaveLength(16);
  });

  it('compacts live particles for GPU consumption', () => {
    const system = new ParticleSystem({ capacity: 3 });
    system.spawn(spawn);
    system.spawn({ ...spawn, x: 4, y: 5, z: 6 });
    system.kill(0);
    const target = createParticleGeometryBuffers(system.capacity);
    const count = writeParticleBuffers(system, target, false);
    expect(count).toBe(1);
    expect(target.positions[0]).toBe(4);
    expect(target.colors[1]).toBeCloseTo(0.4, 6);
  });

  it('fades particles as they age', () => {
    const system = new ParticleSystem({ capacity: 1 });
    system.spawn(spawn);
    system.buffers.age[0] = 5;
    const target = createParticleGeometryBuffers(1);
    expect(writeParticleBuffers(system, target)).toBe(1);
    expect(target.opacities[0]).toBeCloseTo(0.4, 6);
  });
});
