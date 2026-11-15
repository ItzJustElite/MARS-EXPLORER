import { useState, useEffect, useRef } from 'react'
import {
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MapPin,
  Download,
  Clock,
  Compass,
  Maximize2,
  Minimize2,
  X,
  HelpCircle,
  Database,
  Globe as GlobeIcon,
  Map as MapIcon,
  Camera,
  ExternalLink,
} from 'lucide-react'
import { PanoramaViewer } from '@/components/exploration/PanoramaViewer'
import { MarsFlatMap } from '@/components/game/MarsFlatMap'
import { MarsCanvas } from '@/components/mars3d/MarsCanvas'
import {
  SURFACE_ROUNDS,
  panoramaPageUrl,
  type SurfaceRound,
} from '@/data/nasaPanoramas'
import { marsGreatCircleKm } from '@/lib/marsCoordinates'
import { fetchPdsProducts, type PdsProductRecord } from '@/lib/pdsApi'
import { sound } from '@/lib/audio'
import { updateBestScore } from '@/lib/progress'
import { setDailyChallenge } from '@/lib/progress'

interface GeoGuessrGameProps {
  onExitGame: () => void
  mode?: 'standard' | 'daily'
  seed?: number
}

interface RoundResult {
  round: number
  target: SurfaceRound
  guessCoords: { lat: number; lon: number }
  distanceKm: number
  points: number
  pdsData?: PdsProductRecord[]
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const TOTAL_ROUNDS = 5
const ROUND_TIME_SECONDS = 90

export function GeoGuessrGame({ onExitGame, mode = 'standard', seed }: GeoGuessrGameProps) {
  // Game state
  const [roundsList, setRoundsList] = useState<SurfaceRound[]>([])
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

  // Setup 5 random ground-level panoramas for the session. Orbital
  // reconnaissance imagery is intentionally excluded from guessing.
  useEffect(() => {
    let shuffled: SurfaceRound[]
    if (typeof seed === 'number') {
      // Deterministic seeded shuffle for daily challenge
      const rng = mulberry32(seed)
      shuffled = [...SURFACE_ROUNDS].sort(() => rng() - 0.5)
    } else {
      shuffled = [...SURFACE_ROUNDS].sort(() => 0.5 - Math.random())
    }
    const selected = shuffled.slice(0, TOTAL_ROUNDS)
    setRoundsList(selected)
    setCurrentRoundIndex(0)
    setScore(0)
    setResultsHistory([])
    setGameState('playing')
    setPlayerGuess(null)
    setIsMapExpanded(false)
    setTimeLeft(ROUND_TIME_SECONDS)
  }, [seed])

  const currentTarget = roundsList[currentRoundIndex]
  const currentSource = currentTarget?.source
  const resultSource = currentRoundResult?.target.source

  // Query live NASA PDS Search API when round changes
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
      target: currentTarget,
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

    if (distKm <= 100) sound.playBullseye()
    else sound.playScoreCelebration(roundPoints)
  }

  const handleConfirmGuess = () => {
    if (!playerGuess || !currentTarget) return
    sound.playGuess()
    submitRound(playerGuess)
  }

