import { useId } from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  precision?: number;
  description?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function Slider({
  label, value, min, max, step = 0.01, unit = '', precision = 2, description, disabled, onChange,
}: SliderProps) {
  const id = useId();
  const percent = ((value - min) / (max - min || 1)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-medium text-[var(--aether-text-muted)]">{label}</label>
        <output htmlFor={id} className="aether-mono text-[11px] text-[var(--aether-accent)]">
          {value.toFixed(precision)}{unit}
        </output>
      </div>
      <div className="relative flex h-4 items-center">
        <div className="pointer-events-none absolute left-0 right-0 h-[2px] rounded-full bg-[rgba(72,201,232,0.22)]" style={{ width: `${percent}%` }} />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={`${value.toFixed(precision)}${unit}`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="relative z-10 bg-transparent"
        />
      </div>
      {description ? <p className="text-[10px] leading-snug text-[var(--aether-text-dim)]">{description}</p> : null}
    </div>
  );
}