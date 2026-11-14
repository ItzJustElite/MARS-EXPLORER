/**
 * Mars Coordinate Utilities
 * MARS EXPLORER — NASA Space Apps Challenge 2026
 *
 * Mars uses areocentric coordinates:
 * - Latitude: degrees north (+) / south (-)
 * - Longitude: 0–360° east (IAU convention)
 *
 * Mars mean radius: 3,389.5 km (IAU 2015)
 */

export const MARS_RADIUS_KM = 3389.5

/** Convert east longitude (0–360) to -180/+180 for Leaflet */
export function lonEastToLeaflet(lonEast: number): number {
  return lonEast > 180 ? lonEast - 360 : lonEast
}

/** Convert Leaflet longitude (-180/+180) to east longitude (0–360) */
export function leafletLonToEast(lon: number): number {
  return lon < 0 ? lon + 360 : lon
}

/**
 * Calculate great-circle distance between two Martian coordinates
 * using the Haversine formula with Mars mean radius.
 * Returns distance in kilometers.
 */
export function marsGreatCircleKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * MARS_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/** Format areocentric coordinates for display */
export function formatMarsCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonLabel = `${lon.toFixed(4)}°E`
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${lonLabel}`
}

/**
 * Major regions of Mars with representative coordinates.
 * Source: IAU planetary nomenclature / USGS Astrogeology.
 */
export const MARS_REGIONS = [
  { id: 'jezero', name: 'Jezero Crater', lat: 18.4446, lon: 77.4509, description: 'Perseverance rover landing site. Ancient lake delta.' },
  { id: 'gale', name: 'Gale Crater', lat: -4.5895, lon: 137.4417, description: 'Curiosity rover site. Layered sedimentary mound.' },
  { id: 'olympus', name: 'Olympus Mons', lat: 18.65, lon: 226.2, description: "Solar system's largest volcano (~21 km height)." },
  { id: 'valles', name: 'Valles Marineris', lat: -13.9, lon: 301.9, description: 'Canyon system >4,000 km long, up to 7 km deep.' },
  { id: 'hellas', name: 'Hellas Planitia', lat: -42.7, lon: 70.5, description: 'Giant impact basin. Highest surface air pressure on Mars.' },
  { id: 'tharsis', name: 'Tharsis Plateau', lat: 0.0, lon: 245.0, description: 'Volcanic plateau home to multiple shield volcanoes.' },
  { id: 'arcadia', name: 'Arcadia Planitia', lat: 46.7, lon: 192.0, description: 'Northern plains. Candidate for near-surface ice deposits.' },
  { id: 'isidis', name: 'Isidis Planitia', lat: 12.9, lon: 87.0, description: 'Large impact basin. InSight lander operating area.' },
] as const

export type MarsRegionId = (typeof MARS_REGIONS)[number]['id']
