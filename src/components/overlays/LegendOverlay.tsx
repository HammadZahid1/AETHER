import { Legend } from '@/components/ui/Legend';
import { moduleLegend } from '@/renderer/legends';
import { useAetherStore } from '@/state/store';

/** Floating color-scale key for the active visualization. */
export function LegendOverlay() {
  const activeModule = useAetherStore((state) => state.activeModule);
  const configurations = useAetherStore((state) => state.configurations);
  const legend = moduleLegend(activeModule, configurations);

  return (
    <div className="aether-panel pointer-events-none absolute right-3 top-3 z-20 w-[196px] p-2.5">
      <Legend {...legend} />
    </div>
  );
}
