import { useEffect, useState, useTransition } from 'react'

/** Hash routes: `#/` is the landing page, `#/docs/<id>` a docs page, optionally with `#<anchor>` after it. */
export type Route =
  | { kind: 'home' }
  | { kind: 'docs'; id: string; anchor: string }
  | { kind: 'missing'; path: string }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [path = '', rest = ''] = raw.split('#')
  let anchor = rest
  try {
    anchor = decodeURIComponent(rest)
  } catch {
    /* keep the raw anchor */
  }
  if (path === '' || path === '/') return { kind: 'home' }
  if (/^\/docs\/?$/.test(path)) return { kind: 'docs', id: 'introduction', anchor }
  const docs = /^\/docs\/([\w-]+)\/?$/.exec(path) ?? /^\/([\w-]+)\/?$/.exec(path) // "#/button" is an older link form
  if (docs) return { kind: 'docs', id: docs[1]!, anchor }
  return { kind: 'missing', path }
}

export const docsHref = (id: string, anchor?: string) => `#/docs/${id}${anchor ? `#${anchor}` : ''}`

export function navigate(href: string) {
  window.location.hash = href.replace(/^#/, '')
}

/**
 * The current route. Updates inside a transition, so the old page stays up while a new one loads;
 * `pending` is true meanwhile (the shell shows a thin progress bar).
 */
export function useRoute(): { route: Route; pending: boolean } {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [pending, startTransition] = useTransition()
  useEffect(() => {
    const onHash = () => startTransition(() => setRoute(parseHash(window.location.hash)))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return { route, pending }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scroll an element into view below the sticky header. Retries briefly while a lazy page is still loading. */
export function scrollToAnchor(anchor: string, smooth = false) {
  let tries = 0
  const attempt = () => {
    const el = document.getElementById(anchor)
    if (el) el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto', block: 'start' })
    else if (tries++ < 240) requestAnimationFrame(attempt)
  }
  attempt()
}
