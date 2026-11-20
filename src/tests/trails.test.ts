import { describe, expect, it } from 'vitest';
import { ParticleSystem } from '@/engine/particles';
import { TrailBuffer } from '@/engine/trails';

describe('TrailBuffer', () => {
  it('creates segments from recorded positions', () => {
    const system = new ParticleSystem({ capacity: 2 });
    system.buffers.alive[0] = 1;
    system.buffers.position.set([0, 0, 0], 0);
    const trails = new TrailBuffer(system, 2);
    trails.record();
    system.buffers.position.set([1, 1, 1], 0);
    trails.record();

    const target = new Float32Array(24);
    expect(trails.writeSegments(target, 12)).toBe(2);
    expect(target[0]).toBe(0);
    expect(target[3]).toBe(1);
  });

  it('ignores dead particles and clears on reset', () => {
    const system = new ParticleSystem({ capacity: 1 });
    const trails = new TrailBuffer(system, 2);
    trails.record();
    const target = new Float32Array(12);
    expect(trails.writeSegments(target, 6)).toBe(0);
    system.buffers.alive[0] = 1;
    trails.record();
    trails.record();
    expect(trails.writeSegments(target, 6)).toBe(2);
    trails.reset();
    expect(trails.writeSegments(target, 6)).toBe(0);
  });
});
