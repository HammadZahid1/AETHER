import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--aether-accent)] text-[#04121a] hover:brightness-110 border border-transparent font-semibold',
  ghost: 'bg-transparent text-[var(--aether-text-muted)] hover:text-[var(--aether-text)] hover:bg-white/5 border border-transparent',
  outline: 'bg-white/[0.02] text-[var(--aether-text)] border border-[var(--aether-border)] hover:border-[var(--aether-border-strong)] hover:bg-white/5',
  danger: 'bg-transparent text-[var(--aether-danger)] border border-[rgba(232,108,108,0.3)] hover:bg-[rgba(232,108,108,0.08)]',
  subtle: 'bg-white/[0.05] text-[var(--aether-text-muted)] border border-transparent hover:bg-white/[0.09]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[11px] gap-1.5',
  md: 'h-8 px-3 text-xs gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
};

export function Button({
  variant = 'outline', size = 'md', icon, iconRight, loading, children, className = '', disabled, ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-[4px] transition-colors duration-150 disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Icon name="sparkles" size={14} className="aether-spin" /> : icon ? <Icon name={icon} size={14} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={14} /> : null}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  size?: number;
  active?: boolean;
  tone?: 'default' | 'accent' | 'danger';
}

const TONES = {
  default: 'text-[var(--aether-text-muted)] hover:text-[var(--aether-text)] hover:bg-white/5',
  accent: 'text-[var(--aether-accent)] hover:bg-[rgba(72,201,232,0.1)]',
  danger: 'text-[var(--aether-danger)] hover:bg-[rgba(232,108,108,0.1)]',
};

export function IconButton({ icon, label, size = 16, active, tone = 'default', className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors duration-150 ${active ? 'border-[var(--aether-accent)]/40 bg-[rgba(72,201,232,0.1)] text-[var(--aether-accent)]' : 'border-transparent'} ${TONES[tone]} ${className}`}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}