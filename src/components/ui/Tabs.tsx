export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function Tabs<T extends string>({ items, value, onChange, ariaLabel = 'Tabs' }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex gap-0.5 rounded-[4px] border border-[var(--aether-border)] bg-[var(--aether-bg)] p-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-[3px] px-2 py-1.5 text-[10px] font-medium transition-colors ${
            value === item.id
              ? 'bg-[rgba(72,201,232,0.12)] text-[var(--aether-accent)]'
              : 'text-[var(--aether-text-dim)] hover:text-[var(--aether-text)]'
          }`}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}