import { beforeEach, describe, expect, it } from 'vitest';
import { deleteSavedView, loadSavedViews, renameSavedView, saveSavedView } from '@/state/persistence';
import { useAetherStore } from '@/state/store';

const view = (id: string, name: string) => ({
  id,
  name,
  target: { latitude: 10, longitude: 20 },
  distance: 2.5,
  createdAt: 1,
});

describe('saved view persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, renames and deletes views', () => {
    saveSavedView(view('view-1', 'Atlantic'));
    saveSavedView(view('view-2', 'Pacific'));
    expect(loadSavedViews().map((item) => item.name)).toEqual(['Atlantic', 'Pacific']);

    renameSavedView('view-1', 'North Atlantic');
    expect(loadSavedViews().find((item) => item.id === 'view-1')?.name).toBe('North Atlantic');

    deleteSavedView('view-2');
    expect(loadSavedViews().map((item) => item.id)).toEqual(['view-1']);
  });
});

describe('saved view store actions', () => {
  beforeEach(() => {
    localStorage.clear();
    useAetherStore.setState({
      savedViews: [],
      camera: { target: { latitude: 0, longitude: 0 }, distance: 2.8, preset: 'Global View', autoRotate: false },
      notifications: [],
    });
  });

  it('saves, applies and removes a view', () => {
    const store = useAetherStore.getState();
    store.setCamera({ target: { latitude: 40, longitude: -30 }, distance: 2.1 });
    store.saveCurrentView('Test view');

    const saved = useAetherStore.getState().savedViews[0];
    expect(saved.name).toBe('Test view');
    expect(saved.distance).toBe(2.1);

    store.applySavedView(saved.id);
    expect(useAetherStore.getState().camera.preset).toBe('Test view');
    expect(useAetherStore.getState().camera.target.latitude).toBe(40);

    store.removeSavedView(saved.id);
    expect(useAetherStore.getState().savedViews).toHaveLength(0);
  });

  it('renames a saved view', () => {
    saveSavedView(view('view-9', 'Old'));
    useAetherStore.setState({ savedViews: [view('view-9', 'Old')] });
    useAetherStore.getState().renameSavedView('view-9', 'New');
    expect(useAetherStore.getState().savedViews[0].name).toBe('New');
  });
});
