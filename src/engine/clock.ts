import type { PlaybackDirection, SimulationClockState, SimulationStatus } from '@/types/simulation';

/** Maximum delta (seconds) applied in a single step to avoid large jumps. */
export const MAX_DELTA = 0.1;
/** Length of the looping timeline in simulated hours. */
export const TIMELINE_HOURS = 24;

/**
 * A frame-independent simulation clock. The clock owns simulated time and
 * playback state but performs no rendering or domain-specific work.
 */
export class SimulationClock {
  private state: SimulationClockState = {
    elapsed: 0,
    speed: 1,
    direction: 1,
    status: 'idle',
    frame: 0,
    delta: 0,
    timeline: 0,
  };

  /** Advance the clock by a real-world delta in seconds. */
  step(realDeltaSeconds: number): SimulationClockState {
    const delta = Math.min(Math.max(realDeltaSeconds, 0), MAX_DELTA);
    if (this.state.status === 'running') {
      const scaled = delta * this.state.speed * this.state.direction;
      this.state.elapsed = Math.max(0, this.state.elapsed + scaled);
      this.state.timeline = (this.state.timeline + scaled / TIMELINE_HOURS + 1) % 1;
      this.state.frame += 1;
    }
    this.state.delta = this.state.status === 'running' ? delta * this.state.speed * this.state.direction : 0;
    return this.snapshot();
  }

  play(): void {
    this.state.status = 'running';
  }

  pause(): void {
    if (this.state.status === 'running') this.state.status = 'paused';
  }

  resume(): void {
    if (this.state.status === 'paused') this.state.status = 'running';
  }

  stop(): void {
    this.state.status = 'idle';
    this.state.elapsed = 0;
    this.state.timeline = 0;
    this.state.delta = 0;
  }

  reset(): void {
    this.stop();
    this.state.speed = 1;
    this.state.direction = 1;
    this.state.frame = 0;
  }

  setSpeed(speed: number): void {
    this.state.speed = Math.min(Math.max(Number.isFinite(speed) ? speed : 1, 0), 16);
  }

  setDirection(direction: PlaybackDirection): void {
    this.state.direction = direction === -1 ? -1 : 1;
  }

  setStatus(status: SimulationStatus): void {
    this.state.status = status;
  }

  seek(progress: number): void {
    this.state.timeline = Math.min(Math.max(progress, 0), 0.999999);
  }

  setElapsed(seconds: number): void {
    this.state.elapsed = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  }

  snapshot(): SimulationClockState {
    return { ...this.state };
  }
}

/** Format simulated elapsed seconds as a HH:MM:SS string. */
export function formatSimulationTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600) % 24;
  const minutes = Math.floor(total / 60) % 60;
  const secs = total % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, '0')).join(':');
}

/** Convert normalized timeline progress to a 24-hour clock string. */
export function formatTimeline(progress: number): string {
  const minutes = Math.floor(Math.min(Math.max(progress, 0), 1) * 24 * 60);
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} UTC`;
}