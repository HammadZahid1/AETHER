/** Tracks smoothed frame rate from browser animation timestamps. */
export class FrameRateTracker {
  private readonly windowSize: number;
  private readonly samples: number[] = [];
  private previous: number | null = null;
  private frames = 0;

  constructor(windowSize = 30) {
    this.windowSize = Math.max(2, Math.floor(windowSize));
  }

  /** Record a frame timestamp and return the current smoothed FPS. */
  sample(now: number): number {
    this.frames += 1;
    if (this.previous !== null) {
      const delta = now - this.previous;
      if (delta > 0 && Number.isFinite(delta)) {
        this.samples.push(1000 / delta);
        if (this.samples.length > this.windowSize) this.samples.shift();
      }
    }
    this.previous = now;
    return this.fps;
  }

  get fps(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length;
  }

  get frameCount(): number {
    return this.frames;
  }

  reset(): void {
    this.samples.length = 0;
    this.previous = null;
    this.frames = 0;
  }
}
