export interface LegendStop {
  color: string;
  label: string;
}

export interface LegendProps {
  title: string;
  min: string;
  max: string;
  gradient: string;
  stops?: readonly LegendStop[];
  note?: string;
}

export function Legend({ title, min, max, gradient, stops, note }: LegendProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="aether-label">{title}</span>
        {note ? <span className="text-[9px] text-[var(--aether-text-dim)]">{note}</span> : null}
      </div>
      <div className="h-2 rounded-full border border-white/5" style={{ background: gradient }} />
      <div className="flex justify-between aether-mono text-[9px] text-[var(--aether-text-dim)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {stops && stops.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
          {stops.map((stop) => (
            <span key={stop.label} className="flex items-center gap-1 text-[9px] text-[var(--aether-text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stop.color }} />
              {stop.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}