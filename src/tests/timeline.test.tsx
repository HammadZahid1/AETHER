import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Timeline } from '@/components/layout/Timeline';
import { useAetherStore } from '@/state/store';

describe('Timeline', () => {
  beforeEach(() => useAetherStore.setState({ timeline: 0.1, elapsed: 100, status: 'paused', speed: 1, direction: 1 }));

  it('jumps to a preset UTC time', () => {
    render(<Timeline onPlay={vi.fn()} onPause={vi.fn()} onStop={vi.fn()} onStep={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Jump to time'), { target: { value: '0.5' } });
    expect(useAetherStore.getState().timeline).toBeCloseTo(0.5, 6);
  });

  it('steps forward and backward through transport controls', () => {
    const onStep = vi.fn();
    render(<Timeline onPlay={vi.fn()} onPause={vi.fn()} onStop={vi.fn()} onStep={onStep} />);
    fireEvent.click(screen.getByLabelText('Step forward'));
    fireEvent.click(screen.getByLabelText('Step backward'));
    expect(onStep).toHaveBeenNthCalledWith(1, 1);
    expect(onStep).toHaveBeenNthCalledWith(2, -1);
  });
});
