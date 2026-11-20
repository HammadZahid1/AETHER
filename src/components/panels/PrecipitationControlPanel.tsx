import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_PRECIPITATION } from '@/data/defaults';
import { useAetherStore } from '@/state/store';

export function PrecipitationControlPanel() {
  const config = useAetherStore((state) => state.configurations.precipitation);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('precipitation', patch);

  return (
    <>
      <ControlSection title="Precipitation" description="Rain particle simulation">
        <Switch label="Enable precipitation" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Select
          label="Distribution"
          value={config.distribution}
          options={[{ value: 'regional' as const, label: 'Regional' }, { value: 'global' as const, label: 'Global' }]}
          onChange={(distribution) => set({ distribution })}
        />
        <Slider label="Density" value={config.density} min={0} max={1} onChange={(density) => set({ density })} />
        <Slider label="Intensity" value={config.intensity} min={0} max={1} onChange={(intensity) => set({ intensity })} />
      </ControlSection>

      <ControlSection title="Rain particles">
        <Slider label="Fall speed" value={config.speed} min={0.2} max={4} onChange={(speed) => set({ speed })} unit="×" />
        <Slider label="Drop size" value={config.particleSize} min={0.003} max={0.02} step={0.001} precision={3} onChange={(particleSize) => set({ particleSize })} />
        <Slider label="Region radius" value={config.regionRadius} min={5} max={60} step={1} precision={0} onChange={(regionRadius) => set({ regionRadius })} unit="°" />
        <Legend title="Rainfall intensity" min="Light" max="Torrential" gradient="linear-gradient(90deg,#16405e,#2e8bb8,#6fd6e8,#e8e08a)" note="simulated" />
      </ControlSection>

      <ControlNote>Rain intensity is sampled from a deterministic regional field. Select the globe to inspect local precipitation conditions.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('precipitation', { ...DEFAULT_PRECIPITATION })}>Reset precipitation configuration</Button>
    </>
  );
}