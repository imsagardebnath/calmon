'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react'
import { Badge, ToneIcon } from '../badge/badge.tsx'
import { Button } from '../button/index.ts'
import { IconButton } from '../icon-button/index.ts'
import { XIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { toneOf, type Intent, type Severity } from '../lib/tone.ts'
import { ProgressBar } from '../progress-bar/index.ts'
import { SPIN_RING } from '../spinner/spinner.tsx'

/** The one action a toast can carry, such as Undo. Pressing it also dismisses the toast. */
export type ToastAction = {
  /** Button text. Use a verb: "Undo", "View group". */
  label: string
  /** Called when the button is pressed. */
  onClick?: () => void
}

export type ToastProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** Colour and icon. Critical and caution toasts are announced at once (`role="alert"`). Wins over `intent`. Default `normal`. */
  severity?: Severity
  /** Familiar colour names: `primary`, `secondary`, `success`, `warning`, `danger`. Same as the matching severity. */
  intent?: Intent
  /** What happened, using the action's verb: Publish becomes "Published". Required. */
  title: string
  /** One or two sentences of detail under the title. */
  description?: ReactNode
  /**
   * Milliseconds before the toast leaves. `0` keeps it open until dismissed. Default 5000; critical toasts default to 0.
   * Used by `toast()`: a plain `Toast` does not time itself out (`timer` only draws the countdown bar).
   */
  duration?: number
  /** Icon before the title. Defaults to the severity icon; pass `false` to hide it or a node to replace it. Decorative. */
  icon?: ReactNode | false
  /** Replaces the icon with a spinner, for work in progress. Pair it with `progress` or a later update. */
  loading?: boolean
  /** Shows a progress bar under the text, from 0 to 100. With `toast()`, call it again with the same `id` to move the bar. */
  progress?: number
  /** One action, such as Undo. A toast shown with `toast()` is dismissed when the action is pressed. */
  action?: ToastAction
  /**
   * A repeat with the same key updates the existing toast, adds to its `×n` count, restarts its timer and
   * moves it to the front, instead of stacking another. Use it to fight alarm fatigue.
   * Used by `toast()`: a plain `Toast` ignores it (set `count` to show the badge).
   */
  dedupeKey?: string
  /** Called when the close button is pressed. The close button only shows when this is set. */
  onDismiss?: () => void
  /** Accessible name of the close button. Default `Dismiss`. */
  dismissLabel?: string
  /** Shows a `×n` badge: how many times this message happened. Shown when above 1. */
  count?: number
  /** Inverted look (dark in light mode) for plain confirmations such as "Copied to clipboard". */
  solid?: boolean
  /** Draws a bar that shrinks over this many milliseconds, showing when the toast leaves. Hover or focus pauses it. */
  timer?: number
}

/**
 * One toast, as a plain component. Use it for docs and previews; in an app call `useToast()` from a
 * `ToastProvider`, which positions, times, merges and announces toasts for you.
 */
