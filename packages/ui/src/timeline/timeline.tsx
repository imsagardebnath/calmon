'use client'

import { useEffect, useMemo, useState, useSyncExternalStore, type ComponentPropsWithRef, type ReactNode } from 'react'
import { SeverityIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, type Severity } from '../lib/tone.ts'

/** One entry in an entity's history: an alert, a deploy, a note, a person acting. */
export type TimelineEvent = {
  /** Stable key for the event. */
  id: string
  /** When it happened. A `Date` or anything `new Date()` accepts, such as an ISO string. */
  time: Date | string
  /** What happened, in a short phrase such as "Deploy v2.31.0 started". */
  title: ReactNode
  /** More detail, one or two lines. Default none. */
  description?: ReactNode
  /** How serious it was. Sets the icon shape and colour of the node, and is said as a word to screen readers. Default none. */
  severity?: Severity
  /** Who did it: a person, a team or a system. Shown under the title. Default none. */
  actor?: string
  /** What kind of event it is, such as `alert`, `deploy`, `note`. Shown under the title. Default none. */
  type?: string
  /** Replaces the node icon, which is the severity icon or a plain dot. Decorative. */
  icon?: ReactNode
}

const LINE =
  "relative m-0 list-none p-0 before:absolute before:top-2 before:bottom-2 before:left-[11.5px] before:w-px before:bg-border before:content-['']"

const subscribe = () => () => {}

/** False while rendering on the server and while hydrating, true on every client render after that. */
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

const dayKey = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(d)

/** "5 min. ago" or "yesterday" in the viewer's language, or null for anything older than a week. */
const rel = (rtf: Intl.RelativeTimeFormat, ms: number): string | null => {
  const s = ms / 1000
  const a = Math.abs(s)
  if (a >= 604800) return null
  const [unit, size]: ['second' | 'minute' | 'hour' | 'day', number] =
    a < 60 ? ['second', 1] : a < 3600 ? ['minute', 60] : a < 86400 ? ['hour', 3600] : ['day', 86400]
  return rtf.format(unit === 'second' ? 0 : Math.trunc(s / size), unit)
}

export type TimelineProps = Omit<ComponentPropsWithRef<'ol'>, 'children'> & {
  /** The events, in the order to show them. Newest first is the usual choice. They are not re-sorted. */
  events: TimelineEvent[]
  /** `day` groups the events under sticky day headings ("Today", "Yesterday", then the date). `none` is one flat list. Default `day`. */
  groupBy?: 'day' | 'none'
  /** Level of the day headings (`h2` to `h6`). Pick the level that fits the page outline. It only changes the tag, never the look. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /**
   * The heading level written as a tag name. Same as `headingLevel`, kept so existing code keeps working: use
   * `headingLevel` in new code. `headingLevel` wins when both are set.
   * @deprecated Use `headingLevel`.
   */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * IANA time zone for the times and days, such as `UTC` or `Europe/London`. Use it when the people
   * reading the timeline share one zone. Default: the viewer's own zone, once the page has loaded. Until
   * then (on the server and while hydrating) times and days are shown in UTC and English so both sides match.
   */
  timeZone?: string
  /** The time the relative labels ("5 min. ago") and "Today" are measured from. Default: the current time, read after the page loads. */
  now?: Date | number | string
}

/**
 * One ordered record of what happened to an entity: alerts, changes, deploys, notes and who did them.
 * Each node has a severity shape, so status is never colour alone, and each time shows both a clock time
 * and how long ago it was, in a `<time>` element with the full date as its tooltip.
 */
