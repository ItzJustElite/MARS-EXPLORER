import { useState } from 'react'
import { MarsMap } from '@/components/mapping/MarsMap'
import { MissionCard } from '@/components/missions/MissionCard'
import { MissionStatus, MissionProgress } from '@/components/missions/MissionStatus'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import {
  AlertTriangle,
  MapPin,
  Clock,
  Route,
  Users,
  Battery,
  Droplets,
  Wind,
} from 'lucide-react'
import missionsData from '@/data/missions.json'
import type { Mission } from '@/types/mission'

const missions = missionsData as Mission[]

export function MissionPlanner() {
  const [selectedId, setSelectedId] = useState<string>(missions[0]?.id ?? '')
  const selected = missions.find((m) => m.id === selectedId) ?? missions[0]

  const mapMarkers = selected
    ? [
        {
          id: 'start',
          coordinates: selected.start,
          label: selected.start.label,
          color: '#4ADE80',
        },
        {
          id: 'dest',
          coordinates: selected.destination,
          label: selected.destination.label,
          color: '#D97742',
        },
      ]
    : []

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-72 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
            Missions
          </h2>
          <Badge variant="muted" size="sm">{missions.length} planned</Badge>
        </div>

        <div className="mx-3 mt-3 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[rgba(251,191,36,0.2)]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-[var(--color-status-warning)] flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed">
              All missions are simulated training exercises. No real NASA mission data.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 mt-2">
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              selected={m.id === selectedId}
              onClick={() => setSelectedId(m.id)}
            />
          ))}

          <button
            disabled
            className="
              w-full p-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)]
              text-[var(--color-text-disabled)] text-xs
              flex flex-col items-center gap-2 opacity-50 cursor-not-allowed
            "
          >
            <span className="text-lg">+</span>
            <span>New Mission</span>
            <Badge variant="muted" size="sm">Coming Soon</Badge>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 relative min-h-0">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge variant="warning" size="sm" dot>Placeholder Map — Simulated route</Badge>
          </div>
          <MarsMap
            className="w-full h-full"
            center={selected?.start}
            markers={mapMarkers}
            zoom={6}
          />
          <div className="absolute bottom-3 right-3 z-10">
            <div className="flex flex-col gap-1.5 bg-[rgba(9,11,14,0.85)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                <span className="text-[10px] text-[var(--color-text-muted)]">Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D97742]" />
                <span className="text-[10px] text-[var(--color-text-muted)]">Destination</span>
              </div>
            </div>
          </div>
        </div>

        {selected && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 flex items-center gap-6 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span className="text-xs text-[var(--color-text-muted)]">{selected.start.label}</span>
            </div>
            <div className="text-[var(--color-text-disabled)]">→</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span className="text-xs text-[var(--color-text-muted)]">{selected.destination.label}</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Route className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-xs font-mono text-[var(--color-text-muted)]">
                  {selected.estimatedDistanceKm} km
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-xs font-mono text-[var(--color-text-muted)]">
                  {selected.estimatedDurationHrs}h
                </span>
              </div>
              <MissionStatus status={selected.status} size="sm" />
            </div>
          </div>
        )}
      </div>

      <aside className="w-72 flex-shrink-0 border-l border-[var(--color-border)] overflow-y-auto">
        {selected ? (
          <>
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                {selected.title}
              </h2>
              <MissionProgress mission={selected} />
            </div>

            <div className="p-4 space-y-5">
              <div>
                <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-1.5">
                  Mission Objective
                </p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {selected.objective}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Panel variant="flat" padding="sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
                    <span className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider">
                      Crew
                    </span>
                  </div>
                  <p className="text-sm font-heading font-bold text-[var(--color-text-primary)]">
                    {selected.crewSize}
                  </p>
                  <p className="text-[9px] text-[var(--color-text-disabled)]">personnel</p>
                </Panel>
                <Panel variant="flat" padding="sm">
                  <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-1">
                    Priority
                  </p>
                  <Badge
                    variant={
                      selected.priority === 'critical' ? 'error'
                      : selected.priority === 'high' ? 'warning'
                      : selected.priority === 'medium' ? 'info'
                      : 'muted'
                    }
                    size="sm"
                  >
                    {selected.priority}
                  </Badge>
                </Panel>
              </div>

              <div>
                <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                  Resources
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-3 h-3 text-[var(--color-status-info)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">O₂</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-primary)]">
                      {selected.resources.oxygenKg} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-[var(--color-status-info)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">Water</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-primary)]">
                      {selected.resources.waterL} L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className="w-3 h-3 text-[var(--color-status-active)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">Power</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-primary)]">
                      {selected.resources.powerKwh} kWh
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-2">
                  Equipment Manifest
                </p>
                <ul className="space-y-1">
                  {selected.resources.toolsManifest.map((tool) => (
                    <li key={tool} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)] flex-shrink-0" />
                      <span className="text-xs text-[var(--color-text-muted)]">{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-1.5">
                    Notes
                  </p>
                  <p className="text-xs text-[var(--color-status-warning)] leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              )}

              <Button variant="secondary" size="sm" disabled className="w-full">
                Edit Mission (Coming Soon)
              </Button>
            </div>
          </>
        ) : (
          <LoadingState type="empty" message="Select a mission" />
        )}
      </aside>
    </div>
  )
}
