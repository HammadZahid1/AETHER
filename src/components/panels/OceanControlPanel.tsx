import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_OCEAN } from '@/data/defaults';
import { useAetherStore } from '@/state/store';

export function OceanControlPanel() {
  const config = useAetherStore((state) => state.configurations.ocean);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('ocean', patch);

  return (
    <>
      <ControlSection title="Ocean currents" description="Simplified surface circulation">
        <Switch label="Enable ocean layer" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Slider label="Current speed" value={config.currentSpeed} min={0} max={3} onChange={(currentSpeed) => set({ currentSpeed })} unit="×" />
        <Slider label="Particle count" value={config.particleCount} min={300} max={5000} step={100} precision={0} onChange={(particleCount) => set({ particleCount })} />
        <Slider label="Particle size" value={config.particleSize} min={0.004} max={0.03} step={0.001} precision={3} onChange={(particleSize) => set({ particleSize })} />
      </ControlSection>

      <ControlSection title="Overlays">
        <Switch label="Streamlines" checked={config.streamlinesVisible} onChange={(streamlinesVisible) => set({ streamlinesVisible })} />
        <Switch label="Temperature overlay" checked={config.temperatureOverlay} onChange={(temperatureOverlay) => set({ temperatureOverlay })} />
        <Slider label="Reference temperature" value={config.temperature} min={0} max={32} step={0.5} onChange={(temperature) => set({ temperature })} unit="°C" />
        <Legend title="Sea-surface temperature" min="-2°C" max="32°C" gradient="linear-gradient(90deg,#143a80,#1a7aa8,#29c2b8,#9ef0dc)" note="illustrative" />
      </ControlSection>

      <ControlNote>Ocean flow combines subtropical gyres, equatorial bands and deterministic noise. Temperature values are illustrative teaching data.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('ocean', { ...DEFAULT_OCEAN })}>Reset ocean configuration</Button>
    </>
  );
}