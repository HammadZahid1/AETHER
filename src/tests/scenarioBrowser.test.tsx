import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScenarioBrowser } from '@/components/overlays/ScenarioBrowser';

describe('ScenarioBrowser', () => {
  it('loads a built-in scenario and closes', () => {
    const onClose = vi.fn();
    render(<ScenarioBrowser open onClose={onClose} />);
    const loadButtons = screen.getAllByRole('button', { name: 'Load' });
    fireEvent.click(loadButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('filters scenarios by description text', () => {
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Search scenarios'), { target: { value: 'cyclone' } });
    expect(screen.getByText('Storm Simulation')).toBeTruthy();
    expect(screen.queryByText('Global Wind Circulation')).toBeNull();
  });

  it('filters scenarios by category', () => {
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Filter scenarios by category'), { target: { value: 'marine' } });
    expect(screen.getByText('Ocean Currents')).toBeTruthy();
    expect(screen.queryByText('Storm Simulation')).toBeNull();
  });

  it('shows validation errors for invalid imported JSON', () => {
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Scenario JSON'), { target: { value: '{bad json' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(screen.getAllByText(/JSON|property name/).length).toBeGreaterThan(0);
  });
});
