// Example dashboard: infrastructure operations, built only from Calmon components.
// Every name, number and time is fictional. Underscore files are not routes.
import { useEffect, useRef, useState } from 'react'
import type { Severity } from '@openvanta/calmon-react'
import { Avatar } from '@openvanta/calmon-react/avatar'
import { Badge } from '@openvanta/calmon-react/badge'
import { Banner } from '@openvanta/calmon-react/banner'
import { Breadcrumbs } from '@openvanta/calmon-react/breadcrumbs'
import { Button } from '@openvanta/calmon-react/button'
import { Card, CardBody } from '@openvanta/calmon-react/card'
import { Chart } from '@openvanta/calmon-react/chart'
import { ConfirmTarget, EnvironmentBadge } from '@openvanta/calmon-react/confirm-target'
import { Dialog } from '@openvanta/calmon-react/dialog'
import { HealthScore } from '@openvanta/calmon-react/health-score'
import { BellOffIcon, FileIcon, GridIcon, LayersIcon, ListCheckIcon, PulseIcon, SettingsIcon, UserIcon } from '@openvanta/calmon-react/icons'
import { IconButton } from '@openvanta/calmon-react/icon-button'
import { Menu, MenuItem } from '@openvanta/calmon-react/menu'
import { PausePoint } from '@openvanta/calmon-react/pause-point'
import { SideNav, SideNavItem } from '@openvanta/calmon-react/side-nav'
import { StationGrid, type StationItem } from '@openvanta/calmon-react/station-grid'
import { Table, type TableColumn } from '@openvanta/calmon-react/table'
import { Tab, Tabs } from '@openvanta/calmon-react/tabs'
import { Timeline, type TimelineEvent } from '@openvanta/calmon-react/timeline'
import { ToastProvider, useToast } from '@openvanta/calmon-react/toast'
import { VitalTile } from '@openvanta/calmon-react/vital-tile'

/* ------------------------------------------------------------------ Scenario data (fictional) */

/** The screen starts at 14:32 UTC and then ticks, so it reads the same on every visit. */
const NOW = Date.UTC(2026, 10, 23, 14, 32)
const LOADED_AT = Date.now()
const screenNow = () => NOW + (Date.now() - LOADED_AT)
const at = (hh: number, mm: number, daysAgo = 0) => new Date(Date.UTC(2026, 10, 23 - daysAgo, hh, mm))
const ev = (id: string, time: Date, title: string, rest: Partial<TimelineEvent> = {}): TimelineEvent => ({ id, time, title, ...rest })

