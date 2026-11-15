import { useState } from 'react'
import {
  Play,
  Users,
  User,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Compass,
  Sparkles,
} from 'lucide-react'
import { sound } from '@/lib/audio'

interface MainMenuProps {
  onStartSingleplayer: () => void
  onOpenMultiplayer: () => void
  onOpenSettings: () => void
  onToggleExplore: () => void
  isExploreMode: boolean
  isMuted: boolean
  onToggleMute: () => void
}

export function MainMenu({
  onStartSingleplayer,
  onOpenMultiplayer,
  onOpenSettings,
  onToggleExplore,
  isExploreMode,
  isMuted,
  onToggleMute,
}: MainMenuProps) {
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false)

  const toggleFullscreen = () => {
    sound.playClick()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-8 md:p-12 select-none">
      {/* Top Header Row */}
      <header className="flex items-start justify-between">
        {/* Game Title & Tagline */}
        <div className="pointer-events-auto space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff6b35] animate-pulse shadow-lg shadow-[#ff6b35]/60" />
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-wider text-white">
              MARS <span className="text-[#ff6b35]">EXPLORER</span>
            </h1>
          </div>
          <p className="text-sm md:text-base text-neutral-300 font-light tracking-wide max-w-md">
            An Interactive 3D Journey Across the Red Planet
          </p>
        </div>

        {/* Top-Right Control Bar */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#10141a]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/15 shadow-xl">
          <button
            onClick={() => {
              onToggleMute()
              sound.playClick()
            }}
            className="p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-neutral-500" /> : <Volume2 className="w-5 h-5 text-[#ff6b35]" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Action Menu (Left Side with generous spacing) */}
      <nav className="pointer-events-auto max-w-sm space-y-4 my-auto">
        {/* Play Group */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick()
              setIsPlayMenuOpen(!isPlayMenuOpen)
            }}
            className={`
              w-full flex items-center justify-between px-7 py-4.5 rounded-2xl
              font-heading text-xl font-bold tracking-wide transition-all duration-200
              shadow-2xl
              ${
                isPlayMenuOpen
                  ? 'bg-[#ff6b35] text-white shadow-[#ff6b35]/50 scale-[1.02]'
                  : 'bg-[#ff6b35]/90 hover:bg-[#ff6b35] text-white hover:scale-[1.02] shadow-[#ff6b35]/30'
              }
            `}
          >
            <div className="flex items-center gap-3.5">
              <Play className="w-6 h-6 fill-current" />
              <span>PLAY</span>
            </div>
            <span className="text-xs font-mono opacity-80">{isPlayMenuOpen ? '▲' : '▼'}</span>
          </button>

          {/* Submenu for Singleplayer and Multiplayer */}
          {isPlayMenuOpen && (
            <div className="mt-3 space-y-2.5 p-3 rounded-2xl bg-[#10141a]/95 border border-white/20 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-150">
              {/* Singleplayer Button */}
              <button
                onClick={() => {
                  sound.playClick()
                  onStartSingleplayer()
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/40 border border-transparent transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
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

              {/* Multiplayer Button */}
              <button
                onClick={() => {
                  sound.playClick()
                  onOpenMultiplayer()
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent transition-all text-left opacity-80 hover:opacity-100 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-white">Multiplayer</p>
                    <p className="text-xs text-neutral-400">1v1 Interplanetary Duel</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Coming Soon
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Free Roam Explore Globe Button */}
        <button
          onClick={() => {
            sound.playClick()
            onToggleExplore()
          }}
          className={`
            w-full flex items-center gap-3.5 px-7 py-4 rounded-2xl
            font-heading text-lg font-semibold tracking-wide transition-all duration-150
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

        {/* Settings Button */}
        <button
          onClick={() => {
            sound.playClick()
            onOpenSettings()
          }}
          className="w-full flex items-center gap-3.5 px-7 py-4 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white font-heading text-lg font-semibold tracking-wide backdrop-blur-xl transition-all shadow-xl"
        >
          <Settings className="w-5 h-5 text-neutral-400" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Bottom Footer Hint with proper breathing room */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-400 gap-3">
        <div className="flex items-center gap-2.5 bg-[#10141a]/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/15 shadow-lg">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <span>Drag to spin Mars 360° · Click any circular target on the planet to discover it</span>
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          20 Pre-Determined Martian Landmarks
        </div>
      </footer>
    </div>
  )
}
