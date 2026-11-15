/**
 * Landing-region outlines drawn on the flat map during singleplayer.
 *
 * Coordinates and extents are approximate published landing-site regions,
 * not exact target coordinates, so the map aids orientation without turning
 * the game into a click-the-label exercise.
 */
export interface SurfaceRegion {
  id: string
  name: string
  mission: string
  lat: number
  lon: number
  /** Half-extent in degrees of latitude. */
  latRadius: number
  /** Half-extent in degrees of longitude. */
  lonRadius: number
  color: string
}

export const SURFACE_REGIONS: SurfaceRegion[] = [
  { id: 'jezero', name: 'Jezero Crater', mission: 'Perseverance', lat: 18.4447, lon: 77.4508, latRadius: 4.5, lonRadius: 4.5, color: '#34d399' },
  { id: 'gale', name: 'Gale Crater', mission: 'Curiosity', lat: -4.5895, lon: 137.4417, latRadius: 5.5, lonRadius: 5.5, color: '#60a5fa' },
  { id: 'meridiani', name: 'Meridiani Planum', mission: 'Opportunity', lat: -1.9462, lon: -5.5266, latRadius: 6.0, lonRadius: 6.0, color: '#fbbf24' },
  { id: 'gusev', name: 'Gusev Crater', mission: 'Spirit', lat: -14.5684, lon: 175.4729, latRadius: 5.0, lonRadius: 5.0, color: '#f472b6' },
  { id: 'ares', name: 'Ares Vallis', mission: 'Pathfinder', lat: 19.13, lon: -33.22, latRadius: 5.5, lonRadius: 5.5, color: '#fb923c' },
  { id: 'chryse', name: 'Chryse Planitia', mission: 'Viking 1', lat: 22.27, lon: -49.97, latRadius: 6.0, lonRadius: 6.0, color: '#a78bfa' },
  { id: 'vastitas', name: 'Vastitas Borealis', mission: 'Phoenix', lat: 68.22, lon: -125.75, latRadius: 5.0, lonRadius: 5.0, color: '#22d3ee' },
]
