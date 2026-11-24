'use client'

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Badge } from '../badge/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, type Severity } from '../lib/tone.ts'
import type { Density } from '../provider/index.ts'
import { Sparkline } from '../sparkline/index.ts'

/** The limit a metric is judged against. */
export type VitalThreshold = {
  /** The limit. Shown in the footer so the value is never judged against a hidden number. */
  value: number
  /** The severity the tile takes when the value crosses the limit. */
  severity: Severity
  /** Which side is bad. `above` (the default) for latency or error rate, `below` for availability or SpO2. */
  direction?: 'above' | 'below'
}

/*
 * Density. The tile defines its own variables on the root and reads them below. With a `density` prop the
 * variables are set directly on the tile, so the prop always wins. Without it they follow the nearest
 * data-density ancestor (the `[data-density=...]_&` variants), like the rest of the library.
 */
const DIRECT = {
  comfortable: '',
  compact: '[--pad:12px] [--n:var(--numeral-md)] [--lbl:var(--fs-xs)] [--sp-h:28px] [--gap:5px] [--bh:19px] [--bf:10.5px] [--bp:6px]',
  station:
    '[--pad:28px] [--n:var(--numeral-xl)] [--lbl:var(--fs-lg)] [--sp-h:76px] [--gap:14px] [--bh:30px] [--bf:var(--fs-md)] [--bp:12px] [--bg:7px] [--bi:17px] [--ft:var(--fs-sm)]',
}
const INHERIT =
  '[[data-density=compact]_&]:[--pad:12px] [[data-density=compact]_&]:[--n:var(--numeral-md)] [[data-density=compact]_&]:[--lbl:var(--fs-xs)] ' +
  '[[data-density=compact]_&]:[--sp-h:28px] [[data-density=compact]_&]:[--gap:5px] [[data-density=compact]_&]:[--bh:19px] ' +
  '[[data-density=compact]_&]:[--bf:10.5px] [[data-density=compact]_&]:[--bp:6px] ' +
  '[[data-density=station]_&]:[--pad:28px] [[data-density=station]_&]:[--n:var(--numeral-xl)] [[data-density=station]_&]:[--lbl:var(--fs-lg)] ' +
  '[[data-density=station]_&]:[--sp-h:76px] [[data-density=station]_&]:[--gap:14px] [[data-density=station]_&]:[--bh:30px] ' +
  '[[data-density=station]_&]:[--bf:var(--fs-md)] [[data-density=station]_&]:[--bp:12px] [[data-density=station]_&]:[--bg:7px] ' +
  '[[data-density=station]_&]:[--bi:17px] [[data-density=station]_&]:[--ft:var(--fs-sm)]'

const ROOT =
  'relative flex min-w-0 flex-col gap-(--gap) overflow-hidden rounded-card border border-border bg-surface-raised p-(--pad) shadow-low ' +
  '[--pad:18px] [--n:var(--numeral-lg)] [--lbl:var(--fs-sm)] [--sp-h:46px] [--gap:10px] [--bh:22px] [--bf:var(--fs-xs)] [--bi:13px] [--ft:11px]'

/** The 2px rule along the top edge of a tile that is outside its range. */
const RULE = "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-tone before:content-['']"

/** Badge sized from the density variables. */
const BADGE =
  'ml-auto h-(--bh) gap-(--bg,5px) pr-(--bp,8px) pl-(--bp,7px) text-(length:--bf) [&_svg]:size-(--bi)'

const defaultFormat = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

/**
 * The trend summary for a limit the value must stay above. Sparkline words its summary for limits the
 * value must stay below ("within threshold"), which would be wrong for a tile that is under its minimum.
 */
