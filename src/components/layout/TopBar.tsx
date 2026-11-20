import { useEffect, useState } from 'react';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { MODULE_MAP } from '@/data/modules';
import { useAetherStore } from '@/state/store';
import type { SimulationStatus } from '@/types/simulation';

const STATUS_TONE: Record<SimulationStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  idle: 'neutral', running: 'success', paused: 'warning', error: 'danger',
};

const SPEEDS = [0.25, 0.5, 1, 2, 4, 8];

interface TopBarProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function TopBar({ onToggleFullscreen, isFullscreen }: TopBarProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const activeModule = useAetherStore((state) => state.activeModule);
  const status = useAetherStore((state) => state.status);
  const speed = useAetherStore((state) => state.speed);
  const camera = useAetherStore((state) => state.camera);
  const setSpeed = useAetherStore((state) => state.setSpeed);
  const setSettingsOpen = useAetherStore((state) => state.setSettingsOpen);
  const setHelpOpen = useAetherStore((state) => state.setHelpOpen);
  const setCommandPaletteOpen = useAetherStore((state) => state.setCommandPaletteOpen);
  const setCamera = useAetherStore((state) => state.setCamera);
  const saveCurrentView = useAetherStore((state) => state.saveCurrentView);
  const savedViews = useAetherStore((state) => state.savedViews);
  const applySavedView = useAetherStore((state) => state.applySavedView);
  const removeSavedView = useAetherStore((state) => state.removeSavedView);
  const module = MODULE_MAP[activeModule];

  useEffect(() => {
    if (!viewOpen) return;
    const close = () => setViewOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [viewOpen]);

  const views = [
    { name: 'Global View', target: { latitude: 12, longitude: -25 }, distance: 2.8 },
    { name: 'Close-Up', target: { latitude: 20, longitude: -60 }, distance: 1.9 },
    { name: 'Atmospheric View', target: { latitude: 0, longitude: 0 }, distance: 3.6 },
    { name: 'Polar View', target: { latitude: 82, longitude: 0 }, distance: 2.6 },
  ];

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center justify-between border-b border-[var(--aether-border)] bg-[rgba(6,9,15,0.95)] px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-[5px] border border-[rgba(72,201,232,0.4)] bg-[rgba(72,201,232,0.08)] text-[var(--aether-accent)]">
            <Icon name="globe" size={17} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--aether-accent)] aether-glow" />
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-[0.22em] text-[var(--aether-text)]">AETHER</div>
            <div className="mt-1 hidden text-[8px] tracking-[0.16em] text-[var(--aether-text-dim)] sm:block">EARTH &amp; ATMOSPHERE SIMULATION</div>
          </div>
        </div>
        <div className="hidden h-5 w-px bg-[var(--aether-border)] md:block" />
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <Icon name={module.icon} size={14} className="shrink-0 text-[var(--aether-accent)]" />
          <span className="truncate text-[11px] font-medium text-[var(--aether-text-muted)]">{module.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Badge tone={STATUS_TONE[status]} dot>{status}</Badge>
        <div className="hidden items-center gap-1.5 border-l border-[var(--aether-border)] pl-3 lg:flex">
          <span className="aether-label">Speed</span>
          <select
            aria-label="Simulation speed"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="aether-mono h-6 rounded-[3px] border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-1.5 text-[10px] outline-none"
          >
            {SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}
          </select>
        </div>

        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <Button size="sm" variant="ghost" icon="compass" onClick={() => setViewOpen((value) => !value)}>
            <span className="hidden xl:inline">{camera.preset}</span>
          </Button>
          {viewOpen ? (
            <div className="aether-panel absolute right-0 top-8 z-40 w-56 p-1.5 shadow-2xl">
              <div className="aether-label px-2 py-1.5">Camera views</div>
              {views.map((view) => (
                <button
                  key={view.name}
                  type="button"
                  onClick={() => { setCamera({ target: view.target, distance: view.distance, preset: view.name }); setViewOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-[3px] px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-white/5 ${camera.preset === view.name ? 'text-[var(--aether-accent)]' : 'text-[var(--aether-text-muted)]'}`}
                >
                  {view.name}
                  {camera.preset === view.name ? <Icon name="check" size={12} /> : null}
                </button>
              ))}
              {savedViews.length ? (
                <>
                  <div className="my-1 border-t border-[var(--aether-border)]" />
                  <div className="aether-label px-2 py-1.5">Saved views</div>
                  <div className="aether-scroll max-h-32 overflow-y-auto">
                    {savedViews.map((view) => (
                      <div key={view.id} className="flex items-center gap-1 rounded-[3px] hover:bg-white/5">
                        <button
                          type="button"
                          onClick={() => { applySavedView(view.id); setViewOpen(false); }}
                          className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-[11px] text-[var(--aether-text-muted)]"
                        >
                          {view.name}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete view ${view.name}`}
                          onClick={() => removeSavedView(view.id)}
                          className="px-1.5 py-1.5 text-[var(--aether-text-dim)] hover:text-[var(--aether-danger)]"
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <div className="my-1 border-t border-[var(--aether-border)]" />
              <button
                type="button"
                onClick={() => { saveCurrentView(`View ${new Date().toLocaleTimeString()}`); setViewOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-left text-[11px] text-[var(--aether-text-muted)] transition-colors hover:bg-white/5"
              >
                <Icon name="save" size={12} /> Save current view
              </button>
            </div>
          ) : null}
        </div>

        <IconButton icon="search" label="Open command palette" onClick={() => setCommandPaletteOpen(true)} />
        <IconButton icon="fullscreen" label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} active={isFullscreen} onClick={onToggleFullscreen} className="hidden sm:inline-flex" />
        <IconButton icon="settings" label="Open settings" onClick={() => setSettingsOpen(true)} />
        <IconButton icon="help" label="Open help" onClick={() => setHelpOpen(true)} className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}