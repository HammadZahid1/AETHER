import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Legend } from '@/components/ui/Legend';
import { DEFAULT_STORM } from '@/data/defaults';
import { useAetherStore } from '@/state/store';
import { stormCategory } from '@/simulations/storm/field';

export function StormControlPanel() {
  const config = useAetherStore((state) => state.configurations.storm);
  const update = useAetherStore((state) => state.updateConfig);
  const set = (patch: Partial<typeof config>) => update('storm', patch);

  return (
    <>
      <ControlSection title="Storm system" description="Illustrative cyclone model" badge={<Badge tone={config.intensity > 0.65 ? 'warning' : 'accent'}>{stormCategory(config.intensity)}</Badge>}>
        <Switch label="Enable storm" checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Slider label="Intensity" value={config.intensity} min={0} max={1} onChange={(intensity) => set({ intensity })} />
        <Slider label="Radius" value={config.radius} min={5} max={50} step={1} precision={0} onChange={(radius) => set({ radius })} unit="°" />
        <Slider label="Rotation" value={config.rotation} min={-2} max={2} step={0.1} onChange={(rotation) => set({ rotation })} />
      </ControlSection>

      <ControlSection title="Center & movement">
        <Slider label="Center latitude" value={config.center.latitude} min={-70} max={70} step={1} precision={0} onChange={(latitude) => set({ center: { ...config.center, latitude } })} unit="°" />
        <Slider label="Center longitude" value={config.center.longitude} min={-180} max={180} step={1} precision={0} onChange={(longitude) => set({ center: { ...config.center, longitude } })} unit="°" />
        <Slider label="Heading" value={config.movementDirection} min={0} max={360} step={5} precision={0} onChange={(movementDirection) => set({ movementDirection })} unit="°" />
        <Slider label="Movement speed" value={config.movementSpeed} min={0} max={2} onChange={(movementSpeed) => set({ movementSpeed })} />
        <Switch label="Show trajectory" checked={config.trajectoryVisible} onChange={(trajectoryVisible) => set({ trajectoryVisible })} />
      </ControlSection>

      <ControlSection title="Internal structure" defaultOpen={false}>
        <Slider label="Cloud density" value={config.cloudDensity} min={0} max={1} onChange={(cloudDensity) => set({ cloudDensity })} />
        <Slider label="Wind intensity" value={config.windIntensity} min={0} max={2} onChange={(windIntensity) => set({ windIntensity })} />
        <Slider label="Rain intensity" value={config.rainIntensity} min={0} max={1} onChange={(rainIntensity) => set({ rainIntensity })} />
        <Legend title="Core pressure" min="Low" max="Environment" gradient="linear-gradient(90deg,#593ec7,#389ee0,#99c7d1,#f5bd6b)" note="simulated" />
      </ControlSection>

      <ControlNote>The Storm Lab is an educational visualization of cyclone structure. It is not an operational forecasting tool and does not use live meteorological data.</ControlNote>
      <Button size="sm" variant="ghost" icon="reset" onClick={() => update('storm', { ...DEFAULT_STORM })}>Reset storm configuration</Button>
    </>
  );
}