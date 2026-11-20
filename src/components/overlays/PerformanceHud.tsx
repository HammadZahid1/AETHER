import { useAetherStore } from '@/state/store';

/** Small viewport badge showing smoothed render frame rate. */
export function PerformanceHud() {
  const fps = useAetherStore((state) => state.fps);
  const quality = useAetherStore((state) => state.settings.rendering.quality);
  const rounded = Math.round(fps);

  return (
    <div className="aether-panel pointer-events-none absolute bottom-3 right-3 z-20 hidden items-center gap-2 px-2 py-1 sm:flex" aria-label="Performance">
      <span className={`h-1.5 w-1.5 rounded-full ${rounded >= 45 ? 'bg-[var(--aether-success)]' : rounded >= 25 ? 'bg-[var(--aether-amber)]' : 'bg-[var(--aether-danger)]'}`} />
      <span className="aether-mono text-[10px] text-[var(--aether-text)]">{rounded} FPS</span>
      <span className="aether-label">{quality}</span>
    </div>
  );
}
