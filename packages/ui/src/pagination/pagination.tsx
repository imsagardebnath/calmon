'use client'

import { useLayoutEffect, useRef, type ComponentPropsWithRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'

/** Page numbers to show, in order. "a" and "b" are the ellipses. Always 7 slots once there are more than 7 pages. */
function slotsOf(page: number, count: number): (number | 'a' | 'b')[] {
  const all = Array.from({ length: count }, (_, i) => i + 1)
  if (count <= 7) return all
  if (page <= 4) return [...all.slice(0, 5), 'b', count]
  if (page >= count - 3) return [1, 'a', ...all.slice(-5)]
  return [1, 'a', page - 1, page, page + 1, 'b', count]
}

const PAGE =
  'h-8 min-w-8 cursor-pointer rounded-control bg-transparent px-1 font-mono text-ui-sm text-fg-muted ' +
  'transition-colors duration-(--duration-fast) disabled:cursor-not-allowed disabled:text-fg-subtle disabled:opacity-50'
const HOVER = 'enabled:hover:bg-surface-sunken enabled:hover:text-fg'
const CURRENT = 'bg-surface-raised font-medium text-fg shadow-[0_0_0_1px_var(--border-strong),var(--shadow-1)]'

export type PaginationProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'defaultValue' | 'onChange'> & {
  /** Current page, starting at 1. Pass it with `onPageChange` to control the page. Default 1 (see `defaultPage`). */
  page?: number
  /** The page shown first, when uncontrolled. Default 1. */
  defaultPage?: number
  /** Called with the new page number when someone picks a page. */
  onPageChange?: (page: number) => void
  /** Rows per page. Used for the page count and the range text. Default 25. */
  pageSize?: number
  /** Total number of rows across all pages. Required: the range text always shows it. */
  total: number
}

/**
 * Moves through pages of a table or list, with a range summary such as "1–25 of 289".
 * Only worth it for long lists: under about 50 rows, show everything.
 */
export function Pagination({
  page,
  defaultPage = 1,
  onPageChange,
  pageSize = 25,
  total,
  className,
  ...props
}: PaginationProps) {
  const [value, setPage] = useControllable({ value: page, defaultValue: defaultPage, onChange: onPageChange })
  const size = Math.max(1, pageSize)
  const count = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, value), count)
  const from = total === 0 ? 0 : (current - 1) * size + 1
  const to = Math.min(current * size, total)

  const list = useRef<HTMLUListElement>(null)
  const stepped = useRef<HTMLButtonElement | null>(null)
  // Previous and Next disable themselves at the ends. When the one that was just pressed has done that, move
  // focus to the current page, so keyboard users keep their place instead of landing on the page body.
  useLayoutEffect(() => {
    const button = stepped.current
    stepped.current = null
    if (!button?.disabled) return
    const focused = document.activeElement
    if (focused === button || focused === document.body) {
      list.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
    }
  }, [current])

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center gap-1', className)} {...props}>
      <ul ref={list} className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={current <= 1}
            onClick={(e) => {
              stepped.current = e.currentTarget
              setPage(current - 1)
            }}
            className={cn(PAGE, HOVER, 'inline-flex items-center justify-center')}
          >
            <ChevronLeftIcon />
          </button>
        </li>
        {slotsOf(current, count).map((slot) =>
          typeof slot === 'string' ? (
            <li key={slot} aria-hidden="true" className="px-1 text-fg-subtle">
              …
            </li>
          ) : (
            <li key={slot}>
              <button
                type="button"
                aria-current={slot === current ? 'page' : undefined}
                onClick={() => setPage(slot)}
                className={cn(PAGE, slot === current ? CURRENT : HOVER)}
              >
                <span className="sr-only">Page </span>
                {slot}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={current >= count}
            onClick={(e) => {
              stepped.current = e.currentTarget
              setPage(current + 1)
            }}
            className={cn(PAGE, HOVER, 'inline-flex items-center justify-center')}
          >
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
      <span aria-live="polite" aria-atomic="true" className="ml-2 text-ui-sm text-fg-muted">
        {`${from}–${to} of ${total}`}
      </span>
    </nav>
  )
}
