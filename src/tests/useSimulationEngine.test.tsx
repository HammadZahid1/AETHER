import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import { useAetherStore } from '@/state/store';

describe('useSimulationEngine', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    useAetherStore.setState({ status: 'paused', elapsed: 0, timeline: 0, frame: 0, direction: 1 });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('exposes transport controls that update the store', () => {
    const { result } = renderHook(() => useSimulationEngine());

    act(() => result.current.play());
    expect(useAetherStore.getState().status).toBe('running');

    act(() => result.current.pause());
    expect(useAetherStore.getState().status).toBe('paused');

    act(() => result.current.stop());
    expect(useAetherStore.getState().status).toBe('idle');
    expect(useAetherStore.getState().timeline).toBe(0);
  });

  it('steps simulated time without leaving the idle state', () => {
    const { result } = renderHook(() => useSimulationEngine());
    act(() => result.current.step(1));
    expect(useAetherStore.getState().elapsed).toBeCloseTo(0.25, 6);
    expect(useAetherStore.getState().status).toBe('paused');
    expect(useAetherStore.getState().direction).toBe(1);
  });
});
