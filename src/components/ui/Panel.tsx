import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type PanelVariant = 'default' | 'elevated' | 'accent' | 'flat'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  header?: React.ReactNode
  footer?: React.ReactNode
}

const variantStyles: Record<PanelVariant, string> = {
  default: 'bg-[var(--color-bg-panel)] border border-[var(--color-border)]',
  elevated: 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
  accent: 'bg-[var(--color-bg-panel)] border border-[var(--color-border-accent)]',
  flat: 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      header,
      footer,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-[var(--radius-lg)]',
            variantStyles[variant],
            !header && !footer && paddingStyles[padding],
            className,
          ),
        )}
        {...props}
      >
        {header && (
          <div className={clsx('border-b border-[var(--color-border)]', paddingStyles[padding])}>
            {header}
          </div>
        )}
        {header || footer ? (
          <div className={paddingStyles[padding]}>{children}</div>
        ) : (
          children
        )}
        {footer && (
          <div className={clsx('border-t border-[var(--color-border)]', paddingStyles[padding])}>
            {footer}
          </div>
        )}
      </div>
    )
  },
)

Panel.displayName = 'Panel'
