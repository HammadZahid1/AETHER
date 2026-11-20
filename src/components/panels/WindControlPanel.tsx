import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_WIND } from '@/data/defaults';
import { useAetherStore } from '@/state/store';
import type { WindVisualizationMode } from '@/types/simulation';

const MODES = [
  { value: 'particles' as const, label: 'Particle flow' },
  { value: 'streamlines' as const, label: 'Streamlines' },
  { value: 'vectors' as const, label: 'Vector field' },
  { value: 'density' as const, label: 'Flow density' },
  { value: 'directional' as const, label: 'Directional field' },
];

export function WindControlPanel() {
  const config = useAetherStore((state) => state.configurations.wind);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('wind', patch);

  return (
    <>
      <ControlSection title="Wind simulation" description="Animated global circulation model">
        <Switch label="Enable wind field" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Select
          label="Visualization mode"
          value={config.mode}
          options={MODES}
          onChange={(mode) => set({ mode: mode as WindVisualizationMode })}
        />
        <Slider label="Flow speed" value={config.speed} min={0} max={4} step={0.05} onChange={(speed) => set({ speed })} unit="×" />
        <Slider label="Field intensity" value={config.intensity} min={0} max={2} onChange={(intensity) => set({ intensity })} />
      </ControlSection>

      <ControlSection title="Particle system" description="Density, transport and appearance" defaultOpen={false}>
        <Slider label="Particle count" value={config.particleCount} min={200} max={8000} step={100} precision={0} onChange={(particleCount) => set({ particleCount })} />
        <Slider label="Particle size" value={config.particleSize} min={0.004} max={0.04} step={0.001} precision={3} onChange={(particleSize) => set({ particleSize })} />
        <Slider label="Trail length" value={config.trailLength} min={1} max={24} step={1} precision={0} onChange={(trailLength) => set({ trailLength })} />
        <Slider label="Particle lifetime" value={config.lifetime} min={1} max={14} step={0.25} onChange={(lifetime) => set({ lifetime })} unit="s" />
        <Slider label="Acceleration" value={config.acceleration} min={0} max={1} onChange={(acceleration) => set({ acceleration })} />
      </ControlSection>

      <ControlSection title="Overlays" description="Additional field indicators" defaultOpen={false}>
        <Switch label="Flow visibility" checked={config.flowVisible} onChange={(flowVisible) => set({ flowVisible })} />
        <Switch label="Wind vectors" checked={config.vectorsVisible} onChange={(vectorsVisible) => set({ vectorsVisible })} />
        <Legend
          title="Wind speed"
          min="Calm"
          max="Strong"
          gradient="linear-gradient(90deg,#2159bf,#26b8db,#7aefd1,#fad16b,#ff6b59)"
          note="simulated"
        />
      </ControlSection>

      <ControlNote>
        Wind is generated from latitude circulation bands, deterministic noise and optional pressure deflection. Values are illustrative and are not live weather observations.
      </ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('wind', { ...DEFAULT_WIND })}>
        Reset wind configuration
      </Button>
    </>
  );
}