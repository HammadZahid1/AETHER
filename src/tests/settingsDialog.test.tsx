import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsDialog } from '@/components/overlays/SettingsDialog';
import { useAetherStore } from '@/state/store';

describe('SettingsDialog', () => {
  beforeEach(() => useAetherStore.setState({ settingsOpen: true }));

  it('updates the persisted theme from the appearance section', () => {
    render(<SettingsDialog />);
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'midnight' } });
    expect(useAetherStore.getState().settings.theme).toBe('midnight');
    expect(localStorage.getItem('aether.settings.v1')).toContain('midnight');
  });

  it('clears locally saved data after confirmation', () => {
    localStorage.clear();
    useAetherStore.setState({
      savedViews: [{ id: 'view-1', name: 'View', target: { latitude: 0, longitude: 0 }, distance: 2.8, createdAt: 1 }],
      savedConfigurations: [],
    });
    render(<SettingsDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear all local data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm clear' }));
    expect(useAetherStore.getState().savedViews).toEqual([]);
    expect(localStorage.getItem('aether.views.v1')).toBeNull();
  });

  it('closes through the dialog close button', () => {
    render(<SettingsDialog />);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(useAetherStore.getState().settingsOpen).toBe(false);
  });
});
