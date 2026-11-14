/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NASA_API_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_MARS_TILE_SERVER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
