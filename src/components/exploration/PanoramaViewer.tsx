import { useEffect, useRef, useState } from 'react'
import { Maximize2, RefreshCw, AlertTriangle } from 'lucide-react'
import { LoadingState } from '@/components/ui/LoadingState'
import { Badge } from '@/components/ui/Badge'

interface PanoramaViewerProps {
  /** URL to the equirectangular panorama image. If null, shows placeholder. */
  src: string | null
  /** Display title of the panorama */
  title?: string
  /** Initial horizontal field of view in degrees */
  hfov?: number
  /** Initial pitch in degrees */
  pitch?: number
  /** Initial yaw in degrees */
  yaw?: number
  className?: string
}

export function PanoramaViewer({
  src,
  title,
  hfov = 100,
  pitch = 0,
  yaw = 0,
  className = '',
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Pannellum.Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
        hfov,
        pitch,
        yaw,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        showControls: false,
        mouseZoom: true,
        draggable: true,
        compass: false,
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
  }, [src, hfov, pitch, yaw])

  if (!src) {
    return (
      <div
        className={`relative bg-[var(--color-bg-primary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 mars-grid" />
        <LoadingState
          type="coming-soon"
          message="Panorama Not Available"
          description="Panoramic imagery for this observation requires NASA PDS data integration. This feature will display actual rover imagery when configured."
        />
        <div className="absolute top-3 left-3">
          <Badge variant="warning" size="sm" dot>Placeholder</Badge>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative bg-[var(--color-bg-primary)] rounded-[var(--radius-lg)] overflow-hidden ${className}`}
    >
      {/* Pannellum container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]">
          <LoadingState type="loading" message="Loading panorama..." />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] gap-3">
          <AlertTriangle className="w-8 h-8 text-[var(--color-status-error)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Failed to load panorama</p>
        </div>
      )}

      {/* Controls overlay */}
      {!isLoading && !hasError && (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            className="
              w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center
              bg-[rgba(9,11,14,0.7)] border border-[var(--color-border)]
              text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
              transition-colors duration-150
            "
            onClick={() => {
              viewerRef.current?.destroy()
              setIsLoading(true)
            }}
            aria-label="Reload panorama"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            className="
              w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center
              bg-[rgba(9,11,14,0.7)] border border-[var(--color-border)]
              text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
              transition-colors duration-150
            "
            onClick={() => containerRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Title overlay */}
      {title && !isLoading && !hasError && (
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-mono text-[var(--color-text-muted)] bg-[rgba(9,11,14,0.7)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            {title}
          </span>
        </div>
      )}
    </div>
  )
}
