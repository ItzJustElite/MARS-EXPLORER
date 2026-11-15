import { X, Globe, Music, Database, Box } from 'lucide-react'
import { sound } from '@/lib/audio'

interface CreditsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-8 md:p-10 text-white shadow-2xl shadow-black/90 space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Credits & Attribution</h2>
              <p className="text-xs text-neutral-400">Imagery, data, and audio</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose() }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#ff8754]">
            <Database className="w-4 h-4" /> NASA imagery & data
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            All planetary imagery is sourced from official NASA missions and archives:
            the NASA Image and Video Library (images.nasa.gov), NASA Mars Trek
            (trek.nasa.gov), the Mars Reconnaissance Orbiter, Mars Odyssey,
            Viking 1/2 Orbiters, Mars Global Surveyor, Phoenix, Pathfinder,
            Spirit, Opportunity, Curiosity, and Perseverance. Map basemaps are
            NASA Mars Trek WMTS (Viking MDIM 2.1 and MGS MOLA). Live product
            metadata comes from the NASA Planetary Data System.
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Imagery is used under NASA's media usage guidelines and remains the
            property of NASA/JPL-Caltech and partner institutions. Please credit
            NASA and the relevant mission team when reusing.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Box className="w-4 h-4" /> 3D model
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            This work is based on{' '}
            <a
              href="https://sketchfab.com/3d-models/mars-156a95dfec244e07a3ae423f579ffb05"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-200 underline underline-offset-2 hover:text-white"
            >
              &quot;Mars&quot;
            </a>{' '}
            by{' '}
            <a
              href="https://sketchfab.com/arctic.wolves"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-200 underline underline-offset-2 hover:text-white"
            >
              ARCTIC WOLVES™
            </a>{' '}
            licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-200 underline underline-offset-2 hover:text-white"
            >
              CC-BY-4.0
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Music className="w-4 h-4" /> Audio
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            All sound effects and the ambient drone are synthesized in-browser
            with the Web Audio API (original composition). No external audio
            assets are used, so no third-party audio credits or licenses apply.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-200">Open source</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Built with React, Three.js, Leaflet, Pannellum, and Tailwind CSS.
          </p>
        </section>

        <div className="pt-2">
          <button
            onClick={() => { sound.playClick(); onClose() }}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-sm tracking-wide transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
