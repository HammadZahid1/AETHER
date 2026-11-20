import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DiagnosticsOverlay } from '@/components/overlays/DiagnosticsOverlay';
import { useAetherStore } from '@/state/store';

describe('DiagnosticsOverlay', () => {
  beforeEach(() => useAetherStore.setState({ diagnosticsOpen: true, frame: 42, elapsed: 12.75 }));

  it('shows live engine values', () => {
    render(<DiagnosticsOverlay />);
    expect(screen.getByLabelText('Engine diagnostics')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('12.8 s')).toBeTruthy();
  });

  it('closes through its close button', () => {
    render(<DiagnosticsOverlay />);
    fireEvent.click(screen.getByLabelText('Close diagnostics'));
    expect(useAetherStore.getState().diagnosticsOpen).toBe(false);
  });
});
