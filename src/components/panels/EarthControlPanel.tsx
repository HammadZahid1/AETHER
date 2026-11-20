import { ControlNote, ControlSection } from '@/components/layout/RightPanel';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { formatCoordinates } from '@/engine/coordinates';
import { useAetherStore } from '@/state/store';

interface EarthControlPanelProps {
  onResetCamera: () => void;
}

export function EarthControlPanel({ onResetCamera }: EarthControlPanelProps) {
  const camera = useAetherStore((state) => state.camera);
  const selected = useAetherStore((state) => state.selectedCoordinate);
  const settings = useAetherStore((state) => state.settings);
  const setCamera = useAetherStore((state) => state.setCamera);
  const updateSettings = useAetherStore((state) => state.updateSettings);
  const setSelectedCoordinate = useAetherStore((state) => state.setSelectedCoordinate);

  return (
    <>
      <ControlSection title="Camera" description="Orbit and framing">
        <Slider label="Camera distance" value={camera.distance} min={1.5} max={5} step={0.05} onChange={(distance) => setCamera({ distance })} unit="R" />
        <Switch label="Auto rotation" checked={settings.autoRotate} onChange={(autoRotate) => { updateSettings({ autoRotate }); setCamera({ autoRotate }); }} />
        <Button size="sm" variant="outline" icon="crosshair" onClick={onResetCamera} className="w-full">Reset camera</Button>
      </ControlSection>

      <ControlSection title="Selected coordinate" description="Click the globe to inspect a point">
        <div className="aether-mono rounded-[4px] border border-[var(--aether-border)] bg-white/[0.02] p-2.5 text-[11px] text-[var(--aether-accent)]">
          {selected ? formatCoordinates(selected) : 'No point selected'}
        </div>
        {selected ? (
          <>
            <Slider label="Latitude" value={selected.latitude} min={-90} max={90} step={0.5} precision={1} onChange={(latitude) => setSelectedCoordinate({ ...selected, latitude })} unit="°" />
            <Slider label="Longitude" value={selected.longitude} min={-180} max={180} step={0.5} precision={1} onChange={(longitude) => setSelectedCoordinate({ ...selected, longitude })} unit="°" />
          </>
        ) : null}
      </ControlSection>

      <ControlSection title="Reference grid" description="Geographic coordinate overlay" defaultOpen={false}>
        <Switch label="Show grid" checked={settings.showGrid} onChange={(showGrid) => updateSettings({ showGrid })} />
      </ControlSection>

      <ControlNote>Click anywhere on the globe to select a geographic coordinate. The inspection panel reports simulated values from all active modules.</ControlNote>
    </>
  );
}