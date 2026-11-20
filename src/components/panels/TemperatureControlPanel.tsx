import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_TEMPERATURE } from '@/data/defaults';
import { useAetherStore } from '@/state/store';
import type { TemperatureVisualizationMode } from '@/types/simulation';

const MODES = [
  { value: 'heatmap' as const, label: 'Thermal heatmap' },
  { value: 'bands' as const, label: 'Temperature bands' },
  { value: 'gradient' as const, label: 'Smooth gradient' },
];

export function TemperatureControlPanel() {
  const config = useAetherStore((state) => state.configurations.temperature);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('temperature', patch);

  return (
    <>
      <ControlSection title="Thermal field" description="Surface temperature simulation">
        <Switch label="Enable temperature layer" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Select label="Visualization" value={config.mode} options={MODES} onChange={(mode) => set({ mode: mode as TemperatureVisualizationMode })} />
        <Slider label="Global temperature" value={config.globalTemperature} min={-10} max={40} step={0.5} onChange={(globalTemperature) => set({ globalTemperature })} unit="°C" />
        <Slider label="Seasonal intensity" value={config.seasonalIntensity} min={0} max={2} onChange={(seasonalIntensity) => set({ seasonalIntensity })} />
        <Slider label="Latitude influence" value={config.latitudeInfluence} min={0} max={2} onChange={(latitudeInfluence) => set({ latitudeInfluence })} />
      </ControlSection>

      <ControlSection title="Variation" description="Diurnal and local effects">
        <Slider label="Day-night influence" value={config.dayNightInfluence} min={0} max={1} onChange={(dayNightInfluence) => set({ dayNightInfluence })} />
        <Slider label="Local variation" value={config.variation} min={0} max={1.5} onChange={(variation) => set({ variation })} />
        <Slider label="Layer opacity" value={config.opacity} min={0} max={1} onChange={(opacity) => set({ opacity })} />
      </ControlSection>

      <ControlSection title="Display scale" description="Legend range in Celsius" defaultOpen={false}>
        <Slider label="Minimum" value={config.scaleMin} min={-80} max={0} step={1} precision={0} onChange={(scaleMin) => set({ scaleMin })} unit="°C" />
        <Slider label="Maximum" value={config.scaleMax} min={0} max={60} step={1} precision={0} onChange={(scaleMax) => set({ scaleMax })} unit="°C" />
        <Legend
          title="Surface temperature"
          min={`${config.scaleMin}°C`}
          max={`${config.scaleMax}°C`}
          gradient="linear-gradient(90deg,#385cd9,#4db8eb,#8cdbb3,#fad166,#fa7a42,#c7294d)"
          note="simulated"
        />
      </ControlSection>

      <ControlNote>Temperature combines latitude, season, solar phase and deterministic local variation. It is an illustrative field, not measured data.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('temperature', { ...DEFAULT_TEMPERATURE })}>Reset temperature configuration</Button>
    </>
  );
}