import { create } from 'zustand';
import { createDefaultConfigurations, createDefaultLayerState, createDefaultSettings } from '@/data/defaults';
import { getScenario } from '@/data/scenarios';
import { layersFromScenario, mergeConfigurations } from '@/engine/scenarios';
import { loadSavedConfigurations, loadSavedViews, loadSettings, saveSettings, saveSavedView, upsertConfiguration, deleteConfiguration, renameConfiguration, deleteSavedView, renameSavedView } from '@/state/persistence';
import type { AppSettings, SimulationConfigurations } from '@/types/config';
import type { CameraPreset, SavedConfiguration, Scenario } from '@/types/scenario';
import type { GeoCoordinates } from '@/types/geo';
import type { LayerId, LayerState, PlaybackDirection, SimulationModuleId, SimulationStatus } from '@/types/simulation';

export interface Notification {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
  createdAt: number;
}

export interface CameraState {
  target: GeoCoordinates;
  distance: number;
  preset: string;
  autoRotate: boolean;
}

export interface AetherState {
  activeModule: SimulationModuleId;
  configurations: SimulationConfigurations;
  layers: LayerState;
  settings: AppSettings;
  status: SimulationStatus;
  speed: number;
  direction: PlaybackDirection;
  timeline: number;
  elapsed: number;
  frame: number;
  selectedCoordinate: GeoCoordinates | null;
  camera: CameraState;
  activeScenarioId: string | null;
  savedConfigurations: SavedConfiguration[];
  savedViews: ReturnType<typeof loadSavedViews>;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  helpOpen: boolean;
  layersPanelOpen: boolean;
  notifications: Notification[];

  setModule: (module: SimulationModuleId) => void;
  updateConfig: <K extends keyof SimulationConfigurations>(key: K, patch: Partial<SimulationConfigurations[K]>) => void;
  replaceConfigurations: (configurations: SimulationConfigurations) => void;
  toggleLayer: (layer: LayerId) => void;
  setLayer: (layer: LayerId, patch: Partial<LayerState[LayerId]>) => void;
  replaceLayers: (layers: LayerState) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setStatus: (status: SimulationStatus) => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: PlaybackDirection) => void;
  setClock: (elapsed: number, timeline: number, frame: number) => void;
  seek: (timeline: number) => void;
  setSelectedCoordinate: (coordinate: GeoCoordinates | null) => void;
  setCamera: (patch: Partial<CameraState>) => void;
  applyCameraPreset: (preset: CameraPreset) => void;
  loadScenarioById: (id: string) => boolean;
  applyScenario: (scenario: Scenario) => void;
  getCurrentScenario: (name?: string) => Scenario;
  saveCurrentConfiguration: (name: string) => void;
  loadSavedConfiguration: (id: string) => void;
  removeSavedConfiguration: (id: string) => void;
  renameSavedConfiguration: (id: string, name: string) => void;
  saveCurrentView: (name: string) => void;
  applySavedView: (id: string) => void;
  removeSavedView: (id: string) => void;
  renameSavedView: (id: string, name: string) => void;
  importSavedConfiguration: (configuration: SavedConfiguration) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setLayersPanelOpen: (open: boolean) => void;
  notify: (message: string, tone?: Notification['tone']) => void;
  dismissNotification: (id: string) => void;
  resetSimulation: () => void;
}

const initialSettings = loadSettings();

