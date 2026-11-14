import { Link } from 'react-router-dom'
import {
  ScanEye,
  Globe,
  Route,
  Archive,
  Telescope,
  FlaskConical,
  Satellite,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { ROUTES } from '@/lib/routing'
import { NASA_ATTRIBUTION } from '@/lib/nasaData'
import { MARS_REGIONS } from '@/lib/marsCoordinates'

const QUICK_ACTIONS = [
  {
    to: ROUTES.EXPLORE,
    icon: ScanEye,
    label: 'Surface Reconnaissance',
    description: 'Explore rover observations and panoramic imagery',
    badge: 'Interactive',
  },
  {
    to: ROUTES.ATLAS,
    icon: Globe,
    label: 'Martian Atlas',
    description: 'Navigate the regional Martian map with scientific layers',
    badge: 'Map',
  },
  {
    to: ROUTES.MISSIONS,
    icon: Route,
    label: 'Mission Planner',
    description: 'Plan and simulate astronaut marswalk exercises',
    badge: 'Simulation',
  },
  {
    to: ROUTES.ARCHIVE,
    icon: Archive,
    label: 'Scientific Archive',
    description: 'Browse NASA observation records and data sources',
    badge: 'Data',
  },
]

const CAPABILITY_CARDS = [
  {
    icon: Telescope,
    title: 'NASA Rover Imagery',
    description:
      'Integrates observations from Perseverance (Mastcam-Z) and Curiosity (Mastcam) rovers via the NASA Planetary Data System. Panoramic views use equirectangular projection compatible with the Pannellum viewer.',
    status: 'Integration Pending',
    statusVariant: 'warning' as const,
  },
  {
    icon: Satellite,
    title: 'Orbital Data Layers',
    description:
      'Scientific overlays from HiRISE (25 cm/px imagery), CRISM (mineralogy), MOLA (topography), and MCS (thermal). All sourced from NASA MRO and Mars Global Surveyor instruments.',
    status: 'Integration Pending',
    statusVariant: 'warning' as const,
  },
  {
    icon: FlaskConical,
    title: 'Geological Analysis',
    description:
      'Displays layered geological data for identified Martian regions including crater basins, volcanic provinces, and ancient lake/delta systems relevant to habitability research.',
    status: 'Foundation Ready',
    statusVariant: 'info' as const,
  },
]

export function Dashboard() {
  return (
    <div className="min-h-full">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        {/* Background grid pattern */}
        <div className="absolute inset-0 mars-grid opacity-60" />

        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5"
          style={{ background: 'var(--color-accent-primary)' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-8">
            <Badge variant="accent" size="sm" dot>NASA Space Apps Challenge 2026</Badge>
            <span className="text-[var(--color-border)]">·</span>
            <Badge variant="muted" size="sm">Interplanetary Survival Guide: Martian Map</Badge>
          </div>

          {/* Title */}
          <h1
            className="font-heading font-bold mb-4 text-[var(--color-text-primary)]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
          >
            MARS
            <span className="text-[var(--color-accent-primary)]"> EXPLORER</span>
          </h1>

          <p className="text-xl text-[var(--color-text-secondary)] font-light mb-4 max-w-2xl">
            See Mars. Understand Mars. Explore Mars.
          </p>

          <p className="text-sm text-[var(--color-text-muted)] max-w-2xl leading-relaxed mb-10">
            An interactive planetary exploration and mission-planning platform combining NASA
            scientific observations with geographical discovery and simulated astronaut operations.
            Built for the 2026 NASA Space Apps Challenge.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.EXPLORE}
              className="
                inline-flex items-center gap-2 h-11 px-6 text-base font-medium
                rounded-[var(--radius-md)] transition-all duration-150 select-none
                bg-[var(--color-accent-primary)] text-white border border-[var(--color-accent-primary)]
                hover:bg-[#E8834A] active:bg-[#C4682F]
              "
            >
              <ScanEye className="w-4 h-4" />
              Start Exploration
            </Link>
            <Link
              to={ROUTES.ATLAS}
              className="
                inline-flex items-center gap-2 h-11 px-6 text-base font-medium
                rounded-[var(--radius-md)] transition-all duration-150 select-none
                bg-transparent text-[var(--color-accent-primary)]
                border border-[var(--color-border-accent)]
                hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent-primary)]
              "
            >
              <Globe className="w-4 h-4" />
              Open Martian Atlas
            </Link>
            <Link
              to={ROUTES.MISSIONS}
              className="
                inline-flex items-center gap-2 h-11 px-6 text-base font-medium
                rounded-[var(--radius-md)] transition-all duration-150 select-none
                bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]
                border border-[var(--color-border)]
                hover:border-[var(--color-accent-primary)] hover:bg-[#232D38]
              "
            >
              <Route className="w-4 h-4" />
              Mission Planner
            </Link>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Disclaimer */}
        <Panel variant="flat" padding="md">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-[var(--color-status-info)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-status-info)] mb-1 uppercase tracking-wide">
                Scientific Integrity Notice
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                This application clearly distinguishes between verified NASA observations, orbital measurements, rover data,
                derived calculations, simulated mission parameters, and illustrative placeholders. No scientific data is
                fabricated. Data requiring API integration is marked as pending. {NASA_ATTRIBUTION}.
              </p>
            </div>
          </div>
        </Panel>

        {/* Quick navigation */}
        <section>
          <h2 className="font-heading text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Exploration Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="
                    group flex gap-4 p-4 rounded-[var(--radius-lg)]
                    bg-[var(--color-bg-panel)] border border-[var(--color-border)]
                    hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-elevated)]
                    transition-all duration-150
                  "
                >
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-dim)] border border-[var(--color-border-accent)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-accent-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {action.label}
                      </p>
                      <Badge variant="muted" size="sm">{action.badge}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-text-disabled)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-150 flex-shrink-0 mt-0.5" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Key Region: Jezero Crater */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold text-[var(--color-text-primary)]">
              Featured Region
            </h2>
            <Badge variant="accent" size="sm" dot>Primary Study Area</Badge>
          </div>
          <Panel variant="default" padding="lg">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-1">
                  Jezero Crater
                </h3>
                <p className="text-sm text-[var(--color-accent-primary)] font-mono">
                  18.4446°N, 77.4509°E · Isidis Planitia boundary
                </p>
              </div>
              <Badge variant="success" size="sm">Perseverance Active</Badge>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
              Jezero Crater is a 49 km diameter impact crater hosting an ancient river delta — one of the most
              scientifically significant landing sites ever chosen. The NASA Perseverance rover has been operating
              here since February 18, 2021, conducting detailed geological surveys and collecting samples for
              potential future return to Earth. The ancient delta stratigraphy preserves a record of Mars's past
              watery environment and potential habitable conditions.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Diameter', value: '49 km', note: 'Impact crater' },
                { label: 'Latitude', value: '18.44°N', note: 'Areocentric' },
                { label: 'Longitude', value: '77.45°E', note: 'East convention' },
                { label: 'Rover', value: 'Perseverance', note: 'NASA Mars 2020' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--color-border-subtle)]">
                  <p className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-sm font-semibold font-heading text-[var(--color-text-primary)]">
                    {stat.value}
                  </p>
                  <p className="text-[9px] text-[var(--color-text-disabled)]">{stat.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        {/* Mars regions reference */}
        <section>
          <h2 className="font-heading text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Key Martian Regions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MARS_REGIONS.map((region) => (
              <div
                key={region.id}
                className="
                  flex gap-3 p-3 rounded-[var(--radius-md)]
                  bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]
                "
              >
                <div className="w-1 rounded-full bg-[var(--color-accent-primary)] flex-shrink-0 opacity-60" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-0.5">
                    {region.name}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] mb-1">
                    {region.lat}°{region.lat >= 0 ? 'N' : 'S'} · {region.lon}°E
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-snug">
                    {region.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform capabilities */}
        <section>
          <h2 className="font-heading text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAPABILITY_CARDS.map((cap) => {
              const Icon = cap.icon
              return (
                <Panel key={cap.title} variant="default" padding="md">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent-dim)] border border-[var(--color-border-accent)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{cap.title}</p>
                      <Badge variant={cap.statusVariant} size="sm" className="mt-1">{cap.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {cap.description}
                  </p>
                </Panel>
              )
            })}
          </div>
        </section>

        {/* Footer attribution */}
        <footer className="border-t border-[var(--color-border-subtle)] pt-6 pb-4">
          <p className="text-xs text-[var(--color-text-disabled)] text-center">
            {NASA_ATTRIBUTION} · NASA Space Apps Challenge 2026 · MARS EXPLORER
          </p>
        </footer>
      </div>
    </div>
  )
}
