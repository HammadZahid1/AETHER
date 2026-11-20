import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { TopBar } from '@/components/layout/TopBar';
import { useAetherStore } from '@/state/store';

describe('TopBar saved views', () => {
  beforeEach(() => {
    useAetherStore.setState({
      savedViews: [{
        id: 'view-1',
        name: 'North Atlantic',
        target: { latitude: 45, longitude: -30 },
        distance: 2.1,
        createdAt: 1,
      }],
      camera: { target: { latitude: 0, longitude: 0 }, distance: 2.8, preset: 'Global View', autoRotate: false },
    });
  });

  it('restores a saved view from the camera menu', () => {
    render(<TopBar onToggleFullscreen={() => undefined} isFullscreen={false} />);
    fireEvent.click(screen.getByText('Global View'));
    fireEvent.click(screen.getByText('North Atlantic'));
    expect(useAetherStore.getState().camera.target.latitude).toBe(45);
    expect(useAetherStore.getState().camera.preset).toBe('North Atlantic');
  });

  it('opens the data provenance dialog', () => {
    render(<TopBar onToggleFullscreen={() => undefined} isFullscreen={false} />);
    fireEvent.click(screen.getByLabelText('Open data provenance'));
    expect(useAetherStore.getState().provenanceOpen).toBe(true);
  });

  it('deletes a saved view from the camera menu', () => {
    render(<TopBar onToggleFullscreen={() => undefined} isFullscreen={false} />);
    fireEvent.click(screen.getByText('Global View'));
    fireEvent.click(screen.getByLabelText('Delete view North Atlantic'));
    expect(useAetherStore.getState().savedViews).toHaveLength(0);
  });
});
