import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button, IconButton } from '@/components/ui/Button';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_PRESSURE } from '@/data/defaults';
import { useAetherStore } from '@/state/store';
import type { PressureRegion } from '@/types/config';

export function PressureControlPanel() {
  const config = useAetherStore((state) => state.configurations.pressure);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('pressure', patch);

  const updateRegion = (id: string, patch: Partial<PressureRegion>) => {
    set({ regions: config.regions.map((region) => (region.id === id ? { ...region, ...patch } : region)) });
  };
  const addRegion = () => {
    const region: PressureRegion = {
      id: `region-${Date.now()}`,
      label: `System ${config.regions.length + 1}`,
      center: { latitude: 0, longitude: 0 },
      strength: 1,
      radius: 20,
    };
    set({ regions: [...config.regions, region] });
  };

  return (
    <>
      <ControlSection title="Pressure field" description="Sea-level pressure model">
        <Switch label="Enable pressure layer" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Slider label="Field intensity" value={config.intensity} min={0} max={2} onChange={(intensity) => set({ intensity })} />
        <Slider label="Gradient strength" value={config.gradient} min={0} max={2} onChange={(gradient) => set({ gradient })} />
        <Slider label="Contour lines" value={config.contourCount} min={2} max={14} step={1} precision={0} onChange={(contourCount) => set({ contourCount })} />
      </ControlSection>

      <ControlSection title="Visualization" description="Field and contour visibility">
        <Switch label="Pressure field" checked={config.fieldVisible} onChange={(fieldVisible) => set({ fieldVisible })} />
        <Switch label="Contour lines" checked={config.contoursVisible} onChange={(contoursVisible) => set({ contoursVisible })} />
        <Legend
          title="Sea-level pressure"
          min="975 hPa"
          max="1050 hPa"
          gradient="linear-gradient(90deg,#593ec7,#389ee0,#99c7d1,#f5bd6b,#db4870)"
          note="simulated"
        />
      </ControlSection>

      <ControlSection title="Pressure centers" description={`${config.regions.length} configured regions`} defaultOpen={false}>
        <div className="space-y-3">
          {config.regions.map((region) => (
            <div key={region.id} className="rounded-[4px] border border-[var(--aether-border)] bg-white/[0.02] p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-[10px] font-semibold ${region.strength >= 0 ? 'text-[var(--aether-amber)]' : 'text-[var(--aether-accent)]'}`}>
                  {region.strength >= 0 ? 'HIGH' : 'LOW'} · {region.label}
                </span>
                <IconButton icon="trash" label={`Remove ${region.label}`} tone="danger" onClick={() => set({ regions: config.regions.filter((item) => item.id !== region.id) })} />
              </div>
              <Slider label="Latitude" value={region.center.latitude} min={-80} max={80} step={1} precision={0} onChange={(latitude) => updateRegion(region.id, { center: { ...region.center, latitude } })} unit="°" />
              <Slider label="Longitude" value={region.center.longitude} min={-180} max={180} step={1} precision={0} onChange={(longitude) => updateRegion(region.id, { center: { ...region.center, longitude } })} unit="°" />
              <Slider label="Strength" value={region.strength} min={-2} max={2} step={0.1} onChange={(strength) => updateRegion(region.id, { strength })} />
              <Slider label="Radius" value={region.radius} min={5} max={60} step={1} precision={0} onChange={(radius) => updateRegion(region.id, { radius })} unit="°" />
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" icon="plus" onClick={addRegion} className="w-full">Add pressure center</Button>
      </ControlSection>

      <ControlNote>Pressure centers are smooth Gaussian anomalies over a zonal background. Multiple highs and lows can coexist and influence the wind field.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('pressure', { ...DEFAULT_PRESSURE })}>Reset pressure configuration</Button>
    </>
  );
}