import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-[var(--aether-border)] text-[var(--aether-text-muted)]',
  accent: 'border-[rgba(72,201,232,0.35)] text-[var(--aether-accent)] bg-[rgba(72,201,232,0.06)]',
  success: 'border-[rgba(109,221,182,0.3)] text-[var(--aether-success)] bg-[rgba(109,221,182,0.06)]',
  warning: 'border-[rgba(232,179,92,0.3)] text-[var(--aether-amber)] bg-[rgba(232,179,92,0.06)]',
  danger: 'border-[rgba(232,108,108,0.3)] text-[var(--aether-danger)] bg-[rgba(232,108,108,0.06)]',
};

export function Badge({ children, tone = 'neutral', dot = false, className = '' }: { children: ReactNode; tone?: BadgeTone; dot?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${TONES[tone]} ${className}`}>
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}