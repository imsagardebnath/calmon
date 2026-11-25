// The live mini-demos of the component showcase. Each one is a real library component, so what people try here is
// exactly what ships: type past a limit, tick a checklist, type a name to delete, fire the same alert again.
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@openvanta/pikore-react/badge'
import { Banner } from '@openvanta/pikore-react/banner'
import { Button } from '@openvanta/pikore-react/button'
import { Chart } from '@openvanta/pikore-react/chart'
import { ConfirmTarget, EnvironmentBadge } from '@openvanta/pikore-react/confirm-target'
import { HealthScore, type HealthFactor } from '@openvanta/pikore-react/health-score'
import { LayersIcon, SearchIcon, TrashIcon } from '@openvanta/pikore-react/icons'
import { Kbd } from '@openvanta/pikore-react/kbd'
import { LimitedNumberInput, type LimitState } from '@openvanta/pikore-react/limited-number-input'
import { PausePoint } from '@openvanta/pikore-react/pause-point'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { Timeline, type TimelineEvent } from '@openvanta/pikore-react/timeline'
import { ToastProvider, useToast } from '@openvanta/pikore-react/toast'
import { VitalTile } from '@openvanta/pikore-react/vital-tile'
import { BentoCard } from './_bento.tsx'
import { openSiteSearch, useInterval, useReducedMotion } from './_hooks.ts'

type Severity = NonNullable<HealthFactor['severity']>

/** What the demos tell the shared timeline. */
export type Publish = (event: Omit<TimelineEvent, 'id' | 'time'>) => void

/* ------------------------------------------------------------------------------------------------
 * HealthScore: three scenarios for one service. The factors, the band and the ring all follow.
 * ---------------------------------------------------------------------------------------------- */

type Scenario = 'healthy' | 'degraded' | 'incident'
const WEIGHTS = [
  ['Latency p95', 35],
  ['Saturation', 20],
  ['Open alerts', 15],
  ['Error rate', 30],
] as const
const IMPACTS: Record<Scenario, number[]> = {
  healthy: [-2, -2, 0, -1],
  degraded: [-21, -9, -4, -4],
  incident: [-28, -15, -11, -24],
}

/** How much of its weight a factor cost decides its severity. */
const factorSeverity = (impact: number, weight: number): Severity => {
  const share = -impact / weight
  return share < 0.15 ? 'normal' : share < 0.5 ? 'advisory' : share < 0.75 ? 'caution' : 'critical'
}

