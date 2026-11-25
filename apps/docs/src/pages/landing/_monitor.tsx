// The live central-station demo under the hero: the design's `.monitor`, built from real library components.
// StationGrid (worst first, with Sparkline tiles), Badge, Tabs and the severity icons. The clock ticks every second,
// and the sparklines take a new point every five seconds unless the visitor asked for reduced motion.
import { useState } from 'react'
import { Badge } from '@openvanta/pikore-react/badge'
import { scoreSeverity } from '@openvanta/pikore-react/health-score'
import { RoomIcon, SeverityIcon } from '@openvanta/pikore-react/icons'
import { StationGrid, type StationItem } from '@openvanta/pikore-react/station-grid'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { ENVIRONMENT_SCORE, SERVICES } from './_data.ts'
import { seeded, useInterval, useReducedMotion, useUtcClock } from './_hooks.ts'
import { cx } from './_util.ts'

type Severity = StationItem['severity']
type Range = '1h' | '24h' | '7d'
type Series = Record<string, number[]>

/** How many points each time range shows. Only the last hour is real data; longer ranges get a quiet, seeded past. */
const POINTS: Record<Range, number> = { '1h': 12, '24h': 24, '7d': 28 }

/** Full class strings, so Tailwind can see them. */
const SCORE_COLOUR: Record<Severity, string> = {
  normal: 'text-normal-fg',
  info: 'text-info-fg',
  advisory: 'text-advisory-fg',
  caution: 'text-caution-fg',
  critical: 'text-critical-fg',
}
const SEVERITY_WORD: Record<Severity, string> = {
  normal: 'Normal',
  info: 'Info',
  advisory: 'Advisory',
  caution: 'Caution',
  critical: 'Critical',
}

const history = (item: StationItem, n: number): number[] => {
  const base = item.data ?? []
  if (n <= base.length) return base.slice(-n)
  const rng = seeded(`${item.id}:${n}`)
  const spread = Math.max(Math.max(...base) - Math.min(...base), Math.abs(base[0] ?? 1) * 0.1, 1)
  const past: number[] = []
  let v = base[0] ?? 0
  for (let i = 0; i < n - base.length; i++) {
    v = Math.max(0, v + (rng() - 0.5) * spread * 0.25)
    past.unshift(Number(v.toFixed(2)))
  }
  return [...past, ...base]
}

const build = (range: Range): Series => Object.fromEntries(SERVICES.map((s) => [s.id, history(s, POINTS[range])]))

/** One new point per service: a small step from the last one, never below zero. */
const advance = (series: Series): Series =>
  Object.fromEntries(
    Object.entries(series).map(([id, values]) => {
      const last = values.at(-1) ?? 0
      const spread = Math.max(Math.max(...values) - Math.min(...values), Math.abs(last) * 0.1, 1)
      const next = Math.max(0, last + (Math.random() - 0.5) * spread * 0.14)
      return [id, [...values.slice(1), Number(next.toFixed(2))]]
    }),
  )

/** The ECG line of the design: a flat line with a beat every 160 units. */
const ECG =
  'M0 32 H150 l8 -4 8 4 H230 l6 10 10 -36 10 44 8 -18 H390 l8 -4 8 4 H560 l6 10 10 -36 10 44 8 -18 H720 l8 -4 8 4 H880 l6 10 10 -36 10 44 8 -18 H1040 l8 -4 8 4 H1200'

/**
 * The trace is drawn once on load. `stroke-dashoffset` runs from 3000 to 0 (`pikore-trace` in the library styles), and
 * reduced motion shows the finished line at once.
 */
function Trace() {
  return (
    <svg
      viewBox="0 0 1200 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-14 w-full border-b border-border bg-linear-to-b from-surface-raised to-surface"
    >
      <path d="M0 14H1200M0 28H1200M0 42H1200" className="fill-none stroke-border [stroke-width:1] [vector-effect:non-scaling-stroke]" />
      <path
        d={ECG}
        className={cx(
          'fill-none stroke-accent [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6] [vector-effect:non-scaling-stroke]',
          '[stroke-dasharray:3000] [stroke-dashoffset:3000] animate-[pikore-trace_3.4s_var(--ease-pikore-curve)_.3s_forwards]',
          'motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]',
        )}
      />
    </svg>
  )
}

