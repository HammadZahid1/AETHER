import { useState, type ReactNode } from 'react';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-max max-w-[240px] rounded-[4px] border border-[var(--aether-border-strong)] bg-[var(--aether-panel-solid)] px-2.5 py-1.5 text-[10px] leading-snug text-[var(--aether-text)] shadow-xl ${POSITIONS[side]}`}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}