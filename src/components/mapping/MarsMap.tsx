import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { MarsCoordinates } from '@/types/observation'
import { lonEastToLeaflet } from '@/lib/marsCoordinates'

interface MarkerData {
  id: string
  coordinates: MarsCoordinates
  label: string
  color?: string
}

interface MarsMapProps {
  className?: string
  center?: MarsCoordinates
  zoom?: number
  markers?: MarkerData[]
  onMapClick?: (coords: MarsCoordinates) => void
  onMarkerClick?: (id: string) => void
}

export function MarsMap({
  className = '',
  center,
  zoom = 2,
  markers = [],
  onMapClick,
  onMarkerClick,
}: MarsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      crs: L.CRS.EPSG4326,
      center: center
        ? [center.lat, lonEastToLeaflet(center.lon)]
        : [18.44, lonEastToLeaflet(77.45)],
      zoom,
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '<span style="color:#929AA3">⚠ PLACEHOLDER — Earth basemap shown. Real Mars tiles require NASA Trek integration. Source: NASA/JPL-Caltech (future)</span>',
      opacity: 0.3,
      maxZoom: 10,
    }).addTo(map)

    const placeholderPane = map.getPane('overlayPane')
    if (placeholderPane) {
      placeholderPane.style.zIndex = '400'
    }

    mapRef.current = map

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({
          lat: e.latlng.lat,
          lon: e.latlng.lng < 0 ? e.latlng.lng + 360 : e.latlng.lng,
        })
      })
    }

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers not in new list
    const newIds = new Set(markers.map((m) => m.id))
    markersRef.current.forEach((marker, id) => {
      if (!newIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add or update markers
    markers.forEach((m) => {
      const leafletLon = lonEastToLeaflet(m.coordinates.lon)

      if (markersRef.current.has(m.id)) return

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 10px; height: 10px;
            background: ${m.color ?? 'var(--color-accent-primary)'};
            border: 2px solid rgba(255,255,255,0.4);
            border-radius: 50%;
            box-shadow: 0 0 8px ${m.color ?? 'var(--color-accent-primary)'};
            cursor: pointer;
          "></div>
        `,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })

      const marker = L.marker([m.coordinates.lat, leafletLon], { icon })
        .bindTooltip(m.label, {
          permanent: false,
          direction: 'top',
          offset: [0, -8],
          className: 'mars-tooltip',
        })

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(m.id))
      }

      marker.addTo(map)
      markersRef.current.set(m.id, marker)
    })
  }, [markers, onMarkerClick])

  // Pan to center when it changes
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.panTo([center.lat, lonEastToLeaflet(center.lon)])
  }, [center])

  return (
    <div
      ref={containerRef}
      className={`bg-[var(--color-bg-primary)] ${className}`}
      aria-label="Martian map"
    />
  )
}
