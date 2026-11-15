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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#10141a]/95 backdrop-blur-2xl p-6 text-white shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick()
            onClose()
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 mb-4 border border-blue-500/30">
          <Swords className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
          Phase 2 Deployment
        </div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">
          Multiplayer Mars Recon Duel
        </h2>

        <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-light">
          We are currently focusing on the <strong>Singleplayer Reconnaissance Experience</strong>!
          In Phase 2, you will be able to challenge friends in real-time turn-based planetary duels to see who can identify Martian craters fastest.
        </p>

        {/* Features Preview */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-neutral-200">
            <Radio className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Real-time WebSocket room matchmaking</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-200">
            <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Simultaneous pin-dropping with live radar blips</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-200">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Global Leaderboard with astronaut badges</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick()
              onClose()
              onTrySingleplayer()
            }}
            className="w-full py-3.5 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/25"
          >
            Play Singleplayer Now
          </button>
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            Back to Planet Orbit
          </button>
        </div>
      </div>
    </div>
  )
}
