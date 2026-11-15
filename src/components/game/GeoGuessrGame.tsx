import { useState, useEffect, useRef } from 'react'
import {
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MapPin,
  Clock,
  Compass,
  Maximize2,
  Minimize2,
  X,
  HelpCircle,
  Database,
  Globe as GlobeIcon,
  Map as MapIcon,
} from 'lucide-react'
import { PanoramaViewer } from '@/components/exploration/PanoramaViewer'
import { MarsFlatMap } from '@/components/game/MarsFlatMap'
import { MarsCanvas } from '@/components/mars3d/MarsCanvas'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { marsGreatCircleKm } from '@/lib/marsCoordinates'
import { fetchPdsProducts, type PdsProductRecord } from '@/lib/pdsApi'
import { sound } from '@/lib/audio'

interface GeoGuessrGameProps {
  onExitGame: () => void
}

interface RoundResult {
  round: number
  targetPoi: MarsPOI
  guessCoords: { lat: number; lon: number }
  distanceKm: number
  points: number
  pdsData?: PdsProductRecord[]
}

const TOTAL_ROUNDS = 5
const ROUND_TIME_SECONDS = 90

export function GeoGuessrGame({ onExitGame }: GeoGuessrGameProps) {
  // Game state
  const [roundsList, setRoundsList] = useState<MarsPOI[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [resultsHistory, setResultsHistory] = useState<RoundResult[]>([])
  const [gameState, setGameState] = useState<'playing' | 'revealed' | 'gameover'>('playing')
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null)

  // Minimap & guess state
  const [playerGuess, setPlayerGuess] = useState<{ lat: number; lon: number } | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false)
  const [minimapMode, setMinimapMode] = useState<'flat' | 'globe'>('flat')

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS)
  const timerRef = useRef<number | null>(null)

  // Clue & PDS data
  const [showClue, setShowClue] = useState<boolean>(false)
  const [currentPdsData, setCurrentPdsData] = useState<PdsProductRecord[]>([])

  // Setup 5 random POIs for the session
  useEffect(() => {
    const shuffled = [...MARS_POIS].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, TOTAL_ROUNDS)
    setRoundsList(selected)
    setCurrentRoundIndex(0)
    setScore(0)
    setResultsHistory([])
    setGameState('playing')
    setPlayerGuess(null)
    setIsMapExpanded(false)
    setTimeLeft(ROUND_TIME_SECONDS)
  }, [])

  const currentTarget = roundsList[currentRoundIndex]

  // Query NASA PDS API when round changes
  useEffect(() => {
    if (!currentTarget) return
    let isCancelled = false

    fetchPdsProducts(currentTarget.pdsKeywords).then((products) => {
      if (!isCancelled) {
        setCurrentPdsData(products)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [currentTarget])

  // Countdown timer loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, currentRoundIndex])

  // Handle time expiration: auto-submit or score 0
  const handleTimeExpired = () => {
    if (playerGuess) {
      handleConfirmGuess()
    } else if (currentTarget) {
      // Default guess at opposite side of Mars
      const defaultGuess = { lat: 0, lon: (currentTarget.lon + 180) % 360 - 180 }
      submitRound(defaultGuess)
    }
  }

  // Submit round logic
  const submitRound = (guess: { lat: number; lon: number }) => {
    if (!currentTarget) return

    const distKm = Math.round(
      marsGreatCircleKm(guess.lat, guess.lon, currentTarget.lat, currentTarget.lon)
    )

    // Classic GeoGuessr scoring formula: 5000 max, exponential dropoff
    let roundPoints = 0
    if (distKm <= 100) {
      roundPoints = 5000 // Bullseye!
    } else {
      roundPoints = Math.max(0, Math.round(5000 * Math.exp(-distKm / 1200)))
    }

    const result: RoundResult = {
      round: currentRoundIndex + 1,
      targetPoi: currentTarget,
      guessCoords: guess,
      distanceKm: distKm,
      points: roundPoints,
      pdsData: currentPdsData,
    }

    setCurrentRoundResult(result)
    setScore((prev) => prev + roundPoints)
    setResultsHistory((prev) => [...prev, result])
    setGameState('revealed')
    setIsMapExpanded(true)

    sound.playScoreCelebration(roundPoints)
  }

  const handleConfirmGuess = () => {
    if (!playerGuess || !currentTarget) return
    sound.playClick()
    submitRound(playerGuess)
  }

  // Next round handler
  const handleNextRound = () => {
    sound.playClick()
    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      setGameState('gameover')
    } else {
      setCurrentRoundIndex((prev) => prev + 1)
      setGameState('playing')
      setPlayerGuess(null)
      setCurrentRoundResult(null)
      setShowClue(false)
      setIsMapExpanded(false)
      setTimeLeft(ROUND_TIME_SECONDS)
    }
  }

  // Restart game
  const handleRestart = () => {
    sound.playClick()
    const shuffled = [...MARS_POIS].sort(() => 0.5 - Math.random())
    setRoundsList(shuffled.slice(0, TOTAL_ROUNDS))
    setCurrentRoundIndex(0)
    setScore(0)
    setResultsHistory([])
    setGameState('playing')
    setPlayerGuess(null)
    setCurrentRoundResult(null)
    setShowClue(false)
    setIsMapExpanded(false)
    setTimeLeft(ROUND_TIME_SECONDS)
  }

  const getExplorerRank = (total: number) => {
    if (total >= 22000) return { title: 'Chief Planetary Geologist', icon: '🚀', color: 'text-amber-400' }
    if (total >= 16000) return { title: 'Senior Mars Recon Specialist', icon: '🛰️', color: 'text-orange-400' }
    if (total >= 10000) return { title: 'Martian Field Scout', icon: '🧭', color: 'text-emerald-400' }
    return { title: 'Cadet in Orbit', icon: '🪐', color: 'text-blue-400' }
  }

  if (!currentTarget && gameState !== 'gameover') return null

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none text-white">
      {/* 1. Fullscreen 360° Panorama Viewport (The Core StreetView / MarsView Experience) */}
      <div className="absolute inset-0 z-0">
        <PanoramaViewer
          src={currentTarget?.panoramaUrl || '/panoramas/jezero.png'}
          title={currentTarget?.name}
          className="w-full h-full"
        />
      </div>

      {/* 2. Top Header HUD */}
      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Round & Score counter */}
        <div className="pointer-events-auto flex items-center gap-4 bg-[#10141a]/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/15 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b35] animate-ping" />
            <span className="font-heading font-extrabold text-white text-base md:text-lg tracking-wider">
              ROUND {currentRoundIndex + 1} / {TOTAL_ROUNDS}
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-400">{score.toLocaleString()}</span>
            <span className="text-neutral-500 font-mono text-xs">/ 25,000 PTS</span>
          </div>
        </div>

        {/* Center: Timer Bar */}
        {gameState === 'playing' && (
          <div className="pointer-events-auto flex items-center gap-2.5 bg-[#10141a]/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/15 shadow-2xl">
            <Clock className={`w-4 h-4 ${timeLeft <= 20 ? 'text-red-400 animate-bounce' : 'text-neutral-300'}`} />
            <span
              className={`font-mono text-base font-bold ${
                timeLeft <= 20 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Right: Hint Button & Exit */}
        <div className="pointer-events-auto flex items-center gap-3">
          {gameState === 'playing' && (
            <button
              onClick={() => {
                sound.playClick()
                setShowClue(!showClue)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-300 hover:text-white border border-white/15 backdrop-blur-xl shadow-xl transition-all"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showClue ? 'Hide Clue' : 'Hint'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick()
              onExitGame()
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-400 hover:text-white border border-white/15 backdrop-blur-xl shadow-xl transition-all"
          >
            <X className="w-4 h-4" />
            <span>Quit</span>
          </button>
        </div>
      </header>

      {/* Clue Floating Card (Optional assistance) */}
      {showClue && currentTarget && gameState === 'playing' && (
        <div className="absolute top-24 left-6 z-20 pointer-events-auto max-w-sm rounded-2xl bg-[#10141a]/95 backdrop-blur-2xl p-5 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Field Intelligence Clue</span>
          </div>
          <p className="text-sm text-neutral-200 leading-relaxed font-light">
            {currentTarget.clues[0]}
          </p>
        </div>
      )}

      {/* 3. The Classic GeoGuessr Floating Minimap (Bottom-Right Corner) */}
      {gameState === 'playing' && (
        <div
          onMouseEnter={() => setIsMapExpanded(true)}
          className={`
            absolute bottom-6 right-6 z-20 transition-all duration-300 ease-out select-none
            ${isMapExpanded ? 'w-[480px] sm:w-[560px] h-[360px] sm:h-[400px]' : 'w-72 sm:w-80 h-48 sm:h-52'}
          `}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col">
            {/* Minimap Top Header Controls */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/50 border-b border-white/10 text-xs z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMinimapMode('flat')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    minimapMode === 'flat'
                      ? 'bg-[#ff6b35] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Flat Map</span>
                </button>
                <button
                  onClick={() => setMinimapMode('globe')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    minimapMode === 'globe'
                      ? 'bg-[#ff6b35] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <GlobeIcon className="w-3.5 h-3.5" />
                  <span>3D Globe</span>
                </button>
              </div>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="p-1 rounded text-neutral-400 hover:text-white"
                title={isMapExpanded ? 'Minimize Map' : 'Expand Map'}
              >
                {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Minimap Viewport */}
            <div className="flex-1 relative overflow-hidden">
              {minimapMode === 'flat' ? (
                <MarsFlatMap
                  playerGuess={playerGuess}
                  onSetGuess={(coords) => {
                    sound.playClick()
                    setPlayerGuess(coords)
                  }}
                  interactive={true}
                />
              ) : (
                <MarsCanvas
                  selectedPoi={null}
                  onSelectPoi={() => {}}
                  isInteractive={true}
                  autoRotate={false}
                  guessMode={true}
                  onPlayerGuess={(coords) => {
                    sound.playClick()
                    setPlayerGuess(coords)
                  }}
                  playerGuessCoords={playerGuess}
                />
              )}
            </div>

            {/* Minimap Bottom Action Bar */}
            <div className="p-3 bg-[#10141a] border-t border-white/10 flex items-center justify-between gap-3 z-10">
              <div className="text-xs text-neutral-300 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#00f5ff] flex-shrink-0" />
                {playerGuess ? (
                  <span className="font-mono text-cyan-300 text-[11px] truncate">
                    {playerGuess.lat.toFixed(1)}° Lat, {playerGuess.lon.toFixed(1)}° Lon
                  </span>
                ) : (
                  <span className="text-neutral-400 text-xs">Click map to drop pin</span>
                )}
              </div>

              <button
                disabled={!playerGuess}
                onClick={handleConfirmGuess}
                className={`
                  px-5 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider transition-all duration-200 uppercase
                  ${
                    playerGuess
                      ? 'bg-[#ff6b35] hover:bg-[#ff7e4d] text-white shadow-lg shadow-[#ff6b35]/40 hover:scale-105 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                  }
                `}
              >
                GUESS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Round Revealed Screen (GeoGuessr Breakdown) */}
      {gameState === 'revealed' && currentRoundResult && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-7 md:p-9 text-white shadow-2xl space-y-6">
            {/* Top Row: Score Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="font-heading font-extrabold text-2xl text-white">
                  Round {currentRoundIndex + 1} Debrief
                </span>
              </div>

              <div className="px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono font-bold text-sm">
                +{currentRoundResult.points} PTS
              </div>
            </div>

            {/* Revealed Mini-Map */}
            <div className="h-56 rounded-2xl overflow-hidden border border-white/15 relative">
              <MarsFlatMap
                playerGuess={currentRoundResult.guessCoords}
                revealedTarget={currentRoundResult.targetPoi}
                interactive={false}
              />
            </div>

            {/* Distance & Landmark Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <p className="text-xs uppercase font-mono text-[#ff8754] font-semibold mb-0.5">
                  Target Landmark
                </p>
                <h3 className="font-heading text-2xl font-bold text-white">
                  {currentRoundResult.targetPoi.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {currentRoundResult.targetPoi.highlightStat}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs uppercase font-mono text-neutral-400">Distance Error</p>
                <p className="font-heading text-3xl font-extrabold text-amber-400">
                  {currentRoundResult.distanceKm.toLocaleString()}{' '}
                  <span className="text-base text-neutral-400 font-normal">km</span>
                </p>
              </div>
            </div>

            {/* Live NASA PDS API Archive Attribution */}
            {currentRoundResult.pdsData && currentRoundResult.pdsData.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Database className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-cyan-300">
                    NASA Planetary Data System (PDS) Calibrated Archive
                  </p>
                  <p className="text-neutral-300 font-mono text-[11px] truncate max-w-lg">
                    {currentRoundResult.pdsData[0].title}
                  </p>
                  <p className="text-neutral-500 text-[10px]">
                    LID: {currentRoundResult.pdsData[0].id}
                  </p>
                </div>
              </div>
            )}

            {/* Next Action */}
            <button
              onClick={handleNextRound}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
            >
              <span>{currentRoundIndex + 1 >= TOTAL_ROUNDS ? 'VIEW FINAL EXPEDITION SUMMARY' : 'NEXT ROUND'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Game Over Final Scorecard Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-8 md:p-10 text-white shadow-2xl space-y-7">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30 shadow-xl shadow-[#ff6b35]/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Expedition Complete!
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 font-light">
                Here is your 5-Round Martian Surface Reconnaissance Summary
              </p>
            </div>

            {/* Total Score & Rank */}
            {(() => {
              const rank = getExplorerRank(score)
              return (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center space-y-2">
                  <p className="text-xs font-mono uppercase text-neutral-400">Total Score</p>
                  <p className="font-heading text-5xl font-black text-amber-400 tracking-tight">
                    {score.toLocaleString()} <span className="text-lg text-neutral-500 font-normal">/ 25,000</span>
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-semibold">
                    <span>{rank.icon}</span>
                    <span className={rank.color}>{rank.title}</span>
                  </div>
                </div>
              )
            })()}

            {/* Full 5-Round Global Map Summary */}
            <div className="h-44 rounded-2xl overflow-hidden border border-white/15 relative">
              <MarsFlatMap
                playerGuess={null}
                revealedHistory={resultsHistory}
                interactive={false}
              />
            </div>

            {/* Round Breakdown Rows */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {resultsHistory.map((res) => (
                <div
                  key={res.round}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-500 font-bold">#{res.round}</span>
                    <span className="font-medium text-white">{res.targetPoi.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-neutral-400">{res.distanceKm.toLocaleString()} km</span>
                    <span className="font-bold text-amber-400">+{res.points} pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick()
                  onExitGame()
                }}
                className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-base tracking-wide transition-all cursor-pointer"
              >
                Return to Orbit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
