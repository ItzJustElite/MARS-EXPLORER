# MARS EXPLORER
## NASA Space Apps Challenge 2026 — Interplanetary Survival Guide: Martian Map

> An interactive planetary exploration and mission-planning platform combining NASA scientific observations with geographical discovery and simulated astronaut operations.

---

## Overview

MARS EXPLORER is a browser-based platform for exploring Mars through:

- **GeoGuessr-inspired location discovery** using actual Martian regions
- **NASA rover panoramic imagery** (Mastcam-Z, Mastcam) via Pannellum 360° viewer
- **Interactive Martian atlas** with Leaflet mapping and NASA scientific layers
- **Simulated astronaut mission planning** with route optimization and resource tracking
- **Scientific data archive** with NASA PDS attribution and source links

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Routing | React Router DOM |
| Maps | Leaflet + React Leaflet |
| Panoramas | Pannellum |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |

## Project Structure

```
src/
  app/           # Router and app entry
  components/
    layout/      # AppLayout, Sidebar, Topbar
    ui/          # Button, Panel, Badge, LoadingState
    exploration/ # PanoramaViewer, ObservationCard
    mapping/     # MarsMap, MapControls, LayerControls
    missions/    # MissionCard, MissionStatus
  pages/         # Dashboard, Explore, Atlas, MissionPlanner, Archive
  data/          # JSON data files (observations, missions, layers)
  hooks/         # Custom React hooks
  lib/           # Business logic utilities
  types/         # TypeScript interfaces
  styles/        # Global CSS
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## Environment Variables

Copy `.env.example` to `.env` and configure optional NASA API keys:

```bash
cp .env.example .env
```

The application runs fully without any API keys. See `.env.example` for details.

## Scientific Integrity

This project maintains strict scientific integrity:

- **Verified observations** are sourced from NASA PDS with traceable source URLs
- **Placeholder records** are clearly marked with `isVerified: false` and `PLACEHOLDER` data source
- **Simulated missions** are explicitly marked with `isSimulated: true`
- **No scientific data is fabricated** — pending integrations are marked as "Integration Pending"
- Mars coordinates use the IAU areocentric convention (latitude ±90°, east longitude 0–360°)

## Data Sources

- NASA Mars 2020 / Perseverance: [mars.nasa.gov/mars2020](https://mars.nasa.gov/mars2020/)
- NASA MSL / Curiosity: [mars.nasa.gov/msl](https://mars.nasa.gov/msl/)
- HiRISE / MRO: [hirise.lpl.arizona.edu](https://hirise.lpl.arizona.edu/)
- CRISM: [crism.jhuapl.edu](https://crism.jhuapl.edu/)
- MOLA: [pds-geosciences.wustl.edu](https://pds-geosciences.wustl.edu/missions/mgs/mola.html)
- NASA Trek (Mars): [trek.nasa.gov/mars](https://trek.nasa.gov/mars/)
- NASA Open APIs: [api.nasa.gov](https://api.nasa.gov/)

## License

Built for the NASA Space Apps Challenge 2026. All NASA data is used in accordance with NASA's open data policy.
