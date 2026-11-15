import {
  Mountain,
  Circle,
  Waves,
  Snowflake,
  MapPin,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  volcano: Mountain,
  canyon: Waves,
  crater: Circle,
  rover_site: MapPin,
  ice_cap: Snowflake,
  outflow: Waves,
  feature: MapPin,
}

export function PoiCategoryIcon({
  category,
  className,
}: {
  category: string
  className?: string
}) {
  const Icon = ICONS[category] ?? MapPin
  return <Icon className={className} />
}

export function poiCategoryColor(category: string): string {
  switch (category) {
    case 'volcano':
      return '#f97316'
    case 'canyon':
      return '#38bdf8'
    case 'crater':
      return '#a78bfa'
    case 'rover_site':
      return '#34d399'
    case 'ice_cap':
      return '#67e8f9'
    case 'outflow':
      return '#fbbf24'
    default:
      return '#94a3b8'
  }
}
