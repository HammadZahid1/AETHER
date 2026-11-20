import { SimulationClock } from '@/engine/clock';
import type {
  PlaybackDirection,
  SimulationClockState,
  SimulationContext,
  SimulationError,
  SimulationModule,
  SimulationModuleId,
  SimulationStatus,
} from '@/types/simulation';

/**
 * Coordinates the simulation clock and a set of registered modules. Modules
 * are updated in registration order with an identical frame context, keeping
 * domain logic independent from React and the renderer.
 */
export class SimulationEngine {
  readonly clock = new SimulationClock();
  private readonly modules = new Map<SimulationModuleId, SimulationModule<unknown>>();
  private readonly active = new Set<SimulationModuleId>();
  private readonly errors: SimulationError[] = [];
  private running = false;

  register<T>(module: SimulationModule<T>): void {
    this.modules.set(module.id, module as SimulationModule<unknown>);
  }

  unregister(id: SimulationModuleId): void {
    this.modules.get(id)?.dispose();
    this.modules.delete(id);
    this.active.delete(id);
  }

  activate(id: SimulationModuleId): void {
    if (this.modules.has(id)) this.active.add(id);
  }

  deactivate(id: SimulationModuleId): void {
    this.active.delete(id);
  }

  setActive(ids: readonly SimulationModuleId[]): void {
    this.active.clear();
    for (const id of ids) this.activate(id);
  }

  isActive(id: SimulationModuleId): boolean {
    return this.active.has(id);
  }

  getModule<T>(id: SimulationModuleId): SimulationModule<T> | undefined {
    return this.modules.get(id) as SimulationModule<T> | undefined;
  }

  start(): void {
    this.running = true;
    this.clock.play();
  }

  pause(): void {
    this.running = false;
    this.clock.pause();
  }

  resume(): void {
    this.running = true;
    this.clock.resume();
  }

  stop(): void {
    this.running = false;
    this.clock.stop();
  }

  reset(): void {
    this.clock.reset();
    for (const id of this.active) this.modules.get(id)?.reset();
    this.errors.length = 0;
  }

  setSpeed(speed: number): void {
    this.clock.setSpeed(speed);
  }

  setDirection(direction: PlaybackDirection): void {
    this.clock.setDirection(direction);
  }

  /** Move the timeline without advancing simulated time. */
  seek(progress: number): SimulationClockState {
    this.clock.seek(progress);
    return this.clock.snapshot();
  }

  /** Set simulated elapsed seconds directly for saved or restored states. */
  setElapsed(seconds: number): SimulationClockState {
    this.clock.setElapsed(seconds);
    return this.clock.snapshot();
  }

  snapshot(): SimulationClockState {
    return this.clock.snapshot();
  }

  setStatus(status: SimulationStatus): void {
    this.running = status === 'running';
    this.clock.setStatus(status);
  }

  get isRunning(): boolean {
    return this.running;
  }

  /** Advance the clock and every active module by one frame. */
  update(realDeltaSeconds: number): SimulationContext {
    const clockState = this.clock.step(realDeltaSeconds);
    const context: SimulationContext = {
      time: clockState.elapsed,
      delta: clockState.delta,
      speed: clockState.speed,
      direction: clockState.direction,
      frame: clockState.frame,
      timeline: clockState.timeline,
    };

    if (clockState.delta !== 0) {
      for (const id of this.active) {
        const module = this.modules.get(id);
        if (!module) continue;
        try {
          module.update(context);
        } catch (error) {
          this.errors.push({
            module: id,
            message: error instanceof Error ? error.message : String(error),
            at: clockState.elapsed,
          });
          if (this.errors.length > 50) this.errors.shift();
        }
      }
    }

    return context;
  }

  getErrors(): readonly SimulationError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors.length = 0;
  }

  dispose(): void {
    for (const module of this.modules.values()) module.dispose();
    this.modules.clear();
    this.active.clear();
    this.errors.length = 0;
    this.running = false;
  }
}

/** Shared singleton used by the React application. */
export const simulationEngine = new SimulationEngine();