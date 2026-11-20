import { Icon } from '@/components/ui/Icon';

/** Shown when the browser cannot create a WebGL context. */
export function WebGLFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="aether-panel max-w-md p-5 text-center">
        <Icon name="globe" size={30} className="mx-auto text-[var(--aether-accent)]" />
        <h2 className="mt-3 text-[13px] font-semibold text-[var(--aether-text)]">3D viewport unavailable</h2>
        <p className="mt-2 text-[11px] leading-snug text-[var(--aether-text-muted)]">
          This browser could not create a WebGL context. The simulation controls and local data tools remain available,
          but the globe and its visualization layers cannot be rendered.
        </p>
        <p className="mt-3 text-[10px] leading-snug text-[var(--aether-text-dim)]">
          Try enabling hardware acceleration or opening AETHER in a browser with WebGL support.
        </p>
      </div>
    </div>
  );
}
