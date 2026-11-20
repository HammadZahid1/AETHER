import { useId } from 'react';

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export function Switch({ label, checked, onChange, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-[11px] font-medium text-[var(--aether-text-muted)]">{label}</label>
        {description ? <p className="mt-0.5 text-[10px] leading-snug text-[var(--aether-text-dim)]">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-[18px] w-8 shrink-0 rounded-full border transition-colors ${checked ? 'border-[var(--aether-accent)]/50 bg-[rgba(72,201,232,0.28)]' : 'border-[var(--aether-border)] bg-white/5'}`}
      >
        <span className={`absolute top-[2px] h-3 w-3 rounded-full transition-all ${checked ? 'left-[16px] bg-[var(--aether-accent)]' : 'left-[2px] bg-[var(--aether-text-dim)]'}`} />
      </button>
    </div>
  );
}