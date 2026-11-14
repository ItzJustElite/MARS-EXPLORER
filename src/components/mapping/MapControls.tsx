import { ZoomIn, ZoomOut, Crosshair, RotateCcw } from 'lucide-react'

interface MapControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onCenter?: () => void
  onReset?: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onCenter, onReset }: MapControlsProps) {
  const controls = [
    { icon: ZoomIn, label: 'Zoom in', action: onZoomIn },
    { icon: ZoomOut, label: 'Zoom out', action: onZoomOut },
    { icon: Crosshair, label: 'Center', action: onCenter },
    { icon: RotateCcw, label: 'Reset view', action: onReset },
  ]

  return (
    <div className="flex flex-col gap-1">
      {controls.map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={action}
          disabled={!action}
          aria-label={label}
          title={label}
          className="
            w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)]
            bg-[var(--color-bg-panel)] border border-[var(--color-border)]
            text-[var(--color-text-muted)]
            hover:border-[var(--color-border-accent)] hover:text-[var(--color-accent-primary)]
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
