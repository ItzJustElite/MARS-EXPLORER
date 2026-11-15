import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Compass, Eye, Play } from 'lucide-react'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount
    onSelectPoi(MARS_POIS[prevIdx])
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    const nextIdx = (currentIndex + 1) % totalCount
    onSelectPoi(MARS_POIS[nextIdx])
  }

  return (
    <aside
      className={`
        fixed z-20 transition-all duration-300 ease-out select-none
        right-6 md:right-10 top-1/2 -translate-y-1/2
        ${isCollapsed ? 'w-auto' : 'w-[360px] sm:w-[410px]'}
      `}
    >
      <div
        className="
          relative overflow-hidden rounded-3xl border border-white/15
          bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl shadow-black/80
          transition-all duration-300
        "
      >
        {/* Subtle orange accent gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b35] via-amber-400 to-[#ff6b35]" />

        {isCollapsed ? (
          <div className="p-4 flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2 text-xs font-semibold text-white hover:text-[#ff6b35] transition-colors"
            >
              <Eye className="w-4 h-4 text-[#ff6b35]" />
              <span>{poi.name} (Expand)</span>
            </button>
          </div>
        ) : (
          <div className="p-7 md:p-8 space-y-6">
            {/* Top row: Category badge & count */}
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ff6b35]/20 text-[#ff8754] border border-[#ff6b35]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
                {poi.categoryLabel}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono tracking-wider">
                  {currentIndex + 1} / {totalCount}
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-neutral-500 hover:text-neutral-300 text-xs px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                  title="Collapse panel"
                >
                  Hide
                </button>
              </div>
            </div>

            {/* Landmark Title */}
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight leading-tight">
                {poi.name}
              </h2>
            </div>

            {/* Highlight Stat Pill */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Compass className="w-4 h-4 text-[#ff8754] flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-200/90 leading-snug">
                {poi.highlightStat}
              </p>
            </div>

            {/* Plain English Quick Fact */}
            <p className="text-sm text-neutral-200 leading-relaxed font-normal">
              {poi.quickFact}
            </p>

            {/* Bottom Actions & Navigation */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              {/* Previous / Next Switcher */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-all font-medium border border-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-all font-medium border border-white/5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Play Singleplayer CTA */}
              {onStartSingleplayer && (
                <button
                  onClick={() => {
                    sound.playClick()
                    onStartSingleplayer()
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/25"
                >
                  <Play className="w-4 h-4 fill-current" />
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
