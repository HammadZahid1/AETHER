import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataProvenanceDialog } from '@/components/overlays/DataProvenanceDialog';
import { useAetherStore } from '@/state/store';

describe('DataProvenanceDialog', () => {
  beforeEach(() => useAetherStore.setState({ provenanceOpen: true }));

  it('states that the data is simulated and not operational', () => {
    render(<DataProvenanceDialog />);
    expect(screen.getByText(/All values in AETHER are simulated/)).toBeTruthy();
    expect(screen.getByText(/not a numerical weather prediction system/)).toBeTruthy();
  });

  it('closes through the dialog close button', () => {
    render(<DataProvenanceDialog />);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(useAetherStore.getState().provenanceOpen).toBe(false);
  });
});
