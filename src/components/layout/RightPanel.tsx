import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/Button';

interface RightPanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function RightPanel({ title, icon, children, mobileOpen, onMobileClose }: RightPanelProps) {
  return (
    <aside
      className={`${mobileOpen ? 'fixed inset-y-0 right-0 z-50 flex' : 'hidden'} lg:relative lg:flex w-[290px] xl:w-[312px] shrink-0 flex-col border-l border-[var(--aether-border)] bg-[rgba(8,11,18,0.94)]`}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--aether-border)] px-3">
        <div className="flex min-w-0 items-center gap-2 text-[var(--aether-accent)]">
          {icon}
          <span className="truncate text-[11px] font-semibold tracking-wide">{title}</span>
        </div>
        <IconButton icon="close" label="Close controls" onClick={onMobileClose} className="lg:hidden" />
      </div>
      <div className="aether-scroll flex-1 space-y-3 overflow-y-auto p-3">{children}</div>
    </aside>
  );
}

interface ControlSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}

export function ControlSection({ title, description, children, defaultOpen = true, badge }: ControlSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="aether-panel overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold tracking-wide text-[var(--aether-text)]">{title}</span>
          {description ? <span className="mt-0.5 block truncate text-[9px] text-[var(--aether-text-dim)]">{description}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {badge}
          <Icon name="chevronDown" size={13} className={`text-[var(--aether-text-dim)] transition-transform ${open ? '' : '-rotate-90'}`} />
        </span>
      </button>
      {open ? <div className="space-y-3 border-t border-[var(--aether-border)] px-3 py-3">{children}</div> : null}
    </section>
  );
}

export function ControlNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[4px] border border-[rgba(72,201,232,0.14)] bg-[rgba(72,201,232,0.04)] px-2.5 py-2 text-[9.5px] leading-relaxed text-[var(--aether-text-dim)]">
      {children}
    </p>
  );
}