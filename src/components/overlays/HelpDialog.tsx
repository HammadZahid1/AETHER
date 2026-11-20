import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { MODULES } from '@/data/modules';
import { useAetherStore } from '@/state/store';

const SHORTCUTS = [
  ['Ctrl/⌘ + K', 'Open command palette'],
  ['Space', 'Play or pause'],
  ['← / →', 'Step timeline backward or forward'],
  ['R', 'Reset camera'],
  ['L', 'Toggle layers panel'],
  ['?', 'Toggle this help'],
  ['Esc', 'Close dialogs or overlays'],
];

/** Built-in help covering navigation, controls and data provenance. */
export function HelpDialog() {
  const open = useAetherStore((state) => state.helpOpen);
  const setOpen = useAetherStore((state) => state.setHelpOpen);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="AETHER Help"
      subtitle="Interactive Earth and atmosphere exploration"
      width="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="aether-panel bg-[rgba(72,201,232,0.05)] p-3">
          <div className="flex gap-2">
            <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[var(--aether-accent)]" />
            <p className="text-[11px] leading-snug text-[var(--aether-text-muted)]">
              AETHER is an educational simulation. Every field, particle, trajectory and dataset is generated locally from
              deterministic algorithms. Values are illustrative and must not be used for forecasting, navigation or operational decisions.
            </p>
          </div>
        </div>

        <section>
          <h3 className="aether-label mb-2">Keyboard shortcuts</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {SHORTCUTS.map(([keys, description]) => (
              <div key={keys} className="flex items-center justify-between gap-3 rounded border border-[var(--aether-border)] px-2.5 py-1.5">
                <span className="text-[11px] text-[var(--aether-text-muted)]">{description}</span>
                <kbd className="aether-mono text-[10px] text-[var(--aether-accent)]">{keys}</kbd>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="aether-label mb-2">Modules</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODULES.map((module) => (
              <div key={module.id} className="rounded border border-[var(--aether-border)] p-2.5">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--aether-text)]">
                  <Icon name={module.icon} size={13} className="text-[var(--aether-accent)]" />
                  {module.label}
                </div>
                <p className="mt-1 text-[10px] leading-snug text-[var(--aether-text-dim)]">{module.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Dialog>
  );
}
