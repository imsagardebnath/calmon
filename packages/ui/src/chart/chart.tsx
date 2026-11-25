'use client'

import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import { cn } from '../lib/cn.ts'
import type { Severity, Tone } from '../lib/tone.ts'

export type ChartType = 'line' | 'area' | 'bar'

export interface ChartSeries<T> {
  /** The field of each data row that holds this series' numbers. */
  key: Extract<keyof T, string>
  /** Name shown in the legend, the hover readout and the data table. */
  label: string
  /** Tone token for the colour (`accent`, `info`, `caution`, `neutral`, ...), never a raw colour. Default: a palette of tokens, in series order. */
  color?: Tone
  /** Draws the line dashed, for a comparison such as "previous period". Default `false`. */
  dashed?: boolean
}

export interface ChartThreshold {
  /** Where the limit sits on the y axis. */
  value: number
  /** Text drawn next to the line, e.g. "limit 400 ms". The threshold is always named in words. */
  label: string
  /** Colours the band and line. Default `caution`. */
  severity?: Severity
  /** Which side of the line is out of range: `above` shades above it (a ceiling), `below` shades under it (a floor). Default `above`. */
  direction?: 'above' | 'below'
}

export type ChartProps<T extends object> = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** `line`, `area` (a line with a soft fill) or `bar` (grouped bars). Default `line`. */
  type?: ChartType
  /** The rows to plot. Each has the `x` field and one number per series key; a missing number leaves a gap. */
  data: readonly T[]
  /** The field of each row to put on the x axis, such as a time or a category. Shown as text. */
  x: Extract<keyof T, string>
  /** What to plot, at most 6 (more are ignored). */
  series: ChartSeries<T>[]
  /** A limit the data is judged against, drawn as a dashed line and a band with a text label. Default: none. */
  threshold?: ChartThreshold
  /** Unit shown after values in the readout and the data table, e.g. `ms`, `%` or `/min`. Default: none. */
  unit?: string
  /** Formats axis ticks and readout values, e.g. `(v) => '$' + v + 'k'`. Default: a plain number with thousands separators. */
  format?: (value: number) => string
  /** What the chart shows, e.g. "p95 latency, last 24 hours". It starts the generated summary that screen readers hear. */
  label?: string
  /** Height of the plot in pixels. The width fills the container. Default `200`. */
  height?: number
  /** Lowest value on the y axis. Default: 0, or the lowest value when the data goes below 0. */
  min?: number
  /** Highest value on the y axis. Default: rounded up from the data and the threshold. */
  max?: number
  /** Shows the legend above the plot. Default `true`. */
  legend?: boolean
}

/* Tone tokens, in series order. Advisory is last: its yellow is the weakest line on a light background. */
const PALETTE: Tone[] = ['accent', 'info', 'caution', 'neutral', 'normal', 'advisory']
const NICE = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
const PAD = { r: 14, t: 14, b: 26 }

const AX = 'fill-fg-subtle font-mono text-[10.5px] tabular-nums'
const LINE = 'fill-none stroke-tone [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]'
/* pikore-trace draws the line in; with reduced motion the line is simply there. */
const DRAW =
  '[stroke-dasharray:1] [stroke-dashoffset:1] animate-[pikore-trace_1.1s_var(--ease-pikore-curve)_forwards] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]'

const r2 = (n: number) => Math.round(n * 100) / 100
const nice = (v: number) => {
  const p = 10 ** Math.floor(Math.log10(v))
  return (NICE.find((s) => s >= v / p) ?? 10) * p
}

/** The width of the element, kept up to date. 640 until measured (server render, tests). */
function useWidth(ref: RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(640)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      if (el.clientWidth > 0) setW(el.clientWidth)
    }
    read()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

/**
 * Line, area and bar charts with a threshold, a hover and keyboard readout, and a legend.
 * Responsive SVG. Screen readers get a generated summary and a hidden data table.
 */
