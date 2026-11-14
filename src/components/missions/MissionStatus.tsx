import { CheckCircle2, Circle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import type { Mission } from '@/types/mission'

interface MissionStatusProps {
  status: Mission['status']
  showLabel?: boolean
  size?: 'sm' | 'md'
}

const statusConfig = {
  planning: {
    icon: Circle,
    label: 'Planning',
    color: 'var(--color-text-muted)',
  },
  ready: {
    icon: Clock,
    label: 'Ready to Launch',
    color: 'var(--color-status-info)',
  },
  active: {
    icon: CheckCircle2,
    label: 'Active',
    color: 'var(--color-status-active)',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'var(--color-text-muted)',
  },
  aborted: {
    icon: XCircle,
    label: 'Aborted',
    color: 'var(--color-status-error)',
  },
} as const

export function MissionStatus({ status, showLabel = true, size = 'md' }: MissionStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5">
      <Icon
        className={iconSize}
        style={{ color: config.color }}
      />
      {showLabel && (
        <span className={`${textSize} font-medium`} style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </div>
  )
}

interface MissionProgressProps {
  mission: Mission
}

/** Stepped mission progress indicator */
export function MissionProgress({ mission }: MissionProgressProps) {
  const steps: { key: Mission['status']; label: string }[] = [
    { key: 'planning', label: 'Plan' },
    { key: 'ready', label: 'Ready' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ]

  const stepOrder = ['planning', 'ready', 'active', 'completed']
  const currentIndex = stepOrder.indexOf(mission.status)

  if (mission.status === 'aborted') {
    return (
      <div className="flex items-center gap-2 text-[var(--color-status-error)]">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs font-mono uppercase tracking-wider">Mission Aborted</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full border ${
                  done
                    ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)]'
                    : active
                    ? 'bg-transparent border-[var(--color-accent-primary)]'
                    : 'bg-transparent border-[var(--color-border)]'
                }`}
              />
              <span className="text-[9px] font-mono text-[var(--color-text-disabled)] mt-0.5">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-6 mx-1 mb-3 ${
                  done ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border)]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
