import { useState, useId } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Compass, RotateCcw } from 'lucide-react'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { sound } from '@/lib/audio'

interface QuickFactCardProps {
  poi: MarsPOI
  screenPoint: { x: number; y: number; isVisible: boolean } | null
  onSelectPoi: (poi: MarsPOI) => void
  onStartQuizWithPoi?: (poi: MarsPOI) => void
}

export function QuickFactCard({
  poi,
  screenPoint,
  onSelectPoi,
  onStartQuizWithPoi,
}: QuickFactCardProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const markerId = useId()

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

  // Calculate card position on screen
  // If screenPoint is available and visible, position card cleanly to the right or left of the pin
  const isVisibleOnGlobe = screenPoint?.isVisible ?? true
  const pinX = screenPoint ? screenPoint.x : window.innerWidth * 0.5
  const pinY = screenPoint ? screenPoint.y : window.innerHeight * 0.45

  // Decide if card goes to the right or left of the pin
  const isRightSide = pinX < window.innerWidth * 0.55
  const cardX = isRightSide ? Math.min(window.innerWidth - 380, pinX + 110) : Math.max(20, pinX - 380)
  const cardY = Math.max(90, Math.min(window.innerHeight - 380, pinY - 60))

  return (
    <>
      {/* Dynamic SVG Pointer Line connecting the 3D pin to the card */}
      {screenPoint && isVisibleOnGlobe && !isMinimized && (
        <svg
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id={`glow-${markerId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id={`pinGlow-${markerId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff7a3d" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Beacon pulse circle on pin */}
          <circle cx={pinX} cy={pinY} r="7" fill={`url(#pinGlow-${markerId})`} />
          <circle cx={pinX} cy={pinY} r="3" fill="#ffffff" />

          {/* Angled connecting leader line */}
          {(() => {
            const targetX = isRightSide ? cardX : cardX + 340
            const targetY = cardY + 45
            const midX = isRightSide ? pinX + 45 : pinX - 45

            return (
              <path
                d={`M ${pinX} ${pinY} L ${midX} ${targetY} L ${targetX} ${targetY}`}
                fill="none"
                stroke="#ff6b35"
                strokeWidth="1.75"
                strokeDasharray="4 2"
                opacity="0.85"
                filter={`url(#glow-${markerId})`}
              />
            )
          })()}
        </svg>
      )}

      {/* Floating Quick Fact Card */}
      <div
        className="absolute z-20 transition-all duration-300 ease-out select-none"
        style={{
          left: `${cardX}px`,
          top: `${cardY}px`,
          width: isMinimized ? 'auto' : '350px',
        }}
      >
        <div
          className={`
            relative overflow-hidden rounded-2xl border border-white/15
            bg-[#10141a]/90 backdrop-blur-xl shadow-2xl shadow-black/80
            p-5 text-white transition-all duration-300
            ${!isVisibleOnGlobe ? 'border-amber-500/40 opacity-90' : ''}
          `}
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-80" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#ff6b35]/20 text-[#ff8754] border border-[#ff6b35]/30">
                <Sparkles className="w-3 h-3 text-[#ff6b35]" />
                {poi.categoryLabel}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {currentIndex + 1} of {totalCount}
              </span>
            </div>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-xs"
              title={isMinimized ? 'Expand Fact' : 'Minimize'}
            >
              {isMinimized ? 'Expand' : 'Hide'}
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Location Name */}
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight mb-2">
                {poi.name}
              </h3>

              {/* Highlight Stat Pill */}
              <div className="mb-3.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#ff8754] flex-shrink-0" />
                <span className="text-xs font-medium text-amber-200/90 leading-tight">
                  {poi.highlightStat}
                </span>
              </div>

              {/* Plain English Quick Fact */}
              <p className="text-sm text-neutral-200 leading-relaxed mb-5 font-normal">
                {poi.quickFact}
              </p>

              {/* Hidden on back warning & button */}
              {!isVisibleOnGlobe && (
                <div className="mb-4 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                  <span>Facing the far side of Mars</span>
                  <button
                    onClick={() => onSelectPoi(poi)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-white font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rotate Front
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-neutral-300 hover:text-white transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {onStartQuizWithPoi && (
                  <button
                    onClick={() => {
                      sound.playClick()
                      onStartQuizWithPoi(poi)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#ff6b35] hover:bg-[#ff7e4d] text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#ff6b35]/30"
                  >
                    Play Singleplayer
                  </button>
                )}
              </div>
            </>
          )}

          {isMinimized && (
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm">{poi.name}</span>
              <button
                onClick={handleNext}
                className="p-1 hover:text-[#ff6b35] text-xs font-mono"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
