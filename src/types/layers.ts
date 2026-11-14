/* =========================================================
   Scientific Layer Type Definitions
   MARS EXPLORER — NASA Space Apps Challenge 2026
   ========================================================= */

import type { DataSource, LayerCategory } from './observation'

export interface ScientificLayer {
  id: string
  name: string
  shortName: string
  category: LayerCategory
  description: string
  /** Primary NASA/ESA data source */
  source: DataSource
  /** Physical unit of measurement (e.g., 'meters', 'K', 'wt%') */
  units: string
  /** Ground sample distance (e.g., '25 cm/px', '18 m/px') */
  resolution: string
  /** ISO 8601 observation or processing date */
  observationDate: string
  /** Whether tile data is currently available in the app */
  available: boolean
  /** URL to original dataset or documentation */
  sourceUrl?: string
  /** Color ramp minimum value */
  rangeMin?: number
  /** Color ramp maximum value */
  rangeMax?: number
  /** Whether layer is scientifically verified or illustrative */
  isVerified: boolean
  opacity: number
}

export interface LayerGroup {
  id: string
  label: string
  category: LayerCategory
  layers: ScientificLayer[]
}