const COUNTED: Severity[] = ['critical', 'caution', 'advisory', 'normal']

export function Monitor() {
  const reduced = useReducedMotion()
  const clock = useUtcClock()
  const [range, setRange] = useState<Range>('1h')
  const [data, setData] = useState<Record<Range, Series>>(() => ({ '1h': build('1h'), '24h': build('24h'), '7d': build('7d') }))

  useInterval(
    () => setData((d) => ({ '1h': advance(d['1h']), '24h': advance(d['24h']), '7d': advance(d['7d']) })),
    5000,
    !reduced,
  )

  const items = SERVICES.map((s) => ({ ...s, data: data[range][s.id] }))
  const band = scoreSeverity(ENVIRONMENT_SCORE)

  return (
    <div
      role="group"
      aria-label="Central station demo"
      className="relative mx-auto mt-12 max-w-[1180px] overflow-hidden rounded-[22px] bg-surface-raised shadow-[0_0_0_1px_var(--border),var(--shadow-3)] sm:mt-16"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3.5 text-ui-sm sm:px-5">
        <RoomIcon className="size-4 text-accent-fg" aria-hidden="true" />
        <b className="font-semibold">Production, eu-west</b>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-normal-fg">
          <span
            aria-hidden="true"
            className="size-[7px] animate-pikore-blink rounded-full bg-normal shadow-[0_0_0_3px_color-mix(in_oklab,var(--normal),transparent_80%)]"
          />
          Live
        </span>
        <time className="font-mono text-[11.5px] text-fg-subtle">{clock}</time>
        <Tabs variant="segmented" value={range} onValueChange={(v) => setRange(v as Range)} aria-label="Time range" className="ml-auto">
          <Tab value="1h">1h</Tab>
          <Tab value="24h">24h</Tab>
          <Tab value="7d">7d</Tab>
        </Tabs>
      </div>

      <Trace />

      <div className="grid min-[68.75rem]:grid-cols-[280px_minmax(0,1fr)]">
        <div className="grid gap-x-10 gap-y-5 border-b border-border px-[22px] py-6 sm:grid-cols-2 min-[68.75rem]:flex min-[68.75rem]:flex-col min-[68.75rem]:gap-[18px] min-[68.75rem]:border-r min-[68.75rem]:border-b-0">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="text-ui-sm font-[550] text-fg-muted">Environment health</span>
              <Badge severity={band}>{SEVERITY_WORD[band]}</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cx('num text-numeral-xl leading-[.85]', SCORE_COLOUR[band])}>{ENVIRONMENT_SCORE}</span>
              <span className="text-ui-sm text-fg-subtle">of 100</span>
            </div>
          </div>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-1 p-0 sm:self-center min-[68.75rem]:self-auto min-[68.75rem]:flex min-[68.75rem]:flex-col min-[68.75rem]:gap-0.5" aria-label="Services by severity">
            {COUNTED.map((s) => (
              <li
                key={s}
                data-tone={s}
                className="flex items-center gap-2.5 py-[7px] text-ui-sm min-[68.75rem]:border-t min-[68.75rem]:border-border min-[68.75rem]:first:border-t-0"
              >
                <SeverityIcon severity={s} width={16} height={16} className={s === 'normal' ? 'text-normal-fg' : 'text-tone-fg'} />
                {SEVERITY_WORD[s]}
                <span className="num ml-auto text-ui font-normal">{SERVICES.filter((x) => x.severity === s).length}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 text-xs leading-[1.55] text-fg-subtle sm:col-span-2 min-[68.75rem]:col-span-1">41 signals grouped into 3 alerts. Tiles are sorted worst first.</p>
        </div>

        <div className="min-w-0 bg-surface p-3.5 sm:p-[18px]">
          <StationGrid
            label="Production services, worst first"
            items={items}
            summary={false}
            // Phones show the six worst tiles in two columns. The rest stay in the data but are not rendered.
            className="max-sm:[&_li:nth-child(n+7)]:hidden max-sm:[&_ul]:grid-cols-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-[18px] gap-y-1 border-t border-border px-4 py-2.5 font-mono text-[11.5px] text-fg-subtle sm:px-5">
        <span>12 services</span>
        <span>{reduced ? 'refresh paused' : 'refresh 5s'}</span>
        <span className="ml-auto">eu-west-1a, 1b, 1c</span>
      </div>
    </div>
  )
}
