import { useId } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectProps<T extends string> {
  label?: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  description?: string;
}

export function Select<T extends string>({ label, value, options, onChange, description }: SelectProps<T>) {
  const id = useId();
  const selected = options.find((option) => option.value === value);
  return (
    <div className="space-y-1.5">
      {label ? <label htmlFor={id} className="block text-[11px] font-medium text-[var(--aether-text-muted)]">{label}</label> : null}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-8 w-full appearance-none rounded-[4px] border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-2.5 pr-8 text-[11px] text-[var(--aether-text)] outline-none transition-colors hover:border-[var(--aether-border-strong)] focus:border-[var(--aether-accent)]"
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Icon name="chevronDown" size={13} className="pointer-events-none absolute right-2.5 top-2.5 text-[var(--aether-text-dim)]" />
      </div>
      {description ?? selected?.description ? (
        <p className="text-[10px] leading-snug text-[var(--aether-text-dim)]">{description ?? selected?.description}</p>
      ) : null}
    </div>
  );
}