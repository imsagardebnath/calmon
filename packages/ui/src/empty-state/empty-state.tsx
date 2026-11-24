'use client'

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '../lib/cn.ts'

export type EmptyStateProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** What is empty, said plainly: "No alerts in the last 24 hours". Rendered as a heading. Required. */
  title: string
  /** Icon or small illustration above the title. Decorative: hidden from screen readers. */
  icon?: ReactNode
  /** The next step, usually a `Button`. Offer the action that fills the empty area. */
  action?: ReactNode
  /** Level of the title heading (`h2` to `h6`). Pick the level that fits the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * Fills an empty area with what happened and what to do next. `children` is the explanation. Be direct:
 * don't apologise or joke.
 */
export function EmptyState({ title, icon, action, headingLevel = 3, className, children, ...props }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <div className={cn('flex flex-col items-center gap-2.5 rounded-card bg-surface-sunken px-6 py-10 text-center', className)} {...props}>
      {icon ? (
        <span aria-hidden="true" className="inline-flex text-fg-subtle">
          {icon}
        </span>
      ) : null}
      <Heading className="text-lg leading-[1.15] font-semibold tracking-[-0.018em]">{title}</Heading>
      {children ? <div className="max-w-[40ch] text-ui-sm leading-[1.55] text-fg-muted">{children}</div> : null}
      {action}
    </div>
  )
}
