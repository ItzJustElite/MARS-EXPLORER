import { useState } from 'react'
import { Search, Filter, ExternalLink, Database } from 'lucide-react'
import { ObservationCard } from '@/components/exploration/ObservationCard'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { LoadingState } from '@/components/ui/LoadingState'
import observationsData from '@/data/observations.json'
import type { Observation } from '@/types/observation'

const observations = observationsData as Observation[]

const DATA_SOURCES = [
  { id: 'NASA_PDS', label: 'NASA PDS', url: 'https://pds.nasa.gov/' },
  { id: 'NASA_HIRISE', label: 'HiRISE', url: 'https://hirise.lpl.arizona.edu/' },
  { id: 'NASA_CRISM', label: 'CRISM', url: 'https://crism.jhuapl.edu/' },
  { id: 'NASA_MOLA', label: 'MOLA', url: 'https://pds-geosciences.wustl.edu/missions/mgs/mola.html' },
  { id: 'NASA_MRO', label: 'MRO', url: 'https://mars.nasa.gov/mro/' },
  { id: 'NASA_PERSEVERANCE', label: 'Perseverance', url: 'https://mars.nasa.gov/mars2020/' },
  { id: 'NASA_CURIOSITY', label: 'Curiosity', url: 'https://mars.nasa.gov/msl/' },
]

export function Archive() {
  const [search, setSearch] = useState('')
  const [roverFilter, setRoverFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rovers = ['all', ...Array.from(new Set(observations.map((o) => o.rover)))]

  const filtered = observations.filter((o) => {
    const matchesSearch =
      search === '' ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.region.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase())
    const matchesRover = roverFilter === 'all' || o.rover === roverFilter
    return matchesSearch && matchesRover
  })

  const selected = observations.find((o) => o.id === selectedId)

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-56 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-heading text-xs font-semibold text-[var(--color-text-primary)]">
            Filters
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
              Rover
            </p>
            <div className="space-y-1">
              {rovers.map((rover) => (
                <button
                  key={rover}
                  onClick={() => setRoverFilter(rover)}
                  className={`
                    w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)]
                    text-xs transition-colors duration-150
                    ${roverFilter === rover
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]'
                    }
                  `}
                >
                  {rover === 'all' ? 'All Rovers' : rover}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
              NASA Data Sources
            </p>
            <div className="space-y-1.5">
              {DATA_SOURCES.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between gap-2 px-2 py-1.5
                    rounded-[var(--radius-sm)] text-xs
                    text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)]
                    hover:bg-[var(--color-bg-elevated)]
                    transition-colors duration-150
                  "
                >
                  <span>{src.label}</span>
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search observations, regions, instruments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full h-8 pl-9 pr-3 text-xs
                bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                rounded-[var(--radius-md)] text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-disabled)]
                focus:outline-none focus:border-[var(--color-accent-primary)]
                transition-colors duration-150
              "
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <Badge variant="muted" size="sm">{filtered.length} results</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <LoadingState
              type="empty"
              message="No observations found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((obs) => (
                <ObservationCard
                  key={obs.id}
                  observation={obs}
                  selected={obs.id === selectedId}
                  onClick={() => setSelectedId(obs.id === selectedId ? null : obs.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Panel variant="flat" padding="md">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-4 h-4 text-[var(--color-text-muted)]" />
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  NASA PDS Integration Pending
                </p>
                <Badge variant="warning" size="sm">Coming Soon</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Full NASA Planetary Data System integration will provide access to thousands of real rover
                observations including raw images, processed panoramas, spectrometer data, and atmospheric
                measurements. Requires NASA PDS API key configuration.
              </p>
            </Panel>
          </div>
        </div>
      </div>

      {selected && (
        <aside className="w-64 flex-shrink-0 border-l border-[var(--color-border)] overflow-y-auto">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
              Record Detail
            </h2>
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="font-heading text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">
                {selected.name}
              </p>
              <p className="text-xs text-[var(--color-accent-primary)]">{selected.region}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Rover', value: selected.rover },
                { label: 'Instrument', value: selected.instrument },
                { label: 'Sol', value: `Sol ${selected.sol}` },
                { label: 'Date', value: selected.observationDate },
                {
                  label: 'Coordinates',
                  value: `${selected.coordinates.lat.toFixed(4)}°${selected.coordinates.lat >= 0 ? 'N' : 'S'}, ${selected.coordinates.lon.toFixed(4)}°E`,
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-primary)] font-mono">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-1">
                Data Sources
              </p>
              <div className="flex flex-wrap gap-1">
                {selected.dataSources.map((src) => (
                  <Badge
                    key={src}
                    variant={src === 'PLACEHOLDER' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {src}
                  </Badge>
                ))}
              </div>
            </div>
            {selected.sourceUrl && (
              <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-2 text-xs text-[var(--color-accent-primary)]
                  hover:underline
                "
              >
                <ExternalLink className="w-3 h-3" />
                NASA Source
              </a>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
