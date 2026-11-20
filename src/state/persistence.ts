import type { AppSettings } from '@/types/config';
import type { SavedConfiguration } from '@/types/scenario';
import { createDefaultSettings } from '@/data/defaults';

const SETTINGS_KEY = 'aether.settings.v1';
const CONFIGURATIONS_KEY = 'aether.configurations.v1';
const VIEWS_KEY = 'aether.views.v1';

export interface SavedView {
  id: string;
  name: string;
  target: { latitude: number; longitude: number };
  distance: number;
  createdAt: number;
}

/** Safe localStorage access that degrades gracefully when storage is unavailable. */
function read(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key: string, value: string): boolean {
  try {
    globalThis.localStorage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function remove(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function loadSettings(): AppSettings {
  const raw = read(SETTINGS_KEY);
  if (!raw) return createDefaultSettings();
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const defaults = createDefaultSettings();
    return {
      ...defaults,
      ...parsed,
      rendering: { ...defaults.rendering, ...parsed.rendering },
    };
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): boolean {
  return write(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSavedConfigurations(): SavedConfiguration[] {
  const raw = read(CONFIGURATIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedConfiguration[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.scenario) : [];
  } catch {
    return [];
  }
}

export function persistConfigurations(configurations: SavedConfiguration[]): boolean {
  return write(CONFIGURATIONS_KEY, JSON.stringify(configurations));
}

export function upsertConfiguration(configuration: SavedConfiguration): SavedConfiguration[] {
  const all = loadSavedConfigurations();
  const index = all.findIndex((item) => item.id === configuration.id);
  if (index >= 0) all[index] = configuration;
  else all.push(configuration);
  persistConfigurations(all);
  return all;
}

export function deleteConfiguration(id: string): SavedConfiguration[] {
  const all = loadSavedConfigurations().filter((item) => item.id !== id);
  persistConfigurations(all);
  return all;
}

export function renameConfiguration(id: string, name: string): SavedConfiguration[] {
  const all = loadSavedConfigurations().map((item) =>
    item.id === id ? { ...item, name, updatedAt: Date.now() } : item,
  );
  persistConfigurations(all);
  return all;
}

export function loadSavedViews(): SavedView[] {
  const raw = read(VIEWS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedView(view: SavedView): SavedView[] {
  const all = loadSavedViews();
  const index = all.findIndex((item) => item.id === view.id);
  if (index >= 0) all[index] = view;
  else all.push(view);
  write(VIEWS_KEY, JSON.stringify(all));
  return all;
}

export function clearAllPersistedData(): void {
  remove(SETTINGS_KEY);
  remove(CONFIGURATIONS_KEY);
  remove(VIEWS_KEY);
}