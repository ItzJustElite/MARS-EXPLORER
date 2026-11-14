import { useState } from 'react'
import { MarsMap } from '@/components/mapping/MarsMap'
import { MapControls } from '@/components/mapping/MapControls'
import { LayerControls } from '@/components/mapping/LayerControls'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { MARS_REGIONS } from '@/lib/marsCoordinates'
import layersData from '@/data/layers.json'
import observationsData from '@/data/observations.json'
import type { ScientificLayer } from '@/types/layers'
import type { Observation } from '@/types/observation'
import type { MarsCoordinates } from '@/types/observation'

const layers = layersData as ScientificLayer[]
const observations = observationsData as Observation[]

export function Atlas() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())
  const [center, setCenter] = useState<MarsCoordinates>({ lat: 18.4446, lon: 77.4509 })
  const [selectedRegion, setSelectedRegion] = useState<string>('jezero')

  const handleToggleLayer = (id: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRegionSelect = (regionId: string) => {
    const region = MARS_REGIONS.find((r) => r.id === regionId)
    if (region) {
      setCenter({ lat: region.lat, lon: region.lon })
      setSelectedRegion(regionId)
    }
  }

  const mapMarkers = observations.map((o) => ({
    id: o.id,
    coordinates: o.coordinates,
    label: o.name,
    color: '#D97742',
  }))

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: region list */}
      <aside className="w-56 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-heading text-xs font-semibold text-[var(--color-text-primary)]">
            Martian Regions
          </h2>
          <p className="text-[9px] text-[var(--color-text-disabled)] mt-0.5">IAU / USGS Nomenclature</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MARS_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region.id)}
              className={`
                w-full text-left p-2.5 rounded-[var(--radius-md)]
                transition-colors duration-150
                ${selectedRegion === region.id
                  ? 'bg-[var(--color-accent-dim)] border border-[var(--color-border-accent)]'
                  : 'hover:bg-[var(--color-bg-elevated)] border border-transparent'
                }
              `}
            >
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                {region.name}
              </p>
              <p className="text-[9px] font-mono text-[var(--color-text-muted)] mt-0.5">
                {region.lat}°{region.lat >= 0 ? 'N' : 'S'} · {region.lon}°E
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Placeholder warning */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge variant="warning" size="sm" dot>
            Placeholder Basemap — Earth tiles shown. Mars tiles require NASA Trek integration.
          </Badge>
        </div>

        {/* Map */}
        <MarsMap
          className="w-full h-full"
          center={center}
          zoom={4}
          markers={mapMarkers}
        />

        {/* Map controls overlay */}
        <div className="absolute top-12 right-3 z-10">
          <MapControls />
        </div>

        {/* Selected region info overlay */}
        {selectedRegion && (() => {
          const r = MARS_REGIONS.find((reg) => reg.id === selectedRegion)
          if (!r) return null
          return (
            <div className="absolute bottom-3 left-3 z-10 max-w-xs">
              <Panel variant="default" padding="sm">
                <p className="text-xs font-heading font-semibold text-[var(--color-text-primary)] mb-0.5">
                  {r.name}
                </p>
                <p className="text-[9px] font-mono text-[var(--color-accent-primary)] mb-1">
                  {r.lat}°{r.lat >= 0 ? 'N' : 'S'} · {r.lon}°E
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{r.description}</p>
              </Panel>
            </div>
          )
        })()}
      </div>

      {/* Right panel: layer controls */}
      <aside className="w-56 flex-shrink-0 border-l border-[var(--color-border)] overflow-y-auto p-3">
        <LayerControls
          layers={layers}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />

        {/* Attribution */}
        <div className="mt-4 p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
          <p className="text-[9px] text-[var(--color-text-disabled)] leading-relaxed">
            Scientific layers from NASA MRO, HiRISE, CRISM, MOLA, and Mars Express HRSC.
            Integration pending.
          </p>
        </div>
      </aside>
    </div>
  )
}
