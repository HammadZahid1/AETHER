import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PerformanceHud } from '@/components/overlays/PerformanceHud';
import { useAetherStore } from '@/state/store';

describe('PerformanceHud', () => {
  beforeEach(() => useAetherStore.setState({ fps: 58.6 }));

  it('shows a rounded frame rate and quality mode', () => {
    render(<PerformanceHud />);
    expect(screen.getByLabelText('Performance').textContent).toContain('59 FPS');
  });
});
