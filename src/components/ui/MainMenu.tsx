import { useState } from 'react'
import {
  Play,
  User,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react'
import { sound } from '@/lib/audio'
import { loadProgress } from '@/lib/progress'

interface MainMenuProps {
  onStartSingleplayer: () => void
  onStartDaily: () => void
  onStartLearners: () => void
  onOpenSettings: () => void
  onOpenCredits: () => void
  onToggleExplore: () => void
  isExploreMode: boolean
  isMuted: boolean
  onToggleMute: () => void
}

export function MainMenu({
  onStartSingleplayer,
  onStartDaily,
  onStartLearners,
  onOpenSettings,
  onOpenCredits,
  onToggleExplore,
  isExploreMode,
  isMuted,
  onToggleMute,
}: MainMenuProps) {
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false)
  const personalBest = loadProgress().bestScore

  const toggleFullscreen = () => {
    sound.playToggle()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 md:p-10 select-none">
      <header className="flex items-start justify-between gap-6">
        <div className="pointer-events-auto space-y-3 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse shadow-lg shadow-[#ff6b35]/60" />
            <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#ff8754]">
              NASA Space Apps 2026 · Martian Recon
            </p>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-none tracking-[0.05em] text-white drop-shadow-2xl">
            MARS <span className="text-[#ff6b35]">EXPLORER</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-300/90 font-light tracking-[0.08em] max-w-md">
            An Interactive 3D Journey Across the Red Planet
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-[#10141a]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/15 shadow-xl">
          <button
            onClick={() => {
              onToggleMute()
              sound.playToggle()
            }}
            className="p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-neutral-500" /> : <Volume2 className="w-5 h-5 text-[#ff6b35]" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <nav className="pointer-events-auto max-w-sm space-y-3 my-auto">
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick()
              setIsPlayMenuOpen(!isPlayMenuOpen)
            }}
            className={`
              w-full flex items-center justify-between px-5 py-3 rounded-2xl
              font-heading text-base md:text-lg font-bold uppercase tracking-[0.14em] transition-all duration-200
              shadow-2xl
              ${
                isPlayMenuOpen
                  ? 'bg-[#ff6b35] text-white shadow-[#ff6b35]/50 scale-[1.02]'
                  : 'bg-[#ff6b35]/90 hover:bg-[#ff6b35] text-white hover:scale-[1.02] shadow-[#ff6b35]/30'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY</span>
            </div>
            <span className="text-xs font-mono opacity-80">{isPlayMenuOpen ? '▲' : '▼'}</span>
          </button>

          {isPlayMenuOpen && (
            <div className="mt-3 space-y-2 p-3 rounded-2xl bg-[#10141a]/95 border border-white/20 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-150">
              <button
                onClick={() => {
                  sound.playClick()
                  onStartSingleplayer()
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/40 border border-transparent transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-white">Singleplayer</p>
                    <p className="text-xs text-neutral-400">360° GeoGuessr Reconnaissance</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick()
                  onStartDaily()
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 border border-transparent transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-white">Daily Challenge</p>
                    <p className="text-xs text-neutral-400">Same 5 locations for everyone today</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Today
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick()
                  onStartLearners()
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-transparent transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-white">Learners Mode</p>
                    <p className="text-xs text-neutral-400">Browse all 67 surface panoramas</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  New
                </span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            sound.playClick()
            onToggleExplore()
          }}
          aria-label={isExploreMode ? 'Exit Free Roam' : 'Explore Globe'}
          className={`
            w-full flex items-center gap-3 px-5 py-3 rounded-2xl
            font-heading text-sm md:text-base font-semibold uppercase tracking-[0.12em] transition-all duration-150
            border backdrop-blur-xl shadow-xl
            ${
              isExploreMode
                ? 'bg-white/20 border-white text-white'
                : 'bg-[#10141a]/90 hover:bg-[#10141a] border-white/15 hover:border-white/30 text-neutral-200 hover:text-white'
            }
          `}
        >
          <Compass className="w-5 h-5 text-[#ff8754]" />
          <span>{isExploreMode ? 'Exit Free Roam' : 'Explore Globe'}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick()
            onOpenSettings()
          }}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white font-heading text-sm md:text-base font-semibold uppercase tracking-[0.12em] backdrop-blur-xl transition-all shadow-xl"
        >
          <Settings className="w-5 h-5 text-neutral-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => {
            sound.playClick()
            onOpenCredits()
          }}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white font-heading text-sm md:text-base font-semibold uppercase tracking-[0.12em] backdrop-blur-xl transition-all shadow-xl"
        >
          <Info className="w-5 h-5 text-neutral-400" />
          <span>Credits</span>
        </button>
      </nav>

      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-neutral-400 gap-3">
        <div className="flex items-center gap-2 bg-[#10141a]/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-lg">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <span>Drag to spin Mars 360° · Click any circular target on the planet to discover it</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
          <span>20 Pre-Determined Martian Landmarks</span>
          {personalBest > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Personal best: {personalBest.toLocaleString()}
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}