function minimumTrendLabel(data: number[], limit: number): string | undefined {
  const d = data.filter(Number.isFinite)
  const first = d[0]
  const last = d[d.length - 1]
  if (first === undefined || last === undefined || !Number.isFinite(limit)) return undefined
  const lo = Math.min(...d)
  const hi = Math.max(...d)
  const trend = Math.abs(last - first) <= (hi - lo) * 0.05 ? 'steady' : last > first ? 'rising' : 'falling'
  const n = (v: number) => String(Math.round(v * 100) / 100)
  return `Trend ${trend}, ${n(first)} to ${n(last)}. Min ${n(lo)}, max ${n(hi)}, latest ${n(last)}, ${last < limit ? 'below' : 'at or above'} minimum ${n(limit)}.`
}

export type VitalTileProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Name of the metric, such as "p95 latency". */
  label: string
  /** The current value. */
  value: number
  /** Unit shown beside the value, such as `ms` or `%`. Default none. */
  unit?: string
  /** Recent values for the trend line, oldest first. It also draws the threshold. Default none. */
  data?: number[]
  /**
   * The limit the value is judged against. The tile takes the threshold's severity when the value
   * crosses it, shows a badge with the severity word, and prints the limit in the footer.
   */
  threshold?: VitalThreshold
  /** Sets the severity directly, for a value that is judged somewhere else. Wins over `threshold`. */
  severity?: Severity
  /** How the value changed, such as "+12% 1h". Shown on the right of the footer. */
  change?: ReactNode
  /** Replaces the left side of the footer, which shows the limit by default. */
  footer?: ReactNode
  /** Formats `value` and the limit. Default: English number format with up to two decimals. */
  format?: (value: number) => string
  /** Size of the tile. Follows the nearest `data-density` ancestor when unset. */
  density?: Density
}

/**
 * A metric with its unit, a trend line and the limit it is judged against. A tile outside its range
 * gets a top rule, a tinted number and a badge with an icon and the severity word, so colour is never
 * the only signal. A tile with no threshold and no severity stays neutral and has no badge.
 */
export function VitalTile({
  label,
  value,
  unit,
  data,
  threshold,
  severity,
  change,
  footer,
  format,
  density,
  className,
  ...props
}: VitalTileProps) {
  const labelId = useId()
  const fmt = format ?? defaultFormat
  const crossed = threshold && (threshold.direction === 'below' ? value < threshold.value : value > threshold.value)
  const sev: Severity | undefined = severity ?? (threshold ? (crossed ? threshold.severity : 'normal') : undefined)
  const alarm = sev !== undefined && sev !== 'normal'
  const limit =
    footer ??
    (threshold &&
      `${threshold.direction === 'below' ? 'min' : 'limit'} ${fmt(threshold.value)}${unit ? (unit === '%' ? '%' : ` ${unit}`) : ''}`)
  const trendSeverity = threshold ? (threshold.direction === 'below' ? 'normal' : threshold.severity) : alarm ? sev : undefined
  const trendLabel = data && threshold?.direction === 'below' ? minimumTrendLabel(data, threshold.value) : undefined

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-tone={sev ?? 'neutral'}
      data-density={density}
      className={cn(ROOT, density ? DIRECT[density] : INHERIT, alarm && RULE, className)}
      {...props}
    >
      <div className="flex items-center gap-2 text-(length:--lbl) font-[550] text-fg-muted">
        <span id={labelId}>{label}</span>
        {sev && (
          <Badge severity={sev} className={BADGE}>
            {sev === 'normal' ? 'In range' : SEVERITY_LABEL[sev]}
          </Badge>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('num text-(length:--n) leading-none', alarm ? 'text-tone-fg' : 'text-fg')}>{fmt(value)}</span>
        {unit && <span className="text-(length:--lbl) text-fg-subtle">{unit}</span>}
      </div>
      {data && data.length > 1 && (
        <Sparkline
          data={data}
          area
          threshold={threshold?.value}
          severity={trendSeverity}
          className="h-(--sp-h)"
          {...(trendLabel ? { 'aria-label': trendLabel } : {})}
        />
      )}
      {(limit || change) && (
        <div className="flex justify-between gap-2 font-mono text-(length:--ft) text-fg-subtle">
          <span>{limit}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}
