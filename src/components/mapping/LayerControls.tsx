import { Layers, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { ScientificLayer } from '@/types/layers'
import { Badge } from '@/components/ui/Badge'

interface LayerControlsProps {
  layers: ScientificLayer[]
  activeLayers: Set<string>
  onToggleLayer: (layerId: string) => void
}

const categoryLabels: Record<string, string> = {
  topography: 'Topography',
  mineralogy: 'Mineralogy',
  thermal: 'Thermal',
  radar: 'Radar',
  imagery: 'Imagery',
  atmosphere: 'Atmosphere',
  radiation: 'Radiation',
}

export function LayerControls({ layers, activeLayers, onToggleLayer }: LayerControlsProps) {
  const [expanded, setExpanded] = useState(true)

  const grouped = layers.reduce<Record<string, ScientificLayer[]>>((acc, layer) => {
    const cat = layer.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(layer)
    return acc
  }, {})

  return (
    <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="
          w-full flex items-center gap-2 px-3 py-2.5
          border-b border-[var(--color-border)]
          text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)]
          transition-colors duration-150
        "
      >
        <Layers className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-medium flex-1 text-left">Scientific Layers</span>
        <Badge variant="muted" size="sm">{activeLayers.size} active</Badge>
      </button>

      {expanded && (
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {Object.entries(grouped).map(([category, categoryLayers]) => (
            <div key={category} className="p-2">
              <p className="text-[9px] font-mono tracking-widest uppercase text-[var(--color-text-disabled)] px-1 mb-1.5">
                {categoryLabels[category] ?? category}
              </p>
              <div className="space-y-1">
                {categoryLayers.map((layer) => {
                  const isActive = activeLayers.has(layer.id)
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onToggleLayer(layer.id)}
                      disabled={!layer.available}
                      title={layer.available ? layer.description : `${layer.description} — Integration pending`}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)]
                        text-left transition-colors duration-150
                        ${layer.available
                          ? isActive
                            ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent-primary)]'
                            : 'hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                          : 'opacity-40 cursor-not-allowed text-[var(--color-text-disabled)]'
                        }
                      `}
                    >
                      {isActive && layer.available ? (
                        <Eye className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <EyeOff className="w-3 h-3 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{layer.shortName}</p>
                        <p className="text-[9px] font-mono text-[var(--color-text-disabled)] truncate">
                          {layer.source}
                        </p>
                      </div>
                      {!layer.available && (
                        <Badge variant="muted" size="sm">Soon</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
