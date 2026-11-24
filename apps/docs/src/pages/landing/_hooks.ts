// Small hooks for the landing page's live demos.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** True when the visitor asked for reduced motion. Live demos then stop moving, and the ECG line is drawn at once. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(QUERY)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}

const utc = () => `${new Date().toISOString().slice(11, 19)} UTC`

/** The current UTC time as "14:32:07 UTC", ticking every second. */
export function useUtcClock(): string {
  const [time, setTime] = useState(utc)
  useEffect(() => {
    const id = setInterval(() => setTime(utc()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

/** Calls `tick` every `ms` milliseconds while `active` is true. The latest `tick` is always the one called. */
export function useInterval(tick: () => void, ms: number, active = true) {
  const saved = useRef(tick)
  saved.current = tick
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [ms, active])
}

/** A small deterministic random generator, so the same service always gets the same history. */
export function seeded(seed: string): () => number {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Opens the site search (the docs CommandPalette) by sending the shortcut it listens for. */
export function openSiteSearch() {
  const mac = /mac|iphone|ipad/i.test(navigator.platform)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: !mac, metaKey: mac, bubbles: true }))
}
