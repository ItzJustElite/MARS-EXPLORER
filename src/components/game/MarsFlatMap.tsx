import { useState, useRef, useEffect } from 'react'
import { Layers, Search, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react'
import { MARS_POIS } from '@/data/marsPois'
import { SURFACE_REGIONS } from '@/data/mapRegions'
import { poiCategoryColor } from '@/components/ui/PoiCategoryIcon'
import { publicAssetUrl } from '@/lib/publicAssets'

function MapImagery({ mapLayer }: { mapLayer: 'viking' | 'mola' }) {
  return (
    <div className="absolute inset-0 flex pointer-events-none">
      {mapLayer === 'viking' ? (
        <>
          <img src={publicAssetUrl('/models/mars/textures/trek_west.jpg')} alt="" className="w-1/2 h-full object-fill opacity-90" />
          <img src={publicAssetUrl('/models/mars/textures/trek_east.jpg')} alt="" className="w-1/2 h-full object-fill opacity-90" />
        </>
      ) : (
        <>
          <img src={publicAssetUrl('/models/mars/textures/mola_west.jpg')} alt="" className="w-1/2 h-full object-fill opacity-90" />
          <img src={publicAssetUrl('/models/mars/textures/mola_east.jpg')} alt="" className="w-1/2 h-full object-fill opacity-90" />
        </>
      )}
    </div>
  )
}

interface MarsMapTarget {
  lat: number
  lon: number
  name?: string
}

interface MarsFlatMapProps {
  playerGuess: { lat: number; lon: number } | null
  onSetGuess?: (coords: { lat: number; lon: number }) => void
  revealedTarget?: MarsMapTarget | null
  revealedHistory?: Array<{
    target: MarsMapTarget
    guessCoords: { lat: number; lon: number }
  }>
  interactive?: boolean
  showRegions?: boolean
  showPois?: boolean
  waypoints?: { lat: number; lon: number }[]
  layer?: 'viking' | 'mola'
  slopeMap?: string | null
  illuminationMap?: string | null
  showSlope?: boolean
  showIllumination?: boolean
  onWaypointAdd?: (coords: { lat: number; lon: number }) => void
  routeMode?: boolean
  className?: string
}

export function MarsFlatMap({
  playerGuess,
  onSetGuess,
  revealedTarget,
  revealedHistory,
  interactive = true,
  showRegions = false,
  showPois = true,
  waypoints = [],
  layer,
  slopeMap = null,
  illuminationMap = null,
  showSlope = false,
  showIllumination = false,
  onWaypointAdd,
  routeMode = false,
  className = '',
}: MarsFlatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalLayer, setInternalLayer] = useState<'viking' | 'mola'>('viking')
  const mapLayer = layer ?? internalLayer
  const setMapLayer = (l: 'viking' | 'mola') => { if (!layer) setInternalLayer(l) }
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [regionsVisible, setRegionsVisible] = useState(showRegions)
  const [search, setSearch] = useState('')

  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const movedRef = useRef(false)

  useEffect(() => {
    setRegionsVisible(showRegions)
  }, [showRegions])

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Convert lat (-90 to +90) and lon (-180 to +180) to percentage (0% to 100%)
  const toPercent = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100
    const y = ((90 - lat) / 180) * 100
    return { x, y }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const clickX = (e.clientX - rect.left - cx - pan.x) / zoom + cx
    const clickY = (e.clientY - rect.top - cy - pan.y) / zoom + cy

    const normX = Math.max(0, Math.min(1, clickX / rect.width))
    const normY = Math.max(0, Math.min(1, clickY / rect.height))

    const lon = normX * 360 - 180
    const lat = 90 - normY * 180

    if (routeMode && onWaypointAdd) {
      onWaypointAdd({ lat, lon })
      return
    }
    if (!interactive || !onSetGuess) return
    onSetGuess({ lat, lon })
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
        movedRef.current = false
        setIsPanning(false)
      }}
      onPointerMove={(e) => {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          movedRef.current = true
          setIsPanning(true)
          const rect = containerRef.current!.getBoundingClientRect()
          const worldW = rect.width * zoom
          let newX = dragStart.current.panX + dx
          // wrap horizontally for infinite scroll
          newX = ((((newX + worldW / 2) % worldW) + worldW) % worldW) - worldW / 2
          const worldH = rect.height * zoom
          const maxY = Math.max(0, (worldH - rect.height) / 2)
          let newY = dragStart.current.panY + dy
          newY = Math.max(-maxY, Math.min(maxY, newY))
          setPan({ x: newX, y: newY })
        }
      }}
      onPointerUp={(e) => {
        const wasMoved = movedRef.current
        dragStart.current = null
        setIsPanning(false)
        if (!wasMoved) handleClick(e)
      }}
      onPointerLeave={() => { dragStart.current = null; setIsPanning(false) }}
      onDoubleClick={resetView}
      className={`relative w-full h-full overflow-hidden select-none bg-[#0a0d14] ${
        interactive || routeMode ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: isPanning ? 'none' : 'transform 0.15s ease-out' }}
      >
        {[-1, 0, 1].map((off) => (
          <div
            key={off}
            className="absolute inset-0 flex pointer-events-none"
            style={{ transform: `translateX(${off * 100}%)` }}
          >
            <MapImagery mapLayer={mapLayer} />
          </div>
        ))}

      {showSlope && slopeMap && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${slopeMap})`, backgroundSize: '100% 100%', opacity: 0.55, mixBlendMode: 'screen' }} />
      )}
      {showIllumination && illuminationMap && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${illuminationMap})`, backgroundSize: '100% 100%', opacity: 0.45, mixBlendMode: 'overlay' }} />
      )}

      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#ff8754" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#ff8754" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 4" />
      </svg>

      {showPois && (
        <div className="absolute inset-0 pointer-events-none">
          {MARS_POIS.map((p) => {
            const pt = toPercent(p.lat, p.lon)
            const match = search.trim() === '' || p.name.toLowerCase().includes(search.toLowerCase())
            return (
              <div
                key={p.id}
                className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 border border-black/50 pointer-events-auto cursor-help transition-transform ${
                  match ? 'w-3 h-3 hover:scale-150' : 'w-1.5 h-1.5 opacity-30'
                }`}
                style={{ left: `${pt.x}%`, top: `${pt.y}%`, backgroundColor: poiCategoryColor(p.category) }}
                title={`${p.name} — ${p.categoryLabel}`}
              />
            )
          })}
        </div>
      )}

      {regionsVisible && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {SURFACE_REGIONS.map((r) => {
            const c = toPercent(r.lat, r.lon)
            const rx = (r.lonRadius / 360) * 100
            const ry = (r.latRadius / 180) * 100
            return (
              <g key={r.id}>
                <ellipse
                  cx={c.x}
                  cy={c.y}
                  rx={rx}
                  ry={ry}
                  fill={`${r.color}14`}
                  stroke={r.color}
                  strokeWidth={0.25}
                  strokeDasharray="0.8 0.6"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={c.x}
                  y={c.y - ry - 0.6}
                  textAnchor="middle"
                  fontSize={1.3}
                  fontWeight={700}
                  fill={r.color}
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.7)', strokeWidth: 0.15 }}
                >
                  {r.name}
                </text>
                <text
                  x={c.x}
                  y={c.y - ry + 0.9}
                  textAnchor="middle"
                  fontSize={0.9}
                  fill="rgba(255,255,255,0.7)"
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.7)', strokeWidth: 0.1 }}
                >
                  {r.mission}
                </text>
              </g>
            )
          })}
        </svg>
      )}

      {revealedHistory && revealedHistory.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {revealedHistory.map((item, idx) => {
            const g = toPercent(item.guessCoords.lat, item.guessCoords.lon)
            const t = toPercent(item.target.lat, item.target.lon)
            return (
              <g key={idx}>
                <line
                  x1={`${g.x}%`}
                  y1={`${g.y}%`}
                  x2={`${t.x}%`}
                  y2={`${t.y}%`}
                  stroke="#ffd700"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                />
                <circle cx={`${g.x}%`} cy={`${g.y}%`} r="5" fill="#00f5ff" />
                <circle cx={`${t.x}%`} cy={`${t.y}%`} r="6" fill="#ff6b35" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )
          })}
        </svg>
      )}

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
                  strokeWidth="3"
                  strokeDasharray="5 3"
                />
                <circle cx={`${t.x}%`} cy={`${t.y}%`} r="7" fill="#ff6b35" stroke="#ffffff" strokeWidth="2" />
              </>
            )
          })()}
        </svg>
      )}

      {playerGuess && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
          style={{
            left: `${toPercent(playerGuess.lat, playerGuess.lon).x}%`,
            top: `${toPercent(playerGuess.lat, playerGuess.lon).y}%`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#00f5ff] opacity-50 animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-[#00f5ff] border-2 border-white shadow-xl shadow-[#00f5ff]/80" />
          </div>
        </div>
      )}

      {waypoints.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[6]">
          {waypoints.length > 1 && (
            <polyline
              points={waypoints.map((w) => `${toPercent(w.lat, w.lon).x},${toPercent(w.lat, w.lon).y}`).join(' ')}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={0.4}
              strokeDasharray="1.2 0.8"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {waypoints.map((w, i) => {
            const pt = toPercent(w.lat, w.lon)
            return (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r={1.2} fill="#22d3ee" stroke="#ffffff" strokeWidth={0.2} vectorEffect="non-scaling-stroke" />
                <text x={pt.x} y={pt.y - 1.8} textAnchor="middle" fontSize={1.1} fontWeight={700} fill="#22d3ee" style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 0.15 }}>
                  {i + 1}
                </text>
              </g>
            )
          })}
        </svg>
      )}

      </div>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(4, +(z + 0.5).toFixed(1))) }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))) }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setRegionsVisible((v) => !v) }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-[11px] text-neutral-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
          title="Toggle landing regions"
        >
          {regionsVisible ? <Eye className="w-3.5 h-3.5 text-[#ff6b35]" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Regions</span>
        </button>
        {!layer && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMapLayer(mapLayer === 'viking' ? 'mola' : 'viking')
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-[11px] text-neutral-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
            title="Toggle NASA Trek Basemap Layer"
          >
            <Layers className="w-3.5 h-3.5 text-[#ff6b35]" />
            <span>{mapLayer === 'viking' ? 'NASA Trek Viking Color' : 'NASA Trek MOLA Elevation'}</span>
          </button>
        )}
      </div>

      <div className="absolute top-2 left-2 z-20">
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Find a POI…"
            className="bg-transparent text-[11px] text-neutral-200 placeholder-neutral-500 outline-none w-28"
          />
        </div>
      </div>

      <div className="absolute bottom-2 left-2 pointer-events-none z-10 flex items-center gap-2.5 text-[10px] text-neutral-300 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 font-mono">
        <span className="text-[#ff8754]">trek.nasa.gov</span>
        <span>·</span>
        <span>0°N Equator</span>
        <span>·</span>
        <span>0°E Meridian</span>
      </div>
    </div>
  )
}