export function Toast({
  severity,
  intent,
  title,
  description,
  duration: _duration, // `toast()` reads these two; keep them off the DOM element.
  dedupeKey: _dedupeKey,
  icon,
  loading,
  progress,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  count = 1,
  solid,
  timer,
  className,
  ...props
}: ToastProps) {
  const tone = toneOf(severity, intent, 'normal')
  return (
    <div
      role={tone === 'critical' || tone === 'caution' ? 'alert' : 'status'}
      data-tone={tone}
      className={cn(
        'group/toast relative flex w-[360px] max-w-full items-start gap-3 overflow-hidden rounded-[12px] px-4 py-3.5',
        solid ? 'bg-fg text-surface shadow-high' : 'bg-surface-raised text-fg shadow-[0_0_0_1px_var(--border),var(--shadow-3)]',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span aria-hidden="true" className={cn('mt-px size-[18px] shrink-0 border-2', SPIN_RING)} />
      ) : (
        <ToneIcon tone={tone} icon={icon} size={18} className={cn('mt-px', solid ? 'text-surface' : 'text-tone-fg')} />
      )}
      <div className="min-w-0 flex-1">
        <strong className="block font-semibold">
          {title}
          {count > 1 ? <Badge className="ml-1">×{count}</Badge> : null}
        </strong>
        {description ? (
          <div className={cn('mt-0.5 text-ui-sm leading-[1.45]', solid ? 'text-[color-mix(in_oklab,var(--surface),transparent_30%)]' : 'text-fg-muted')}>
            {description}
          </div>
        ) : null}
        {progress !== undefined ? <ProgressBar value={progress} severity={severity} intent={intent} aria-label={title} className="mt-2.5" /> : null}
        {action ? (
          <div className="mt-2.5 flex gap-1.5">
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>
      {onDismiss ? (
        <IconButton variant="ghost" size="sm" label={dismissLabel} icon={<XIcon />} onClick={onDismiss} className="-mt-1 -mr-1.5" />
      ) : null}
      {timer ? (
        <span
          // Keyed so a new timer or a merged repeat restarts the bar. Hidden under reduced motion.
          key={`${timer}:${count}`}
          aria-hidden="true"
          className={cn(
            'absolute bottom-0 left-0 h-0.5 animate-[calmon-bar_linear_forwards] opacity-50 motion-reduce:hidden',
            'group-focus-within/toast:[animation-play-state:paused] group-hover/toast:[animation-play-state:paused]',
            solid ? 'bg-surface' : 'bg-tone-fg',
          )}
          style={{ animationDuration: `${timer}ms` }}
        />
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Provider and hook                                                   */
/* ------------------------------------------------------------------ */

/** What `toast()` takes: the `Toast` fields below (their docs live on `ToastProps`) plus an `id`. */
export type ToastOptions = Pick<
  ToastProps,
  'severity' | 'intent' | 'title' | 'description' | 'duration' | 'action' | 'dedupeKey' | 'icon' | 'loading' | 'progress' | 'solid'
> & {
  /** Updates the toast with this id in place instead of adding one: use it for progress. Generated when omitted. */
  id?: string
}

export type ToastApi = {
  /** Shows a toast, or updates a matching one (same `id` or `dedupeKey`). Returns the toast's id. */
  toast: (options: ToastOptions) => string
  /** Dismisses one toast by id. */
  dismiss: (id: string) => void
  /** Dismisses every toast. */
  dismissAll: () => void
}

export type ToastProviderProps = {
  /** The app (or the part of it) that can call `useToast()`. */
  children?: ReactNode
  /** How many toasts show at once. Older ones tuck behind the newest and wait their turn. Default 3. */
  limit?: number
  /** Accessible name of the notification area. Default `Notifications`. */
  label?: string
  /** Extra classes for the fixed notification area (bottom right). */
  className?: string
}

type Item = { id: string; count: number; leaving?: boolean; opts: ToastOptions }

/** True when focus shows its ring, i.e. it got there by keyboard. Mouse users losing focus to <body> is harmless. */
function isKeyboardFocus(el: Element): boolean {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true // An engine without :focus-visible: assume the keyboard, so focus is never lost.
  }
}

const Context = createContext<ToastApi | null>(null)

/** Read the toast API. Must be used inside a `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(Context)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.')
  return api
}

/**
 * Where each toast sits in the collapsed pile, newest first: full size, then tucked behind. The last entry
 * serves every toast deeper than the third (a `limit` above 3): out of sight, directly behind it.
 */
const PILE = [
  'z-30 self-end',
  'z-20 self-start -translate-y-[18px] scale-95 opacity-80 max-h-14',
  'z-10 self-start -translate-y-9 scale-90 opacity-55 max-h-14',
  'z-0 self-start -translate-y-9 scale-90 opacity-0 max-h-14',
]

function ToastItem({
  item,
  depth,
  limit,
  open,
  dismiss,
}: {
  item: Item
  depth: number
  limit: number
  open: boolean
  dismiss: (id: string) => void
}) {
  const { id, count, leaving, opts } = item
  const duration = opts.duration ?? (toneOf(opts.severity, opts.intent, 'normal') === 'critical' ? 0 : 5000)
  const visible = depth < limit
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const left = useRef(duration)

  // The timer starts when a toast becomes visible, is restarted by a repeat, and pauses on hover and focus.
  useEffect(() => {
    left.current = duration
  }, [duration, count, visible])
  useEffect(() => {
    if (!duration || !visible || leaving || hover || focus) return
    const start = Date.now()
    const timer = setTimeout(() => dismiss(id), left.current)
    return () => {
      clearTimeout(timer)
      left.current = Math.max(left.current - (Date.now() - start), 800)
    }
  }, [duration, count, visible, leaving, hover, focus, id, dismiss])

  // Beyond the limit a toast waits, hidden, until the ones in front leave.
  const placement = !visible ? 'hidden' : open ? '' : (PILE[Math.min(depth, PILE.length - 1)] ?? '')
  return (
    <Toast
      severity={opts.severity}
      intent={opts.intent}
      title={opts.title}
      description={opts.description}
      icon={opts.icon}
      loading={opts.loading}
      progress={opts.progress}
      solid={opts.solid}
      count={count}
      timer={visible && !leaving ? duration : 0}
      action={
        opts.action && {
          label: opts.action.label,
          onClick: () => {
            opts.action?.onClick?.()
            dismiss(id)
          },
        }
      }
      onDismiss={() => dismiss(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false)
      }}
      className={cn(
        'pointer-events-auto col-start-1 row-start-1 w-full origin-top transition-[translate,scale,opacity] duration-(--duration-base)',
        leaving ? 'pointer-events-none animate-calmon-toast-out' : 'animate-calmon-pop',
        placement,
      )}
    />
  )
}

/**
 * Renders the notification area (bottom right, a polite live region) and provides `useToast()`.
 * Put one near the root of your app. Up to `limit` toasts show as a pile with the newest in front;
 * hover or focus spreads the pile out so every toast can be read and dismissed.
 */
export function ToastProvider({ children, limit = 3, label = 'Notifications', className }: ToastProviderProps) {
  const [items, setItems] = useState<Item[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<Item[]>(items)
  const seq = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const area = useRef<HTMLDivElement>(null)
  // What had focus before it moved into the notification area: where focus goes back to when the toasts are gone.
  const before = useRef<HTMLElement | null>(null)
  // Set when a toast is removed while a keyboard user has focus inside the area. See the effect below.
  const regain = useRef(false)

  const commit = useCallback((next: Item[]) => {
    ref.current = next
    setItems(next)
  }, [])

  // With nothing left on screen the pile is no longer hovered or focused, even if no leave event fired.
  useEffect(() => {
    if (items.length === 0) setOpen(false)
  }, [items.length])

  // A toast that is removed while it has focus (its Undo or Dismiss was pressed) would drop focus to <body>.
  // Hand it to the next toast instead, or back to where it was before it entered the notification area.
  useEffect(() => {
    const el = area.current
    if (!regain.current || !el) return
    regain.current = false
    if (el.contains(document.activeElement)) return
    el.children[ref.current.findIndex((i) => !i.leaving)]?.querySelector('button')?.focus()
    if (!el.contains(document.activeElement) && before.current?.isConnected) before.current.focus()
  }, [items])

  useEffect(() => {
    const all = timers.current
    return () => all.forEach(clearTimeout)
  }, [])

  const toast = useCallback(
    (opts: ToastOptions) => {
      const live = ref.current.filter((i) => !i.leaving)
      const byId = opts.id ? live.find((i) => i.id === opts.id) : undefined
      const match = byId ?? (opts.dedupeKey ? live.find((i) => i.opts.dedupeKey === opts.dedupeKey) : undefined)
      if (!match) {
        const id = opts.id ?? `calmon-toast-${++seq.current}`
        // A toast with this id may still be playing its exit animation: drop it, so the id (the React key) stays unique.
        commit([{ id, count: 1, opts }, ...ref.current.filter((i) => i.id !== id)])
        return id
      }
      // Same id: update in place. Same dedupeKey: update, count the repeat and bring it to the front.
      const next: Item = { ...match, opts: { ...match.opts, ...opts }, count: match === byId ? match.count : match.count + 1 }
      commit(match === byId ? ref.current.map((i) => (i === match ? next : i)) : [next, ...ref.current.filter((i) => i !== match)])
      return match.id
    },
    [commit],
  )

  // Marks toasts as leaving (the exit animation), then removes them.
  const leave = useCallback(
    (pick: (id: string) => boolean) => {
      commit(ref.current.map((i) => (pick(i.id) ? { ...i, leaving: true } : i)))
      const t = setTimeout(() => {
        timers.current.delete(t)
        const active = document.activeElement
        if (active && area.current?.contains(active) && isKeyboardFocus(active)) regain.current = true
        commit(ref.current.filter((i) => !(i.leaving && pick(i.id))))
      }, 200)
      timers.current.add(t)
    },
    [commit],
  )
  const dismiss = useCallback((id: string) => leave((i) => i === id), [leave])
  const dismissAll = useCallback(() => leave(() => true), [leave])
  const api = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll])

  return (
    <Context value={api}>
      {children}
      <div
        ref={area}
        role="region"
        aria-label={label}
        aria-live="polite"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) before.current = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : null
          setOpen(true)
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
        }}
        className={cn(
          'pointer-events-none fixed right-5 bottom-5 z-120 w-[380px] max-w-[calc(100vw-40px)]',
          open ? 'flex flex-col-reverse gap-2.5' : 'grid',
          className,
        )}
      >
        {items.map((item, depth) => (
          <ToastItem key={item.id} item={item} depth={depth} limit={limit} open={open} dismiss={dismiss} />
        ))}
      </div>
    </Context>
  )
}
