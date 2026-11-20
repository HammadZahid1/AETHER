import { IconButton } from '@/components/ui/Button';
import { useAetherStore } from '@/state/store';

interface ViewportControlsProps {
  onOpenScenarios: () => void;
  onResetCamera: () => void;
}

/** Compact toolbar over the globe for common view actions. */
export function ViewportControls({ onOpenScenarios, onResetCamera }: ViewportControlsProps) {
  const camera = useAetherStore((state) => state.camera);
  const setCamera = useAetherStore((state) => state.setCamera);
  const setLayersPanelOpen = useAetherStore((state) => state.setLayersPanelOpen);
  const saveCurrentView = useAetherStore((state) => state.saveCurrentView);

  return (
    <div className="aether-panel absolute right-3 top-[104px] z-20 flex flex-col gap-0.5 p-1">
      <IconButton icon="sparkles" label="Open scenario browser" onClick={onOpenScenarios} />
      <IconButton icon="layers" label="Open layers panel" onClick={() => setLayersPanelOpen(true)} />
      <IconButton icon="camera" label="Reset camera" onClick={onResetCamera} />
      <IconButton
        icon="compass"
        label={camera.autoRotate ? 'Disable auto rotation' : 'Enable auto rotation'}
        active={camera.autoRotate}
        onClick={() => setCamera({ autoRotate: !camera.autoRotate })}
      />
      <IconButton icon="save" label="Save current view" onClick={() => saveCurrentView(`View ${new Date().toLocaleTimeString()}`)} />
    </div>
  );
}
