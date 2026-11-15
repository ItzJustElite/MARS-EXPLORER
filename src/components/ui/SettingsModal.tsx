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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#10141a]/95 backdrop-blur-2xl p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff6b35]" />
            <h2 className="font-heading text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="space-y-5">
          {/* Audio Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#ff6b35]">
                {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">Cosmic Audio</p>
                <p className="text-[11px] text-neutral-400">Atmospheric space ambiance & chimes</p>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleMute()
                sound.playClick()
              }}
              className={`
                px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all
                ${
                  !isMuted
                    ? 'bg-[#ff6b35] text-white shadow-md shadow-[#ff6b35]/30'
                    : 'bg-white/10 text-neutral-400'
                }
              `}
            >
              {!isMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Idle Auto-Rotation */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">Planet Auto-Spin</p>
                  <p className="text-[11px] text-neutral-400">Slow planetary rotation when idle</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick()
                  onToggleAutoRotate()
                }}
                className={`
                  px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all
                  ${
                    autoRotate
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-white/10 text-neutral-400'
                  }
                `}
              >
                {autoRotate ? 'ON' : 'OFF'}
              </button>
            </div>

            {autoRotate && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Spin Speed</span>
                  <span className="font-mono">{rotationSpeed.toFixed(1)}x</span>
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

          {/* Controls Guide */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-neutral-300 text-xs font-semibold mb-1">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How to Navigate Mars</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-1.5 pl-1">
              <li>• <strong className="text-white">Left-Click & Drag</strong>: Spin Mars 360° freely</li>
              <li>• <strong className="text-white">Mouse Scroll</strong>: Zoom in and out</li>
              <li>• <strong className="text-white">Click Beacons</strong>: View quick facts and stories</li>
            </ul>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="w-full py-3 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
