import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Mark the document when running inside Tauri desktop app
if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
  document.documentElement.setAttribute('data-tauri', '')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
