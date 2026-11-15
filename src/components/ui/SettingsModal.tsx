import { X, Volume2, VolumeX, RotateCw, Sparkles, HelpCircle } from 'lucide-react'
import { sound } from '@/lib/audio'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isMuted: boolean
  onToggleMute: () => void
  autoRotate: boolean
  onToggleAutoRotate: () => void
  rotationSpeed: number
  onChangeRotationSpeed: (speed: number) => void
}

export function SettingsModal({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  autoRotate,
  onToggleAutoRotate,
  rotationSpeed,
  onChangeRotationSpeed,
}: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-8 md:p-10 text-white shadow-2xl shadow-black/90 space-y-7">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Settings</h2>
              <p className="text-xs text-neutral-400">Audio & Simulation Controls</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-[#ff6b35]">
                {isMuted ? <VolumeX className="w-5 h-5 text-neutral-400" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-heading font-semibold text-base">Cosmic Audio</p>
                <p className="text-xs text-neutral-400">Atmospheric space ambiance & chimes</p>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleMute()
                sound.playClick()
              }}
              className={`
                px-4 py-2 rounded-xl font-heading text-xs font-bold tracking-wider transition-all
                ${
                  !isMuted
                    ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/30'
                    : 'bg-white/10 text-neutral-400'
                }
              `}
            >
              {!isMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-base">Planet Auto-Spin</p>
                  <p className="text-xs text-neutral-400">Gentle planetary rotation when idle</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick()
                  onToggleAutoRotate()
                }}
                className={`
                  px-4 py-2 rounded-xl font-heading text-xs font-bold tracking-wider transition-all
                  ${
                    autoRotate
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 text-neutral-400'
                  }
                `}
              >
                {autoRotate ? 'ON' : 'OFF'}
              </button>
            </div>

            {autoRotate && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Spin Speed</span>
                  <span className="font-mono text-amber-400 font-bold">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => onChangeRotationSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#ff6b35] cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-neutral-200 text-sm font-semibold">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How to Navigate Mars</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 pl-1 leading-relaxed">
              <li>• <strong className="text-white">Left-Click & Drag</strong>: Spin Mars 360° in any direction</li>
              <li>• <strong className="text-white">Mouse Scroll Wheel</strong>: Zoom in and out</li>
              <li>• <strong className="text-white">Click Beacons</strong>: View quick facts and stories</li>
            </ul>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="w-full py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  )
}
