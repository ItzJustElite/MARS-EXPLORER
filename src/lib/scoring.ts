/**
 * Scoring Utilities — GeoGuessr-inspired Mars Location Discovery
 * MARS EXPLORER — NASA Space Apps Challenge 2026
 *
 * Scoring is based on distance from the actual location.
 * Uses Mars great-circle distance.
 */

import { marsGreatCircleKm } from './marsCoordinates'

/** Maximum distance for any score (km) — roughly 1/4 of Mars circumference */
const MAX_SCORE_DISTANCE_KM = 5340

/** Maximum points for a perfect guess */
const MAX_POINTS = 5000

/**
 * Calculate exploration score based on how close the guess was
 * to the actual Martian location.
 *
 * Score formula inspired by GeoGuessr:
 * score = MAX_POINTS * e^(-distance / decay)
 * where decay controls how quickly points fall off with distance.
 */
export function calculateLocationScore(
  guessLat: number,
  guessLon: number,
  actualLat: number,
  actualLon: number,
): number {
  const distance = marsGreatCircleKm(guessLat, guessLon, actualLat, actualLon)
  const decay = MAX_SCORE_DISTANCE_KM / 5
  const score = MAX_POINTS * Math.exp(-distance / decay)
  return Math.round(Math.max(0, Math.min(MAX_POINTS, score)))
}

/** Score tier labels */
export function getScoreTier(score: number): { label: string; color: string } {
  if (score >= 4500) return { label: 'PERFECT LANDING', color: '#4ADE80' }
  if (score >= 3500) return { label: 'EXCELLENT', color: '#86EFAC' }
  if (score >= 2500) return { label: 'GOOD', color: '#D97742' }
  if (score >= 1500) return { label: 'FAIR', color: '#FBBF24' }
  if (score >= 500) return { label: 'POOR', color: '#F87171' }
  return { label: 'LOST IN SPACE', color: '#6B7280' }
}

/** Format distance for human display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString()} km`
}