export const useAetherStore = create<AetherState>((set, get) => ({
  activeModule: initialSettings.defaultModule as SimulationModuleId,
  configurations: createDefaultConfigurations(),
  layers: createDefaultLayerState(),
  settings: initialSettings,
  status: 'paused',
  speed: 1,
  direction: 1,
  timeline: 0,
  elapsed: 0,
  frame: 0,
  selectedCoordinate: { latitude: 18, longitude: -55 },
  camera: { target: { latitude: 12, longitude: -25 }, distance: 2.8, preset: 'Global View', autoRotate: initialSettings.autoRotate },
  activeScenarioId: 'global-wind',
  savedConfigurations: loadSavedConfigurations(),
  savedViews: loadSavedViews(),
  commandPaletteOpen: false,
  settingsOpen: false,
  helpOpen: false,
  layersPanelOpen: false,
  notifications: [],

  setModule: (module) => set({ activeModule: module }),

  updateConfig: (key, patch) => set((state) => ({
    configurations: { ...state.configurations, [key]: { ...state.configurations[key], ...patch } },
  })),

  replaceConfigurations: (configurations) => set({ configurations }),

  toggleLayer: (layer) => set((state) => ({
    layers: { ...state.layers, [layer]: { ...state.layers[layer], visible: !state.layers[layer].visible } },
  })),

  setLayer: (layer, patch) => set((state) => ({
    layers: { ...state.layers, [layer]: { ...state.layers[layer], ...patch } },
  })),

  replaceLayers: (layers) => set({ layers }),

  updateSettings: (patch) => set((state) => {
    const settings = { ...state.settings, ...patch };
    saveSettings(settings);
    return { settings };
  }),

  setStatus: (status) => set({ status }),
  setSpeed: (speed) => set({ speed: Math.min(Math.max(speed, 0), 16) }),
  setDirection: (direction) => set({ direction }),
  setClock: (elapsed, timeline, frame) => set({ elapsed, timeline, frame }),
  seek: (timeline) => set({ timeline: Math.min(Math.max(timeline, 0), 0.999999) }),
  setSelectedCoordinate: (selectedCoordinate) => set({ selectedCoordinate }),

  setCamera: (patch) => set((state) => ({ camera: { ...state.camera, ...patch } })),
  applyCameraPreset: (preset) => set((state) => ({
    camera: { ...state.camera, target: { ...preset.target }, distance: preset.distance, preset: preset.name },
  })),

  loadScenarioById: (id) => {
    const scenario = getScenario(id);
    if (!scenario) return false;
    get().applyScenario(scenario);
    return true;
  },

  applyScenario: (scenario) => set((state) => ({
    activeModule: scenario.module,
    configurations: mergeConfigurations(scenario),
    layers: layersFromScenario(scenario),
    camera: {
      ...state.camera,
      target: { ...scenario.camera.target },
      distance: scenario.camera.distance,
      preset: scenario.camera.name,
    },
    speed: scenario.speed,
    timeline: scenario.time,
    activeScenarioId: scenario.id,
    status: 'running',
  })),

  getCurrentScenario: (name) => {
    const state = get();
    return {
      id: `custom-${Date.now()}`,
      name: name ?? 'AETHER configuration',
      description: 'User-saved AETHER configuration.',
      category: 'circulation',
      module: state.activeModule,
      layers: (Object.keys(state.layers) as LayerId[]).filter((id) => state.layers[id].visible),
      camera: { name: state.camera.preset, target: { ...state.camera.target }, distance: state.camera.distance },
      time: state.elapsed,
      speed: state.speed,
      configurations: structuredClone(state.configurations),
    };
  },

  saveCurrentConfiguration: (name) => {
    const scenario = get().getCurrentScenario(name);
    const saved: SavedConfiguration = { id: scenario.id, name, createdAt: Date.now(), updatedAt: Date.now(), scenario };
    set({ savedConfigurations: upsertConfiguration(saved), activeScenarioId: saved.id });
    get().notify(`Saved “${name}”`, 'success');
  },

  loadSavedConfiguration: (id) => {
    const saved = get().savedConfigurations.find((item) => item.id === id);
    if (!saved) return;
    get().applyScenario(saved.scenario);
    get().notify(`Loaded “${saved.name}”`, 'info');
  },

  removeSavedConfiguration: (id) => set(() => ({ savedConfigurations: deleteConfiguration(id) })),
  renameSavedConfiguration: (id, name) => set(() => ({ savedConfigurations: renameConfiguration(id, name) })),

  saveCurrentView: (name) => {
    const { camera } = get();
    set({ savedViews: saveSavedView({ id: `view-${Date.now()}`, name, target: camera.target, distance: camera.distance, createdAt: Date.now() }) });
    get().notify(`Saved view “${name}”`, 'success');
  },

  applySavedView: (id) => {
    const view = get().savedViews.find((item) => item.id === id);
    if (!view) return;
    set((state) => ({
      camera: { ...state.camera, target: { ...view.target }, distance: view.distance, preset: view.name },
    }));
    get().notify(`Loaded view “${view.name}”`, 'info');
  },

  removeSavedView: (id) => set({ savedViews: deleteSavedView(id) }),

  renameSavedView: (id, name) => set({ savedViews: renameSavedView(id, name) }),

  importSavedConfiguration: (configuration) => {
    set(() => ({ savedConfigurations: upsertConfiguration(configuration) }));
    get().notify(`Imported “${configuration.name}”`, 'success');
  },

  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  setLayersPanelOpen: (layersPanelOpen) => set({ layersPanelOpen }),

  notify: (message, tone = 'info') => set((state) => ({
    notifications: [...state.notifications, { id: `n-${Date.now()}-${Math.random()}`, message, tone, createdAt: Date.now() }].slice(-4),
  })),
  dismissNotification: (id) => set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) })),

  resetSimulation: () => set({
    configurations: createDefaultConfigurations(),
    layers: createDefaultLayerState(),
    status: 'idle',
    speed: 1,
    direction: 1,
    timeline: 0,
    elapsed: 0,
    selectedCoordinate: null,
  }),
}));

/** Reset persisted preferences to their defaults. */
export function resetPersistedSettings(): void {
  saveSettings(createDefaultSettings());
}