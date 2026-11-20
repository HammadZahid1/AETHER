import { beforeEach, describe, expect, it } from 'vitest';
import { formatSimulationTime, formatTimeline, MAX_DELTA, SimulationClock } from '@/engine/clock';
import { SimulationEngine } from '@/engine/engine';
import type { SimulationContext, SimulationModule, SimulationModuleId } from '@/types/simulation';

describe('SimulationClock', () => {
  it('does not advance while idle', () => {
    const clock = new SimulationClock();
    clock.step(0.5);
    expect(clock.snapshot().elapsed).toBe(0);
  });

  it('advances time when running', () => {
    const clock = new SimulationClock();
    clock.play();
    clock.step(0.05);
    expect(clock.snapshot().elapsed).toBeCloseTo(0.05, 6);
    expect(clock.snapshot().frame).toBe(1);
  });

  it('caps large deltas to keep the simulation stable', () => {
    const clock = new SimulationClock();
    clock.play();
    clock.step(10);
    expect(clock.snapshot().elapsed).toBeCloseTo(MAX_DELTA, 6);
  });

  it('applies simulation speed', () => {
    const clock = new SimulationClock();
    clock.play();
    clock.setSpeed(4);
    clock.step(0.1);
    expect(clock.snapshot().elapsed).toBeCloseTo(0.4, 6);
  });

  it('supports reverse playback without going below zero', () => {
    const clock = new SimulationClock();
    clock.play();
    clock.step(0.1);
    clock.setDirection(-1);
    clock.step(0.05);
    clock.step(0.05);
    expect(clock.snapshot().elapsed).toBe(0);
  });

  it('pauses and resumes correctly', () => {
    const clock = new SimulationClock();
    clock.play();
    clock.pause();
    clock.step(0.1);
    expect(clock.snapshot().elapsed).toBe(0);
    clock.resume();
    clock.step(0.1);
    expect(clock.snapshot().elapsed).toBeCloseTo(0.1, 6);
  });

  it('clamps speed and seeks on the timeline', () => {
    const clock = new SimulationClock();
    clock.setSpeed(100);
    expect(clock.snapshot().speed).toBe(16);
    clock.seek(2);
    expect(clock.snapshot().timeline).toBeLessThan(1);
    clock.seek(-1);
    expect(clock.snapshot().timeline).toBe(0);
  });

  it('formats simulated and timeline time', () => {
    expect(formatSimulationTime(3661)).toBe('01:01:01');
    expect(formatTimeline(0.5)).toBe('12:00 UTC');
  });
});

class CountingModule implements SimulationModule<string> {
  updates = 0;
  resets = 0;
  disposals = 0;
  constructor(readonly id: SimulationModuleId = 'wind', readonly name = 'Counter', public config = 'test') {}
  update(_context: SimulationContext): void { this.updates += 1; }
  reset(): void { this.resets += 1; }
  dispose(): void { this.disposals += 1; }
}

describe('SimulationEngine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('only updates active modules', () => {
    const first = new CountingModule('wind');
    const second = new CountingModule('ocean');
    engine.register(first);
    engine.register(second);
    engine.activate('wind');
    engine.start();
    engine.update(0.05);
    expect(first.updates).toBe(1);
    expect(second.updates).toBe(0);
  });

  it('shares a single frame context', () => {
    const first = new CountingModule('wind');
    const second = new CountingModule('ocean');
    engine.register(first);
    engine.register(second);
    engine.setActive(['wind', 'ocean']);
    engine.start();
    engine.update(0.05);
    expect(engine.isActive('wind')).toBe(true);
    expect(engine.isActive('ocean')).toBe(true);
  });

  it('does not update modules when paused', () => {
    const module = new CountingModule('wind');
    engine.register(module);
    engine.activate('wind');
    engine.start();
    engine.pause();
    engine.update(0.05);
    expect(module.updates).toBe(0);
  });

  it('resets active modules only', () => {
    const first = new CountingModule('wind');
    const second = new CountingModule('ocean');
    engine.register(first);
    engine.register(second);
    engine.activate('wind');
    engine.reset();
    expect(first.resets).toBe(1);
    expect(second.resets).toBe(0);
  });

  it('isolates module errors and exposes them', () => {
    const failing = new CountingModule('wind');
    failing.update = () => { throw new Error('boom'); };
    engine.register(failing);
    engine.activate('wind');
    engine.start();
    engine.update(0.05);
    expect(engine.getErrors()).toHaveLength(1);
    expect(engine.getErrors()[0].message).toBe('boom');
    engine.clearErrors();
    expect(engine.getErrors()).toHaveLength(0);
  });

  it('disposes modules on removal and shutdown', () => {
    const module = new CountingModule('wind');
    engine.register(module);
    engine.unregister('wind');
    expect(module.disposals).toBe(1);
    const second = new CountingModule('ocean');
    engine.register(second);
    engine.dispose();
    expect(second.disposals).toBe(1);
  });
});