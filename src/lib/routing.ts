/**
 * Application Routing Constants
 * MARS EXPLORER — NASA Space Apps Challenge 2026
 */

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  ATLAS: '/atlas',
  MISSIONS: '/missions',
  ARCHIVE: '/archive',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export interface NavItem {
  path: AppRoute
  label: string
  shortLabel: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: ROUTES.HOME, label: 'Command Center', shortLabel: 'Command', icon: 'LayoutDashboard' },
  { path: ROUTES.EXPLORE, label: 'Surface Reconnaissance', shortLabel: 'Explore', icon: 'ScanEye' },
  { path: ROUTES.ATLAS, label: 'Martian Atlas', shortLabel: 'Atlas', icon: 'Globe' },
  { path: ROUTES.MISSIONS, label: 'Mission Planner', shortLabel: 'Missions', icon: 'Route' },
  { path: ROUTES.ARCHIVE, label: 'Scientific Archive', shortLabel: 'Archive', icon: 'Archive' },
]
