import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { simulationEngine } from '@/engine/engine';
import { useAetherStore } from '@/state/store';

/** Compact live readout of engine health and clock progress. */
export function DiagnosticsOverlay() {
  const open = useAetherStore((state) => state.diagnosticsOpen);
  const setOpen = useAetherStore((state) => state.setDiagnosticsOpen);
  const frame = useAetherStore((state) => state.frame);
  const elapsed = useAetherStore((state) => state.elapsed);
  if (!open) return null;

  const diagnostics = simulationEngine.diagnostics();
  const rows = [
    ['Frame', String(frame)],
    ['Elapsed', `${elapsed.toFixed(1)} s`],
    ['Modules', `${diagnostics.activeModules} / ${diagnostics.registeredModules}`],
    ['Errors', String(diagnostics.errors)],
    ['Engine', diagnostics.running ? 'running' : 'stopped'],
  ] as const;

  return (
    <section className="aether-panel absolute left-3 top-[104px] z-30 w-[216px] p-2.5" aria-label="Engine diagnostics">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="aether-label">Diagnostics</span>
        <IconButton icon="close" label="Close diagnostics" size={13} onClick={() => setOpen(false)} />
      </div>
      <dl className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <dt className="aether-label">{label}</dt>
            <dd className="aether-mono text-[10px] text-[var(--aether-text)]">{value}</dd>
          </div>
        ))}
      </dl>
      {diagnostics.latestError ? (
        <div className="mt-2 border-t border-[var(--aether-border)] pt-1.5">
          <Badge tone="danger">Error</Badge>
          <p className="mt-1 text-[9px] leading-snug text-[var(--aether-danger)]">{diagnostics.latestError.message}</p>
        </div>
      ) : null}
    </section>
  );
}
