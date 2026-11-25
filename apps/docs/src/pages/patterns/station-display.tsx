// Readable across the room: the same tiles at comfortable, compact and station density, worst first, with a greyscale check.
import { useState } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { StationGrid, StationTile, type StationItem } from '@openvanta/pikore-react/station-grid'
import { Switch } from '@openvanta/pikore-react/switch'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { VitalTile, type VitalThreshold } from '@openvanta/pikore-react/vital-tile'
import { PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

type Density = 'comfortable' | 'compact' | 'station'

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
  { value: 'station', label: 'Station' },
]

/** Whole class strings, so Tailwind can see them. Station density needs wide tiles for 88px numerals. */
const GRID: Record<Density, string> = {
  comfortable: 'grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 p-4',
  compact: 'grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5 p-3',
  station: 'grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 p-6',
}
const TITLE: Record<Density, string> = {
  comfortable: 'text-lg',
  compact: 'text-ui',
  station: 'text-4xl',
}

interface Metric {
  id: string
  label: string
  value: number
  unit?: string
  data: number[]
  threshold: VitalThreshold
  change: string
}

/** In the order the data arrives. The display sorts them, so this order does not matter. */
const METRICS: Metric[] = [
  { id: 'cpu', label: 'CPU saturation', value: 78, unit: '%', data: [61, 63, 62, 66, 68, 67, 70, 72, 74, 73, 76, 78], threshold: { value: 85, severity: 'advisory' }, change: '+6 pts 1h' },
  { id: 'latency', label: 'p95 latency', value: 1840, unit: 'ms', data: [980, 1010, 1000, 1090, 1150, 1230, 1310, 1420, 1530, 1640, 1760, 1840], threshold: { value: 1200, severity: 'caution' }, change: '+53% 1h' },
  { id: 'errors', label: 'Error rate', value: 0.42, unit: '%', data: [0.5, 0.48, 0.52, 0.45, 0.47, 0.44, 0.46, 0.43, 0.45, 0.41, 0.44, 0.42], threshold: { value: 1, severity: 'critical' }, change: '−0.06 pts 1h' },
  { id: 'queue', label: 'Jobs in queue', value: 2310, data: [400, 420, 480, 600, 750, 900, 1100, 1350, 1600, 1900, 2100, 2310], threshold: { value: 1000, severity: 'critical' }, change: '+410% 1h' },
]

const RANK = { normal: 0, info: 1, advisory: 2, caution: 3, critical: 4 } as const

/** How bad the tile is: its threshold's severity when the value is over the limit, otherwise normal. */
function severityOf(m: Metric) {
  return m.value > m.threshold.value ? m.threshold.severity : 'normal'
}

const worstFirst = [...METRICS].sort((a, b) => RANK[severityOf(b)] - RANK[severityOf(a)])

function DensityDemo() {
  const [density, setDensity] = useState<Density>('station')
  const [grey, setGrey] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Tabs variant="segmented" value={density} onValueChange={(v) => setDensity(v as Density)} aria-label="Density">
          {DENSITIES.map((d) => (
            <Tab key={d.value} value={d.value}>
              {d.label}
            </Tab>
          ))}
        </Tabs>
        <Switch checked={grey} onCheckedChange={setGrey} className="text-ui-sm font-[550]">
          Greyscale
        </Switch>
      </div>

      {/* The display: everything inside follows the data-density of this element, the controls above do not. */}
      <div data-density={density} className={`rounded-card bg-surface-sunken shadow-[inset_0_0_0_1px_var(--border)] ${grey ? 'grayscale' : ''}`}>
        <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 ${density === 'station' ? 'px-6 pt-5' : density === 'compact' ? 'px-3 pt-3' : 'px-4 pt-4'}`}>
          <div className="flex flex-col">
            <span className={`font-semibold tracking-[-0.02em] ${TITLE[density]}`}>Checkout, eu-west-1</span>
            <span className="text-ui-sm text-fg-muted">Updated 14:32 UTC</span>
          </div>
          <Button>Acknowledge alerts</Button>
        </div>
        <div className={`grid ${GRID[density]}`}>
          {worstFirst.map((m) => (
            <VitalTile key={m.id} label={m.label} value={m.value} unit={m.unit} data={m.data} threshold={m.threshold} change={m.change} />
          ))}
        </div>
      </div>
    </div>
  )
}

const components: PatternComponent[] = [
  {
    name: 'VitalTile',
    role: 'Takes the density of the screen it sits on: numerals up to 88px, a taller trend line, and a larger badge and label.',
  },
  {
    name: 'StationGrid',
    role: 'Sorts tiles worst first whatever order the data arrives in, so the top-left tile is the one to look at.',
  },
]

const ITEMS: StationItem[] = [
  { id: 'auth', name: 'auth-service', severity: 'advisory', score: 77, data: [50, 52, 55, 54, 58, 60, 63, 64, 66, 70, 72, 78] },
  { id: 'checkout', name: 'checkout-web', severity: 'caution', score: 58, data: [8, 9, 8, 10, 12, 11, 14, 15, 16, 18, 17, 19] },
  { id: 'orders', name: 'orders-api', severity: 'normal', score: 88, data: [20, 22, 21, 23, 22, 24, 22, 21, 23, 22, 24, 23] },
  { id: 'payments', name: 'payments-api', severity: 'critical', score: 41, data: [2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42] },
]

const SERIES = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]
const LATENCY: VitalThreshold = { value: 400, severity: 'caution' }

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[340px]">
        <StationGrid label="Services, worst first" items={ITEMS} columns={2} summary={false} />
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[340px]">
        <StationGrid label="Services, by name" items={ITEMS} columns={2} summary={false} sort="name" />
      </div>
    ),
    doText: 'Sort worst first, so the top-left tile is always the one to look at.',
    dontText: 'Sort by name on a wall display. The failing service lands wherever its letters fall.',
  },
  {
    doPreview: (
      <div className="w-full max-w-[360px]">
        <VitalTile density="station" label="p95 latency" value={412} unit="ms" data={SERIES} threshold={LATENCY} change="+12% 1h" />
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[190px]">
        <VitalTile density="compact" label="p95" value={412} unit="ms" data={SERIES} threshold={LATENCY} />
      </div>
    ),
    doText: 'Switch the display to station density: type, spacing and numerals scale together.',
    dontText: 'Show a wall display at compact density. The numbers can’t be read from across the room.',
  },
  {
    doPreview: (
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5 grayscale">
        <StationTile name="payments-api" severity="critical" score={41} detail="Errors 4.2%" />
        <StationTile name="checkout-web" severity="caution" score={58} detail="p95 1.8 s" />
      </div>
    ),
    dontPreview: (
      <div className="flex items-center gap-4 grayscale" role="presentation">
        <span className="size-7 rounded-full bg-critical" />
        <span className="size-7 rounded-full bg-caution" />
        <span className="size-7 rounded-full bg-advisory" />
      </div>
    ),
    doText: 'Check the screen in greyscale. Every status keeps its own icon and its word.',
    dontText: 'Rely on red against orange. In greyscale, under glare, or for a colour-blind colleague, they look the same.',
  },
]

export default function StationDisplay() {
  return (
    <PatternPage
      principle={PRINCIPLES['station-display']}
      components={components}
      demoTitle="Checkout metrics at three densities"
      demoIntro={
        <>
          Switch between comfortable, compact and station density. Numerals, spacing, the trend line, the badge and the
          button all scale together, and the tiles stay sorted worst first. Turn on greyscale to check that severity still
          reads without colour.
        </>
      }
      demo={<DensityDemo />}
      dos={dos}
    />
  )
}
