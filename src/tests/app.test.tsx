import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/renderer/SceneCanvas', () => ({
  SceneCanvas: () => <div data-testid="scene-canvas" />,
}));

import { App } from '@/App';
import { useAetherStore } from '@/state/store';

describe('App shell', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    useAetherStore.setState({ activeModule: 'wind', status: 'paused' });
  });

  it('renders the main workspace regions', () => {
    render(<App />);
    expect(screen.getByText('AETHER')).toBeTruthy();
    expect(screen.getByTestId('scene-canvas')).toBeTruthy();
    expect(screen.getByLabelText('Simulation modules')).toBeTruthy();
    expect(screen.getByLabelText('Scrub simulation timeline')).toBeTruthy();
    expect(screen.getByText(/Wind Lab · Controls/)).toBeTruthy();
  });
});
