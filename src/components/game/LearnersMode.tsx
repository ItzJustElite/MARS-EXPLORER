import { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  ExternalLink,
  Compass,
  Sparkles,
} from 'lucide-react'
import { PanoramaViewer } from '@/components/exploration/PanoramaViewer'
import { MarsFlatMap } from '@/components/game/MarsFlatMap'
import { SURFACE_ROUNDS, panoramaPageUrl } from '@/data/nasaPanoramas'
import { sound } from '@/lib/audio'
import { loadProgress, setLearnersIndex } from '@/lib/progress'

interface LearnersModeProps {
  onExit: () => void
}

export function LearnersMode({ onExit }: LearnersModeProps) {
  const [index, setIndex] = useState(() => {
    const p = loadProgress()
    const i = p.lastLearnersIndex ?? 0
    return Math.min(Math.max(0, i), SURFACE_ROUNDS.length - 1)
  })
  const total = SURFACE_ROUNDS.length
  const round = SURFACE_ROUNDS[index]
  const source = round.source

  useEffect(() => { setLearnersIndex(index) }, [index])

  const go = useCallback(
    (dir: number) => {
      sound.playNavigate()
      setIndex((prev) => (prev + dir + total) % total)
    },
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') go(1)
      else if (e.key === 'ArrowLeft' || e.key === 'a') go(-1)
      else if (e.key === 'Escape') {
        sound.playClick()
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onExit])

  const locationPin = { lat: round.lat, lon: round.lon }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none text-white">
      <div className="absolute inset-0 z-0">
        <PanoramaViewer
          src={source.src}
          title={source.title}
          credit={source.credit}
          captured={source.captured}
          kind="surface"
          nasaId={source.nasaId}
          sourceUrl={panoramaPageUrl(source)}
          note={source.note}
          haov={source.haov}
          vaov={source.vaov}
          horizonPitch={source.horizonPitch}
          hfov={source.initialHfov}
          pitch={source.initialPitch}
          yaw={source.initialYaw}
          className="w-full h-full"
        />
      </div>

      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-[#10141a]/90 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-heading font-extrabold text-white text-lg tracking-wider">
              LEARNERS MODE
            </span>
          </div>
          <div className="h-5 w-px bg-white/20" />
          <span className="font-mono text-sm text-neutral-300">
            {index + 1} / {total}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-300 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
            aria-label="Previous panorama"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => go(1)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-300 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
            aria-label="Next panorama"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playExit()
              onExit()
            }}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-400 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <div className="absolute bottom-6 left-6 z-20 w-[300px] sm:w-[360px] h-[200px] sm:h-[230px] rounded-2xl overflow-hidden border-2 border-white/20 bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl">
        <MarsFlatMap
          playerGuess={locationPin}
          revealedTarget={locationPin}
          interactive={false}
          showRegions={true}
          showPois={true}
          className="w-full h-full"
        />
        <div className="absolute top-2 left-2 z-20 pointer-events-none text-[10px] font-mono text-neutral-300 bg-black/70 backdrop-blur-md px-2 py-1 rounded border border-white/15">
          {round.siteName}
        </div>
      </div>

      <aside className="absolute right-4 sm:right-8 top-24 bottom-6 z-20 w-[calc(100vw-2rem)] max-w-[380px] rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl overflow-y-auto">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              Surface panorama
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight leading-tight mt-3">
              {round.name}
            </h2>
            <p className="text-xs font-mono text-neutral-400">{round.siteName}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <Compass className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-200/90 leading-relaxed">
              {round.highlight}
            </p>
          </div>

          <p className="text-sm text-neutral-200 leading-relaxed font-light">
            {round.clue}
          </p>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official NASA imagery</span>
            </div>
            <p className="text-xs text-neutral-200 font-medium truncate">
              {source.title}
            </p>
            <p className="text-[10px] text-neutral-500 font-mono truncate">
              {source.credit} · {source.nasaId ?? 'Mars Trek WMTS'}
            </p>
            {source.captured && (
              <p className="text-[10px] text-neutral-500 font-mono">
                Captured {source.captured}
                {source.locationLabel ? ` · ${source.locationLabel}` : ''}
              </p>
            )}
            {panoramaPageUrl(source) && (
              <a
                href={panoramaPageUrl(source)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-neutral-300 uppercase tracking-wider transition-colors"
              >
                NASA source
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              All {total} surface panoramas
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {SURFACE_ROUNDS.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => {
                    sound.playClick()
                    setIndex(i)
                  }}
                  className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    i === index
                      ? 'border-emerald-400 scale-105'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                  title={r.name}
                >
                  <img
                    src={r.source.thumb}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-neutral-500 font-mono pt-2 border-t border-white/10">
            Use ← / → or A / D to navigate. Esc to exit.
          </p>
        </div>
      </aside>
    </div>
  )
}
