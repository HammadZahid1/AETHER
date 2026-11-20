import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { DEFAULT_CLOUDS } from '@/data/defaults';
import { useAetherStore } from '@/state/store';

export function CloudControlPanel() {
  const config = useAetherStore((state) => state.configurations.clouds);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('clouds', patch);

  return (
    <>
      <ControlSection title="Cloud field" description="Procedural layered cloud cover">
        <Switch label="Enable clouds" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Slider label="Cloud density" value={config.density} min={0} max={1} onChange={(density) => set({ density })} />
        <Slider label="Coverage threshold" value={config.coverage} min={0} max={1} onChange={(coverage) => set({ coverage })} />
        <Slider label="Cloud layers" value={config.layerCount} min={1} max={4} step={1} precision={0} onChange={(layerCount) => set({ layerCount })} />
      </ControlSection>

      <ControlSection title="Appearance & motion">
        <Slider label="Cloud altitude" value={config.height} min={0.01} max={0.12} step={0.005} precision={3} onChange={(height) => set({ height })} />
        <Slider label="Puff size" value={config.size} min={0.03} max={0.2} step={0.005} precision={3} onChange={(size) => set({ size })} />
        <Slider label="Opacity" value={config.opacity} min={0} max={1} onChange={(opacity) => set({ opacity })} />
        <Slider label="Movement speed" value={config.movementSpeed} min={0} max={2} onChange={(movementSpeed) => set({ movementSpeed })} />
      </ControlSection>

      <ControlNote>Cloud puffs are generated from layered fractal noise and drift eastward. Density and coverage changes rebuild the particle set.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('clouds', { ...DEFAULT_CLOUDS })}>Reset cloud configuration</Button>
    </>
  );
}