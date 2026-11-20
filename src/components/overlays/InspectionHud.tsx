import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { getSimulationModules } from '@/engine/simulationModules';
import { inspectActiveModule } from '@/renderer/inspection';
import { useAetherStore } from '@/state/store';
import { MODULE_MAP } from '@/data/modules';

/** Live local readout for the coordinate selected on the globe. */
export function InspectionHud() {
  const activeModule = useAetherStore((state) => state.activeModule);
  const selected = useAetherStore((state) => state.selectedCoordinate);
  const elapsed = useAetherStore((state) => state.elapsed);
  const rows = inspectActiveModule(
    getSimulationModules(),
    activeModule,
    selected ?? { latitude: 0, longitude: 0 },
    elapsed,
  );
  const module = MODULE_MAP[activeModule];

  return (
    <div className="aether-panel pointer-events-none absolute bottom-3 left-3 z-20 w-[218px] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--aether-text)]">
          <Icon name={module.icon} size={13} className="text-[var(--aether-accent)]" />
          <span className="truncate">{module.shortLabel}</span>
        </div>
        <Badge tone="warning">Simulated</Badge>
      </div>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-2">
            <dt className="aether-label">{row.label}</dt>
            <dd className="aether-mono truncate text-[10px] text-[var(--aether-text)]">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 border-t border-[var(--aether-border)] pt-1.5 text-[9px] leading-snug text-[var(--aether-text-dim)]">
        Click the globe to inspect another point. Values are illustrative.
      </p>
    </div>
  );
}
