import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { useAetherStore } from '@/state/store';

const SECTIONS = [
  {
    title: 'Generation',
    body: 'Fields are sampled from deterministic noise, analytic latitude bands and simple coupled models. Repeating the same settings and timeline always produces the same values.',
  },
  {
    title: 'Sources',
    body: 'AETHER ships no observational datasets and contacts no external services. Coastlines, climate datasets and atmospheric profiles are illustrative procedural approximations.',
  },
  {
    title: 'Units',
    body: 'Temperatures are shown in °C, pressure in hPa, wind in m/s and distances in kilometres. Units are indicative only and are not calibrated to any instrument network.',
  },
  {
    title: 'Limitations',
    body: 'The simulation is not a numerical weather prediction system. It cannot support forecasts, aviation, marine navigation, emergency planning or operational decisions.',
  },
] as const;

/** Explicit provenance and suitability statement for all simulated data. */
export function DataProvenanceDialog() {
  const open = useAetherStore((state) => state.provenanceOpen);
  const setOpen = useAetherStore((state) => state.setProvenanceOpen);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Data Provenance"
      subtitle="How AETHER creates its illustrative values"
      width="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="aether-panel flex gap-2 border-[rgba(232,176,84,0.35)] bg-[rgba(232,176,84,0.06)] p-3">
          <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[var(--aether-amber)]" />
          <p className="text-[11px] leading-snug text-[var(--aether-text)]">
            All values in AETHER are simulated. They are intended for exploration and teaching only.
          </p>
        </div>
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="aether-label mb-1">{section.title}</h3>
            <p className="text-[11px] leading-snug text-[var(--aether-text-muted)]">{section.body}</p>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
