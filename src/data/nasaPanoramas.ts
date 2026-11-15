/**
 * Typed access to the NASA panorama catalogue built by
 * `scripts/build-nasa-panoramas.mjs`.
 *
 * Every panorama in the catalogue is either:
 *  - `surface`: an official NASA/JPL rover or lander mosaic resolved through the
 *    NASA Image and Video Library API, or
 *  - `orbital`: a virtual 360° view projected from the official NASA Mars Trek
 *    global mosaic (Viking MDIM 2.1), used only by the globe exploration view.
 *
 * Singleplayer guessing rounds are built exclusively from the `surface` entries
 * (see `SURFACE_ROUNDS`), so orbital imagery can never appear as a guess target.
 *
 * Run `node scripts/build-nasa-panoramas.mjs` to (re)generate the manifest.
 */
import {
  NASA_PANORAMAS,
  NASA_PANORAMAS_GENERATED_AT,
  NASA_CARD_IMAGES,
  type NasaPanoramaKind,
  type NasaPanoramaSource,
  type NasaCardImageSource,
} from './nasaPanoramas.generated'

export { NASA_PANORAMAS, NASA_PANORAMAS_GENERATED_AT, NASA_CARD_IMAGES }
export type { NasaPanoramaKind, NasaPanoramaSource, NasaCardImageSource }

/** A single ground-level guessing round. */
export interface SurfaceRound {
  /** Stable id shared with the panorama manifest. */
  id: string
  /** Full display name, e.g. "Bright Angel — Jezero Crater". */
  name: string
  /** Landing region the rover was operating in. */
  siteId: string
  siteName: string
  /** Feature the rover was parked at, e.g. "Bright Angel". */
  locationLabel: string
  lat: number
  lon: number
  /** One-line field hint shown behind the Hint button. */
  clue: string
  /** Short mission highlight shown on the debrief screen. */
  highlight: string
  /** Keywords used for the live NASA PDS archive lookup. */
  pdsKeywords: string
  source: NasaPanoramaSource
}

/** Look up the official NASA panorama for a point of interest. */
export function getNasaPanorama(poiId: string): NasaPanoramaSource | undefined {
  return NASA_PANORAMAS[poiId]
}

/** Look up the official NASA still image used by info cards. */
export function getNasaCardImage(poiId: string): NasaCardImageSource | undefined {
  return NASA_CARD_IMAGES[poiId]
}

/**
 * All ground-level rover/lander panoramas, ready to be used as singleplayer
 * guess targets. Orbital reconnaissance entries are filtered out here.
 */
export const SURFACE_ROUNDS: SurfaceRound[] = Object.values(NASA_PANORAMAS)
  .filter(
    (source): source is NasaPanoramaSource & {
      lat: number
      lon: number
      siteId: string
      siteName: string
      clue: string
      highlight: string
      pdsKeywords: string
    } =>
      source.kind === 'surface' &&
      typeof source.lat === 'number' &&
      typeof source.lon === 'number' &&
      typeof source.siteName === 'string',
  )
  .map((source) => ({
    id: source.poiId,
    name: source.name ?? source.siteName,
    siteId: source.siteId,
    siteName: source.siteName,
    locationLabel: source.locationLabel ?? source.siteName,
    lat: source.lat,
    lon: source.lon,
    clue: source.clue,
    highlight: source.highlight,
    pdsKeywords: source.pdsKeywords,
    source,
  }))

/** Human-readable label for the imagery type shown in badges. */
export function panoramaKindLabel(kind: NasaPanoramaKind | undefined): string {
  return kind === 'orbital' ? 'ORBITAL RECON' : 'NASA 360° SURFACE'
}

/** Short provenance line, e.g. "NASA/JPL-Caltech/MSSS · PIA25407". */
export function panoramaCreditLine(source: NasaPanoramaSource | undefined): string {
  if (!source) return ''
  return `${source.credit} · ${source.nasaId ?? 'Mars Trek WMTS'}`
}

/** Human-facing NASA page for the source imagery. */
export function panoramaPageUrl(source: NasaPanoramaSource | undefined): string | undefined {
  if (!source) return undefined
  return source.nasaId
    ? `https://images.nasa.gov/details-${source.nasaId}`
    : 'https://trek.nasa.gov/mars/'
}
