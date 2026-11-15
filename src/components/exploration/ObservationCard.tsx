import { Camera, MapPin, Calendar, Database } from 'lucide-react'
import type { Observation } from '@/types/observation'
import { Badge } from '@/components/ui/Badge'
import { formatMarsCoords } from '@/lib/marsCoordinates'

interface ObservationCardProps {
  observation: Observation
  selected?: boolean
  onClick?: () => void
}

export function ObservationCard({ observation, selected = false, onClick }: ObservationCardProps) {
  const sourceLabel = observation.isVerified ? 'Verified' : 'Placeholder'
  const sourceBadgeVariant = observation.isVerified ? 'success' : 'warning'

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
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {observation.name}
          </h3>
          <p className="text-xs text-[var(--color-accent-primary)] font-mono mt-0.5">
            {observation.region}
          </p>
        </div>
        <Badge variant={sourceBadgeVariant} size="sm">{sourceLabel}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)] truncate">{observation.rover}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)] truncate">{observation.instrument}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs font-mono text-[var(--color-text-muted)] truncate">
            {formatMarsCoords(observation.coordinates.lat, observation.coordinates.lon)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)] truncate">{observation.observationDate}</span>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
        {observation.description}
      </p>

      <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${observation.panorama ? 'bg-[var(--color-status-active)]' : 'bg-[var(--color-text-disabled)]'}`} />
        <span className="text-[10px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider">
          {observation.panorama ? 'Panorama Available' : 'No Panorama'}
        </span>
      </div>
    </button>
  )
}
