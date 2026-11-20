import { IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatSimulationTime, formatTimeline } from '@/engine/clock';
import { useAetherStore } from '@/state/store';

interface TimelineProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStep: (direction: 1 | -1) => void;
}

export function Timeline({ onPlay, onPause, onStop, onStep }: TimelineProps) {
  const status = useAetherStore((state) => state.status);
  const speed = useAetherStore((state) => state.speed);
  const direction = useAetherStore((state) => state.direction);
  const timeline = useAetherStore((state) => state.timeline);
  const elapsed = useAetherStore((state) => state.elapsed);
  const seek = useAetherStore((state) => state.seek);
  const setSpeed = useAetherStore((state) => state.setSpeed);
  const setDirection = useAetherStore((state) => state.setDirection);

  return (
    <footer className="relative z-20 flex h-[62px] shrink-0 items-center gap-3 border-t border-[var(--aether-border)] bg-[rgba(6,9,15,0.96)] px-3 sm:px-4">
      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton icon="reverse" label="Step backward" onClick={() => onStep(-1)} />
        <IconButton
          icon={status === 'running' && direction === 1 ? 'pause' : 'play'}
          label={status === 'running' && direction === 1 ? 'Pause simulation' : 'Play simulation'}
          active={status === 'running' && direction === 1}
          tone="accent"
          onClick={() => (status === 'running' && direction === 1 ? onPause() : (setDirection(1), onPlay()))}
        />
        <IconButton icon="stop" label="Stop simulation" onClick={onStop} />
        <IconButton icon="forward" label="Step forward" onClick={() => onStep(1)} />
      </div>

      <div className="hidden h-7 w-px bg-[var(--aether-border)] sm:block" />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="aether-label hidden sm:inline">Simulation timeline</span>
          <span className="aether-mono text-[9px] text-[var(--aether-text-dim)]">{formatTimeline(timeline)}</span>
        </div>
        <div className="relative flex h-4 items-center">
          <div className="pointer-events-none absolute left-0 right-0 h-[3px] rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#1b6f8c,#48c9e8)]" style={{ width: `${timeline * 100}%` }} />
          </div>
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <span key={tick} className="pointer-events-none absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-[var(--aether-text-dim)]/40" style={{ left: `${tick * 100}%` }} />
          ))}
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={timeline}
            aria-label="Scrub simulation timeline"
            onChange={(event) => seek(Number(event.target.value))}
            className="relative z-10 h-3 bg-transparent"
          />
        </div>
      </div>

      <div className="hidden h-7 w-px bg-[var(--aether-border)] lg:block" />

      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        <span className="aether-label">Rate</span>
        <select
          aria-label="Timeline playback rate"
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          className="aether-mono h-6 rounded-[3px] border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-1.5 text-[10px] outline-none"
        >
          {[0.25, 0.5, 1, 2, 4, 8].map((value) => <option key={value} value={value}>{value}×</option>)}
        </select>
      </div>

      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <span className="aether-mono text-[11px] text-[var(--aether-text)]">{formatSimulationTime(elapsed)}</span>
        <span className="aether-label">Elapsed</span>
      </div>
      {status === 'running' && direction === -1 ? <Badge tone="warning">Reverse</Badge> : null}
    </footer>
  );
}