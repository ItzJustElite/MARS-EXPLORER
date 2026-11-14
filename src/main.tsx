import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'
import { AppRouter } from './app/router'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
