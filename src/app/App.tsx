import { useState, useEffect, useMemo } from 'react'
import { MarsCanvas } from '@/components/mars3d/MarsCanvas'
import { QuickFactCard } from '@/components/ui/QuickFactCard'
import { MainMenu } from '@/components/ui/MainMenu'
import { GeoGuessrGame } from '@/components/game/GeoGuessrGame'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { MultiplayerModal } from '@/components/ui/MultiplayerModal'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { sound } from '@/lib/audio'

export function App() {
  // Pick one random POI out of the 20 when the website opens
  const initialPoi = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MARS_POIS.length)
    return MARS_POIS[randomIndex]
  }, [])

  // Application view modes: 'menu' | 'singleplayer' | 'explore'
  const [currentMode, setCurrentMode] = useState<'menu' | 'singleplayer' | 'explore'>('menu')
  const [selectedPoi, setSelectedPoi] = useState<MarsPOI>(initialPoi)

  // Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false)
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

  // Exit singleplayer back to main menu
  const handleExitGame = () => {
    sound.playClick()
    setCurrentMode('menu')
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090c] text-white">
      {/* When in Singleplayer mode, the main globe goes away and we enter full 360 GeoGuessr! */}
      {currentMode === 'singleplayer' ? (
        <GeoGuessrGame onExitGame={handleExitGame} />
      ) : (
        <>
          {/* 3D WebGL Mars & Space Skybox Canvas (Main Menu / Explore) */}
          <MarsCanvas
            selectedPoi={selectedPoi}
            onSelectPoi={handleSelectPoi}
            isInteractive={true}
            autoRotate={autoRotate && currentMode === 'menu'}
            rotationSpeed={rotationSpeed}
          />

          {/* Main Menu State */}
          {currentMode === 'menu' && (
            <>
              {/* Main Menu Navigation Overlay */}
              <MainMenu
                onStartSingleplayer={handleStartSingleplayer}
                onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleExplore={() => setCurrentMode('explore')}
                isExploreMode={false}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />

              {/* Quick Fact Card - FIXED & CONSTRAINED TO THE RIGHT */}
              <QuickFactCard
                poi={selectedPoi}
                onSelectPoi={handleSelectPoi}
                onStartSingleplayer={handleStartSingleplayer}
              />
            </>
          )}

          {/* Explore Free Roam Mode (Clean HUD with just Quick Fact Card and Exit button) */}
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

              {/* Quick Fact Card - Fixed to the Right */}
              <QuickFactCard
                poi={selectedPoi}
                onSelectPoi={handleSelectPoi}
                onStartSingleplayer={handleStartSingleplayer}
              />
            </>
          )}

          {/* Settings Modal (Spacious & Clean) */}
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

          {/* Multiplayer Preview Modal (Spacious & Clean) */}
          <MultiplayerModal
            isOpen={isMultiplayerOpen}
            onClose={() => setIsMultiplayerOpen(false)}
            onTrySingleplayer={handleStartSingleplayer}
          />
        </>
      )}
    </div>
  )
}

export default App
