import { useState } from 'react'
import { ChevronLeft, ChevronRight, Compass, Eye, Play } from 'lucide-react'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { getNasaPanorama, getNasaCardImage } from '@/data/nasaPanoramas'
import { PoiCategoryIcon } from '@/components/ui/PoiCategoryIcon'
import { sound } from '@/lib/audio'

interface QuickFactCardProps {
  poi: MarsPOI
  onSelectPoi: (poi: MarsPOI) => void
  onStartSingleplayer?: () => void
}

export function QuickFactCard({
  poi,
  onSelectPoi,
  onStartSingleplayer,
}: QuickFactCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const currentIndex = MARS_POIS.findIndex((p) => p.id === poi.id)
  const totalCount = MARS_POIS.length
  const source = getNasaPanorama(poi.id)
  const cardImage = getNasaCardImage(poi.id)
  const heroSrc = cardImage?.src ?? source?.thumb ?? poi.panoramaUrl
  const heroAlt = cardImage?.title ?? source?.title ?? poi.name
  const heroCredit = cardImage?.credit ?? source?.credit
  const heroNasaId = cardImage?.nasaId ?? source?.nasaId
  const heroSourceUrl = heroNasaId
    ? `https://images.nasa.gov/details-${heroNasaId}`
    : source
      ? 'https://trek.nasa.gov/mars/'
      : undefined
  const isOrbital = source?.kind === 'orbital'

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playNavigate()
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount
    onSelectPoi(MARS_POIS[prevIdx])
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playNavigate()
    const nextIdx = (currentIndex + 1) % totalCount
    onSelectPoi(MARS_POIS[nextIdx])
  }

  return (
    <aside
      className={`
        fixed z-20 transition-all duration-300 ease-out select-none
        right-4 sm:right-8 xl:right-14
        top-36 bottom-6
        ${isCollapsed ? 'w-auto' : 'w-[calc(100vw-2rem)] max-w-[400px] xl:max-w-[460px]'}
      `}
    >
      <div
        className="
          relative max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden
          rounded-3xl border border-white/20
          bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl shadow-black/90
          transition-all duration-300
        "
      >
        <div className="h-2 w-full bg-gradient-to-r from-[#ff6b35] via-amber-400 to-[#ff6b35]" />

        {!isCollapsed && (
          <div className="relative h-36 w-full overflow-hidden bg-black">
            <img
              src={heroSrc}
              alt={heroAlt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10141a]/95 via-[#10141a]/10 to-transparent" />
            <span
              className={`
                absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold
                tracking-[0.16em] uppercase backdrop-blur-md border
                ${
                  isOrbital
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                }
              `}
            >
              {isOrbital ? 'Orbital Recon' : 'NASA 360°'}
            </span>
            <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
              <p className="text-xs font-mono text-white tracking-wider">
                {cardImage ? 'Official NASA imagery' : '360° panorama'} · {poi.name}
              </p>
              {(heroCredit || heroNasaId) && (
                <p className="text-[9px] font-mono text-neutral-400 truncate flex items-center gap-1.5">
                  <span>{heroCredit}{heroNasaId ? ` · ${heroNasaId}` : ''}</span>
                  {heroSourceUrl && (
                    <a
                      href={heroSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto text-[#ff8754] hover:text-white underline"
                    >
                      Source
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {isCollapsed ? (
          <div className="p-5 flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2.5 text-sm font-semibold text-white hover:text-[#ff6b35] transition-colors"
            >
              <Eye className="w-4 h-4 text-[#ff6b35]" />
              <span>{poi.name} (Expand)</span>
            </button>
          </div>
        ) : (
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ff6b35]/20 text-[#ff8754] border border-[#ff6b35]/30">
                <PoiCategoryIcon category={poi.category} className="w-3.5 h-3.5 text-[#ff6b35]" />
                {poi.categoryLabel}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 font-mono tracking-wider">
                  {currentIndex + 1} / {totalCount}
                </span>
                <button
                  onClick={() => { sound.playToggle(); setIsCollapsed(true) }}
                  className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Collapse panel"
                >
                  Hide
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {poi.name}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
              <Compass className="w-5 h-5 text-[#ff8754] flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-200/90 leading-relaxed">
                {poi.highlightStat}
              </p>
            </div>

            <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-light">
              {poi.quickFact}
            </p>

            <div className="pt-5 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-3.5">
                <button
                  onClick={handlePrev}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-all font-semibold border border-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-all font-semibold border border-white/5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {onStartSingleplayer && (
                <button
                  onClick={() => {
                    sound.playClick()
                    onStartSingleplayer()
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Singleplayer</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
