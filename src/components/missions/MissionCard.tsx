import { Route, Clock, Users, AlertTriangle } from 'lucide-react'
import type { Mission } from '@/types/mission'
import { Badge } from '@/components/ui/Badge'

interface MissionCardProps {
  mission: Mission
  selected?: boolean
  onClick?: () => void
}

const statusConfig: Record<
  Mission['status'],
  { label: string; variant: 'success' | 'info' | 'warning' | 'error' | 'muted' }
> = {
  planning: { label: 'Planning', variant: 'muted' },
  ready: { label: 'Ready', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  completed: { label: 'Completed', variant: 'muted' },
  aborted: { label: 'Aborted', variant: 'error' },
}

const priorityConfig: Record<
  Mission['priority'],
  { label: string; variant: 'muted' | 'info' | 'warning' | 'error' }
> = {
  low: { label: 'Low', variant: 'muted' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'error' },
}

export function MissionCard({ mission, selected = false, onClick }: MissionCardProps) {
  const status = statusConfig[mission.status]
  const priority = priorityConfig[mission.priority]

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-[var(--radius-lg)] border p-4
        transition-all duration-150 cursor-pointer
        ${selected
          ? 'bg-[var(--color-accent-dim)] border-[var(--color-border-accent)]'
          : 'bg-[var(--color-bg-panel)] border-[var(--color-border)] hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-elevated)]'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Route className="w-4 h-4 text-[var(--color-accent-primary)] flex-shrink-0" />
          <h3 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {mission.title}
          </h3>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Badge variant={status.variant} size="sm">{status.label}</Badge>
          <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
        </div>
      </div>

      {/* Objective */}
      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed mb-3">
        {mission.objective}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)]">{mission.estimatedDurationHrs}h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Route className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)]">{mission.estimatedDistanceKm} km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)]">{mission.crewSize} crew</span>
        </div>
      </div>

      {/* Simulated warning */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-[var(--color-status-warning)] flex-shrink-0" />
        <span className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider">
          Simulated Mission Exercise
        </span>
      </div>
    </button>
  )
}
