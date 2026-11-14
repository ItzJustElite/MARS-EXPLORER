import { useState } from 'react'
import { PanoramaViewer } from '@/components/exploration/PanoramaViewer'
import { ObservationCard } from '@/components/exploration/ObservationCard'
import { MarsMap } from '@/components/mapping/MarsMap'
import { Badge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import observationsData from '@/data/observations.json'
import type { Observation } from '@/types/observation'

const observations = observationsData as Observation[]

export function Explore() {
  const [selectedId, setSelectedId] = useState<string>(observations[0]?.id ?? '')

  const selected = observations.find((o) => o.id === selectedId) ?? observations[0]

  const mapMarkers = observations.map((o) => ({
    id: o.id,
    coordinates: o.coordinates,
    label: o.name,
    color: o.id === selectedId ? '#D97742' : '#4A5260',
  }))

  return (
    <div className="flex h-full overflow-hidden">
      {/* Observation list */}
      <aside className="w-72 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
            Observations
          </h2>
          <Badge variant="muted" size="sm">{observations.length} records</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {observations.map((obs) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              selected={obs.id === selectedId}
              onClick={() => setSelectedId(obs.id)}
            />
          ))}
        </div>
      </aside>

      {/* Main exploration area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Panorama viewport */}
        <div className="flex-1 relative p-4 min-h-0">
          <PanoramaViewer
            src={selected?.panorama ?? null}
            title={selected?.name}
            className="w-full h-full"
          />

          {/* Observation info overlay */}
          {selected && (
            <div className="absolute bottom-6 left-6 right-6 max-w-lg">
              <div className="bg-[rgba(9,11,14,0.85)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
                    {selected.name}
                  </p>
                  <Badge variant={selected.isVerified ? 'success' : 'warning'} size="sm">
                    {selected.isVerified ? 'Verified' : 'Placeholder'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                  {selected.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map strip */}
        <div className="h-48 border-t border-[var(--color-border)] relative flex-shrink-0">
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="warning" size="sm" dot>Earth Basemap — Placeholder</Badge>
          </div>
          <MarsMap
            className="w-full h-full"
            center={selected?.coordinates}
            markers={mapMarkers}
            onMarkerClick={(id) => setSelectedId(id)}
          />
        </div>
      </div>

      {/* Detail panel */}
      <aside className="w-64 flex-shrink-0 border-l border-[var(--color-border)] overflow-y-auto">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
            Observation Detail
          </h2>
        </div>

        {selected ? (
          <div className="p-4 space-y-5">
            {/* Instrument */}
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                Instrument
              </p>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">{selected.instrument}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{selected.rover}</p>
            </div>

            {/* Coordinates */}
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                Areocentric Coordinates
              </p>
              <p className="text-xs font-mono text-[var(--color-text-primary)]">
                {selected.coordinates.lat.toFixed(4)}°{selected.coordinates.lat >= 0 ? 'N' : 'S'}
              </p>
              <p className="text-xs font-mono text-[var(--color-text-muted)]">
                {selected.coordinates.lon.toFixed(4)}°E
              </p>
            </div>

            {/* Sol */}
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                Sol / Earth Date
              </p>
              <p className="text-xs font-mono text-[var(--color-text-primary)]">Sol {selected.sol}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{selected.observationDate}</p>
            </div>

            {/* Data sources */}
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                Data Sources
              </p>
              <div className="flex flex-wrap gap-1">
                {selected.dataSources.map((src) => (
                  <Badge key={src} variant={src === 'PLACEHOLDER' ? 'warning' : 'info'} size="sm">
                    {src}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {selected.description}
              </p>
            </div>

            {/* Source link */}
            {selected.sourceUrl && (
              <div>
                <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                  NASA Source
                </p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-accent-primary)] hover:underline break-all"
                >
                  {selected.sourceUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          <LoadingState type="empty" message="Select an observation" />
        )}
      </aside>
    </div>
  )
}
