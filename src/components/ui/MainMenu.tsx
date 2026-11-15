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
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 md:p-8 select-none">
      {/* Top Header Row */}
      <header className="flex items-start justify-between">
        {/* Game Title & Tagline */}
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff6b35] animate-pulse shadow-lg shadow-[#ff6b35]/50" />
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-wider text-white">
              MARS <span className="text-[#ff6b35]">EXPLORER</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 font-light tracking-wide max-w-sm">
            An Interactive 3D Journey Across the Red Planet
          </p>
        </div>

        {/* Top-Right Control Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#10141a]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => {
              onToggleMute()
              sound.playClick()
            }}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-[#ff6b35]" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Action Menu (Left Side) */}
      <nav className="pointer-events-auto max-w-xs space-y-3 my-auto">
        {/* Play Group */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick()
              setIsPlayMenuOpen(!isPlayMenuOpen)
            }}
            className={`
              w-full flex items-center justify-between px-6 py-4 rounded-2xl
              font-heading text-lg font-bold tracking-wide transition-all duration-200
              shadow-xl
              ${
                isPlayMenuOpen
                  ? 'bg-[#ff6b35] text-white shadow-[#ff6b35]/40'
                  : 'bg-[#ff6b35]/90 hover:bg-[#ff6b35] text-white hover:scale-[1.02] shadow-[#ff6b35]/25'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY</span>
            </div>
            <span className="text-xs font-mono opacity-80">{isPlayMenuOpen ? '▲' : '▼'}</span>
          </button>

          {/* Submenu for Singleplayer and Multiplayer */}
          {isPlayMenuOpen && (
            <div className="mt-2 space-y-2 p-2 rounded-2xl bg-[#10141a]/95 border border-white/15 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Singleplayer Button */}
              <button
                onClick={() => {
                  sound.playClick()
                  onStartSingleplayer()
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/40 border border-transparent transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-white">Singleplayer</p>
                    <p className="text-[11px] text-neutral-400">5-Round Reconnaissance Quiz</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </button>

              {/* Multiplayer Button */}
              <button
                onClick={() => {
                  sound.playClick()
                  onOpenMultiplayer()
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent transition-all text-left opacity-80 hover:opacity-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-white">Multiplayer</p>
                    <p className="text-[11px] text-neutral-400">1v1 Interplanetary Duel</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
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
            w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl
            font-heading text-base font-semibold tracking-wide transition-all duration-150
            border backdrop-blur-md shadow-lg
            ${
              isExploreMode
                ? 'bg-white/20 border-white text-white'
                : 'bg-[#10141a]/80 hover:bg-[#10141a] border-white/10 hover:border-white/25 text-neutral-200 hover:text-white'
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
          className="w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#10141a]/80 hover:bg-[#10141a] border border-white/10 hover:border-white/25 text-neutral-200 hover:text-white font-heading text-base font-semibold tracking-wide backdrop-blur-md transition-all shadow-lg"
        >
          <Settings className="w-5 h-5 text-neutral-400" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Bottom Footer Hint */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
        <div className="flex items-center gap-2 bg-[#10141a]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span>Drag to spin Mars 360° · Click any beacon pin to view quick facts</span>
        </div>

        <div className="text-[11px] text-neutral-400 font-mono">
          20 Pre-Determined Martian Landmarks
        </div>
      </footer>
    </div>
  )
}
