// The card around one live demo in the component showcase (the design's `.bento > .card` with its `.cap` caption).
import type { ReactNode } from 'react'
import { componentHref, cx } from './_util.ts'

export function BentoCard({
  name,
  slug,
  note,
  className,
  children,
}: {
  /** Component name, shown as a link to its docs page. */
  name: string
  /** Folder name of the component, for the link. */
  slug: string
  /** What this demo shows, or its live state. Right side of the caption. */
  note?: ReactNode
  /** Grid placement, such as `min-[68.75rem]:col-span-5`. */
  className?: string
  children: ReactNode
}) {
  return (
    <article
      className={cx(
        'flex min-w-0 flex-col gap-5 rounded-[18px] bg-surface-raised p-4 shadow-[0_0_0_1px_var(--border),var(--shadow-1)] sm:p-6',
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-ui font-semibold">
          <a
            href={componentHref(slug)}
            className="text-fg no-underline decoration-fg-subtle underline-offset-4 hover:underline"
            aria-label={`${name} documentation`}
          >
            {name}
          </a>
        </h3>
        {note ? <span className="min-w-0 text-right text-ui-sm text-fg-subtle">{note}</span> : null}
      </header>
      {children}
    </article>
  )
}
