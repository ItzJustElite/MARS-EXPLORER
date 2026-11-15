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

/** NASA Image and Video Library search API (public, CORS-enabled). */
export const NASA_IMAGES_API = 'https://images-api.nasa.gov/search'

export interface NasaImageMetadata {
  nasaId: string
  title: string
  description: string
  credit: string
  center: string
  dateCreated: string | null
  pageUrl: string
}

/**
 * Refresh provenance metadata for a single NASA Images API asset.
 *
 * The panorama files are bundled locally for reliable loading, but their titles
 * and credits are resolved from the live API so the UI always shows the current
 * official description. Failures are non-fatal: callers keep the build-time
 * metadata they already have.
 */
export async function fetchNasaImageMetadata(
  nasaId: string,
  { timeoutMs = 6000 }: { timeoutMs?: number } = {},
): Promise<NasaImageMetadata | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(
      `${NASA_IMAGES_API}?nasa_id=${encodeURIComponent(nasaId)}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return null

    const json = (await response.json()) as {
      collection?: {
        items?: Array<{
          data?: Array<Record<string, unknown>>
          href?: string
        }>
      }
    }

    const item = json.collection?.items?.[0]
    const data = item?.data?.[0]
    if (!data) return null

    return {
      nasaId,
      title: typeof data['title'] === 'string' ? data['title'] : nasaId,
      description: typeof data['description'] === 'string' ? data['description'] : '',
      credit:
        (typeof data['secondary_creator'] === 'string' && data['secondary_creator']) ||
        (typeof data['center'] === 'string' && data['center']) ||
        'NASA/JPL-Caltech',
      center: typeof data['center'] === 'string' ? data['center'] : 'NASA',
      dateCreated:
        typeof data['date_created'] === 'string'
          ? data['date_created'].slice(0, 10)
          : null,
      pageUrl: `https://images.nasa.gov/details-${nasaId}`,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Data attribution string for display in the UI.
 * Always attribute NASA data properly.
 */
export const NASA_ATTRIBUTION = 'Data sources: NASA/JPL-Caltech, USGS Astrogeology Science Center, ESA'

export const INTEGRATION_PENDING = '[INTEGRATION PENDING — Requires NASA API connection]'
