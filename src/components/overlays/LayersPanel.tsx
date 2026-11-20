import { Dialog } from '@/components/ui/Dialog';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { LAYER_PRESETS } from '@/data/presets';
import { LayerManager } from '@/engine/layers';
import { useAetherStore } from '@/state/store';
import { LAYER_IDS } from '@/types/simulation';

/** Visibility, opacity and intensity controls for every render layer. */
export function LayersPanel() {
  const open = useAetherStore((state) => state.layersPanelOpen);
  const setOpen = useAetherStore((state) => state.setLayersPanelOpen);
  const layers = useAetherStore((state) => state.layers);
  const setLayer = useAetherStore((state) => state.setLayer);
  const replaceLayers = useAetherStore((state) => state.replaceLayers);
  const notify = useAetherStore((state) => state.notify);

  const applyPreset = (id: string) => {
    const definition = LAYER_PRESETS.find((preset) => preset.id === id);
    if (!definition) return;
    const manager = new LayerManager(layers);
    manager.applyPreset(definition.preset);
    replaceLayers(manager.getState());
    notify(`Applied “${definition.name}” layer preset`, 'success');
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Visualization Layers"
      subtitle="Combine atmospheric, surface and climate overlays."
      width="max-w-2xl"
    >
      <div className="space-y-4">
        <section>
          <h3 className="aether-label mb-2">Presets</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {LAYER_PRESETS.map((definition) => (
              <button
                key={definition.id}
                type="button"
                onClick={() => applyPreset(definition.id)}
                className="aether-panel p-2.5 text-left transition-colors hover:border-[var(--aether-accent)]/40"
              >
                <div className="text-[11px] font-medium text-[var(--aether-text)]">{definition.name}</div>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--aether-text-dim)]">{definition.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 border-t border-[var(--aether-border)] pt-4">
          <h3 className="aether-label">All layers</h3>
          {LAYER_IDS.map((id) => (
            <div key={id} className="grid gap-2 rounded border border-[var(--aether-border)] p-2.5 sm:grid-cols-[minmax(120px,1fr)_1fr_1fr] sm:items-center">
              <Switch
                label={id[0].toUpperCase() + id.slice(1)}
                checked={layers[id].visible}
                onChange={(visible) => setLayer(id, { visible })}
              />
              <Slider label="Opacity" value={layers[id].opacity} min={0} max={1} step={0.05} precision={2} onChange={(opacity) => setLayer(id, { opacity })} />
              <Slider label="Intensity" value={layers[id].intensity} min={0} max={2} step={0.1} precision={1} onChange={(intensity) => setLayer(id, { intensity })} />
            </div>
          ))}
        </section>
      </div>
    </Dialog>
  );
}
