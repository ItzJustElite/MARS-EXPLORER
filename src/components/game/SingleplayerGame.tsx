import { useState, useEffect } from 'react'
import {
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MapPin,
  HelpCircle,
  X,
  Target,
} from 'lucide-react'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'
import { marsGreatCircleKm } from '@/lib/marsCoordinates'
import { sound } from '@/lib/audio'

interface SingleplayerGameProps {
  onExitGame: () => void
  onSetGameGuessMode: (active: boolean) => void
  playerGuessCoords: { lat: number; lon: number } | null
  onSetRevealedPoi: (poi: MarsPOI | null) => void
  onSetTargetPoiForCamera: (poi: MarsPOI | null) => void
}

interface RoundResult {
  round: number
  targetPoi: MarsPOI
  guessCoords: { lat: number; lon: number }
  distanceKm: number
  points: number
}

const TOTAL_ROUNDS = 5

export function SingleplayerGame({
  onExitGame,
  onSetGameGuessMode,
  playerGuessCoords,
  onSetRevealedPoi,
  onSetTargetPoiForCamera,
}: SingleplayerGameProps) {
  // Game session state
  const [roundsList, setRoundsList] = useState<MarsPOI[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [resultsHistory, setResultsHistory] = useState<RoundResult[]>([])
  const [gameState, setGameState] = useState<'guessing' | 'revealed' | 'gameover'>('guessing')
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null)
  const [clueStage, setClueStage] = useState<number>(1) // reveal 1, 2, or 3 clues

  // Initialize 5 unique random POIs for the session
  useEffect(() => {
    const shuffled = [...MARS_POIS].sort(() => 0.5 - Math.random())
    const selectedFive = shuffled.slice(0, TOTAL_ROUNDS)
    setRoundsList(selectedFive)
    setCurrentRoundIndex(0)
    setScore(0)
    setResultsHistory([])
    setGameState('guessing')
    setClueStage(1)
    onSetGameGuessMode(true)
    onSetRevealedPoi(null)
  }, [onSetGameGuessMode, onSetRevealedPoi])

  const currentTarget = roundsList[currentRoundIndex]

  // Submit player's guess
  const handleConfirmGuess = () => {
    if (!playerGuessCoords || !currentTarget) return

    sound.playClick()

    // Calculate real great circle distance on Mars in kilometers
    const distKm = Math.round(
      marsGreatCircleKm(
        playerGuessCoords.lat,
        playerGuessCoords.lon,
        currentTarget.lat,
        currentTarget.lon
      )
    )

    // Score formula: max 5000, exponential decay with distance
    // Exact within 150 km = 5,000 points
    let roundPoints = 0
    if (distKm <= 150) {
      roundPoints = 5000
    } else {
      roundPoints = Math.max(0, Math.round(5000 * Math.exp(-distKm / 1400)))
    }

    // Clue penalty: -300 for clue 2, -600 for clue 3
    if (clueStage === 2) roundPoints = Math.max(100, roundPoints - 300)
    if (clueStage === 3) roundPoints = Math.max(100, roundPoints - 600)

    const result: RoundResult = {
      round: currentRoundIndex + 1,
      targetPoi: currentTarget,
      guessCoords: playerGuessCoords,
      distanceKm: distKm,
      points: roundPoints,
    }

    setCurrentRoundResult(result)
    setScore((prev) => prev + roundPoints)
    setResultsHistory((prev) => [...prev, result])
    setGameState('revealed')

    // Reveal target on Mars canvas & draw connecting arc
    onSetRevealedPoi(currentTarget)
    onSetTargetPoiForCamera(currentTarget)

    // Play fanfare based on accuracy
    sound.playScoreCelebration(roundPoints)
  }

  // Advance to next round or end game
  const handleNextRound = () => {
    sound.playClick()
    onSetRevealedPoi(null)

    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      setGameState('gameover')
      onSetGameGuessMode(false)
    } else {
      setCurrentRoundIndex((prev) => prev + 1)
      setGameState('guessing')
      setClueStage(1)
      setCurrentRoundResult(null)
      onSetGameGuessMode(true)
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
    setGameState('guessing')
    setClueStage(1)
    setCurrentRoundResult(null)
    onSetGameGuessMode(true)
    onSetRevealedPoi(null)
  }

  // Calculate explorer title rank
  const getExplorerRank = (total: number) => {
    if (total >= 22000) return { title: 'Chief Planetary Geologist', icon: '🚀', color: 'text-amber-400' }
    if (total >= 16000) return { title: 'Senior Mars Recon Specialist', icon: '🛰️', color: 'text-orange-400' }
    if (total >= 10000) return { title: 'Martian Field Scout', icon: '🧭', color: 'text-emerald-400' }
    return { title: 'Cadet in Orbit', icon: '🪐', color: 'text-blue-400' }
  }

  if (!currentTarget && gameState !== 'gameover') return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 md:p-8 select-none">
      {/* Top Status Bar */}
      <header className="pointer-events-auto flex items-center justify-between bg-[#10141a]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/15 max-w-4xl mx-auto w-full shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b35] animate-ping" />
            <span className="font-heading font-bold text-white text-base md:text-lg tracking-wide">
              ROUND {currentRoundIndex + 1} OF {TOTAL_ROUNDS}
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-1.5 text-neutral-300 text-xs md:text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-400">{score}</span>
            <span className="text-neutral-500">/ 25,000 pts</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick()
            onSetGameGuessMode(false)
            onSetRevealedPoi(null)
            onExitGame()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs transition-colors"
          title="Exit to Main Menu"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </header>

      {/* Center Clue / Target Card (During Guessing Phase) */}
      {gameState === 'guessing' && currentTarget && (
        <div className="pointer-events-auto max-w-lg mx-auto w-full my-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-6 text-white shadow-2xl shadow-black/90">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ff6b35]/20 text-[#ff8754] border border-[#ff6b35]/30">
                <Target className="w-3.5 h-3.5 text-[#ff6b35]" />
                Mystery Target Location
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {currentTarget.categoryLabel}
              </span>
            </div>

            {/* Target Title Prompt */}
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              Where is {currentTarget.name}?
            </h2>

            {/* Progressive Clues Box */}
            <div className="my-4 space-y-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-mono uppercase text-[#ff8754] mb-1 font-semibold">
                  Clue 1
                </p>
                <p className="text-sm text-neutral-200">{currentTarget.clues[0]}</p>
              </div>

              {clueStage >= 2 ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 animate-in fade-in duration-200">
                  <p className="text-[11px] font-mono uppercase text-amber-400 mb-1 font-semibold">
                    Clue 2
                  </p>
                  <p className="text-sm text-neutral-200">{currentTarget.clues[1]}</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick()
                    setClueStage(2)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reveal Clue 2 (-300 pts)</span>
                </button>
              )}

              {clueStage >= 3 ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 animate-in fade-in duration-200">
                  <p className="text-[11px] font-mono uppercase text-emerald-400 mb-1 font-semibold">
                    Clue 3
                  </p>
                  <p className="text-sm text-neutral-200">{currentTarget.clues[2]}</p>
                </div>
              ) : clueStage === 2 ? (
                <button
                  onClick={() => {
                    sound.playClick()
                    setClueStage(3)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reveal Clue 3 (-600 pts)</span>
                </button>
              ) : null}
            </div>

            {/* Instruction & Confirm Action */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00f5ff]" />
                {playerGuessCoords ? (
                  <span className="font-mono text-[#00f5ff]">
                    Pin set: {playerGuessCoords.lat.toFixed(1)}°, {playerGuessCoords.lon.toFixed(1)}°
                  </span>
                ) : (
                  <span>Click on Mars to drop your guess pin</span>
                )}
              </div>

              <button
                disabled={!playerGuessCoords}
                onClick={handleConfirmGuess}
                className={`
                  w-full sm:w-auto px-6 py-3 rounded-2xl font-heading font-bold text-sm tracking-wide
                  transition-all duration-200 shadow-xl
                  ${
                    playerGuessCoords
                      ? 'bg-[#ff6b35] hover:bg-[#ff7e4d] text-white hover:scale-105 shadow-[#ff6b35]/40 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                  }
                `}
              >
                CONFIRM LOCATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round Revealed Summary Modal */}
      {gameState === 'revealed' && currentRoundResult && (
        <div className="pointer-events-auto max-w-lg mx-auto w-full my-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-6 text-white shadow-2xl shadow-black/90">
            {/* Top result pill */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-heading font-bold text-lg text-white">Location Revealed!</span>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                +{currentRoundResult.points} PTS
              </span>
            </div>

            {/* Target Details */}
            <h3 className="font-heading text-2xl font-extrabold text-white mb-1">
              {currentRoundResult.targetPoi.name}
            </h3>
            <p className="text-xs text-[#ff8754] font-medium mb-3">
              {currentRoundResult.targetPoi.highlightStat}
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              {currentRoundResult.targetPoi.quickFact}
            </p>

            {/* Distance & Accuracy Metric */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5">
              <div>
                <p className="text-[10px] font-mono uppercase text-neutral-400">Distance Error</p>
                <p className="font-heading text-xl font-bold text-white">
                  {currentRoundResult.distanceKm.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-neutral-400">Accuracy</p>
                <p className="font-heading text-xl font-bold text-emerald-400">
                  {currentRoundResult.distanceKm < 200
                    ? 'Bullseye! 🎯'
                    : currentRoundResult.distanceKm < 1000
                    ? 'Great Guess!'
                    : currentRoundResult.distanceKm < 3000
                    ? 'Good Recon'
                    : 'Off Course'}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextRound}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30"
            >
              <span>{currentRoundIndex + 1 >= TOTAL_ROUNDS ? 'VIEW FINAL RESULTS' : 'NEXT ROUND'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="pointer-events-auto max-w-lg mx-auto w-full my-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-6 text-white shadow-2xl shadow-black/90">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff6b35]/20 text-[#ff6b35] mb-3 border border-[#ff6b35]/30">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight mb-1">
                Expedition Complete!
              </h2>
              <p className="text-xs text-neutral-400 font-light">
                Here is your Martian Reconnaissance Scorecard
              </p>
            </div>

            {/* Total Score & Rank */}
            {(() => {
              const rank = getExplorerRank(score)
              return (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center mb-6">
                  <p className="text-xs font-mono uppercase text-neutral-400 mb-1">Total Score</p>
                  <p className="font-heading text-4xl font-extrabold text-amber-400 mb-2">
                    {score.toLocaleString()} <span className="text-lg text-neutral-500">/ 25,000</span>
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold">
                    <span>{rank.icon}</span>
                    <span className={rank.color}>{rank.title}</span>
                  </div>
                </div>
              )
            })()}

            {/* Rounds Breakdown Table */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
              {resultsHistory.map((res) => (
                <div
                  key={res.round}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 w-4">#{res.round}</span>
                    <span className="font-medium text-white">{res.targetPoi.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-neutral-400">{res.distanceKm.toLocaleString()} km</span>
                    <span className="font-bold text-amber-400">+{res.points}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-sm tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick()
                  onExitGame()
                }}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-sm tracking-wide transition-all"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom helper text */}
      <footer className="text-center text-xs text-neutral-400">
        <span className="bg-[#10141a]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          Rotate Mars in 360° to locate the landmark
        </span>
      </footer>
    </div>
  )
}
