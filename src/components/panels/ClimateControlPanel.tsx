import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CLIMATE_DATASET_LIST, seasonLabel } from '@/data/climateDatasets';
import { DEFAULT_CLIMATE } from '@/data/defaults';
import { useAetherStore } from '@/state/store';
import type { ClimateDatasetId } from '@/types/config';

export function ClimateControlPanel() {
  const config = useAetherStore((state) => state.configurations.climate);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('climate', patch);

  return (
    <>
      <ControlSection title="Climate dataset" description="Bundled illustrative patterns" badge={<Badge tone="accent">Local data</Badge>}>
        <Switch label="Enable climate layer" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Select
          label="Dataset"
          value={config.dataset}
          options={CLIMATE_DATASET_LIST.map((dataset) => ({ value: dataset.id, label: dataset.name, description: dataset.description }))}
          onChange={(dataset) => set({ dataset: dataset as ClimateDatasetId })}
        />
      </ControlSection>

      <ControlSection title="Seasonal controls">
        <Slider label="Season" value={config.season} min={0} max={3.99} step={0.01} precision={2} onChange={(season) => set({ season })} />
        <div className="aether-mono text-[10px] text-[var(--aether-accent)]">{seasonLabel(config.season)}</div>
        <Slider label="Temperature scale" value={config.temperatureScale} min={0.2} max={2} onChange={(temperatureScale) => set({ temperatureScale })} />
        <Slider label="Rainfall intensity" value={config.rainfallIntensity} min={0} max={2} onChange={(rainfallIntensity) => set({ rainfallIntensity })} />
      </ControlSection>

      <ControlSection title="Display" defaultOpen={false}>
        <Switch label="Climate zones" checked={config.zonesVisible} onChange={(zonesVisible) => set({ zonesVisible })} />
        <Switch label="Season comparison" checked={config.comparisonMode} onChange={(comparisonMode) => set({ comparisonMode })} />
      </ControlSection>

      <ControlNote>All climate datasets are generated deterministically in the browser for exploration and teaching. They are not observations, reanalysis, or projections.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('climate', { ...DEFAULT_CLIMATE })}>Reset climate configuration</Button>
    </>
  );
}