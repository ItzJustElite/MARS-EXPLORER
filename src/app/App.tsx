import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { QuickFactCard } from '@/components/ui/QuickFactCard'
import { MainMenu } from '@/components/ui/MainMenu'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { MultiplayerModal } from '@/components/ui/MultiplayerModal'
import { CreditsModal } from '@/components/ui/CreditsModal'
import { TutorialOverlay } from '@/components/ui/TutorialOverlay'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { sound } from '@/lib/audio'

const MarsCanvas = lazy(() => import('@/components/mars3d/MarsCanvas').then((m) => ({ default: m.MarsCanvas })))
const GeoGuessrGame = lazy(() => import('@/components/game/GeoGuessrGame').then((m) => ({ default: m.GeoGuessrGame })))
const LearnersMode = lazy(() => import('@/components/game/LearnersMode').then((m) => ({ default: m.LearnersMode })))
const MarswalkPlanner = lazy(() => import('@/components/game/MarswalkPlanner').then((m) => ({ default: m.MarswalkPlanner })))

export function App() {
  // Pick one random POI out of the 20 when the website opens
  const initialPoi = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MARS_POIS.length)
    return MARS_POIS[randomIndex]
  }, [])

  // Daily challenge seed (date-based, UTC)
  const dailySeed = useMemo(() => {
    const d = new Date()
    const s = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
  }, [])
  const [currentMode, setCurrentMode] = useState<'menu' | 'singleplayer' | 'explore' | 'learners' | 'daily' | 'marswalk'>('menu')
  const [selectedPoi, setSelectedPoi] = useState<MarsPOI>(initialPoi)

  // Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(0.3)

  // Audio start on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      sound.startAmbientDrone()
      window.removeEventListener('pointerdown', handleFirstInteraction)
    }
    window.addEventListener('pointerdown', handleFirstInteraction)
    return () => window.removeEventListener('pointerdown', handleFirstInteraction)
  }, [])

  // Mute toggle
  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    sound.setMuted(newMuted)
  }

  // Handle POI selection
  const handleSelectPoi = (poi: MarsPOI) => {
    setSelectedPoi(poi)
    sound.playBeaconSelect()
  }

  // Start singleplayer GeoGuessr mode
  const handleStartSingleplayer = () => {
    sound.playClick()
    setCurrentMode('singleplayer')
  }

  // Start learners mode
  const handleStartLearners = () => {
    sound.playClick()
    setCurrentMode('learners')
  }

  // Start daily challenge
  const handleStartDaily = () => {
    sound.playClick()
    setCurrentMode('daily')
  }

  // Exit learners back to main menu
  const handleExitLearners = () => {
    sound.playClick()
    setCurrentMode('menu')
  }

  const handleExitMarswalk = () => {
    sound.playClick()
    setCurrentMode('menu')
  }

  // Exit singleplayer back to main menu
  const handleExitGame = () => {
    sound.playClick()
    setCurrentMode('menu')
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090c] text-white">
      {currentMode === 'singleplayer' ? (
        <Suspense fallback={<div className='absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-sm'>Loading…</div>}><GeoGuessrGame onExitGame={handleExitGame} /></Suspense>
      ) : currentMode === 'marswalk' ? (
        <Suspense fallback={<div className='absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-sm'>Loading…</div>}><MarswalkPlanner onExit={handleExitMarswalk} /></Suspense>
      ) : currentMode === 'daily' ? (
        <Suspense fallback={<div className='absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-sm'>Loading…</div>}><GeoGuessrGame onExitGame={handleExitGame} mode='daily' seed={dailySeed} /></Suspense>
      ) : currentMode === 'learners' ? (
        <Suspense fallback={<div className='absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-sm'>Loading…</div>}><LearnersMode onExit={handleExitLearners} /></Suspense>
      ) : (
        <>
          <Suspense fallback={<div className='absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-sm'>Loading Mars…</div>}>
            <MarsCanvas
              selectedPoi={selectedPoi}
              onSelectPoi={handleSelectPoi}
              isInteractive={true}
              autoRotate={autoRotate && currentMode === 'menu'}
              rotationSpeed={rotationSpeed}
            />
          </Suspense>

          {currentMode === 'menu' && (
            <>
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.28)_38%,transparent_65%)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/60 to-transparent" />

              <MainMenu
                onStartSingleplayer={handleStartSingleplayer}
                onStartDaily={handleStartDaily}
                onStartLearners={handleStartLearners}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenCredits={() => setIsCreditsOpen(true)}
                onToggleExplore={() => setCurrentMode('marswalk')}
                isExploreMode={false}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />

              <QuickFactCard
                poi={selectedPoi}
                onSelectPoi={handleSelectPoi}
                onStartSingleplayer={handleStartSingleplayer}
              />
            </>
          )}

          {currentMode === 'explore' && (
            <>
              <div className="absolute top-8 left-8 z-30 pointer-events-auto">
                <button
                  onClick={() => {
                    sound.playClick()
                    setCurrentMode('menu')
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-white text-xs font-heading font-semibold border border-white/20 backdrop-blur-xl shadow-2xl transition-all"
                >
                  &larr; Back to Main Menu
                </button>
              </div>

              <QuickFactCard
                poi={selectedPoi}
                onSelectPoi={handleSelectPoi}
                onStartSingleplayer={handleStartSingleplayer}
              />
            </>
          )}

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
            rotationSpeed={rotationSpeed}
            onChangeRotationSpeed={setRotationSpeed}
          />

          <MultiplayerModal
            isOpen={isMultiplayerOpen}
            onClose={() => setIsMultiplayerOpen(false)}
            onTrySingleplayer={handleStartSingleplayer}
          />

          <CreditsModal
            isOpen={isCreditsOpen}
            onClose={() => setIsCreditsOpen(false)}
          />

          <TutorialOverlay />
        </>
      )}
    </div>
  )
}

export default App
