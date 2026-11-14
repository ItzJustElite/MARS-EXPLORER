import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-accent-primary)] text-white',
    'hover:bg-[#E8834A] active:bg-[#C4682F]',
    'border border-[var(--color-accent-primary)]',
  ].join(' '),
  secondary: [
    'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]',
    'hover:bg-[#232D38] active:bg-[#1A2430]',
    'border border-[var(--color-border)]',
    'hover:border-[var(--color-accent-primary)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
    'border border-transparent',
  ].join(' '),
  danger: [
    'bg-[var(--color-accent-secondary)] text-white',
    'hover:bg-[#C9553E] active:bg-[#A63D27]',
    'border border-[var(--color-accent-secondary)]',
  ].join(' '),
  outline: [
    'bg-transparent text-[var(--color-accent-primary)]',
    'hover:bg-[var(--color-accent-dim)]',
    'border border-[var(--color-border-accent)]',
    'hover:border-[var(--color-accent-primary)]',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-[11px] gap-1',
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={twMerge(
          clsx(
            // Base
            'inline-flex items-center justify-center',
            'font-medium rounded-[var(--radius-md)]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
            'select-none cursor-pointer whitespace-nowrap',
            // Variant
            variantStyles[variant],
            // Size
            sizeStyles[size],
            // States
            isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
            fullWidth && 'w-full',
            className,
          ),
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
