/* =========================================================
   Mission Type Definitions
   MARS EXPLORER — NASA Space Apps Challenge 2026

   Mission types represent simulated astronaut marswalk
   mission planning exercises — not real NASA missions.
   ========================================================= */

import type { MarsCoordinates } from './observation'

export type MissionStatus =
  | 'planning'
  | 'ready'
  | 'active'
  | 'completed'
  | 'aborted'

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical'

export type MissionObjectiveType =
  | 'geological_survey'
  | 'sample_collection'
  | 'atmospheric_measurement'
  | 'infrastructure_deployment'
  | 'rescue_operation'
  | 'route_scouting'
  | 'training'

export interface MissionWaypoint {
  id: string
  label: string
  coordinates: MarsCoordinates
  /** Estimated time at waypoint in minutes */
  dwellTime: number
  objective?: string
  completed: boolean
}

export interface MissionResource {
  oxygenKg: number
  waterL: number
  foodRations: number
  powerKwh: number
  toolsManifest: string[]
}

export interface Mission {
  id: string
  title: string
  objective: string
  objectiveType: MissionObjectiveType
  status: MissionStatus
  priority: MissionPriority
  /** Starting location coordinates */
  start: MarsCoordinates & { label: string }
  /** Destination coordinates */
  destination: MarsCoordinates & { label: string }
  waypoints: MissionWaypoint[]
  /** Estimated duration in Martian hours */
  estimatedDurationHrs: number
  /** Estimated distance in kilometers */
  estimatedDistanceKm: number
  resources: MissionResource
  /** ISO 8601 planned start date/time */
  plannedStart: string
  crewSize: number
  notes: string
  /** This is a simulated mission, not a real NASA operation */
  isSimulated: true
}
