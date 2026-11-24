// Layout pieces shared by the landing sections. Underscore files are not routes.
import type { ReactNode } from 'react'
import { cx } from './_util.ts'

/** A full-width band with the design's `.lsec` spacing and a 1180px column. */
export function Section({
  id,
  tone = 'surface',
  className,
  children,
  label,
  flush = false,
}: {
  id?: string
  tone?: 'surface' | 'sunken'
  className?: string
  children: ReactNode
  /** Accessible name of the region when it has no visible heading. */
  label?: string
  /** Drops the vertical padding, for slim bands. */
  flush?: boolean
}) {
  return (
    <section
      id={id}
      aria-label={label}
      aria-labelledby={label || !id ? undefined : `${id}-title`}
      className={cx(
        'scroll-mt-16 border-t border-border px-5 sm:px-8',
        !flush && 'py-16 sm:py-24',
        tone === 'sunken' && 'bg-surface-sunken',
        className,
      )}
    >
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </section>
  )
}

/** The design's section heading (`.lsec h2` and `.lede`). */
export function SectionHead({ id, title, lede, className }: { id?: string; title: ReactNode; lede?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2
        id={id ? `${id}-title` : undefined}
        className="max-w-[18ch] text-[clamp(1.875rem,1.4rem+2vw,2.25rem)] leading-[1.05] tracking-[-0.035em]"
      >
        {title}
      </h2>
      {lede ? <p className="mt-4 max-w-[46ch] text-lg leading-[1.6] text-fg-muted">{lede}</p> : null}
    </div>
  )
}
