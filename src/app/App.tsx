import { useState, useEffect, useMemo } from 'react'
import { MarsCanvas } from '@/components/mars3d/MarsCanvas'
import { QuickFactCard } from '@/components/ui/QuickFactCard'
import { MainMenu } from '@/components/ui/MainMenu'
import { SingleplayerGame } from '@/components/game/SingleplayerGame'
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
  const [screenPoint, setScreenPoint] = useState<{ x: number; y: number; isVisible: boolean } | null>(null)

  // Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(0.3)

  // Singleplayer game communication states with 3D canvas
  const [gameGuessMode, setGameGuessMode] = useState(false)
  const [playerGuessCoords, setPlayerGuessCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [revealedPoi, setRevealedPoi] = useState<MarsPOI | null>(null)

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

  // Start singleplayer mode
  const handleStartSingleplayer = () => {
    sound.playClick()
    setCurrentMode('singleplayer')
    setPlayerGuessCoords(null)
    setRevealedPoi(null)
  }

  // Exit singleplayer back to main menu
  const handleExitGame = () => {
    sound.playClick()
    setCurrentMode('menu')
    setGameGuessMode(false)
    setPlayerGuessCoords(null)
    setRevealedPoi(null)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090c] text-white">
      {/* 3D WebGL Mars & Space Skybox Canvas */}
      <MarsCanvas
        selectedPoi={currentMode === 'singleplayer' ? (revealedPoi ?? null) : selectedPoi}
        onSelectPoi={handleSelectPoi}
        isInteractive={true}
        autoRotate={autoRotate && currentMode === 'menu'}
        rotationSpeed={rotationSpeed}
        onScreenPointUpdate={setScreenPoint}
        guessMode={gameGuessMode}
        onPlayerGuess={(coords) => {
          sound.playClick()
          setPlayerGuessCoords(coords)
        }}
        playerGuessCoords={playerGuessCoords}
        revealedPoi={revealedPoi}
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

          {/* Quick Fact Card with SVG line pointing to the selected POI */}
          <QuickFactCard
            poi={selectedPoi}
            screenPoint={screenPoint}
            onSelectPoi={handleSelectPoi}
            onStartQuizWithPoi={handleStartSingleplayer}
          />
        </>
      )}

      {/* Explore Free Roam Mode (Clean HUD with just Quick Fact Card and Exit button) */}
      {currentMode === 'explore' && (
        <>
          <div className="absolute top-6 left-6 z-30 pointer-events-auto">
            <button
              onClick={() => {
                sound.playClick()
                setCurrentMode('menu')
              }}
              className="px-4 py-2 rounded-xl bg-[#10141a]/90 hover:bg-[#10141a] text-white text-xs font-heading font-semibold border border-white/20 backdrop-blur-md shadow-xl transition-all"
            >
              &larr; Back to Main Menu
            </button>
          </div>

          <QuickFactCard
            poi={selectedPoi}
            screenPoint={screenPoint}
            onSelectPoi={handleSelectPoi}
            onStartQuizWithPoi={handleStartSingleplayer}
          />
        </>
      )}

      {/* Singleplayer Game Loop Overlay */}
      {currentMode === 'singleplayer' && (
        <SingleplayerGame
          onExitGame={handleExitGame}
          onSetGameGuessMode={setGameGuessMode}
          playerGuessCoords={playerGuessCoords}
          onSetRevealedPoi={setRevealedPoi}
          onSetTargetPoiForCamera={(poi) => {
            if (poi) handleSelectPoi(poi)
          }}
        />
      )}

      {/* Settings Modal */}
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

      {/* Multiplayer Preview Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        onTrySingleplayer={handleStartSingleplayer}
      />
    </div>
  )
}

export default App
