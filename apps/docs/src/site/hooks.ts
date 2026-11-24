import { useCallback, useEffect, useRef, useState } from 'react'
import { BASE } from './config.ts'

/** Copy text to the clipboard. `copied` is true for two seconds afterwards. */
export function useCopy() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }, [])
  return { copied, copy }
}

export interface PropDoc {
  name: string
  type: string
  required: boolean
  default: string | null
  description: string
}
interface CatalogueComponent {
  slug: string
  props: PropDoc[]
}
interface Catalogue {
  components: CatalogueComponent[]
}

let catalogue: Promise<Catalogue | null> | undefined

/** components.json, fetched once (`npm run agent-docs` generates it). Resolves to null when it is missing. */
export function loadCatalogue(): Promise<Catalogue | null> {
  catalogue ??= fetch(`${BASE}components.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Catalogue>) : null))
    .catch(() => null)
  return catalogue
}

/** The props of one component: `undefined` while loading, `null` when the catalogue or the component is missing. */
export function useProps(slug: string): PropDoc[] | null | undefined {
  const [state, setState] = useState<{ slug: string; props: PropDoc[] | null } | undefined>()
  useEffect(() => {
    let live = true
    loadCatalogue().then((c) => {
      if (live) setState({ slug, props: c?.components.find((x) => x.slug === slug)?.props ?? null })
    })
    return () => {
      live = false
    }
  }, [slug])
  return state?.slug === slug ? state.props : undefined
}

/** Fetch a text file published next to the site. Resolves to null when it is missing. */
export function useTextFile(path: string): string | null | undefined {
  const [state, setState] = useState<{ path: string; text: string | null } | undefined>()
  useEffect(() => {
    let live = true
    fetch(`${BASE}${path}`)
      .then((r) => (r.ok ? r.text() : null))
      .catch(() => null)
      .then((text) => {
        if (live) setState({ path, text })
      })
    return () => {
      live = false
    }
  }, [path])
  return state?.path === path ? state.text : undefined
}

const RECENT_KEY = 'calmon-docs-recent'

export function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as unknown
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function pushRecent(id: string) {
  try {
    const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 8)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
}
