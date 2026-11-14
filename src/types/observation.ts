/* =========================================================
   Observation Type Definitions
   MARS EXPLORER — NASA Space Apps Challenge 2026

   These types represent rover and orbital observations.
   All scientific data must be clearly attributed and
   distinguished from illustrative placeholders.
   ========================================================= */

export type PanoramaType = 'equirectangular' | 'cubemap' | 'multires' | 'placeholder'

export type DataSource =
  | 'NASA_PDS'           // NASA Planetary Data System
  | 'NASA_MRO'           // Mars Reconnaissance Orbiter
  | 'NASA_HIRISE'        // High Resolution Imaging Science Experiment
  | 'NASA_CRISM'         // Compact Reconnaissance Imaging Spectrometer
  | 'NASA_MOLA'          // Mars Orbiter Laser Altimeter
  | 'NASA_PERSEVERANCE'  // Perseverance Rover
  | 'NASA_CURIOSITY'     // Curiosity Rover
  | 'NASA_OPPORTUNITY'   // Opportunity Rover (archived)
  | 'ESA_HRSC'           // ESA Mars Express HRSC
  | 'PLACEHOLDER'        // Illustrative, not real scientific data

export type Rover =
  | 'Perseverance'
  | 'Curiosity'
  | 'Opportunity'
  | 'Spirit'
  | 'InSight'
  | 'None'

export type InstrumentType =
  | 'Mastcam-Z'
  | 'SuperCam'
  | 'MEDA'
  | 'RIMFAX'
  | 'PIXL'
  | 'SHERLOC'
  | 'Mastcam'
  | 'ChemCam'
  | 'HiRISE'
  | 'CRISM'
  | 'CTX'
  | 'Navcam'
  | 'Hazcam'
  | 'Placeholder'

export type LayerCategory =
  | 'topography'
  | 'mineralogy'
  | 'thermal'
  | 'radar'
  | 'imagery'
  | 'atmosphere'
  | 'radiation'

export interface MarsCoordinates {
  /** Areocentric latitude (degrees, positive north) */
  lat: number
  /** East longitude (degrees, 0–360) */
  lon: number
}

export interface AvailableLayer {
  layerId: string
  name: string
  dataSource: DataSource
  resolution?: string
}

export interface Observation {
  id: string
  name: string
  rover: Rover
  instrument: InstrumentType
  /** Martian solar day since landing */
  sol: number
  coordinates: MarsCoordinates
  /** Path or URL to panorama image; null if not available */
  panorama: string | null
  panoramaType: PanoramaType
  description: string
  dataSources: DataSource[]
  /** ISO 8601 date string of the Earth observation date */
  observationDate: string
  availableLayers: AvailableLayer[]
  /** True if data is real NASA observation; false if placeholder */
  isVerified: boolean
  /** URL to original NASA source, if applicable */
  sourceUrl?: string
  region: string
}
