'use client'

import { useId, type ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'
import { toneOf, type Intent, type Severity } from '../lib/tone.ts'

export type SparklineProps = Omit<ComponentPropsWithRef<'svg'>, 'children' | 'height'> & {
  /** The values, oldest first. Non-finite values are ignored. */
  data: number[]
  /** Draws a dashed reference line. Parts of the line above it use the severity colour. Default none. */
  threshold?: number
  /** Fills the space under the line with a soft gradient. Default `false`. */
  area?: boolean
  /**
   * Colour of the line. With a `threshold`, only the parts above it use this colour, and the rest stay
   * accent. Use `critical` for a limit that must not be crossed. Default accent, or `caution` with a threshold.
   */
  severity?: Severity
  /** Familiar colour names: `success`, `warning`, `danger`. Same as the matching severity. `severity` wins. */
  intent?: Intent
  /** Height in pixels. The width always fills the container. Default 32. */
  height?: number
}

/* The line is drawn in a 100 x 30 box that is stretched to the real size (preserveAspectRatio="none"). */
const W = 100
const H = 30
const fmt = (n: number) => String(Math.round(n * 100) / 100)

/**
 * A word-sized trend line. Pair it with the current value, and never add axes to it: use Chart for that.
 * The line stretches to the width of its container, and it carries a generated text summary
 * (trend, minimum, maximum and latest value) for screen readers.
 */
export function Sparkline({
  data,
  threshold,
  area = false,
  severity,
  intent,
  height = 32,
  className,
  ...props
}: SparklineProps) {
  const gid = useId().replace(/\W/g, '')
  const d = data.filter(Number.isFinite)
  const tone = toneOf(severity, intent, null)
  const limit = threshold !== undefined && Number.isFinite(threshold) ? threshold : undefined
  // Below or without a threshold the line is accent; a severity colours the whole line unless there is a threshold.
  const base = limit === undefined ? 'stroke-tone' : 'stroke-accent'
  const svg = {
    role: 'img' as const,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'none' as const,
    height,
    focusable: 'false' as const,
    'data-tone': tone ?? (limit === undefined ? 'accent' : 'caution'),
    className: cn('block w-full overflow-visible', className),
  }

  if (d.length === 0) return <svg {...svg} aria-label="No data" {...props} />

  // Scale to the min and max (and the threshold), padded 12%. A flat series keeps a visible span instead of a stretched line.
  const lo = Math.min(...d, limit ?? Infinity)
  const hi = Math.max(...d, limit ?? -Infinity)
  const mean = d.reduce((a, b) => a + b, 0) / d.length
  const span = Math.max(hi - lo, Math.abs(mean) * 0.8 || 1)
  const pad = span * 0.12
  const min = (hi + lo) / 2 - span / 2 - pad
  const max = (hi + lo) / 2 + span / 2 + pad
  const x = (i: number) => (d.length > 1 ? (i / (d.length - 1)) * W : W / 2)
  const y = (v: number) => H - ((v - min) / (max - min)) * H
  const points = d.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')

  const first = d[0] ?? 0
  const last = d[d.length - 1] ?? 0
  const dMin = Math.min(...d)
  const dMax = Math.max(...d)
  const trend = Math.abs(last - first) <= (dMax - dMin) * 0.05 ? 'steady' : last > first ? 'rising' : 'falling'
  const above = limit !== undefined && last > limit
  const label =
    `Trend ${trend}, ${fmt(first)} to ${fmt(last)}. Min ${fmt(dMin)}, max ${fmt(dMax)}, latest ${fmt(last)}` +
    (limit === undefined ? '.' : `, ${above ? 'above' : 'within'} threshold ${fmt(limit)}.`)

  const fill = limit === undefined ? 'var(--s)' : 'var(--accent)'
  const ty = limit === undefined ? 0 : y(limit)
  const line = {
    fill: 'none',
    strokeWidth: 1.6,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    vectorEffect: 'non-scaling-stroke',
  } as const

  return (
    <svg {...svg} aria-label={label} {...props}>
      {area && (
        <>
          <linearGradient id={`${gid}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: fill, stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: fill, stopOpacity: 0 }} />
          </linearGradient>
          <path d={`M0,${H}L${points.replaceAll(' ', 'L')}L${W},${H}Z`} fill={`url(#${gid}g)`} />
        </>
      )}
      {limit !== undefined && (
        <line
          x1={0}
          x2={W}
          y1={ty}
          y2={ty}
          strokeWidth={1}
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
          className="stroke-fg-subtle opacity-80"
        />
      )}
      <polyline points={points} className={base} {...line} />
      {limit !== undefined && d.some((v) => v > limit) && (
        <>
          <clipPath id={`${gid}c`}>
            <rect x={-5} y={-1000} width={W + 10} height={ty + 1000} />
          </clipPath>
          <polyline points={points} className="stroke-tone" clipPath={`url(#${gid}c)`} {...line} />
        </>
      )}
      {/* The latest value: a zero-length line with round caps stays a circle however the box is stretched. */}
      <line
        x1={x(d.length - 1)}
        x2={x(d.length - 1)}
        y1={y(last)}
        y2={y(last)}
        strokeWidth={6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className={above ? 'stroke-tone' : base}
      />
    </svg>
  )
}
