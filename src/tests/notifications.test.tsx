import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Notifications } from '@/components/overlays/Notifications';
import { useAetherStore } from '@/state/store';

describe('Notifications', () => {
  beforeEach(() => useAetherStore.setState({ notifications: [] }));

  it('exposes a persistent polite live region', () => {
    render(<Notifications />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows and dismisses store notifications', () => {
    useAetherStore.getState().notify('Scenario loaded', 'success');
    render(<Notifications />);
    expect(screen.getByText('Scenario loaded')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(useAetherStore.getState().notifications).toHaveLength(0);
  });
});
