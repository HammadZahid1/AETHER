import { describe, expect, it } from 'vitest';
import { FrameRateTracker } from '@/engine/performance';

describe('FrameRateTracker', () => {
  it('returns zero until two frames have been sampled', () => {
    const tracker = new FrameRateTracker();
    expect(tracker.sample(1000)).toBe(0);
    expect(tracker.frameCount).toBe(1);
    expect(tracker.sample(1016)).toBeCloseTo(62.5, 6);
  });

  it('smooths frame rate across the configured window', () => {
    const tracker = new FrameRateTracker(2);
    tracker.sample(0);
    tracker.sample(10);
    tracker.sample(30);
    expect(Math.round(tracker.fps)).toBe(75);
  });

  it('ignores invalid deltas and resets cleanly', () => {
    const tracker = new FrameRateTracker();
    tracker.sample(0);
    tracker.sample(-10);
    expect(tracker.fps).toBe(0);
    tracker.reset();
    expect(tracker.frameCount).toBe(0);
  });
});
