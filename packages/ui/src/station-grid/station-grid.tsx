'use client'

import type { ComponentPropsWithRef, MouseEvent } from 'react'
import { SeverityIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITIES, SEVERITY_LABEL, bySeverityDesc, type Severity } from '../lib/tone.ts'
import { Sparkline } from '../sparkline/index.ts'

/** One entity in a station grid: a service, a patient bed, a site. */
export type StationItem = {
  /** Stable key for the entity. */
  id: string
  /** Name shown on the tile. Keep it short: it is cut off with an ellipsis when it does not fit. */
  name: string
  /** The big number, usually a 0 to 100 health score. */
  score: number
  /** How bad it is. Sets the icon, the colour and the severity word on the tile. */
  severity: Severity
  /** One line under the number, such as "Errors 4.2% · 23 alerts grouped". Default none. */
  detail?: string
  /** Recent values for the small trend line, oldest first. Default none. */
  data?: number[]
  /** Makes the tile a link. */
  href?: string
  /** Called when the tile is clicked. Makes the tile a button, or runs in addition to `href`. Wins over the grid's `onSelect`. */
  onSelect?: (item: StationItem) => void
}

const TILE =
  'relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-[12px] border border-border bg-surface-raised px-3.5 py-3 text-left text-fg no-underline ' +
  'shadow-[0_1px_2px_rgb(16_24_40/.03)] transition-shadow duration-(--duration-fast)'

/** The 3px rule down the left edge of a tile that is not normal. */
const RULE = "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-tone before:content-['']"

/** Critical tiles get a tinted face and a ring that pulses once in a while. Reduced motion turns the pulse off. */
const CRITICAL =
  "border-tone-border bg-tone-soft after:pointer-events-none after:absolute after:inset-0 after:rounded-[12px] after:opacity-0 after:animate-calmon-crit after:shadow-[inset_0_0_0_1px_var(--critical)] after:content-[''] motion-reduce:after:animate-none"

const CLICKABLE = 'cursor-pointer hover:shadow-mid'

export type StationTileProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> &
  Omit<StationItem, 'id' | 'onSelect'> & {
    /** Called when the tile is clicked. Makes the tile a button, or runs in addition to `href`. */
    onSelect?: () => void
    /** Extra classes for the tile. */
    className?: string
  }

/**
 * One tile of a StationGrid: severity icon and name, the score, a trend line and one line of detail.
 * It is a link with `href`, a button with `onSelect`, and a plain group otherwise. Its accessible name
 * carries the name, the severity word, the score and the detail. Other props, including `ref`, go on the
 * root element, so a tile can take `id`, `data-*` and `aria-*` (an `aria-label` replaces the generated name).
 */
export function StationTile({
  name,
  score,
  severity,
  detail,
  data,
  href,
  onSelect,
  className,
  onClick,
  ...props
}: StationTileProps) {
  const normal = severity === 'normal'
  const common = {
    'data-tone': severity,
    'aria-label': `${name}, ${SEVERITY_LABEL[severity]}, score ${score}${detail ? `, ${detail}` : ''}`,
    className: cn(
      TILE,
      !normal && RULE,
      severity === 'critical' && CRITICAL,
      (href || onSelect) && CLICKABLE,
      className,
    ),
  }
  // The root is an <a>, a <button> or a <div>: the click handler runs the caller's onClick, then onSelect.
  const click = (e: MouseEvent<HTMLElement>) => {
    onClick?.(e as MouseEvent<HTMLDivElement>)
    onSelect?.()
  }
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-[7px]">
        <SeverityIcon severity={severity} width={14} height={14} className="text-tone-fg" />
        <span className="truncate text-[12.5px] font-[550] text-fg">{name}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn('num text-numeral-md leading-[.9]', normal ? 'text-fg' : 'text-tone-fg')}>{score}</span>
        {data && data.length > 1 && (
          <Sparkline
            data={data}
            severity={normal ? undefined : severity}
            intent={normal ? 'secondary' : undefined}
            aria-hidden="true"
            className="h-[26px] w-[72px]"
          />
        )}
      </div>
      {(!normal || detail) && (
        <div className="truncate text-[11.5px] text-fg-muted">
          {!normal && <span className="font-semibold text-tone-fg">{SEVERITY_LABEL[severity]}</span>} {detail}
        </div>
      )}
    </>
  )

  if (href)
    return (
      <a href={href} {...common} {...(props as unknown as ComponentPropsWithRef<'a'>)} onClick={click}>
        {content}
      </a>
    )
  if (onSelect)
    return (
      <button type="button" {...common} {...(props as unknown as ComponentPropsWithRef<'button'>)} onClick={click}>
        {content}
      </button>
    )
  return (
    <div role="group" {...common} {...props} onClick={onClick}>
      {content}
    </div>
  )
}

export type StationGridProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> & {
  /** The entities to show, in any order. Each needs a score and a severity. */
  items: StationItem[]
  /** Order of the tiles. `worst-first` puts the most severe first, then the lowest score. `name` is A to Z. Default `worst-first`. */
  sort?: 'worst-first' | 'name'
  /** Fixed number of columns. By default the grid fits as many tiles as the width allows. */
  columns?: number
  /** Accessible name of the list of tiles, such as "Production services". Default `Stations`. */
  label?: string
  /** Shows the count line above the grid, such as "2 critical, 3 caution, 11 normal". Default `true`. */
  summary?: boolean
  /** Called when a tile without its own `onSelect` is clicked. Makes every tile a button. */
  onSelect?: (item: StationItem) => void
}

/**
 * An overview of many entities as tiles, worst first, so the top-left tile is always the one to look at.
 * Only critical tiles pulse. The DOM order is the visual order, so a screen reader hears the worst first.
 * The grid is not a live region: only the count of critical tiles is announced when it changes.
 */
export function StationGrid({
  items,
  sort = 'worst-first',
  columns,
  label = 'Stations',
  summary = true,
  onSelect,
  className,
  ...props
}: StationGridProps) {
  const sorted = [...items].sort(
    sort === 'name'
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) => bySeverityDesc(a.severity, b.severity) || a.score - b.score || a.name.localeCompare(b.name),
  )
  const count = (s: Severity) => items.filter((i) => i.severity === s).length
  const shown = [...SEVERITIES].reverse().filter((s) => s === 'critical' || count(s) > 0)

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)} {...props}>
      {summary && (
        <p className="m-0 text-ui-sm text-fg-muted">
          {shown.map((s, i) => (
            <span key={s}>
              {i > 0 && ', '}
              {/* Only the critical count is a live region, so a change in it is announced politely and nothing else is. */}
              <span
                role={s === 'critical' ? 'status' : undefined}
                data-tone={s}
                className={cn('inline-flex items-center gap-1 align-middle font-[550]', count(s) > 0 && s !== 'normal' ? 'text-tone-fg' : 'text-fg-muted')}
              >
                <SeverityIcon severity={s} width={13} height={13} />
                {count(s)} {s}
              </span>
            </span>
          ))}
        </p>
      )}
      <ul
        aria-label={label}
        className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5 p-0"
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {sorted.map((item) => {
          const { id, onSelect: own, ...tile } = item
          const select = own ?? onSelect
          return (
            <li key={id} className="min-w-0">
              <StationTile {...tile} onSelect={select && (() => select(item))} className="h-full w-full" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
