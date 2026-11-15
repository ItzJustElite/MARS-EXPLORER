import { useEffect, useRef, useState } from 'react'
import 'pannellum'
import 'pannellum/build/pannellum.css'
import {
  Maximize2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Camera,
  Satellite,
} from 'lucide-react'
import { LoadingState } from '@/components/ui/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { fetchNasaImageMetadata, type NasaImageMetadata } from '@/lib/nasaData'
import type { NasaPanoramaKind } from '@/data/nasaPanoramas'

interface PanoramaViewerProps {
  /** URL to the equirectangular panorama image. If null, shows placeholder. */
  src: string | null
  /** Display title of the panorama */
  title?: string
  /** Imagery credit line, e.g. "NASA/JPL-Caltech/MSSS" */
  credit?: string
  /** Capture or acquisition date (ISO date string) */
  captured?: string | null
  /** Surface rover mosaic or virtual orbital reconnaissance view */
  kind?: NasaPanoramaKind
  /** NASA Images API identifier, used to refresh live metadata */
  nasaId?: string | null
  /** Official source / documentation URL shown in the attribution badge */
  sourceUrl?: string
  /** Short provenance note shown under the title */
  note?: string
  /** Horizontal angle of view covered by the image (default 360) */
  haov?: number
  /** Vertical angle of view covered by the image (default 180) */
  vaov?: number
  /** Horizon offset for partial equirectangular images */
  horizonPitch?: number
  /** Initial horizontal field of view in degrees */
  hfov?: number
  /** Initial pitch in degrees */
  pitch?: number
  /** Initial yaw in degrees */
  yaw?: number
  /**
   * Hide the location title, note and NASA link. Used during an active
   * singleplayer round so the panorama's provenance cannot spoil the answer.
   * The imagery credit and type badge stay visible.
   */
  hideTitle?: boolean
  className?: string
}

export function PanoramaViewer({
  src,
  title,
  credit,
  captured,
  kind = 'surface',
  nasaId,
  sourceUrl,
  note,
  haov = 360,
  vaov = 180,
  horizonPitch = 0,
  hfov = 100,
  pitch = 0,
  yaw = 0,
  hideTitle = false,
  className = '',
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Pannellum.Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [liveMeta, setLiveMeta] = useState<NasaImageMetadata | null>(null)

  // Refresh the official title/credit from the NASA Images API. The actual
  // pixels stay same-origin; only the provenance metadata is fetched live.
  useEffect(() => {
    setLiveMeta(null)
    if (!nasaId || hideTitle) return

    let cancelled = false
    fetchNasaImageMetadata(nasaId).then((meta) => {
      if (!cancelled && meta) setLiveMeta(meta)
    })

    return () => {
      cancelled = true
    }
  }, [nasaId, hideTitle])

  useEffect(() => {
    if (!src || !containerRef.current) {
      setIsLoading(false)
      return
    }

    if (!window.pannellum) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    // Destroy previous viewer if it exists
    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = null
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const viewer = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: src,
        autoLoad: true,
        haov,
        vaov,
        horizonPitch,
        hfov,
        pitch,
        yaw,
        minHfov: 25,
        maxHfov: 120,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        showControls: false,
        mouseZoom: true,
        draggable: true,
        backgroundColor: [8, 10, 14],
        hotSpots: [],
      })

      viewer.on('load', () => setIsLoading(false))
      viewer.on('error', () => {
        setHasError(true)
        setIsLoading(false)
      })

      viewerRef.current = viewer
    } catch {
      setHasError(true)
      setIsLoading(false)
    }

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [src, haov, vaov, horizonPitch, hfov, pitch, yaw, reloadNonce])

  if (!src) {
    return (
      <div
        className={`relative bg-[var(--color-bg-primary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 mars-grid" />
        <LoadingState
          type="coming-soon"
          message="Panorama Not Available"
          description="Panoramic imagery for this observation requires NASA data integration. This feature will display official rover imagery when configured."
        />
        <div className="absolute top-3 left-3">
          <Badge variant="warning" size="sm" dot>Placeholder</Badge>
        </div>
      </div>
    )
  }

  const displayTitle = hideTitle ? undefined : liveMeta?.title ?? title
  const displayCredit = liveMeta?.credit ?? credit
  const displayCaptured = hideTitle ? null : liveMeta?.dateCreated ?? captured ?? null
  const attributionUrl = hideTitle ? undefined : liveMeta?.pageUrl ?? sourceUrl
  const isOrbital = kind === 'orbital'

  return (
    <div
      className={`relative bg-[#080a0e] rounded-[var(--radius-lg)] overflow-hidden ${className}`}
    >
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]">
          <LoadingState type="loading" message="Loading NASA panorama..." />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] gap-3">
          <AlertTriangle className="w-8 h-8 text-[var(--color-status-error)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Failed to load panorama</p>
          <button
            onClick={() => setReloadNonce((value) => value + 1)}
            className="text-xs font-semibold text-[#ff8754] hover:text-[#ff6b35] underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              backdrop-blur-md border text-[10px] font-mono font-bold tracking-[0.18em] uppercase
              ${
                isOrbital
                  ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30'
                  : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
              }
            `}
          >
            {isOrbital ? <Satellite className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
            {isOrbital ? 'Orbital Recon' : 'NASA 360° Surface'}
          </span>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            className="
              w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center
              bg-[rgba(9,11,14,0.72)] border border-white/20 backdrop-blur-md
              text-[var(--color-text-muted)] hover:text-white
              transition-colors duration-150
            "
            onClick={() => setReloadNonce((value) => value + 1)}
            aria-label="Reload panorama"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            className="
              w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center
              bg-[rgba(9,11,14,0.72)] border border-white/20 backdrop-blur-md
              text-[var(--color-text-muted)] hover:text-white
              transition-colors duration-150
            "
            onClick={() => containerRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isLoading && !hasError && (displayTitle || displayCredit) && (
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-gradient-to-t from-black/85 via-black/55 to-transparent pt-16 pb-3 px-4">
          <div className="min-w-0">
            {displayTitle && (
              <p className="text-white text-sm font-semibold leading-snug line-clamp-1">
                {displayTitle}
              </p>
            )}
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate max-w-full">
                {!hideTitle && note ? `${note} · ` : ''}
                {displayCredit}
                {displayCaptured ? ` · ${displayCaptured}` : ''}
              </span>
              {(attributionUrl) && (
                <a
                  href={attributionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-[9px] font-mono text-neutral-200 tracking-wider uppercase transition-colors"
                >
                  NASA
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
