'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'compact' | 'station'

export interface PikoreContextValue {
  /** The chosen theme. `system` follows the OS setting. */
  theme: Theme
  /** What is actually shown: `light` or `dark`. */
  resolvedTheme: 'light' | 'dark'
  /** Choose a theme. The choice is remembered in `localStorage` unless `storageKey` is `false`. */
  setTheme: (theme: Theme) => void
  /** The current density: `comfortable`, `compact` or `station`. */
  density: Density
  /** Change the density for the whole page. Not remembered between visits. */
  setDensity: (density: Density) => void
}

const PikoreContext = createContext<PikoreContextValue | null>(null)

export interface PikoreProviderProps {
  /** Initial theme. Default `system`. */
  theme?: Theme
  /** Initial density. Default `comfortable`. `station` is for wall displays. */
  density?: Density
  /** localStorage key to remember the chosen theme. Set to `false` to not persist. Default `"pikore-theme"`. */
  storageKey?: string | false
  /** Your app. The provider renders no element of its own. */
  children?: ReactNode
}

const read = (key: string | false): Theme | null => {
  if (!key) return null
  try {
    const v = localStorage.getItem(key)
    return v === 'light' || v === 'dark' || v === 'system' ? v : null
  } catch {
    return null
  }
}

/**
 * Applies the theme (class `dark` on `<html>`) and density (`data-density` on `<html>`) to the page,
 * so portalled content such as dialogs and popovers follows them too. Renders no DOM of its own.
 * Components also work without it (light theme, comfortable density).
 *
 * The first render uses the `theme` prop on the server and in the browser alike, so server-rendered
 * markup hydrates cleanly. The remembered choice is read after mount.
 */
export function PikoreProvider({
  theme: themeProp = 'system',
  density: densityProp = 'comfortable',
  storageKey = 'pikore-theme',
  children,
}: PikoreProviderProps) {
  // The remembered choice, `null` until it has been read after mount.
  const [chosen, setChosen] = useState<Theme | null>(null)
  const [density, setDensity] = useState<Density>(densityProp)
  // The OS preference, `null` until measured, so the `dark` class is never touched on a guess.
  const [systemDark, setSystemDark] = useState<boolean | null>(null)

  const theme = chosen ?? themeProp

  useEffect(() => setChosen(read(storageKey) ?? themeProp), [themeProp, storageKey])
  useEffect(() => setDensity(densityProp), [densityProp])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      // No way to ask: treat the system as light.
      setSystemDark(false)
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    // Wait for the remembered choice and, for `system`, the OS preference, so a `dark` class set before
    // hydration (for example by a no-flash script) is not removed and added back.
    if (chosen === null || (theme === 'system' && systemDark === null)) return
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [chosen, theme, systemDark, resolvedTheme])

  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])

  const setTheme = useCallback(
    (next: Theme) => {
      setChosen(next)
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next)
        } catch {
          /* storage unavailable: the choice still applies for this session */
        }
      }
    },
    [storageKey],
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, density, setDensity }),
    [theme, resolvedTheme, setTheme, density],
  )

  return <PikoreContext.Provider value={value}>{children}</PikoreContext.Provider>
}

/** Read and change the theme and density. Must be used inside `PikoreProvider`. */
export function usePikore(): PikoreContextValue {
  const ctx = useContext(PikoreContext)
  if (!ctx) throw new Error('usePikore must be used inside <PikoreProvider>.')
  return ctx
}
