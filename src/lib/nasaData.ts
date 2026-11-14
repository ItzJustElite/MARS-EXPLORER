/**
 * NASA Data Integration Utilities
 * MARS EXPLORER — NASA Space Apps Challenge 2026
 *
 * Placeholder module for future NASA API integrations.
 * All public NASA APIs are free to use and do not require
 * API keys for basic access (some have optional keys for
 * higher rate limits).
 */

/** NASA Mars Rover Photos API base URL */
export const NASA_ROVER_API = 'https://api.nasa.gov/mars-photos/api/v1/rovers'

/** NASA Mars Weather API (InSight) base URL — Note: InSight mission ended Dec 2022 */
export const NASA_INSIGHT_API = 'https://api.nasa.gov/insight_weather/'

/** NASA PDS Geosciences Node */
export const NASA_PDS_GEOSCIENCES = 'https://pds-geosciences.wustl.edu'

/** USGS Astrogeology ISIS Maps API */
export const USGS_MARS_TILES = 'https://trek.nasa.gov/mars'

/**
 * Get the NASA API key from environment variables.
 * Returns 'DEMO_KEY' if not configured (limited rate).
 * Never hardcode API keys in source code.
 */
export function getNasaApiKey(): string {
  return import.meta.env['VITE_NASA_API_KEY'] ?? 'DEMO_KEY'
}

/**
 * Build Mars rover photos API URL.
 * Future implementation will fetch real Mastcam-Z imagery.
 *
 * @param rover - Rover name (perseverance, curiosity, opportunity, spirit)
 * @param sol - Martian solar day
 * @param camera - Camera identifier
 */
export function buildRoverPhotosUrl(
  rover: string,
  sol: number,
  camera?: string,
): string {
  const key = getNasaApiKey()
  const cameraParam = camera ? `&camera=${camera}` : ''
  return `${NASA_ROVER_API}/${rover.toLowerCase()}/photos?sol=${sol}${cameraParam}&api_key=${key}`
}

/**
 * Data attribution string for display in the UI.
 * Always attribute NASA data properly.
 */
export const NASA_ATTRIBUTION = 'Data sources: NASA/JPL-Caltech, USGS Astrogeology Science Center, ESA'

/** Placeholder indicating a future API integration point */
export const INTEGRATION_PENDING = '[INTEGRATION PENDING — Requires NASA API connection]'
