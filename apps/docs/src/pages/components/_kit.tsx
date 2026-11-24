// Building blocks for the component gallery: a live, non-interactive, scaled preview of a component's first
// example, an error boundary so one broken example never breaks the page, and the card around them.
// Underscore files are not routes.
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Badge } from '@openvanta/calmon-react/badge'
import type { DocEntry } from '../../registry.ts'

/** Categories whose components carry the safety patterns. They get a "Signature" badge and a filter. */
export const SIGNATURE_CATEGORIES: readonly string[] = ['Monitoring', 'Safety']

export const isSignature = (e: Pick<DocEntry, 'category'>) => SIGNATURE_CATEGORIES.includes(e.category)

/* ------------------------------------------------------------------------------------------------
 * Error boundary
 * ---------------------------------------------------------------------------------------------- */

interface BoundaryProps {
  /** Shown instead of the children when they throw while rendering. */
  fallback: ReactNode
  children: ReactNode
}

/** A broken example shows a quiet placeholder. It never takes the rest of the page down with it. */
export class PreviewBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ------------------------------------------------------------------------------------------------
 * Preview
 * ---------------------------------------------------------------------------------------------- */

/** Never shrink below this, so text stays legible. Anything larger is cropped by the frame. */
const MIN_SCALE = 0.5
/** Breathing room inside the preview area, in px, on each axis. */
const GUTTER = 28

/** True once the element has come near the viewport (and stays true). Previews render lazily. */
function useSeen<T extends Element>(ref: RefObject<T | null>): boolean {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (items) => {
        if (items.some((i) => i.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '240px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen])
  return seen
}

/** Centres its children, and scales them down (never below MIN_SCALE, never above 1) so they fit the frame. */
function Fit({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const b = box.current
    const i = inner.current
    if (!b || !i) return
    const fit = () => {
      const w = i.offsetWidth
      const h = i.offsetHeight
      if (!w || !h) return
      const next = Math.max(MIN_SCALE, Math.min(1, (b.clientWidth - GUTTER) / w, (b.clientHeight - GUTTER) / h))
      setScale(Math.round(next * 100) / 100)
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(fit)
    ro.observe(b)
    ro.observe(i)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="relative size-full">
      <div
        ref={inner}
        className="absolute top-1/2 left-1/2 w-max max-w-[640px] min-w-[240px] origin-center"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * The live preview of a component's first example. It is `inert` (nothing inside can be focused or clicked),
 * hidden from assistive technology (the card's text says everything), and drawn with its real styles.
 */
export function Preview({ entry }: { entry: DocEntry }) {
  const frame = useRef<HTMLDivElement>(null)
  const seen = useSeen(frame)
  const Example = entry.examples[0]?.Component

  return (
    <div
      ref={frame}
      inert
      aria-hidden="true"
      className="pointer-events-none relative m-1.5 mb-0 grid h-[140px] place-items-center overflow-hidden rounded-[11px] bg-surface shadow-[inset_0_0_0_1px_var(--border)] select-none"
    >
      {Example && seen ? (
        <PreviewBoundary fallback={<span className="font-mono text-xs text-fg-subtle">No preview</span>}>
          <Fit>
            <Example />
          </Fit>
        </PreviewBoundary>
      ) : Example ? null : (
        <span className="font-mono text-xs text-fg-subtle">No example yet</span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Card
 * ---------------------------------------------------------------------------------------------- */

/**
 * One component in the gallery. The whole card is the link (a stretched link on the name), and the preview sits
 * beside it rather than inside it, so previews that contain links or buttons are still valid HTML.
 */
export function ComponentCard({ entry }: { entry: DocEntry }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-[0_0_0_1px_var(--border),var(--shadow-1)] transition-[box-shadow,transform] duration-(--duration-base) ease-calmon hover:-translate-y-px hover:shadow-[0_0_0_1px_var(--border-strong),var(--shadow-2)]">
      <Preview entry={entry} />
      <div className="flex flex-1 flex-col gap-0.5 px-3.5 pt-3 pb-3.5">
        <b className="flex items-center gap-2 text-ui font-semibold">
          <a
            href={`#/docs/${entry.slug}`}
            className="text-fg no-underline after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
          >
            {entry.name}
          </a>
          {isSignature(entry) ? <Badge intent="primary">Signature</Badge> : null}
        </b>
        <span className="line-clamp-2 text-ui-sm text-fg-muted">{entry.description}</span>
      </div>
    </div>
  )
}