export function Timeline({
  events,
  groupBy = 'day',
  headingLevel,
  as: tag,
  timeZone,
  now: nowProp,
  className,
  ...props
}: TimelineProps) {
  // Relative times depend on the clock, so they are filled in after mount to keep server and client markup equal.
  const [tick, setTick] = useState<number | null>(null)
  useEffect(() => {
    if (nowProp !== undefined) return
    setTick(Date.now())
    const timer = setInterval(() => setTick(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [nowProp])
  const now = nowProp !== undefined ? +new Date(nowProp) : tick

  // The server does not know the viewer's zone or language, so until the page is hydrated everything is formatted
  // in UTC and English: same markup on both sides, and the same days in the same groups. Then it switches.
  const hydrated = useHydrated()
  const zone = timeZone ?? (hydrated ? undefined : 'UTC')
  const locale = hydrated ? undefined : 'en'
  const fmt = useMemo(() => {
    const o = { timeZone: zone, hourCycle: 'h23' } as const
    const t = { hour: '2-digit', minute: '2-digit' } as const
    return {
      time: new Intl.DateTimeFormat(locale, { ...o, ...t }),
      both: new Intl.DateTimeFormat(locale, { ...o, ...t, month: 'short', day: 'numeric' }),
      full: new Intl.DateTimeFormat(locale, { ...o, ...t, second: '2-digit', year: 'numeric', month: 'short', day: 'numeric', timeZoneName: 'short' }),
      day: new Intl.DateTimeFormat(locale, { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric' }),
      ago: new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }),
    }
  }, [zone, locale])

  const item = (e: TimelineEvent) => {
    const d = new Date(e.time)
    const valid = !Number.isNaN(+d)
    const ago = valid && now !== null ? rel(fmt.ago, +d - now) : null
    const meta = [e.actor, e.type].filter(Boolean).join(' · ')
    return (
      <li
        key={e.id}
        data-tone={e.severity ?? 'neutral'}
        className={cn('relative grid grid-cols-[24px_1fr_auto] gap-3.5 py-[9px]', !e.severity && '[--s-border:var(--border-strong)]')}
      >
        <span
          aria-hidden="true"
          className="z-1 grid size-6 place-items-center rounded-full bg-surface-raised text-tone-fg shadow-[0_0_0_1px_var(--s-border),0_0_0_4px_var(--surface-raised)]"
        >
          {e.icon ?? (e.severity ? <SeverityIcon severity={e.severity} width={13} height={13} /> : <span className="size-1.5 rounded-full bg-current" />)}
        </span>
        <div className="min-w-0 text-ui-sm">
          <span className="font-[550]">
            {e.severity && <span className="sr-only">{SEVERITY_LABEL[e.severity]}: </span>}
            {e.title}
          </span>
          {e.description && <p className="m-0 mt-0.5 text-fg-muted">{e.description}</p>}
          {meta && <p className="m-0 mt-0.5 text-xs text-fg-subtle">{meta}</p>}
        </div>
        {valid ? (
          <time
            dateTime={d.toISOString()}
            title={fmt.full.format(d)}
            suppressHydrationWarning
            className="pt-[3px] text-right font-mono text-[11px] whitespace-nowrap text-fg-subtle"
          >
            {(groupBy === 'day' ? fmt.time : fmt.both).format(d)}
            {ago && <span className="block">{ago}</span>}
          </time>
        ) : (
          <span className="pt-[3px] font-mono text-[11px] text-fg-subtle">{String(e.time)}</span>
        )}
      </li>
    )
  }

  if (groupBy === 'none')
    return (
      <ol className={cn(LINE, className)} {...props}>
        {events.map(item)}
      </ol>
    )

  // Group neighbouring events that fall on the same day, keeping the order they were given in.
  const groups: { key: string; label: string; events: TimelineEvent[] }[] = []
  const today = now === null ? null : dayKey(new Date(now), zone)
  const yesterday = now === null ? null : dayKey(new Date(now - 864e5), zone)
  for (const e of events) {
    const d = new Date(e.time)
    const key = Number.isNaN(+d) ? String(e.time) : dayKey(d, zone)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.events.push(e)
    else
      groups.push({
        key,
        label: key === today ? 'Today' : key === yesterday ? 'Yesterday' : Number.isNaN(+d) ? key : fmt.day.format(d),
        events: [e],
      })
  }

  const Heading = headingLevel ? (`h${headingLevel}` as const) : (tag ?? 'h3')

  return (
    <ol className={cn('m-0 list-none p-0', className)} {...props}>
      {groups.map((g, i) => (
        <li key={`${g.key}-${i}`}>
          <Heading
            suppressHydrationWarning
            className="sticky top-0 z-2 m-0 bg-(--timeline-bg,var(--surface-raised)) pt-3.5 pb-1 pl-[38px] text-xs font-semibold text-fg-subtle"
          >
            {g.label}
          </Heading>
          <ol className={LINE}>{g.events.map(item)}</ol>
        </li>
      ))}
    </ol>
  )
}
