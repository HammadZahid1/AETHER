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

  it('closes through the dialog close button', () => {
    render(<SettingsDialog />);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(useAetherStore.getState().settingsOpen).toBe(false);
  });
});
