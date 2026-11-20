import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface PanelProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Panel({
  title, subtitle, eyebrow, actions, children, className = '', bodyClassName = '',
  padded = true, collapsible = false, defaultCollapsed = false,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const hasHeader = Boolean(title || eyebrow || actions);
  return (
    <section className={`aether-panel overflow-hidden ${className}`}>
      {hasHeader ? (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--aether-border)] px-3.5 py-2.5">
          <div className="min-w-0">
            {eyebrow ? <div className="aether-label mb-0.5">{eyebrow}</div> : null}
            {title ? <h2 className="truncate text-[12px] font-semibold tracking-wide text-[var(--aether-text)]">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 truncate text-[11px] text-[var(--aether-text-dim)]">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            {collapsible ? (
              <button
                type="button"
                aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
                onClick={() => setCollapsed((value) => !value)}
                className="text-[var(--aether-text-dim)] transition-colors hover:text-[var(--aether-text)]"
              >
                <Icon name="chevronDown" size={14} className={collapsed ? '-rotate-90 transition-transform' : 'transition-transform'} />
              </button>
            ) : null}
          </div>
        </header>
      ) : null}
      {!collapsed ? <div className={`${padded ? 'p-3.5' : ''} ${bodyClassName}`}>{children}</div> : null}
    </section>
  );
}