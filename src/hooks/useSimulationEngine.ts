import { useCallback, useEffect } from 'react';
import { simulationEngine } from '@/engine/engine';
import type { PrecipitationSimulation } from '@/simulations/precipitation/PrecipitationSimulation';
import {
  registerSimulationModules,
  resetSimulationModules,
  syncSimulationConfigurations,
} from '@/engine/simulationModules';
import { useAetherStore } from '@/state/store';
import type { PlaybackDirection } from '@/types/simulation';

export interface SimulationControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  step: (direction: PlaybackDirection) => void;
  reset: () => void;
}

/** Bind the shared simulation engine to the Zustand store and browser frame loop. */
export function useSimulationEngine(): SimulationControls {
  const configurations = useAetherStore((state) => state.configurations);
  const status = useAetherStore((state) => state.status);
  const speed = useAetherStore((state) => state.speed);
  const direction = useAetherStore((state) => state.direction);
  const selectedCoordinate = useAetherStore((state) => state.selectedCoordinate);

  useEffect(() => {
    registerSimulationModules(simulationEngine, useAetherStore.getState().configurations);
  }, []);

  useEffect(() => {
    syncSimulationConfigurations(configurations);
  }, [configurations]);

  useEffect(() => {
    simulationEngine.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    simulationEngine.setDirection(direction);
  }, [direction]);

  useEffect(() => {
    if (status === 'running') simulationEngine.start();
    else if (status === 'paused') simulationEngine.pause();
    else simulationEngine.stop();
  }, [status]);

  useEffect(() => {
    const precipitation = simulationEngine.getModule('precipitation') as PrecipitationSimulation | undefined;
    if (selectedCoordinate) precipitation?.setCenter(selectedCoordinate);
  }, [selectedCoordinate]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let handle = 0;
    let lastErrorCount = 0;

    const tick = (now: number) => {
      const delta = Math.min(0.1, Math.max(0, (now - previous) / 1000));
      previous = now;
      const context = simulationEngine.update(delta);
      frame += 1;
      const errors = simulationEngine.getErrors();
      if (errors.length < lastErrorCount) lastErrorCount = 0;
      if (errors.length > lastErrorCount) {
        const latest = errors[errors.length - 1];
        useAetherStore.getState().notify(`${latest.module}: ${latest.message}`, 'warning');
      }
      lastErrorCount = errors.length;
      if (frame % 6 === 0) {
        useAetherStore.getState().setClock(context.time, context.timeline, context.frame);
      }
      handle = requestAnimationFrame(tick);
    };

    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, []);

  const play = useCallback(() => {
    simulationEngine.start();
    useAetherStore.setState({ status: 'running' });
  }, []);

  const pause = useCallback(() => {
    simulationEngine.pause();
    useAetherStore.setState({ status: 'paused' });
  }, []);

  const stop = useCallback(() => {
    simulationEngine.stop();
    simulationEngine.clearErrors();
    const snapshot = simulationEngine.snapshot();
    useAetherStore.setState({ status: 'idle', elapsed: 0, timeline: 0, frame: 0 });
    useAetherStore.getState().setClock(snapshot.elapsed, snapshot.timeline, snapshot.frame);
  }, []);

  const step = useCallback((value: PlaybackDirection) => {
    const snapshot = simulationEngine.snapshot();
    const deltaSeconds = 0.25 * value;
    const nextElapsed = Math.max(0, snapshot.elapsed + deltaSeconds);
    const nextTimeline = (snapshot.timeline + deltaSeconds / 24 + 1) % 1;
    simulationEngine.setElapsed(nextElapsed);
    simulationEngine.seek(nextElapsed === 0 ? 0 : nextTimeline);
    useAetherStore.setState({ direction: value });
    useAetherStore.getState().setClock(nextElapsed, simulationEngine.snapshot().timeline, snapshot.frame);
  }, []);

  const reset = useCallback(() => {
    simulationEngine.stop();
    resetSimulationModules();
    simulationEngine.clearErrors();
    useAetherStore.setState({ status: 'idle', elapsed: 0, timeline: 0, frame: 0 });
    useAetherStore.getState().notify('Simulation reset to initial conditions', 'info');
  }, []);

  return { play, pause, stop, step, reset };
}
