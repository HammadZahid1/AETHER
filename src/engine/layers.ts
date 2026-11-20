import type { LayerConfig, LayerId, LayerState } from '@/types/simulation';
import { LAYER_IDS } from '@/types/simulation';

export interface LayerPreset {
  id: string;
  name: string;
  description: string;
  layers: Partial<LayerState>;
}

/** Central registry for layer visibility, opacity and intensity. */
export class LayerManager {
  private state: LayerState;
  private listeners = new Set<(state: LayerState) => void>();
  private activePreset: string | null = null;

  constructor(initial: LayerState) {
    this.state = structuredClone(initial);
  }

  getState(): LayerState {
    return this.state;
  }

  get(id: LayerId): LayerConfig {
    return this.state[id];
  }

  isVisible(id: LayerId): boolean {
    return this.state[id].visible;
  }

  set(id: LayerId, patch: Partial<LayerConfig>): void {
    this.state[id] = { ...this.state[id], ...patch };
    this.activePreset = null;
    this.notify();
  }

  toggle(id: LayerId): void {
    this.set(id, { visible: !this.state[id].visible });
  }

  setVisible(id: LayerId, visible: boolean): void {
    this.set(id, { visible });
  }

  setOpacity(id: LayerId, opacity: number): void {
    this.set(id, { opacity: Math.min(Math.max(opacity, 0), 1) });
  }

  setIntensity(id: LayerId, intensity: number): void {
    this.set(id, { intensity: Math.min(Math.max(intensity, 0), 2) });
  }

  showOnly(ids: readonly LayerId[]): void {
    for (const id of LAYER_IDS) {
      this.state[id] = { ...this.state[id], visible: ids.includes(id) };
    }
    this.notify();
  }

  applyPreset(preset: LayerPreset): void {
    for (const id of LAYER_IDS) {
      const patch = preset.layers[id];
      if (patch) this.state[id] = { ...this.state[id], ...patch };
    }
    this.activePreset = preset.id;
    this.notify();
  }

  getActivePreset(): string | null {
    return this.activePreset;
  }

  subscribe(listener: (state: LayerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(initial: LayerState): void {
    this.state = structuredClone(initial);
    this.activePreset = null;
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}

/** Build a layer preset from a list of visible layers. */
export function createLayerPreset(
  id: string,
  name: string,
  description: string,
  visibleLayers: readonly LayerId[],
): LayerPreset {
  const layers = {} as Partial<LayerState>;
  for (const layer of LAYER_IDS) {
    layers[layer] = { visible: visibleLayers.includes(layer), opacity: layer === 'surface' ? 1 : 0.7, intensity: 1 };
  }
  return { id, name, description, layers };
}