export function Chart<T extends object>({
  type = 'line',
  data,
  x,
  series: seriesProp,
  threshold,
  unit,
  format,
  label,
  height = 200,
  min,
  max,
  legend = true,
  className,
  ...props
}: ChartProps<T>) {
  const plot = useRef<HTMLDivElement>(null)
  const W = useWidth(plot)
  const [active, setActive] = useState<number | null>(null)
  const H = height
  const n = data.length
  const bar = type === 'bar'
  const series = seriesProp.slice(0, 6).map((s, i) => ({ ...s, tone: s.color ?? PALETTE[i] ?? 'accent' }))

  const at = (i: number, key: string): unknown => (data[i] as Record<string, unknown> | undefined)?.[key]
  const val = (i: number, key: string) => {
    const v = at(i, key)
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }
  const xs = (i: number) => String(at(i, x) ?? '')
  const suffix = unit ? (/^[%/]/.test(unit) ? unit : ` ${unit}`) : ''

  // Scale. The span comes from the data, so small values (ratios, seconds) fill the axis; a flat series at lo falls back to 1.
  const nums = series.flatMap((s) => data.map((_, i) => val(i, s.key))).filter((v): v is number => v !== null)
  if (threshold) nums.push(threshold.value)
  const lo = min ?? Math.min(0, ...nums)
  const span = Math.max(...nums) - lo
  const hi = max ?? lo + nice(((span > 0 ? span : 1) * 1.08) / 4) * 4
  const ticks = [0, 1, 2, 3, 4].map((k) => lo + ((hi - lo) * k) / 4)
  // Two decimals, or more when the ticks are closer than that, so a small range still has distinct tick labels.
  const step = (hi - lo) / 4
  const digits = step > 0 && Number.isFinite(step) ? Math.min(8, Math.max(2, Math.ceil(-Math.log10(step)) + 1)) : 2
  const fmt = format ?? ((v: number) => v.toLocaleString('en-US', { maximumFractionDigits: digits }))
  const show = (v: number | null) => (v === null ? 'no data' : fmt(v) + suffix)
  const tickText = ticks.map(fmt)
  const L = Math.ceil(Math.max(...tickText.map((t) => t.length)) * 6.4) + 18
  const iw = Math.max(W - L - PAD.r, 10)
  const ih = H - PAD.t - PAD.b
  const px = (i: number) => (bar || n < 2 ? L + ((i + 0.5) * iw) / n : L + (i * iw) / (n - 1))
  const py = (v: number) => PAD.t + ih - ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * ih
  const base = py(0)

  // Lines: one run of points per stretch without gaps.
  const runs = (key: string) => {
    const out: { pts: string[]; x0: number; x1: number }[] = []
    let cur: (typeof out)[number] | null = null
    for (let i = 0; i < n; i++) {
      const v = val(i, key)
      if (v === null) {
        cur = null
        continue
      }
      if (!cur) out.push((cur = { pts: [], x0: px(i), x1: px(i) }))
      cur.pts.push(`${r2(px(i))},${r2(py(v))}`)
      cur.x1 = px(i)
    }
    return out
  }

  // Readout, by pointer or keyboard
  const idx = active === null || n === 0 ? null : Math.min(active, n - 1)
  const hover = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const rel = ((e.clientX - r.left) * iw) / (r.width || iw)
    setActive(Math.max(0, Math.min(n - 1, bar || n < 2 ? Math.floor(rel / (iw / n)) : Math.round(rel / (iw / (n - 1))))))
  }
  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const k = e.key
    if (k === 'Escape') return setActive(null)
    const cur = idx ?? (k === 'ArrowLeft' ? n : -1)
    const next = k === 'ArrowRight' ? cur + 1 : k === 'ArrowLeft' ? cur - 1 : k === 'Home' ? 0 : k === 'End' ? n - 1 : null
    if (next === null || n === 0) return
    e.preventDefault()
    setActive(Math.max(0, Math.min(n - 1, next)))
  }

  // Summary for screen readers
  const beyond = threshold
    ? series
        .flatMap((s) => data.map((_, i) => val(i, s.key)))
        .filter((v) => v !== null && (threshold.direction === 'below' ? v < threshold.value : v > threshold.value)).length
    : 0
  const summary = [
    label,
    `${type[0]?.toUpperCase()}${type.slice(1)} chart${n ? `, ${n} points from ${xs(0)} to ${xs(n - 1)}` : ', no data'}`,
    ...series.map((s) => {
      const vs = data.map((_, i) => val(i, s.key)).filter((v): v is number => v !== null)
      return vs.length
        ? `${s.label}: latest ${show(vs[vs.length - 1] ?? null)}, low ${show(Math.min(...vs))}, high ${show(Math.max(...vs))}`
        : `${s.label}: no data`
    }),
    threshold && `${threshold.label} at ${show(threshold.value)}: ${beyond ? `${beyond} readings beyond it` : 'no readings beyond it'}`,
  ]
    .filter(Boolean)
    .join('. ')

  const ty = threshold ? py(threshold.value) : 0
  const below = threshold?.direction === 'below'
  const bw = Math.min(22, n ? iw / n / (series.length + 1) : 0)

  return (
    <div data-tone="neutral" {...props} className={cn('block w-full', className)}>
      {legend ? (
        <ul className="m-0 mb-1.5 flex list-none flex-wrap gap-x-3.5 gap-y-1 p-0 text-xs text-fg-muted">
          {series.map((s) => (
            <li key={s.key} data-tone={s.tone} className="flex items-center gap-1.5">
              <i aria-hidden="true" className="h-[3px] w-2.5 rounded-xs bg-tone" />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div ref={plot} className="relative">
        <svg
          role="img"
          aria-label={summary}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          tabIndex={n ? 0 : undefined}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((a) => a ?? (n ? n - 1 : null))}
          onBlur={() => setActive(null)}
          className="block w-full overflow-visible"
        >
          {ticks.map((t, k) => (
            <g key={k}>
              <line x1={L} x2={W - PAD.r} y1={py(t)} y2={py(t)} className="stroke-border" />
              <text x={L - 8} y={py(t) + 3.5} textAnchor="end" className={AX}>
                {tickText[k]}
              </text>
            </g>
          ))}
          {data.map((_, i) =>
            i % Math.ceil(n / 8) === 0 ? (
              <text key={i} x={px(i)} y={H - 6} textAnchor="middle" className={AX}>
                {xs(i)}
              </text>
            ) : null,
          )}
          {n === 0 ? (
            <text x={W / 2} y={H / 2} textAnchor="middle" className={AX}>
              No data
            </text>
          ) : null}
          {threshold ? (
            <g data-tone={threshold.severity ?? 'caution'}>
              <rect
                x={L}
                y={below ? ty : PAD.t}
                width={iw}
                height={Math.max(0, below ? PAD.t + ih - ty : ty - PAD.t)}
                className="fill-tone opacity-[.07]"
              />
              <line x1={L} x2={W - PAD.r} y1={ty} y2={ty} className="stroke-tone [stroke-dasharray:4_4]" />
              <text
                x={W - PAD.r}
                y={below || ty - 6 < PAD.t + 6 ? ty + 14 : ty - 6}
                textAnchor="end"
                className="fill-tone-fg font-mono text-[10.5px]"
              >
                {threshold.label}
              </text>
            </g>
          ) : null}
          {series.map((s, si) => {
            const rs = runs(s.key)
            return (
              <g key={s.key} data-tone={s.tone}>
                {bar ? (
                  data.map((_, i) => {
                    const v = val(i, s.key)
                    if (v === null) return null
                    const x0 = px(i) - (series.length * bw) / 2 + si * bw + 1
                    return (
                      <rect
                        key={i}
                        x={r2(x0)}
                        y={r2(Math.min(py(v), base))}
                        width={Math.max(bw - 2, 1)}
                        height={r2(Math.abs(base - py(v)))}
                        rx={3}
                        className="fill-tone"
                      />
                    )
                  })
                ) : (
                  <>
                    {type === 'area' ? (
                      <path
                        d={rs.map((r) => `M${r2(r.x0)},${r2(base)}L${r.pts.join('L')}L${r2(r.x1)},${r2(base)}Z`).join('')}
                        className="fill-tone opacity-10"
                      />
                    ) : null}
                    <path
                      d={rs.map((r) => `M${r.pts.join('L')}`).join('')}
                      pathLength={s.dashed ? undefined : 1}
                      className={cn(LINE, s.dashed ? '[stroke-dasharray:4_4]' : DRAW)}
                    />
                  </>
                )}
              </g>
            )
          })}
          {idx !== null ? (
            <g>
              <line x1={px(idx)} x2={px(idx)} y1={PAD.t} y2={PAD.t + ih} className="stroke-fg-subtle [stroke-dasharray:2_3]" />
              {bar
                ? null
                : series.map((s) => {
                    const v = val(idx, s.key)
                    return v === null ? null : (
                      <circle key={s.key} data-tone={s.tone} cx={px(idx)} cy={py(v)} r={4} className="fill-tone stroke-surface-raised stroke-2" />
                    )
                  })}
            </g>
          ) : null}
          <rect
            x={L}
            y={PAD.t}
            width={iw}
            height={ih}
            className="fill-transparent"
            onPointerMove={hover}
            onPointerDown={hover}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
        {idx !== null ? (
          <div
            aria-hidden="true"
            style={px(idx) < W / 2 ? { left: px(idx) + 12 } : { right: W - px(idx) + 12 }}
            className="pointer-events-none absolute top-2 z-[5] rounded-control bg-surface-raised px-2.5 py-2 text-xs whitespace-nowrap shadow-[0_0_0_1px_var(--border),var(--shadow-2)]"
          >
            <b className="mb-0.5 block font-semibold">{xs(idx)}</b>
            {series.map((s) => (
              <span key={s.key} data-tone={s.tone} className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <i className="size-2 rounded-xs bg-tone" />
                {s.label}: {show(val(idx, s.key))}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <p role="status" className="sr-only">
        {idx === null ? '' : `${xs(idx)}: ${series.map((s) => `${s.label} ${show(val(idx, s.key))}`).join(', ')}`}
      </p>
      <table className="sr-only">
        <caption>{label ? `${label}: data` : 'Chart data'}</caption>
        <thead>
          <tr>
            <th scope="col">{x}</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((_, i) => (
            <tr key={i}>
              <th scope="row">{xs(i)}</th>
              {series.map((s) => (
                <td key={s.key}>{val(i, s.key) === null ? '' : show(val(i, s.key))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
