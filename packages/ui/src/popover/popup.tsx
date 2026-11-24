'use client'

/* Shared by Popover, Menu and Tooltip: Floating UI, a portal, and dismissal. Internal. */

import { arrow, autoUpdate, flip, offset, shift, useFloating, type Placement, type UseFloatingReturn } from '@floating-ui/react-dom'
import { cloneElement, useCallback, useEffect, useState, type ReactElement, type ReactNode, type Ref, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export type Side = 'top' | 'bottom' | 'start' | 'end'

const SIDE = { top: 'top', bottom: 'bottom', start: 'left', end: 'right' } as const

/** `side` is physical: `start` is always the left edge and `end` the right, in any text direction. `align` is Floating UI's, so it follows the text direction. */
export const placementOf = (side: Side, align?: 'start' | 'end') =>
  (align ? `${SIDE[side]}-${align}` : SIDE[side]) as Placement

/** The trigger element (Floating UI types it as possibly virtual; ours never is). */
export const triggerOf = (refs: UseFloatingReturn['refs']) => refs.reference.current as HTMLElement | null

function setRef<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === 'function') ref(el)
  else if (ref) ref.current = el
}

/** One callback ref that fills two refs. */
export function useMergedRef<T>(a: Ref<T> | undefined, b: Ref<T> | undefined) {
  return useCallback(
    (el: T | null) => {
      setRef(a, el)
      setRef(b, el)
    },
    [a, b],
  )
}

/** The trigger, cloned with a ref and extra props. Handlers run after the trigger's own. */
export function cloneTrigger(trigger: ReactElement, ref: Ref<HTMLElement>, props: Record<string, unknown>) {
  const own = trigger.props as Record<string, unknown>
  const merged: Record<string, unknown> = { ref }
  for (const key in props) {
    const a = own[key]
    const b = props[key]
    merged[key] =
      typeof a === 'function' && typeof b === 'function'
        ? (e: unknown) => {
            a(e)
            b(e)
          }
        : b
  }
  return cloneElement(trigger as ReactElement<Record<string, unknown>>, merged)
}

/** Fixed positioning (never clipped), no transform (enter animations use it), flip and shift to stay on screen. */
export function usePopup(open: boolean, placement: Placement, arrowRef?: RefObject<HTMLElement | null>) {
  return useFloating({
    open,
    placement,
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 }), ...(arrowRef ? [arrow({ element: arrowRef, padding: 6 })] : [])],
  })
}

/** Selector for a popup (Popover, Menu), which carries `data-popup`, so that a popup opened inside it can be portaled into it. */
export const POPUP = '[data-popup]'

/**
 * Into the nearest enclosing <dialog> (a modal makes the rest of the page inert) or popup, so that a Menu
 * or Popover opened inside a Popover is inside it in the DOM too and does not count as "outside" it.
 * Else <body> (inherits `dark` from <html>).
 */
export function Portal({ anchor, children }: { anchor: Element | null; children: ReactNode }) {
  const [root, setRoot] = useState<Element | null>(null)
  useEffect(() => setRoot(anchor?.closest(`dialog, ${POPUP}`) ?? document.body), [anchor])
  return root ? createPortal(children, root) : null
}

/**
 * While open: Escape calls `close(true)`, a pointer-down outside the popup and trigger calls `close(false)`.
 * `true` means refocus the trigger. With popups nested, Escape closes only the innermost one.
 */
export function useDismiss(
  open: boolean,
  refs: UseFloatingReturn['refs'],
  close: (refocus: boolean) => void,
  outside = true,
) {
  useEffect(() => {
    if (!open) return
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (refs.floating.current?.contains(t) || triggerOf(refs)?.contains(t))
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // A popup nested inside this one is closed first: it is either still open in our DOM, or it has just
      // handled this key (it ran before us) and prevented its default.
      if (e.defaultPrevented || refs.floating.current?.querySelector(POPUP)) return
      e.preventDefault() // an Escape that closes a popup must not also close a dialog around it
      close(true)
    }
    const onDown = (e: PointerEvent) => {
      if (!inside(e.target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    if (outside) document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, refs, close, outside])
}
