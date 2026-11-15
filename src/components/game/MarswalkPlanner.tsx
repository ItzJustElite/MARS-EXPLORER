import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Route,
  Shield,
  MapPin,
  Activity,
} from 'lucide-react'
import { MarsFlatMap } from '@/components/game/MarsFlatMap'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { marsGreatCircleKm } from '@/lib/marsCoordinates'
import { publicAssetUrl } from '@/lib/publicAssets'
import { sound } from '@/lib/audio'

interface MarswalkPlannerProps {
  onExit: () => void
}

type LayerKey = 'optical' | 'topo' | 'slope' | 'illumination' | 'regions' | 'pois' | 'route'

export function MarswalkPlanner({ onExit }: MarswalkPlannerProps) {
  const [destination, setDestination] = useState<MarsPOI>(MARS_POIS[0])
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    optical: true,
    topo: false,
    slope: false,
    illumination: false,
    regions: true,
    pois: true,
    route: true,
  })
  const [waypoints, setWaypoints] = useState<{ lat: number; lon: number }[]>([])
  const [routeMode, setRouteMode] = useState(false)
  const [slopeMap, setSlopeMap] = useState<string | null>(null)
  const [illuminationMap, setIlluminationMap] = useState<string | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [tutorialSeen, setTutorialSeen] = useState(() => {
    try { return localStorage.getItem('mars-explorer:marswalk-tutorial') === '1' } catch { return false }
  })

  // Derive a slope/hazard overlay from the MOLA topography image.
  useEffect(() => {
    let cancelled = false
    const imgW = new Image()
    const imgE = new Image()
    imgW.crossOrigin = 'anonymous'
    imgE.crossOrigin = 'anonymous'
    let loaded = 0
    const onDone = () => {
      if (cancelled) return
      if (loaded < 2) return
      const w = imgW.naturalWidth + imgE.naturalWidth
      const h = imgW.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(imgW, 0, 0)
      ctx.drawImage(imgE, imgW.naturalWidth, 0)
      const data = ctx.getImageData(0, 0, w, h)
      const px = data.data
      // grayscale luminance
      const gray = new Float32Array(w * h)
      for (let i = 0; i < w * h; i++) {
        const j = i * 4
        gray[i] = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2]
      }
      const out = ctx.createImageData(w, h)
      const op = out.data
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x
          const gx = gray[i + 1] - gray[i - 1]
          const gy = gray[i + w] - gray[i - w]
          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.6)
          // colorize: low slope green, high slope red
          const t = mag / 255
          op[i * 4] = Math.round(40 + t * 200)
          op[i * 4 + 1] = Math.round(180 - t * 150)
          op[i * 4 + 2] = Math.round(60 - t * 40)
          op[i * 4 + 3] = Math.round(60 + t * 120)
        }
      }
      ctx.putImageData(out, 0, 0)
      if (!cancelled) setSlopeMap(canvas.toDataURL('image/png'))

      // Illumination (hillshade) derived from the same topography.
      const ill = ctx.createImageData(w, h)
      const ip = ill.data
      const alt = (45 * Math.PI) / 180
      const az = (315 * Math.PI) / 180
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x
          const gx = gray[i + 1] - gray[i - 1]
          const gy = gray[i + w] - gray[i - w]
          const slope = Math.atan(Math.sqrt(gx * gx + gy * gy) / 255)
          const aspect = Math.atan2(gy, -gx)
          const cosInc = Math.cos(alt) * Math.cos(slope) + Math.sin(alt) * Math.sin(slope) * Math.cos(az - aspect)
          const shade = Math.max(0, Math.min(255, 255 * cosInc))
          ip[i * 4] = shade
          ip[i * 4 + 1] = shade
          ip[i * 4 + 2] = shade
          ip[i * 4 + 3] = 180
        }
      }
      ctx.putImageData(ill, 0, 0)
      if (!cancelled) setIlluminationMap(canvas.toDataURL('image/png'))
    }
    imgW.onload = () => { loaded++; onDone() }
    imgE.onload = () => { loaded++; onDone() }
    imgW.src = publicAssetUrl('/models/mars/textures/mola_west.jpg')
    imgE.src = publicAssetUrl('/models/mars/textures/mola_east.jpg')
    return () => { cancelled = true }
  }, [])

  const toggle = (k: LayerKey) => {
    sound.playToggle()
    setLayers((l) => ({ ...l, [k]: !l[k] }))
  }

  const addWaypoint = (c: { lat: number; lon: number }) => {
    sound.playGuess()
    setWaypoints((w) => [...w, c])
  }

  const clearRoute = () => {
    sound.playClick()
    setWaypoints([])
  }

  const totalDist = useMemo(() => {
    let d = 0
    for (let i = 1; i < waypoints.length; i++) {
      d += marsGreatCircleKm(waypoints[i - 1].lat, waypoints[i - 1].lon, waypoints[i].lat, waypoints[i].lon)
    }
    return Math.round(d)
  }, [waypoints])

  const evaHours = (totalDist / 2).toFixed(1)

  // Sun angle (approx): subsolar latitude for date
  const sunLat = useMemo(() => {
    const d = new Date(date)
    const day = (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000
    return 25.2 * Math.sin((2 * Math.PI * (day - 80)) / 365.25)
  }, [date])

  const hazardLabel = (dist: number) => (dist > 1500 ? 'Long excursion' : dist > 500 ? 'Moderate' : 'Short')

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090c] text-white flex">
      <div className="relative flex-1 overflow-hidden">
        <MarsFlatMap
          playerGuess={null}
          revealedTarget={{ lat: destination.lat, lon: destination.lon, name: destination.name }}
          interactive={false}
          showRegions={layers.regions}
          showPois={layers.pois}
          waypoints={layers.route ? waypoints : []}
          onWaypointAdd={routeMode ? addWaypoint : undefined}
          routeMode={routeMode}
          layer={layers.topo ? 'mola' : 'viking'}
          slopeMap={slopeMap}
          illuminationMap={illuminationMap}
          showSlope={layers.slope}
          showIllumination={layers.illumination}
          className="w-full h-full"
        />

        <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-[#10141a]/90 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="font-heading font-extrabold text-white text-sm tracking-wider">MARS WALK PLANNER</span>
          </div>
          <button
            onClick={() => { sound.playExit(); onExit() }}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-400 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </header>

        <div className="absolute bottom-4 left-4 z-20 w-64 rounded-2xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-3.5 space-y-2.5 shadow-2xl">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Destination</label>
            <select
              value={destination.id}
              onChange={(e) => {
                sound.playClick()
                const p = MARS_POIS.find((x) => x.id === e.target.value)
                if (p) setDestination(p)
              }}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
            >
              {MARS_POIS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#10141a]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Data layers</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(layers) as LayerKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(k)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all ${
                    layers[k]
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-neutral-400 border-white/10'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playToggle(); setRouteMode((r) => !r) }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                routeMode
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-neutral-300 border-white/10'
              }`}
            >
              <Route className="w-3.5 h-3.5 inline mr-1.5" />
              {routeMode ? 'Adding waypoints…' : 'Plan route'}
            </button>
            <button
              onClick={clearRoute}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/15 transition-all"
            >
              Clear
            </button>
          </div>
          <p className="text-[10px] text-neutral-500">
            {routeMode ? 'Click the map to add waypoints.' : 'Toggle "Plan route" then click the map.'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 pointer-events-none rounded-xl border border-white/20 bg-black/70 backdrop-blur-md px-3 py-2 space-y-1">
        <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1">Legend</p>
        <div className="space-y-0.5 text-[10px] text-neutral-300">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> POI</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Waypoint</div>
          <div className="flex items-center gap-2"><span className="w-5 h-0.5 bg-cyan-400" /> Route</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/40 border border-emerald-400" /> Region</div>
        </div>
      </div>

      <aside className="w-[360px] flex-shrink-0 border-l border-white/10 bg-[#10141a]/95 backdrop-blur-2xl overflow-y-auto p-5 space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight">{destination.name}</h2>
          <p className="text-xs font-mono text-neutral-400 mt-1">{destination.categoryLabel}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Location</p>
          <p className="text-sm text-neutral-200">
            {destination.lat.toFixed(3)}° N/S · {destination.lon.toFixed(3)}° E/W
          </p>
          <p className="text-xs text-neutral-300 leading-relaxed">{destination.quickFact}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Route</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-neutral-400">Waypoints</p>
              <p className="font-mono text-lg text-white">{waypoints.length}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Distance</p>
              <p className="font-mono text-lg text-cyan-300">{totalDist} km</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Est. EVA time</p>
              <p className="font-mono text-lg text-white">{evaHours} h</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Risk</p>
              <p className="font-mono text-lg text-amber-300">{hazardLabel(totalDist)}</p>
            </div>
          </div>
          <p className="text-[10px] text-neutral-500">EVA time assumes 2 km/h suited walk. Distances are great-circle (surface straight-line).</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-300" /> Safety
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-300">GCR dose (modeled)</span>
              <span className="font-mono text-amber-300">~0.67 mSv/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-300">SPE status</span>
              <span className="font-mono text-emerald-300">Nominal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-300">Subsolar lat. ({date})</span>
              <span className="font-mono text-neutral-200">{sunLat.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-300">Terrain slope</span>
              <span className="font-mono text-neutral-200">See slope layer</span>
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          />
          <p className="text-[10px] text-neutral-500">Radiation values are modeled estimates for planning, not real-time telemetry.</p>
        </div>


        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-300" /> Survival guide
          </p>
          <ul className="text-xs text-neutral-300 space-y-1.5 leading-relaxed">
            <li><strong className="text-white">Suit:</strong> ~4 h EVA O2; keep route within return range.</li>
            <li><strong className="text-white">Temp:</strong> -60°C avg; avoid extended shadow at poles.</li>
            <li><strong className="text-white">Comms:</strong> ~3-22 min one-way delay; plan autonomous.</li>
            <li><strong className="text-white">Dust:</strong> Storm season (southern spring/summer); check opacity.</li>
            <li><strong className="text-white">Rad:</strong> Shelter in habitat during SPE; minimize EVA dose.</li>
            <li><strong className="text-white">Water:</strong> Carry 2 L/person; ISRU from ice at poles.</li>
            <li><strong className="text-white">Buddy:</strong> Never EVA alone; maintain line-of-sight.</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" /> Point of view
          </p>
          <p className="text-xs text-neutral-300">
            Open Learners Mode to inspect the 360° panorama at this location before the EVA.
          </p>
        </div>
      </aside>

      {!tutorialSeen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#10141a]/95 p-7 space-y-4 shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white">Mars Walk Planner — quick guide</h3>
            <ol className="text-sm text-neutral-200 space-y-2 list-decimal pl-5">
              <li>Pick a <strong>destination</strong> from the dropdown.</li>
              <li>Toggle <strong>data layers</strong> (optical, topo, slope, illumination) to inspect terrain.</li>
              <li>Press <strong>Plan route</strong>, then click the map to add waypoints.</li>
              <li>Review distance, EVA time, and safety in the right panel.</li>
              <li>Pan/zoom the map with drag and the +/- buttons; double-click to reset.</li>
            </ol>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { try { localStorage.setItem('mars-explorer:marswalk-tutorial', '1') } catch {} ; setTutorialSeen(true); sound.playClick() }}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white underline"
              >
                Skip
              </button>
              <button
                onClick={() => { try { localStorage.setItem('mars-explorer:marswalk-tutorial', '1') } catch {} ; setTutorialSeen(true); sound.playClick() }}
                className="px-5 py-2.5 rounded-xl bg-[#ff6b35] text-white text-sm font-bold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
