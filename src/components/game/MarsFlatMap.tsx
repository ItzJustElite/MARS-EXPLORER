import { useRef } from 'react'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'

interface MarsFlatMapProps {
  playerGuess: { lat: number; lon: number } | null
  onSetGuess?: (coords: { lat: number; lon: number }) => void
  revealedTarget?: MarsPOI | null
  revealedHistory?: Array<{
    targetPoi: MarsPOI
    guessCoords: { lat: number; lon: number }
  }>
  interactive?: boolean
  className?: string
}

export function MarsFlatMap({
  playerGuess,
  onSetGuess,
  revealedTarget,
  revealedHistory,
  interactive = true,
  className = '',
}: MarsFlatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert lat (-90 to +90) and lon (-180 to +180) to percentage (0% to 100%)
  const toPercent = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100
    const y = ((90 - lat) / 180) * 100
    return { x, y }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSetGuess || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const normX = Math.max(0, Math.min(1, clickX / rect.width))
    const normY = Math.max(0, Math.min(1, clickY / rect.height))

    const lon = normX * 360 - 180
    const lat = 90 - normY * 180

    onSetGuess({ lat, lon })
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative w-full h-full overflow-hidden select-none bg-[#12161f] ${
        interactive ? 'cursor-crosshair' : ''
      } ${className}`}
    >
      {/* Mars Surface Texture Base */}
      <img
        src="/models/mars/textures/MarsLOD1_baseColor.png"
        alt="Mars Surface Global Map"
        className="absolute inset-0 w-full h-full object-fill opacity-85 pointer-events-none"
      />

      {/* Lat/Lon Grid Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
        {/* Equator & Meridians */}
        <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#ff8754" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#ff8754" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Parallels */}
        <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        {/* Meridians */}
        <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
      </svg>

      {/* Landmarks reference dots (subtle guides) */}
      <div className="absolute inset-0 pointer-events-none">
        {MARS_POIS.map((p) => {
          const pt = toPercent(p.lat, p.lon)
          return (
            <div
              key={p.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              title={p.name}
            />
          )
        })}
      </div>

      {/* Revealed History Lines (For End Game summary) */}
      {revealedHistory && revealedHistory.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {revealedHistory.map((item, idx) => {
            const g = toPercent(item.guessCoords.lat, item.guessCoords.lon)
            const t = toPercent(item.targetPoi.lat, item.targetPoi.lon)
            return (
              <g key={idx}>
                <line
                  x1={`${g.x}%`}
                  y1={`${g.y}%`}
                  x2={`${t.x}%`}
                  y2={`${t.y}%`}
                  stroke="#ffd700"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                {/* Guess pin */}
                <circle cx={`${g.x}%`} cy={`${g.y}%`} r="4.5" fill="#00f5ff" />
                {/* Target pin */}
                <circle cx={`${t.x}%`} cy={`${t.y}%`} r="5" fill="#ff6b35" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )
          })}
        </svg>
      )}

      {/* Single Round Revealed Line connecting player guess to target */}
      {revealedTarget && playerGuess && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {(() => {
            const g = toPercent(playerGuess.lat, playerGuess.lon)
            const t = toPercent(revealedTarget.lat, revealedTarget.lon)
            return (
              <>
                <line
                  x1={`${g.x}%`}
                  y1={`${g.y}%`}
                  x2={`${t.x}%`}
                  y2={`${t.y}%`}
                  stroke="#ffd700"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <circle cx={`${t.x}%`} cy={`${t.y}%`} r="6.5" fill="#ff6b35" stroke="#ffffff" strokeWidth="2" />
              </>
            )
          })()}
        </svg>
      )}

      {/* Player's Current Guess Pin */}
      {playerGuess && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
          style={{
            left: `${toPercent(playerGuess.lat, playerGuess.lon).x}%`,
            top: `${toPercent(playerGuess.lat, playerGuess.lon).y}%`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-[#00f5ff] opacity-40 animate-ping absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#00f5ff] border-2 border-white shadow-lg shadow-[#00f5ff]/70" />
          </div>
        </div>
      )}

      {/* Map Labels / Legend */}
      <div className="absolute bottom-2 left-2 pointer-events-none z-10 flex items-center gap-3 text-[10px] text-neutral-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono">
        <span>0°N Equator</span>
        <span>·</span>
        <span>0°E Prime Meridian</span>
      </div>
    </div>
  )
}
