import { useState, useEffect } from 'react'
import { X, MousePointer2, MapPin, HelpCircle, Play, ChevronRight } from 'lucide-react'
import { sound } from '@/lib/audio'

const KEY = 'mars-explorer:tutorial-seen'

const STEPS = [
  { icon: MousePointer2, title: 'Spin the planet', body: 'Click and drag anywhere on Mars to rotate it 360°. Scroll to zoom in and out.' },
  { icon: MapPin, title: 'Discover landmarks', body: 'Click the glowing orange beacons to open the info card for that location.' },
  { icon: Play, title: 'Play Singleplayer', body: 'Start a 5-round GeoGuessr run. You are dropped into a 360° panorama and must guess where on Mars you are.' },
  { icon: HelpCircle, title: 'Use the Hint', body: 'Stuck? Open the Hint button for a field clue. Drop your guess on the flat map, then press GUESS.' },
]

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    sound.playClick()
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-8 text-white shadow-2xl space-y-6">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Skip tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Step {step + 1} of {STEPS.length}
            </p>
            <h3 className="font-heading text-xl font-bold text-white">{current.title}</h3>
          </div>
        </div>

        <p className="text-sm text-neutral-200 leading-relaxed font-light">{current.body}</p>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={dismiss}
            className="text-xs text-neutral-400 hover:text-white transition-colors underline"
          >
            Skip tutorial
          </button>
          <button
            onClick={() => {
              sound.playClick()
              if (isLast) dismiss()
              else setStep((s) => s + 1)
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
          >
            <span>{isLast ? 'Get started' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
