import { useEffect, type ReactNode } from 'react';
import { IconButton } from '@/components/ui/Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function Dialog({ open, onClose, title, subtitle, children, width = 'max-w-2xl' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/65 p-4 pt-[8vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`aether-panel w-full ${width} shadow-2xl`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-[var(--aether-border)] px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-[11px] text-[var(--aether-text-dim)]">{subtitle}</p> : null}
          </div>
          <IconButton icon="close" label="Close dialog" onClick={onClose} />
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}