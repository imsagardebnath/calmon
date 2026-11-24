'use client'

import { useState, type ComponentPropsWithRef } from 'react'
import { ChevronRightIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'

export type BreadcrumbItem = {
  /** Text of the crumb. */
  label: string
  /** Where the crumb links to. Leave it out for the current page, or for a level that has no page. */
  href?: string
}

export type BreadcrumbsProps = Omit<ComponentPropsWithRef<'nav'>, 'children'> & {
  /** The path, from the top level down. The last item is the current page. */
  items: BreadcrumbItem[]
  /** Most crumbs to show. A longer path keeps the first and the last ones and collapses the middle into a "…" button. Default 4. */
  maxItems?: number
}

const focusOnMount = (el: HTMLElement | null) => el?.focus()

const CRUMB = 'rounded-[4px] text-fg-muted no-underline'

/**
 * Shows where the current page sits in a hierarchy. The last item is the current page.
 * Start with the environment, for example Production, so people always know where they are.
 */
export function Breadcrumbs({ items, maxItems = 4, className, ...props }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false)
  const long = items.length > maxItems
  const tail = Math.max(1, maxItems - 2)
  const slots = items.map((item, at) => ({ item, at }))
  const shown = long && !expanded ? [...slots.slice(0, 1), { item: null, at: -1 }, ...slots.slice(-tail)] : slots

  return (
    <nav aria-label="Breadcrumb" className={cn('text-ui-sm text-fg-muted', className)} {...props}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        {shown.map(({ item, at }, i) => {
          const last = i === shown.length - 1
          // After expanding, move focus to the first crumb that appeared, since the "…" button is gone.
          const revealed = long && expanded && at === 1
          return (
            <li key={at} className="inline-flex items-center gap-1.5">
              {item === null ? (
                <button
                  type="button"
                  title={items.slice(1, -tail).map((c) => c.label).join(' / ')}
                  onClick={() => setExpanded(true)}
                  className={cn(CRUMB, 'cursor-pointer bg-transparent px-1 hover:text-fg')}
                >
                  <span aria-hidden="true">…</span>
                  <span className="sr-only">Show all breadcrumbs</span>
                </button>
              ) : item.href ? (
                <a
                  href={item.href}
                  aria-current={last ? 'page' : undefined}
                  ref={revealed ? focusOnMount : undefined}
                  className={cn(CRUMB, 'hover:text-fg', last && 'font-[550] text-fg')}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  ref={revealed ? focusOnMount : undefined}
                  tabIndex={revealed ? -1 : undefined}
                  className={cn(last && 'font-[550] text-fg')}
                >
                  {item.label}
                </span>
              )}
              {last ? null : <ChevronRightIcon className="size-3.5 text-border-strong" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