  // Next round handler
  const handleNextRound = () => {
    sound.playNavigate()
    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      const rank = getExplorerRank(score)
      updateBestScore(score, rank.title)
      if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10)
        setDailyChallenge(today, score)
      }
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
    sound.playNavigate()
    let shuffled: SurfaceRound[]
    if (typeof seed === 'number') {
      const rng = mulberry32(seed)
      shuffled = [...SURFACE_ROUNDS].sort(() => rng() - 0.5)
    } else {
      shuffled = [...SURFACE_ROUNDS].sort(() => 0.5 - Math.random())
    }
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

  const downloadResultCard = () => {
    sound.playClick()
    const W = 1200
    const H = 630
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#090b0e')
    grad.addColorStop(1, '#1a1208')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Accent bar
    ctx.fillStyle = '#ff6b35'
    ctx.fillRect(0, 0, W, 8)

    ctx.fillStyle = '#ff8754'
    ctx.font = 'bold 22px sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('MARS EXPLORER  ·  EXPEDITION REPORT', 60, 60)

    const rank = getExplorerRank(score)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 52px sans-serif'
    ctx.fillText('Expedition Complete', 60, 120)

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 72px sans-serif'
    ctx.fillText(score.toLocaleString(), 60, 200)
    ctx.fillStyle = '#9ca3af'
    ctx.font = '24px sans-serif'
    ctx.fillText('/ 25,000 PTS', 60 + ctx.measureText(score.toLocaleString()).width + 16, 200)

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(`${rank.icon}  ${rank.title}`, 60, 245)

    // Round breakdown
    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('ROUND', 60, 300)
    ctx.fillText('TARGET', 150, 300)
    ctx.fillText('DISTANCE', 760, 300)
    ctx.fillText('POINTS', 980, 300)

    let y = 335
    resultsHistory.forEach((r) => {
      ctx.fillStyle = '#e5e7eb'
      ctx.font = '18px sans-serif'
      ctx.fillText(`#${r.round}`, 60, y)
      const name = r.target.name.length > 34 ? r.target.name.slice(0, 33) + '…' : r.target.name
      ctx.fillText(name, 150, y)
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(`${r.distanceKm.toLocaleString()} km`, 760, y)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(`+${r.points}`, 980, y)
      y += 34
    })

    ctx.fillStyle = '#6b7280'
    ctx.font = '14px sans-serif'
    ctx.fillText('mars-explorer  ·  NASA surface panoramas  ·  ' + new Date().toLocaleDateString(), 60, H - 40)

    const link = document.createElement('a')
    link.download = `mars-expedition-${score}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!currentTarget && gameState !== 'gameover') return null

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none text-white">
      <div className="absolute inset-0 z-0">
        <PanoramaViewer
          src={currentSource?.src ?? null}
          title={currentSource?.title}
          credit={currentSource?.credit}
          captured={currentSource?.captured}
          kind="surface"
          nasaId={currentSource?.nasaId}
          sourceUrl={panoramaPageUrl(currentSource)}
          note={currentSource?.note}
          haov={currentSource?.haov ?? 360}
          vaov={currentSource?.vaov ?? 180}
          horizonPitch={currentSource?.horizonPitch ?? 0}
          hfov={currentSource?.initialHfov ?? 100}
          pitch={currentSource?.initialPitch ?? 0}
          yaw={currentSource?.initialYaw ?? 0}
          hideTitle={gameState === 'playing'}
          className="w-full h-full"
        />
      </div>

      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-[#10141a]/90 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#ff6b35] animate-ping" />
            <span className="font-heading font-extrabold text-white text-lg tracking-wider">
              ROUND {currentRoundIndex + 1} / {TOTAL_ROUNDS}
              {mode === 'daily' ? ' · DAILY' : ''}
            </span>
          </div>

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-2.5 text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-400 text-base">{score.toLocaleString()}</span>
            <span className="text-neutral-400 font-mono text-xs">/ 25,000 PTS</span>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="pointer-events-auto flex items-center gap-3 bg-[#10141a]/90 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl">
            <Clock className={`w-5 h-5 ${timeLeft <= 20 ? 'text-red-400 animate-bounce' : 'text-neutral-300'}`} />
            <span
              className={`font-mono text-lg font-bold tracking-wider ${
                timeLeft <= 20 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-3.5">
          {gameState === 'playing' && (
            <button
              onClick={() => {
                sound.playHint()
                setShowClue(!showClue)
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-300 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showClue ? 'Hide Hint' : 'Hint'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playExit()
              onExitGame()
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#10141a]/90 hover:bg-[#10141a] text-xs font-semibold text-neutral-400 hover:text-white border border-white/15 backdrop-blur-2xl shadow-xl transition-all"
          >
            <X className="w-4 h-4" />
            <span>Quit</span>
          </button>
        </div>
      </header>

      {showClue && currentTarget && gameState === 'playing' && (
        <div className="absolute top-44 left-8 z-20 pointer-events-auto max-w-md rounded-3xl bg-[#10141a]/95 backdrop-blur-2xl p-7 border border-white/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Field Intelligence Clue</span>
          </div>
          <p className="text-sm text-neutral-200 leading-relaxed font-light">
            {currentTarget.clue}
          </p>
        </div>
      )}

      {gameState === 'playing' && (
        <div
          onMouseEnter={() => setIsMapExpanded(true)}
          className={`
            absolute bottom-6 right-6 z-20 transition-all duration-300 ease-out select-none
            ${isMapExpanded ? 'w-[520px] sm:w-[620px] h-[380px] sm:h-[430px]' : 'w-80 sm:w-96 h-52 sm:h-60'}
          `}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 bg-[#10141a]/95 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-black/60 border-b border-white/10 text-xs z-10">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { sound.playToggle(); setMinimapMode('flat') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    minimapMode === 'flat'
                      ? 'bg-[#ff6b35] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>NASA Flat Map</span>
                </button>
                <button
                  onClick={() => { sound.playToggle(); setMinimapMode('globe') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    minimapMode === 'globe'
                      ? 'bg-[#ff6b35] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span>3D Globe</span>
                </button>
              </div>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMapExpanded ? 'Minimize Map' : 'Expand Map'}
              >
                {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {minimapMode === 'flat' ? (
                <MarsFlatMap
                  playerGuess={playerGuess}
                  onSetGuess={(coords) => {
                    sound.playClick()
                    setPlayerGuess(coords)
                  }}
                  interactive={true}
                  showRegions={true}
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

            <div className="p-4 bg-[#10141a] border-t border-white/10 flex items-center justify-between gap-4 z-10">
              <div className="text-xs text-neutral-300 flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#00f5ff] flex-shrink-0" />
                {playerGuess ? (
                  <span className="font-mono text-cyan-300 text-xs truncate">
                    {playerGuess.lat.toFixed(1)}° Lat, {playerGuess.lon.toFixed(1)}° Lon
                  </span>
                ) : (
                  <span className="text-neutral-400 text-xs">Click map to drop guess pin</span>
                )}
              </div>

              <button
                disabled={!playerGuess}
                onClick={handleConfirmGuess}
                className={`
                  px-7 py-3 rounded-2xl font-heading font-bold text-sm tracking-wider transition-all duration-200 uppercase
                  ${
                    playerGuess
                      ? 'bg-[#ff6b35] hover:bg-[#ff7e4d] text-white shadow-xl shadow-[#ff6b35]/40 hover:scale-105 cursor-pointer'
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

      {gameState === 'revealed' && currentRoundResult && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-6 md:p-8 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                <h3 className="font-heading font-extrabold text-3xl text-white">
                  Round {currentRoundIndex + 1} Debrief
                </h3>
              </div>

              <div className="px-5 py-2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono font-bold text-base shadow-lg">
                +{currentRoundResult.points} PTS
              </div>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-white/15 relative">
              <MarsFlatMap
                playerGuess={currentRoundResult.guessCoords}
                revealedTarget={currentRoundResult.target}
                interactive={false}
                showRegions={true}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1">
                <p className="text-xs uppercase font-mono text-[#ff8754] font-semibold">
                  Target Location
                </p>
                <h4 className="font-heading text-2xl font-bold text-white">
                  {currentRoundResult.target.name}
                </h4>
                <p className="text-xs text-neutral-300">
                  {currentRoundResult.target.highlight}
                </p>
              </div>

              <div className="sm:text-right space-y-0.5">
                <p className="text-xs uppercase font-mono text-neutral-400">Distance Error</p>
                <p className="font-heading text-4xl font-extrabold text-amber-400">
                  {currentRoundResult.distanceKm.toLocaleString()}{' '}
                  <span className="text-base text-neutral-400 font-normal">km</span>
                </p>
              </div>
            </div>

            {resultSource && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border bg-emerald-500/15 text-emerald-300 border-emerald-400/30">
                  <Camera className="w-4.5 h-4.5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300">
                      NASA 360° Surface
                    </span>
                    {resultSource.locationLabel && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        {resultSource.locationLabel}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-500">
                      {resultSource.nasaId ?? 'Mars Trek WMTS'}
                    </span>
                    {resultSource.captured && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        · {resultSource.captured}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-200 font-medium truncate">
                    {resultSource.title}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">
                    {resultSource.credit} · {resultSource.note}
                  </p>
                </div>

                <a
                  href={panoramaPageUrl(resultSource) ?? resultSource.sourceApi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-neutral-300 uppercase tracking-wider transition-colors"
                >
                  Source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {currentRoundResult.pdsData && currentRoundResult.pdsData.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                <Database className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cyan-300">
                      NASA Planetary Data System (PDS) Calibrated Archive
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      pds.mcp.nasa.gov
                    </span>
                  </div>
                  <p className="text-neutral-200 font-mono text-xs truncate max-w-xl">
                    {currentRoundResult.pdsData[0].title}
                  </p>
                  <p className="text-neutral-500 text-[10px] font-mono">
                    LID: {currentRoundResult.pdsData[0].id}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleNextRound}
              className="w-full flex items-center justify-center gap-3 py-4.5 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
            >
              <span>{currentRoundIndex + 1 >= TOTAL_ROUNDS ? 'VIEW FINAL EXPEDITION SUMMARY' : 'NEXT ROUND'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#10141a]/95 backdrop-blur-2xl p-6 md:p-8 text-white shadow-2xl space-y-5">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30 shadow-2xl shadow-[#ff6b35]/20">
                <Trophy className="w-10 h-10" />
              </div>
              <h2 className="font-heading text-4xl font-extrabold text-white tracking-tight">
                Expedition Complete!
              </h2>
              <p className="text-sm text-neutral-400 font-light">
                Here is your 5-Round Martian Surface Reconnaissance Summary
              </p>
            </div>

            {(() => {
              const rank = getExplorerRank(score)
              return (
                <div className="p-7 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3">
                  <p className="text-xs font-mono uppercase text-neutral-400">Total Score</p>
                  <p className="font-heading text-5xl font-black text-amber-400 tracking-tight">
                    {score.toLocaleString()} <span className="text-xl text-neutral-500 font-normal">/ 25,000</span>
                  </p>
                  <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 text-base font-semibold">
                    <span>{rank.icon}</span>
                    <span className={rank.color}>{rank.title}</span>
                  </div>
                </div>
              )
            })()}

            <div className="h-52 rounded-2xl overflow-hidden border border-white/15 relative">
              <MarsFlatMap
                playerGuess={null}
                revealedHistory={resultsHistory}
                interactive={false}
                showRegions={true}
              />
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {resultsHistory.map((res) => (
                <div
                  key={res.round}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-500 font-bold">#{res.round}</span>
                    <span className="font-medium text-white text-sm">{res.target.name}</span>
                  </div>
                  <div className="flex items-center gap-5 font-mono">
                    <span className="text-neutral-400">{res.distanceKm.toLocaleString()} km</span>
                    <span className="font-bold text-amber-400 text-sm">+{res.points} pts</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={downloadResultCard}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white font-heading font-semibold text-sm tracking-wide transition-all border border-white/10 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Result Card (PNG)</span>
            </button>

            <div className="flex items-center gap-4 pt-3">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2.5 py-4.5 rounded-2xl bg-[#ff6b35] hover:bg-[#ff7e4d] text-white font-heading font-bold text-base tracking-wide transition-all shadow-xl shadow-[#ff6b35]/30 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick()
                  onExitGame()
                }}
                className="flex-1 py-4.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-base tracking-wide transition-all cursor-pointer"
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
