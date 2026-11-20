import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { DEFAULT_ATMOSPHERE } from '@/data/defaults';
import { ATMOSPHERIC_LAYERS } from '@/data/atmosphericLayers';
import { useAetherStore } from '@/state/store';

export function AtmosphereControlPanel() {
  const config = useAetherStore((state) => state.configurations.atmosphere);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('atmosphere', patch);
  const selected = ATMOSPHERIC_LAYERS.find((layer) => layer.id === config.layerId) ?? ATMOSPHERIC_LAYERS[0];

  return (
    <>
      <ControlSection title="Atmospheric shell" description="Layer visualization">
        <Switch label="Show atmosphere" checked={config.visible} onChange={(visible) => set({ visible })} />
        <Select
          label="Selected layer"
          value={config.layerId}
          options={ATMOSPHERIC_LAYERS.map((layer) => ({ value: layer.id, label: layer.name, description: layer.description }))}
          onChange={(layerId) => set({ layerId })}
        />
      </ControlSection>

      <ControlSection title="Layer parameters">
        <Slider label="Shell opacity" value={config.opacity} min={0} max={1} onChange={(opacity) => set({ opacity })} />
        <Slider label="Shell height" value={config.height} min={0.01} max={0.22} step={0.005} precision={3} onChange={(height) => set({ height })} />
        <Slider label="Atmospheric glow" value={config.glow} min={0} max={2} onChange={(glow) => set({ glow })} />
        <Slider label="Transition speed" value={config.transitionSpeed} min={0.1} max={3} onChange={(transitionSpeed) => set({ transitionSpeed })} />
      </ControlSection>

      <div className="aether-panel p-3">
        <div className="aether-label mb-1.5">Layer profile</div>
        <div className="aether-mono text-[11px] text-[var(--aether-accent)]">{selected.name}</div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--aether-text-muted)]">{selected.description}</p>
        <div className="mt-2 flex justify-between aether-mono text-[9px] text-[var(--aether-text-dim)]">
          <span>{selected.baseKm}–{selected.topKm} km</span>
          <span>{selected.temperature}</span>
        </div>
      </div>

      <ControlNote>Layer heights are exaggerated for visibility at planetary scale. Atmosphere rendering uses procedural shaders, not photographic assets.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('atmosphere', { ...DEFAULT_ATMOSPHERE })}>Reset atmosphere configuration</Button>
    </>
  );
}