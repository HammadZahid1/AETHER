import { IconButton } from '@/components/ui/Button';
import { useAetherStore } from '@/state/store';

interface MobileControlsProps {
  onOpenNavigation: () => void;
}

/** Floating controls that expose desktop panels on narrow screens. */
export function MobileControls({ onOpenNavigation }: MobileControlsProps) {
  const setLayersPanelOpen = useAetherStore((state) => state.setLayersPanelOpen);
  const setCommandPaletteOpen = useAetherStore((state) => state.setCommandPaletteOpen);

  return (
    <div className="aether-panel absolute left-3 top-3 z-20 flex gap-0.5 p-1 lg:hidden">
      <IconButton icon="menu" label="Open module navigation" onClick={onOpenNavigation} />
      <IconButton icon="layers" label="Open layers panel" onClick={() => setLayersPanelOpen(true)} />
      <IconButton icon="search" label="Open command palette" onClick={() => setCommandPaletteOpen(true)} />
    </div>
  );
}
