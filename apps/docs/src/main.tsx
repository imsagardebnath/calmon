import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CalmonProvider, type Density } from '@calmon/react/provider'
import { App } from './App.tsx'
import { DENSITY_KEY } from './site/config.ts'
import './styles.css'

function savedDensity(): Density {
  try {
    const d = localStorage.getItem(DENSITY_KEY)
    if (d === 'compact' || d === 'station' || d === 'comfortable') return d
  } catch {
    /* storage unavailable */
  }
  return 'comfortable'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Dark by default; the choice is remembered in localStorage ("calmon-theme"). */}
    <CalmonProvider theme="dark" density={savedDensity()}>
      <App />
    </CalmonProvider>
  </StrictMode>,
)
