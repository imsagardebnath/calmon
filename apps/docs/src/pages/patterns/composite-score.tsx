// One composite score: a HealthScore built from the same metrics the VitalTiles show, each with its limit.
import { useState } from 'react'
import { HealthScore, type HealthFactor } from '@calmon/react/health-score'
import { Tab, Tabs } from '@calmon/react/tabs'
import { VitalTile } from '@calmon/react/vital-tile'
import { Panel, PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

type Key = 'latency' | 'error' | 'cpu' | 'alerts'
type Severity = HealthFactor['severity']

interface Metric {
  key: Key
  /** Name of the factor in the score. */
  factor: string
  /** Name on the tile. */
  tile: string
  unit?: string
  /** The limit the metric is judged against. */
  limit: number
  /** The most points this metric can take off the score. */
  weight: number
  /** How bad it is just past the limit. Far past it (1.5 times) is always critical. */
  soft: 'caution' | 'advisory'
}

const METRICS: Metric[] = [
  { key: 'latency', factor: 'Latency p95', tile: 'p95 latency', unit: 'ms', limit: 400, weight: 35, soft: 'caution' },
  { key: 'error', factor: 'Error rate', tile: 'Error rate', unit: '%', limit: 1, weight: 30, soft: 'caution' },
  { key: 'cpu', factor: 'Saturation', tile: 'CPU saturation', unit: '%', limit: 80, weight: 20, soft: 'advisory' },
  { key: 'alerts', factor: 'Open alerts', tile: 'Open alerts', limit: 3, weight: 15, soft: 'advisory' },
]

type Values = Record<Key, number>

interface Scenario {
  label: string
  /** The hour before: where each metric started. */
  from: Values
  /** Now. */
  to: Values
  /** Points each metric takes off the score now. The score is 100 plus these. */
  impact: Values
}

const SCENARIOS: Record<string, Scenario> = {
  healthy: {
    label: 'Healthy',
    from: { latency: 351, error: 0.36, cpu: 63, alerts: 2 },
    to: { latency: 342, error: 0.31, cpu: 61, alerts: 1 },
    impact: { latency: -2, error: -1, cpu: -3, alerts: 0 },
  },
  degrading: {
    label: 'Degrading',
    from: { latency: 338, error: 0.45, cpu: 62, alerts: 1 },
    to: { latency: 412, error: 0.84, cpu: 84, alerts: 4 },
    impact: { latency: -21, error: -4, cpu: -9, alerts: -4 },
  },
  incident: {
    label: 'Incident',
    from: { latency: 412, error: 0.84, cpu: 84, alerts: 4 },
    to: { latency: 812, error: 4.2, cpu: 93, alerts: 17 },
    impact: { latency: -29, error: -24, cpu: -11, alerts: -9 },
  },
}

/** The severity of a value: normal inside the limit, the metric's own level just past it, critical far past it. */
function severityOf(m: Metric, value: number): Severity {
  if (value <= m.limit) return 'normal'
  return value / m.limit > 1.5 ? 'critical' : m.soft
}

const WOBBLE = [0, 1, -1, 0, 2, -1, 1, 0, -1, 1, 0, 0]

/** Twelve points from `from` to `to`, bending late the way a real incident does. Deterministic, so the page never shifts. */
function trend(from: number, to: number): number[] {
  return WOBBLE.map((w, i) => {
    const t = i / (WOBBLE.length - 1)
    const v = from + (to - from) * t ** 1.7 + w * Math.abs(to) * 0.012
    return Math.round(v * 100) / 100
  })
}

const sign = (n: number) => (n < 0 ? '−' : '+')

/** "+22% 1h" for a quantity, "+0.39 pts 1h" for a percentage, "+3 1h" for a count. */
function change(m: Metric, from: number, to: number): string {
  const d = to - from
  if (m.unit === '%') return `${sign(d)}${Math.abs(d).toFixed(2).replace(/\.?0+$/, '')} pts 1h`
  if (!m.unit) return `${sign(d)}${Math.abs(d)} 1h`
  return `${sign(d)}${Math.abs(Math.round((d / from) * 100))}% 1h`
}

function ScoreDemo() {
  const [scenario, setScenario] = useState('degrading')
  const s = SCENARIOS[scenario] ?? SCENARIOS.degrading!

  const factors: HealthFactor[] = METRICS.map((m) => ({
    label: m.factor,
    weight: m.weight,
    impact: s.impact[m.key],
    severity: severityOf(m, s.to[m.key]),
  }))
  const score = 100 + factors.reduce((sum, f) => sum + f.impact, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Tabs variant="segmented" value={scenario} onValueChange={setScenario} aria-label="Scenario">
          {Object.entries(SCENARIOS).map(([key, sc]) => (
            <Tab key={key} value={key}>
              {sc.label}
            </Tab>
          ))}
        </Tabs>
        <span className="text-ui-sm text-fg-muted">checkout-web, production, last hour</span>
      </div>

      <Panel>
        <HealthScore label="checkout-web" meta="Updated 14:32 UTC" value={score} factors={factors} />
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {METRICS.map((m) => {
          const value = s.to[m.key]
          return (
            <VitalTile
              key={m.key}
              label={m.tile}
              value={value}
              unit={m.unit}
              data={trend(s.from[m.key], value)}
              threshold={{ value: m.limit, severity: value / m.limit > 1.5 ? 'critical' : m.soft }}
              change={change(m, s.from[m.key], value)}
            />
          )
        })}
      </div>
    </div>
  )
}

const components: PatternComponent[] = [
  {
    name: 'HealthScore',
    role: 'A ring, its band as a word, the biggest factor, and every factor with its weight and the points it cost.',
  },
  {
    name: 'VitalTile',
    role: 'One metric with a trend, and the limit it is judged against printed in the footer, so no number stands alone.',
  },
]

const SERIES = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[300px]">
        <HealthScore
          size="sm"
          label="checkout-web"
          value={62}
          defaultOpen={false}
          factors={[
            { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
            { label: 'Saturation', weight: 20, impact: -9, severity: 'advisory' },
            { label: 'Open alerts', weight: 15, impact: -4, severity: 'advisory' },
            { label: 'Error rate', weight: 30, impact: -4, severity: 'normal' },
          ]}
        />
      </div>
    ),
    dontPreview: (
      <div className="flex items-center gap-4">
        <span className="num text-numeral-lg leading-none text-fg">62</span>
        <span className="max-w-[16ch] text-ui-sm leading-[1.4] text-fg-muted">Is that good? What moved it?</span>
      </div>
    ),
    doText: 'Show the score with its band and the biggest factor, and keep the breakdown one click away.',
    dontText: 'Show a bare number. Without its factors it is a black box, and people stop trusting it.',
  },
  {
    doPreview: (
      <div className="w-full max-w-[260px]">
        <VitalTile
          density="compact"
          label="p95 latency"
          value={412}
          unit="ms"
          data={SERIES}
          threshold={{ value: 400, severity: 'caution' }}
          change="+12% 1h"
        />
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[260px]">
        <VitalTile density="compact" label="p95 latency" value={412} unit="ms" data={SERIES} />
      </div>
    ),
    doText: 'Print the limit each metric is judged against, and say when it is over.',
    dontText: 'Show a metric with no limit. Whether 412 ms is fine is left to guesswork.',
  },
]

export default function CompositeScore() {
  return (
    <PatternPage
      principle={PRINCIPLES['composite-score']}
      components={components}
      demoTitle="checkout-web health score and its four metrics"
      demoIntro={
        <>
          Switch scenario. The score is 100 minus what each factor costs, and every factor comes from a metric you can
          see below it, with its limit. Open the breakdown to see the weights.
        </>
      }
      demo={<ScoreDemo />}
      dos={dos}
    />
  )
}
