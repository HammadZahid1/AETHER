import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScenarioBrowser } from '@/components/overlays/ScenarioBrowser';
import { upsertConfiguration } from '@/state/persistence';
import { useAetherStore } from '@/state/store';

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

  it('exports the current workspace as JSON', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export current' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });

  it('renames a saved configuration', () => {
    localStorage.clear();
    const saved = {
      id: 'saved-1',
      name: 'Old name',
      createdAt: 1,
      updatedAt: 1,
      scenario: {
        id: 'saved-1', name: 'Old name', description: '', category: 'circulation' as const,
        module: 'wind' as const, layers: [], camera: { name: 'View', target: { latitude: 0, longitude: 0 }, distance: 2.8 },
        time: 0, speed: 1,
      },
    };
    const configurations = upsertConfiguration(saved);
    useAetherStore.setState({ savedConfigurations: configurations });
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    fireEvent.change(screen.getByLabelText('Rename Old name'), { target: { value: 'New name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(useAetherStore.getState().savedConfigurations[0].name).toBe('New name');
  });

  it('shows validation errors for invalid imported JSON', () => {
    render(<ScenarioBrowser open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Scenario JSON'), { target: { value: '{bad json' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(screen.getAllByText(/JSON|property name/).length).toBeGreaterThan(0);
  });
});
