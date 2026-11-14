import { Loader2, AlertTriangle, Info } from 'lucide-react'

type LoadingStateType = 'loading' | 'error' | 'empty' | 'coming-soon'

interface LoadingStateProps {
  type?: LoadingStateType
  message?: string
  description?: string
  action?: React.ReactNode
}

export function LoadingState({
  type = 'loading',
  message,
  description,
  action,
}: LoadingStateProps) {
  const configs: Record<
    LoadingStateType,
    { icon: React.ReactNode; defaultMsg: string; defaultDesc?: string }
  > = {
    loading: {
      icon: <Loader2 className="w-8 h-8 text-[var(--color-accent-primary)] animate-spin" />,
      defaultMsg: 'Loading...',
    },
    error: {
      icon: <AlertTriangle className="w-8 h-8 text-[var(--color-status-error)]" />,
      defaultMsg: 'An error occurred',
      defaultDesc: 'Please try again or check your connection.',
    },
    empty: {
      icon: <Info className="w-8 h-8 text-[var(--color-text-muted)]" />,
      defaultMsg: 'No data available',
      defaultDesc: 'No records found for this query.',
    },
    'coming-soon': {
      icon: (
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border-accent)] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-primary)] pulse-accent" />
          </div>
        </div>
      ),
      defaultMsg: 'Feature in Development',
      defaultDesc: 'This capability will be available in a future mission update.',
    },
  }

  const config = configs[type]

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center min-h-[200px]">
      {config.icon}
      <div className="space-y-1">
        <p className="font-heading text-[var(--color-text-primary)] font-medium">
          {message ?? config.defaultMsg}
        </p>
        {(description ?? config.defaultDesc) && (
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            {description ?? config.defaultDesc}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