const SERVICES: StationItem[] = [
  { id: 'payments-api', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2% · 23 alerts grouped', data: [2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42] },
  { id: 'checkout-web', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s, limit 1.2 s', data: [8, 9, 8, 10, 12, 11, 14, 15, 16, 18, 17, 19] },
  { id: 'search-index', name: 'search-index', severity: 'caution', score: 64, detail: 'Replica lag 92 s', data: [5, 5, 6, 8, 11, 10, 13, 15, 14, 16, 18, 17] },
  { id: 'auth-service', name: 'auth-service', severity: 'advisory', score: 77, detail: 'CPU 78%, rising', data: [50, 52, 55, 54, 58, 60, 63, 64, 66, 70, 72, 78] },
  { id: 'orders-api', name: 'orders-api', severity: 'normal', score: 88, detail: 'All vitals in range', data: [20, 22, 21, 23, 22, 24, 22, 21, 23, 22, 24, 23] },
  { id: 'inventory', name: 'inventory', severity: 'normal', score: 91, detail: 'All vitals in range', data: [12, 13, 12, 12, 14, 13, 12, 13, 14, 13, 12, 13] },
  { id: 'notifications', name: 'notifications', severity: 'normal', score: 93, detail: 'All vitals in range', data: [30, 28, 31, 29, 30, 32, 29, 30, 31, 29, 30, 31] },
  { id: 'catalog-api', name: 'catalog-api', severity: 'normal', score: 94, detail: 'All vitals in range', data: [9, 10, 9, 9, 10, 9, 10, 10, 9, 10, 9, 10] },
  { id: 'ledger', name: 'ledger', severity: 'normal', score: 95, data: [5, 5, 6, 5, 5, 6, 5, 5, 6, 5, 6, 5] },
  { id: 'shipping', name: 'shipping', severity: 'normal', score: 96, data: [14, 15, 14, 15, 14, 14, 15, 14, 15, 14, 15, 14] },
  { id: 'cdn-edge', name: 'cdn-edge', severity: 'normal', score: 97, data: [40, 42, 41, 40, 42, 41, 40, 41, 42, 40, 41, 42] },
  { id: 'gateway', name: 'gateway', severity: 'normal', score: 98, data: [22, 22, 23, 22, 23, 22, 22, 23, 22, 23, 22, 22] },
]

type Alert = { id: string; title: string; service: string; severity: Severity; started: string; owner: string; acked: boolean }
const ALERTS: Omit<Alert, 'acked'>[] = [
  { id: 'ALT-9921', title: 'Payment authorisation failures above 4%', service: 'payments-api', severity: 'critical', started: '14:21', owner: 'R. Iyer' },
  { id: 'ALT-9917', title: 'p95 checkout latency above 1.2 s', service: 'checkout-web', severity: 'caution', started: '13:52', owner: 'A. Kaur' },
  { id: 'ALT-9904', title: 'Search replica lag at 92 seconds', service: 'search-index', severity: 'caution', started: '12:10', owner: 'M. Rao' },
  { id: 'ALT-9898', title: 'CPU at 78% and rising', service: 'auth-service', severity: 'advisory', started: '09:44', owner: 'J. Okafor' },
  { id: 'ALT-9890', title: 'Certificate expires in 21 days', service: 'gateway', severity: 'advisory', started: '08:00', owner: 'A. Kaur' },
  { id: 'ALT-9885', title: 'Database failover test tonight, 02:00', service: 'ledger', severity: 'info', started: '07:30', owner: 'P. Shah' },
]

/** One timeline per service. A service without its own events shows a quiet default. */
const TIMELINES: Record<string, TimelineEvent[]> = {
  'payments-api': [
    ev('p1', at(14, 24), 'R. Iyer acknowledged', { type: 'person', description: 'Investigating card issuer timeouts.', icon: <UserIcon width={13} height={13} /> }),
    ev('p2', at(14, 21), 'Error rate above 4%', { severity: 'critical', type: 'alert', description: '23 alerts from 6 pods grouped into one.' }),
    ev('p3', at(14, 5), 'Deploy v2.31.0 started', { type: 'deploy', description: 'Rolling, 4 of 12 pods updated.', icon: <LayersIcon width={13} height={13} /> }),
    ev('p4', at(13, 52), 'p95 latency above 800 ms', { severity: 'caution', type: 'alert' }),
    ev('p5', at(17, 40, 1), 'Config v42 published', { severity: 'normal', type: 'change', description: 'Pause point completed by A. Kaur.', icon: <ListCheckIcon width={13} height={13} /> }),
    ev('p6', at(11, 10, 1), 'Note added', { type: 'note', description: 'The issuer rate-limits us above 900 requests per second.', icon: <FileIcon width={13} height={13} /> }),
  ],
  'checkout-web': [
    ev('c1', at(14, 10), 'p95 latency above 1.2 s', { severity: 'caution', type: 'alert', description: 'Mobile Safari accounts for most of the slow requests.' }),
    ev('c2', at(13, 30), 'Canary at 10%', { type: 'deploy', actor: 'A. Kaur', icon: <LayersIcon width={13} height={13} /> }),
    ev('c3', at(16, 5, 1), 'v2.31.0 deployed', { severity: 'normal', type: 'deploy', actor: 'M. Rao' }),
  ],
  'search-index': [
    ev('s1', at(12, 10), 'Replica lag above 60 s', { severity: 'caution', type: 'alert', description: 'Reindex job is running on the primary.' }),
    ev('s2', at(11, 55), 'Reindex started', { type: 'job', actor: 'M. Rao' }),
  ],
  'auth-service': [ev('a1', at(9, 44), 'CPU above 75%', { severity: 'advisory', type: 'alert', description: 'Up from 52% at 06:00.' })],
}
const QUIET = [ev('q1', at(6, 0), 'All checks passing', { severity: 'normal', type: 'health' })]

const RANGES = { '1h': { n: 12, step: 5 * 60e3, ramp: 4, k: 40 }, '24h': { n: 24, step: 60 * 60e3, ramp: 6, k: 28 }, '7d': { n: 14, step: 12 * 60 * 60e3, ramp: 1, k: 110 } } as const
type Range = keyof typeof RANGES
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const wobble = (i: number, seed: number) => Math.sin(i * 12.9898 + seed * 78.233)

/** Latency and errors for the chosen range. The last point is today's reading. */
function readings(range: Range) {
  const { n, step, ramp, k } = RANGES[range]
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(NOW - (n - 1 - i) * step)
    const hh = t.toISOString().slice(11, 13)
    const time = range === '1h' ? t.toISOString().slice(11, 16) : range === '24h' ? `${hh}:00` : `${DAY[t.getUTCDay()]} ${hh}h`
    const up = Math.max(0, i - (n - 1 - ramp))
    const last = i === n - 1
    return {
      time,
      p95: last ? 412 : Math.round(235 + i * 2 + wobble(i, 2) * 14 + up * k),
      p50: last ? 126 : Math.round(118 + wobble(i, 5) * 7 + up * 5),
      e5xx: last ? 280 : up > 0 ? 60 + (up - 1) * 55 : Math.round(28 + wobble(i, 1) * 5),
      e4xx: Math.round(85 + wobble(i, 4) * 12),
    }
  })
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: <GridIcon /> },
  { id: 'services', label: 'Services', icon: <PulseIcon /> },
  { id: 'incidents', label: 'Incidents', icon: <BellOffIcon /> },
  { id: 'deploys', label: 'Deploys', icon: <LayersIcon /> },
  { id: 'oncall', label: 'On call', icon: <UserIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

const ON_CALL = [
  { name: 'R. Iyer', role: 'Payments, primary', until: 'until 18:00' },
  { name: 'A. Kaur', role: 'Platform, primary', until: 'until 22:00' },
  { name: 'M. Rao', role: 'Search, secondary', until: 'until 18:00' },
]

/* ------------------------------------------------------------------ Small pieces */

/** On a narrow screen the side navigation moves into a menu. */
function NavMenu({ onPick }: { onPick: (label: string) => void }) {
  return (
    <Menu trigger={<IconButton variant="ghost" size="sm" label="Open navigation" icon={<GridIcon />} className="@3xl:hidden" />}>
      {NAV.map((n) => (
        <MenuItem key={n.id} icon={n.icon} onClick={() => onPick(n.label)}>
          {n.label}
        </MenuItem>
      ))}
    </Menu>
  )
}

/* ------------------------------------------------------------------ The screen */

function Operations() {
  const { toast, dismiss } = useToast()
  const [range, setRange] = useState<Range>('24h')
  const [service, setService] = useState('payments-api')
  const [acked, setAcked] = useState<string[]>([])
  const [incidentAcked, setIncidentAcked] = useState(false)
  const [history, setHistory] = useState(['v2.30.4', 'v2.31.0'])
  const [deployOpen, setDeployOpen] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [log, setLog] = useState<Record<string, TimelineEvent[]>>({})
  const [now, setNow] = useState(screenNow)
  const gridRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)
  const seq = useRef(0)
  useEffect(() => () => clearInterval(timer.current), [])
  useEffect(() => {
    const id = setInterval(() => setNow(screenNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  // StationTile has no selected state, so mark the chosen tile for CSS and for assistive tech.
  useEffect(() => {
    gridRef.current?.querySelectorAll<HTMLElement>('button[aria-label]').forEach((el) => {
      el.setAttribute('aria-pressed', String(el.getAttribute('aria-label')?.startsWith(`${service}, `) ?? false))
    })
  })

  const running = history[history.length - 1]!
  const previous = history[history.length - 2]
  const upToDate = history.includes('v2.32.0')
  const data = readings(range)
  const rows: Alert[] = ALERTS.map((a) => ({ ...a, acked: acked.includes(a.id) }))
  const open = rows.filter((a) => !a.acked && a.severity !== 'info').length
  const events = [...(log[service] ?? []), ...(TIMELINES[service] ?? QUIET)]

  const record = (svc: string, e: Partial<TimelineEvent> & { title: string }) =>
    setLog((l) => ({ ...l, [svc]: [{ id: `new-${++seq.current}`, time: new Date(screenNow()), ...e }, ...(l[svc] ?? [])] }))
  const soon = (label: string) =>
    toast({ severity: 'info', title: `${label} is not part of this example`, description: 'The docs show the overview only.', duration: 3000 })

  const acknowledge = (a: Alert) => {
    setAcked((x) => [...x, a.id])
    record(a.service, { severity: 'info', title: `${a.id} acknowledged`, actor: 'A. Kaur', type: 'person', description: a.title })
    toast({ severity: 'info', title: `${a.id} acknowledged`, description: `${a.owner} stays the owner. Repeats stay grouped.` })
  }

  const deploy = () => {
    setDeployOpen(false)
    setDeploying(true)
    let done = 0
    const status = (n: number) => ({ id: 'deploy', severity: 'info' as const, loading: true, title: 'Deploying v2.32.0', description: `${n} of 12 pods updated`, progress: (n / 12) * 100, duration: 0 })
    toast(status(0))
    timer.current = setInterval(() => {
      done += 3
      if (done < 12) return void toast(status(done))
      clearInterval(timer.current)
      setDeploying(false)
      setHistory((h) => [...h, 'v2.32.0'])
      record('checkout-web', { severity: 'normal', title: 'v2.32.0 deployed', actor: 'A. Kaur', type: 'deploy', description: 'Pause point completed, 12 of 12 pods updated.' })
      toast({ id: 'deploy', severity: 'normal', loading: false, progress: undefined, title: 'Deployed v2.32.0', description: 'checkout-web is healthy on all 12 pods.', duration: 6000 })
    }, 700)
  }

  const rollback = () => {
    if (deploying) {
      // Rolling back mid-deploy stops the rollout. The pods that were updated go back to the running version.
      clearInterval(timer.current)
      setDeploying(false)
      dismiss('deploy')
      record('checkout-web', { severity: 'caution', title: 'Deploy of v2.32.0 cancelled', actor: 'A. Kaur', type: 'deploy', description: `Pods return to ${running}.` })
      toast({ severity: 'caution', title: 'Deploy cancelled', description: `checkout-web stays on ${running}.` })
      return
    }
    if (!previous) return
    setHistory((h) => h.slice(0, -1))
    record('checkout-web', { severity: 'caution', title: `Rolled back to ${previous}`, actor: 'A. Kaur', type: 'deploy', description: `From ${running}, 12 pods.` })
    toast({ severity: 'caution', title: `Rolled back to ${previous}`, description: 'checkout-web is serving the previous version on all 12 pods.' })
  }

  const columns: TableColumn<Alert>[] = [
    {
      key: 'title',
      header: 'Alert',
      rowHeader: true,
      accessor: (a) => (
        <span className="flex flex-col">
          <span>{a.title}</span>
          <span className="font-mono text-[11px] font-normal text-fg-subtle">{a.id}</span>
        </span>
      ),
    },
    { key: 'service', header: 'Service', accessor: (a) => <span className="font-mono text-xs">{a.service}</span> },
    { key: 'started', header: 'Started', numeric: true },
    {
      key: 'owner',
      header: 'Owner',
      accessor: (a) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Avatar name={a.owner} size="sm" />
          {a.owner}
        </span>
      ),
    },
    {
      key: 'action',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      accessor: (a) =>
        a.acked ? (
          <Badge severity="info">Acknowledged</Badge>
        ) : a.severity === 'info' ? null : (
          <Button size="sm" onClick={() => acknowledge(a)}>
            Acknowledge
            <span className="sr-only"> {a.id}</span>
          </Button>
        ),
    },
  ]

  const sideNav = (collapsed: boolean) => (
    <SideNav aria-label="Operations" collapsed={collapsed}>
      {NAV.map((n) => (
        <SideNavItem
          key={n.id}
          icon={n.icon}
          active={n.id === 'overview'}
          badge={n.id === 'services' ? { severity: 'critical', count: 1 } : n.id === 'incidents' ? { severity: 'caution', count: open } : undefined}
          onClick={n.id === 'overview' ? undefined : () => soon(n.label)}
        >
          {n.label}
        </SideNavItem>
      ))}
    </SideNav>
  )

  return (
    <div className="@container bg-surface text-fg">
      <div className="grid min-h-[680px] grid-cols-1 @3xl:grid-cols-[80px_minmax(0,1fr)] @5xl:grid-cols-[216px_minmax(0,1fr)]">
        <aside className="hidden flex-col border-r border-border bg-surface px-3 py-[18px] @3xl:flex">
          <div className="flex items-center justify-center gap-2.5 pb-4 font-semibold @5xl:justify-start @5xl:px-2">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent text-accent-on">
              <PulseIcon />
            </span>
            <span className="hidden @5xl:inline">Northwind Ops</span>
          </div>
          <div className="@5xl:hidden">{sideNav(true)}</div>
          <div className="hidden @5xl:block">{sideNav(false)}</div>
          <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-border pt-3 text-ui-sm @5xl:justify-start @5xl:px-2">
            <Avatar name="A. Kaur" size="sm" status="online" />
            <div className="hidden @5xl:block">
              <div className="font-[550]">A. Kaur</div>
              <div className="text-xs text-fg-muted">SRE, on call</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-raised px-5 py-3.5">
            <NavMenu onPick={soon} />
            <div className="min-w-0">
              <Breadcrumbs items={[{ label: 'Production' }, { label: 'eu-west' }, { label: 'Overview' }]} className="text-xs" />
              <h3 className="text-lg">Overview</h3>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <EnvironmentBadge env="prod" />
              <Tabs variant="segmented" value={range} onValueChange={(v) => setRange(v as Range)} aria-label="Time range">
                <Tab value="1h">1h</Tab>
                <Tab value="24h">24h</Tab>
                <Tab value="7d">7d</Tab>
              </Tabs>
              <Button variant="primary" size="sm" iconStart={<LayersIcon />} disabled={upToDate || deploying} onClick={() => setDeployOpen(true)}>
                Deploy
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-4 p-4 @3xl:p-5">
            <Banner
              severity="critical"
              title="INC-2041: Payments failing in eu-west"
              action={
                incidentAcked ? (
                  <Badge severity="info">Acknowledged by A. Kaur</Badge>
                ) : (
                  <>
                    <Button
                      size="sm"
                      severity="critical"
                      onClick={() => {
                        setIncidentAcked(true)
                        record('payments-api', { severity: 'info', title: 'INC-2041 acknowledged', actor: 'A. Kaur', type: 'person' })
                        toast({ severity: 'info', title: 'INC-2041 acknowledged', description: 'R. Iyer stays incident lead.' })
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setService('payments-api')}>
                      Show service
                    </Button>
                  </>
                )
              }
            >
              Error rate 4.2% since 14:21. 23 alerts from 6 pods grouped. R. Iyer is incident lead; next update 14:45.
            </Banner>

            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @7xl:grid-cols-4">
              <VitalTile
                label="Availability, 30d"
                value={99.94}
                unit="%"
                data={[99.95, 99.96, 99.94, 99.97, 99.95, 99.96, 99.94, 99.95, 99.93, 99.94]}
                threshold={{ value: 99.9, severity: 'caution', direction: 'below' }}
                change="−0.01"
              />
              <VitalTile
                label="p95 latency"
                value={412}
                unit="ms"
                data={[310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]}
                threshold={{ value: 400, severity: 'caution' }}
                change="+12% 1h"
              />
              <VitalTile
                label="Error rate"
                value={4.2}
                unit="%"
                data={[0.3, 0.4, 0.3, 0.35, 0.4, 0.5, 0.9, 1.8, 3.1, 4.2]}
                threshold={{ value: 1, severity: 'critical' }}
                change="+3.78 1h"
              />
              <VitalTile
                label="Throughput"
                value={1284}
                unit="req/s"
                data={[1100, 1180, 1220, 1250, 1210, 1300, 1280, 1310, 1270, 1284]}
                threshold={{ value: 2000, severity: 'caution' }}
                footer="capacity 2,000"
                change="+4% 1h"
              />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2">
              <Card as="h4" title="Latency" action={<span className="text-ui-sm text-fg-subtle">all services, {range}</span>}>
                <Chart
                  label={`Latency, all services, last ${range}`}
                  data={data}
                  x="time"
                  series={[
                    { key: 'p95', label: 'p95', color: 'caution' },
                    { key: 'p50', label: 'p50', color: 'accent' },
                  ]}
                  threshold={{ value: 400, label: 'limit 400 ms' }}
                  unit="ms"
                  height={220}
                />
              </Card>
              <Card as="h4" title="Errors per minute" action={<span className="text-ui-sm text-fg-subtle">{range}</span>}>
                <Chart
                  type="bar"
                  label={`Errors per minute, last ${range}`}
                  data={data}
                  x="time"
                  series={[
                    { key: 'e5xx', label: '5xx', color: 'critical' },
                    { key: 'e4xx', label: '4xx', color: 'neutral' },
                  ]}
                  unit="/min"
                  height={220}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 @6xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Card as="h4" title="Services" action={<span className="text-ui-sm text-fg-subtle">12, worst first. Select one for its timeline.</span>}>
                <div ref={gridRef} className="[&_[aria-pressed=true]]:outline-2 [&_[aria-pressed=true]]:outline-accent">
                  <StationGrid label="Production services" items={SERVICES} onSelect={(s) => setService(s.id)} />
                </div>
              </Card>
              <Card as="h4" title="Environment health" action={<Badge severity="caution">Caution</Badge>}>
                <HealthScore
                  size="sm"
                  label="eu-west"
                  meta="14:32 UTC"
                  value={62}
                  factors={[
                    { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
                    { label: 'Error rate', weight: 30, impact: -10, severity: 'caution' },
                    { label: 'Saturation', weight: 20, impact: -5, severity: 'advisory' },
                    { label: 'Open alerts', weight: 15, impact: -2, severity: 'normal' },
                  ]}
                />
              </Card>
            </div>

            <Card as="h4" title="Alerts" action={<span className="text-ui-sm text-fg-subtle">{open} need action</span>}>
              <CardBody className="p-0">
                <Table<Alert> aria-label="Alerts, worst first" columns={columns} data={rows} density="compact" className="rounded-t-none border-0" />
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2">
              <Card as="h4" title={`${service} timeline`}>
                <div className="max-h-[380px] overflow-y-auto pr-1">
                  <Timeline events={events} timeZone="UTC" now={now} />
                </div>
              </Card>
              <div className="flex flex-col gap-4">
                <Card as="h4" title="Release, checkout-web" action={<EnvironmentBadge env="prod" />}>
                  <div className="flex flex-col gap-3">
                    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-ui-sm">
                      <dt className="text-fg-muted">Running</dt>
                      <dd className="m-0 text-right font-mono">{running}</dd>
                      <dt className="text-fg-muted">Ready to deploy</dt>
                      <dd className="m-0 text-right font-mono">{upToDate ? 'nothing newer' : 'v2.32.0'}</dd>
                      <dt className="text-fg-muted">Rollback target</dt>
                      <dd className="m-0 text-right font-mono">{previous ?? 'none'}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary" size="sm" iconStart={<LayersIcon />} disabled={upToDate || deploying} onClick={() => setDeployOpen(true)}>
                        Deploy v2.32.0
                      </Button>
                      <ConfirmTarget
                        name="checkout-web"
                        env="prod"
                        action="Roll back"
                        detail={`${running} → ${previous ?? 'none'}`}
                        description="Traffic moves back to the previous version, pod by pod."
                        consequences={[`All 12 pods are rolled back to ${previous ?? 'the previous version'}.`, 'A deploy in progress is cancelled.']}
                        onConfirm={rollback}
                      >
                        <Button size="sm" severity="critical" disabled={!previous && !deploying}>
                          Roll back
                        </Button>
                      </ConfirmTarget>
                    </div>
                  </div>
                </Card>
                <Card as="h4" title="On call">
                  <ul className="m-0 flex list-none flex-col p-0">
                    {ON_CALL.map((p) => (
                      <li key={p.name} className="flex items-center gap-3 border-t border-border py-2.5 text-ui-sm first:border-t-0 first:pt-0 last:pb-0">
                        <Avatar name={p.name} />
                        <span className="min-w-0">
                          <span className="block font-[550]">{p.name}</span>
                          <span className="block text-xs text-fg-muted">{p.role}</span>
                        </span>
                        <span className="ml-auto font-mono text-xs text-fg-subtle">{p.until}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={deployOpen}
        onOpenChange={setDeployOpen}
        title="Deploy checkout-web v2.32.0"
        description="A rolling update across 12 pods in production."
      >
        <Banner severity="caution" title="An incident is open in this region">
          INC-2041 affects payments-api. Deploying now adds risk.
        </Banner>
        <PausePoint
          title="Before you deploy"
          env="prod"
          action="Deploy v2.32.0"
          onCancel={() => setDeployOpen(false)}
          onConfirm={deploy}
          items={[
            { label: 'Diff reviewed by a second person', evidence: 'Approved by M. Rao, 20 min ago' },
            { label: 'Rollback plan is linked', evidence: `${running} is one click away` },
            'Incident lead agrees to deploy now',
          ]}
        />
      </Dialog>
    </div>
  )
}

export function ItOps() {
  return (
    <ToastProvider>
      <Operations />
    </ToastProvider>
  )
}

export default ItOps
