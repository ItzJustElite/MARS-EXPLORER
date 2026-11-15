import { X, Users, Sparkles, Swords, Radio } from 'lucide-react'
import { sound } from '@/lib/audio'

interface MultiplayerModalProps {
  isOpen: boolean
  onClose: () => void
  onTrySingleplayer: () => void
}

export function MultiplayerModal({
  isOpen,
  onClose,
  onTrySingleplayer,
}: MultiplayerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-8 md:p-10 text-white shadow-2xl text-center space-y-6">
        <button
          onClick={() => {
            sound.playClick()
            onClose()
          }}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-xl shadow-blue-500/20">
          <Swords className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
            Multiplayer Mode
          </span>
          <h2 className="font-heading text-3xl font-bold text-white tracking-tight">
            1v1 Interplanetary Duel
          </h2>
        </div>

        <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-light">
          We are currently focusing on the <strong>Singleplayer 360° Reconnaissance Experience</strong>!
          In Phase 2, challenge friends in live, turn-based planetary duels to see who can identify Martian surface features fastest.
        </p>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
          <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-200">
            <Radio className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Real-time WebSocket room matchmaking</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-200">
            <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Simultaneous pin-dropping with live radar blips</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-200">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Global Leaderboard with astronaut badges</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick()
              onClose()
              onTrySingleplayer()
            }}
            className="w-full py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
          >
            Play Singleplayer Now
          </button>
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            Back to Planet Orbit
          </button>
        </div>
      </div>
    </div>
  )
}