export function HealthDemo({ className }: { className?: string }) {
  const [scenario, setScenario] = useState<Scenario>('degraded')
  const impacts = IMPACTS[scenario]
  const factors: HealthFactor[] = WEIGHTS.map(([label, weight], i) => ({
    label,
    weight,
    impact: impacts[i] ?? 0,
    severity: factorSeverity(impacts[i] ?? 0, weight),
  }))
  const value = 100 + impacts.reduce((sum, n) => sum + n, 0)
  return (
    <BentoCard name="HealthScore" slug="health-score" note="Composite score" className={className}>
      <Tabs variant="segmented" value={scenario} onValueChange={(v) => setScenario(v as Scenario)} aria-label="Scenario" className="self-start">
        <Tab value="healthy">Healthy</Tab>
        <Tab value="degraded">Degraded</Tab>
        <Tab value="incident">Incident</Tab>
      </Tabs>
      <HealthScore size="md" label="checkout-web" value={value} factors={factors} />
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * VitalTile: p95 latency walks around its 400 ms limit, so the tile crosses it now and then. The density switch
 * shows the same tile at compact, comfortable and station size (the "readable across the room" habit).
 * ---------------------------------------------------------------------------------------------- */

const LATENCY = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]

type Density = 'compact' | 'comfortable' | 'station'

export function VitalDemo({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [density, setDensity] = useState<Density>('comfortable')
  const [latency, setLatency] = useState(LATENCY)
  useInterval(
    () =>
      setLatency((d) => {
        const last = d.at(-1) ?? 400
        const next = Math.round(Math.min(432, Math.max(386, last + (Math.random() - 0.5) * 18)))
        return [...d.slice(1), next]
      }),
    2500,
    !reduced,
  )
  const now = latency.at(-1) ?? 0
  const first = latency[0] ?? 1
  const change = Math.round(((now - first) / first) * 100)
  return (
    <BentoCard name="VitalTile" slug="vital-tile" note="Metric with threshold" className={className}>
      <Tabs
        variant="segmented"
        value={density}
        onValueChange={(v) => setDensity(v as Density)}
        aria-label="Tile density"
        className="max-w-full self-start overflow-x-auto"
      >
        <Tab value="compact">Compact</Tab>
        <Tab value="comfortable">Comfortable</Tab>
        <Tab value="station">Station</Tab>
      </Tabs>
      {/* The tiles stretch to the card, so the row stays even when the card next to it is taller. */}
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <VitalTile
          density={density}
          className="justify-between"
          label="p95 latency"
          value={now}
          unit="ms"
          data={latency}
          threshold={{ value: 400, severity: 'caution' }}
          change={`${change >= 0 ? '+' : '−'}${Math.abs(change)}% 1h`}
        />
        <VitalTile
          density={density}
          className="justify-between"
          label="Error rate"
          value={0.42}
          unit="%"
          data={[0.5, 0.48, 0.52, 0.45, 0.47, 0.44, 0.46, 0.43, 0.45, 0.41, 0.44, 0.42]}
          threshold={{ value: 1, severity: 'critical' }}
          change="−0.06 1h"
        />
      </div>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * LimitedNumberInput: 25% asks for a reason, 60% is blocked. The caption follows the state.
 * ---------------------------------------------------------------------------------------------- */

const LIMIT_NOTE: Record<LimitState, string> = { ok: 'Usual range', soft: 'Soft limit', hard: 'Hard limit' }

export function LimitDemo({ className }: { className?: string }) {
  const [state, setState] = useState<LimitState>('soft')
  return (
    <BentoCard name="LimitedNumberInput" slug="limited-number-input" note={LIMIT_NOTE[state]} className={className}>
      <LimitedNumberInput label="Canary traffic" unit="%" softMax={25} hardMax={60} defaultValue={35} onStateChange={setState} />
      <p className="m-0 text-ui-sm text-fg-subtle">Try 20, 35 or 70.</p>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * PausePoint: two checks are already verified. Ticking the third unlocks Publish.
 * ---------------------------------------------------------------------------------------------- */

const START = [true, true, false]

export function PauseDemo({ className, publish }: { className?: string; publish: Publish }) {
  const [checked, setChecked] = useState(START)
  const [done, setDone] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const count = checked.filter(Boolean).length
  return (
    <BentoCard name="PausePoint" slug="pause-point" note={done ? 'Published' : `${count} of 3 checked`} className={className}>
      <PausePoint
        title="Before you publish"
        action="Publish"
        checked={checked}
        onCheckedChange={setChecked}
        onConfirm={() => {
          setDone(true)
          publish({ severity: 'normal', title: 'Config v43 published', description: 'PausePoint completed. Demo only.', actor: 'You', type: 'change' })
          clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            setDone(false)
            setChecked(START)
          }, 3200)
        }}
        items={['Rollback plan is linked', 'On-call engineer is notified', 'Change window is confirmed']}
      />
      <p role="status" className="m-0 min-h-5 text-ui-sm text-normal-fg">
        {done ? 'Published. Config v43 is live (demo).' : ''}
      </p>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * ConfirmTarget: the real dialog. Type the exact name to unlock the button. Nothing is deleted.
 * ---------------------------------------------------------------------------------------------- */

export function ConfirmDemo({ className, publish }: { className?: string; publish: Publish }) {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <BentoCard name="ConfirmTarget" slug="confirm-target" note={<EnvironmentBadge env="prod" />} className={className}>
      <div className="flex items-center gap-3 rounded-control bg-surface p-3 shadow-[inset_0_0_0_1px_var(--border)]">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-surface-sunken text-fg-muted">
          <LayersIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <code className="block truncate font-mono text-ui-sm text-fg">orders-eu</code>
          <span className="text-xs text-fg-subtle">284 GB · 3 replicas</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ConfirmTarget
          name="orders-eu"
          env="prod"
          action="Delete database"
          detail="284 GB · 3 replicas"
          description="Type the exact name to unlock the button. This is a demo: nothing is deleted."
          consequences={['All tables and backups are removed.', 'The 3 replicas are shut down.']}
          onConfirm={() => {
            setConfirmed(true)
            publish({
              severity: 'info',
              title: 'Delete confirmed for orders-eu',
              description: 'The exact name was typed in PROD. Demo only: nothing was deleted.',
              actor: 'You',
              type: 'change',
            })
          }}
        >
          <Button severity="critical" iconStart={<TrashIcon className="size-4" />}>
            Delete database
          </Button>
        </ConfirmTarget>
        <span role="status" className="text-ui-sm text-fg-muted">
          {confirmed ? 'Confirmed. Demo only, nothing was deleted.' : ''}
        </span>
      </div>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Timeline: one ordered record. The PausePoint and ConfirmTarget demos add to it.
 * ---------------------------------------------------------------------------------------------- */

export function TimelineDemo({ className, events }: { className?: string; events: TimelineEvent[] }) {
  return (
    <BentoCard name="Timeline" slug="timeline" note="One record per service" className={className}>
      <Timeline events={events} timeZone="UTC" as="h4" />
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Chart: the limit is drawn and named. Hover, or use the arrow keys, for a readout.
 * ---------------------------------------------------------------------------------------------- */

const LATENCY_HISTORY = [
  { time: '10:00', p95: 310 },
  { time: '10:30', p95: 330 },
  { time: '11:00', p95: 320 },
  { time: '11:30', p95: 350 },
  { time: '12:00', p95: 372 },
  { time: '12:30', p95: 391 },
  { time: '13:00', p95: 405 },
  { time: '13:30', p95: 412 },
]

export function ChartDemo({ className }: { className?: string }) {
  return (
    <BentoCard name="Chart" slug="chart" note="Threshold and readout" className={className}>
      <Chart
        type="area"
        label="p95 latency, last 4 hours"
        data={LATENCY_HISTORY}
        x="time"
        unit="ms"
        height={236}
        series={[{ key: 'p95', label: 'p95 latency' }]}
        threshold={{ value: 400, label: 'limit 400 ms', severity: 'caution' }}
      />
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Toast: the same alert, fired again and again, is one toast with a count. The pile sits inside the card.
 * ---------------------------------------------------------------------------------------------- */

function FireAlerts() {
  const { toast, dismissAll } = useToast()
  const [fired, setFired] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          severity="caution"
          onClick={() => {
            setFired((n) => n + 1)
            toast({
              severity: 'caution',
              title: 'Disk above 85%',
              description: 'db-03 will slow down writes at 90%.',
              dedupeKey: 'disk-85',
              duration: 8000,
            })
          }}
        >
          Fire disk alert
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            dismissAll()
            setFired(0)
          }}
        >
          Dismiss
        </Button>
      </div>
      <p role="status" className="m-0 text-ui-sm text-fg-muted">
        {fired === 0 ? 'Press the button a few times.' : `${fired} ${fired === 1 ? 'alert' : 'alerts'} fired, 1 toast on screen.`}
      </p>
    </div>
  )
}

export function ToastDemo({ className }: { className?: string }) {
  return (
    <BentoCard name="Toast" slug="toast" note="Grouped repeats" className={className}>
      <div className="relative flex min-h-[190px] flex-col justify-between gap-4">
        <ToastProvider
          limit={3}
          label="Demo notifications"
          className="absolute right-0 bottom-0 left-0 z-10 w-auto max-w-none"
        >
          <FireAlerts />
        </ToastProvider>
      </div>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Banner: every severity has its own colour, icon shape and word.
 * ---------------------------------------------------------------------------------------------- */

type BannerSeverity = 'info' | 'advisory' | 'caution' | 'critical'
const BANNERS: Record<BannerSeverity, [string, string]> = {
  info: ['Maintenance tonight', 'Failover test from 02:00 to 02:30 UTC. Alerts from db-* are grouped.'],
  advisory: ['Certificate expires in 21 days', 'Renew before 14 Dec to avoid a forced rotation.'],
  caution: ['Disk above 85% on 3 hosts', 'Free space or extend volumes before 90%, when writes slow down.'],
  critical: ['Payments failing in eu-west', 'Error rate is 4.2%. R. Iyer is on it. Updates every 15 minutes.'],
}

export function BannerDemo({ className }: { className?: string }) {
  const [severity, setSeverity] = useState<BannerSeverity>('caution')
  const [title, text] = BANNERS[severity]
  return (
    <BentoCard name="Banner" slug="banner" note="Shape, not just colour" className={className}>
      <Tabs variant="segmented" value={severity} onValueChange={(v) => setSeverity(v as BannerSeverity)} aria-label="Severity" className="max-w-full self-start overflow-x-auto">
        <Tab value="info">Info</Tab>
        <Tab value="advisory">Advisory</Tab>
        <Tab value="caution">Caution</Tab>
        <Tab value="critical">Critical</Tab>
      </Tabs>
      <Banner severity={severity} title={title}>
        {text}
      </Banner>
      <p className="m-0 text-ui-sm leading-[1.55] text-fg-muted">
        Each severity has its own icon shape and word, so the message never depends on colour. Caution and critical banners are
        announced to screen readers at once.
      </p>
    </BentoCard>
  )
}

/* ------------------------------------------------------------------------------------------------
 * CommandPalette: the docs search is the same component. The button sends it Ctrl K (Cmd K on a Mac).
 * ---------------------------------------------------------------------------------------------- */

export function PaletteDemo({ className }: { className?: string }) {
  return (
    <BentoCard name="CommandPalette" slug="command-palette" note="Keyboard first" className={className}>
      <button
        type="button"
        onClick={openSiteSearch}
        className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-surface-sunken pr-2.5 pl-3 text-left text-ui-sm text-fg-subtle shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,color] duration-(--duration-fast) hover:text-fg-muted hover:shadow-[inset_0_0_0_1px_var(--border-strong)]"
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Search the docs</span>
        <Kbd>mod+K</Kbd>
      </button>
      <p className="m-0 text-ui-sm leading-[1.55] text-fg-muted">
        The search in the header is this component. Type a few letters, move with the arrow keys and press Enter. Matches are
        highlighted.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Badge>Groups</Badge>
        <Badge>Fuzzy match</Badge>
        <Badge>Shortcuts</Badge>
      </div>
    </BentoCard>
  )
}
