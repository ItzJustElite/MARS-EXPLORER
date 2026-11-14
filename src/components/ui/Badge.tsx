import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type BadgeVariant =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted'
  | 'outline'

type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  accent: 'bg-[var(--color-accent-dim)] text-[var(--color-accent-primary)] border border-[var(--color-border-accent)]',
  success: 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border border-[rgba(74,222,128,0.2)]',
  warning: 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24] border border-[rgba(251,191,36,0.2)]',
  error: 'bg-[rgba(248,113,113,0.1)] text-[#F87171] border border-[rgba(248,113,113,0.2)]',
  info: 'bg-[rgba(96,165,250,0.1)] text-[#60A5FA] border border-[rgba(96,165,250,0.2)]',
  muted: 'bg-transparent text-[var(--color-text-disabled)] border border-[var(--color-border-subtle)]',
  outline: 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-text-muted)]',
  accent: 'bg-[var(--color-accent-primary)]',
  success: 'bg-[#4ADE80]',
  warning: 'bg-[#FBBF24]',
  error: 'bg-[#F87171]',
  info: 'bg-[#60A5FA]',
  muted: 'bg-[var(--color-text-disabled)]',
  outline: 'bg-[var(--color-text-muted)]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-[11px] px-2 py-0.5 gap-1.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium tracking-wide uppercase rounded-full',
          'font-[var(--font-mono)]',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ),
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </span>
  )
}
