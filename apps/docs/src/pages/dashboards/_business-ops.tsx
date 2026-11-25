// Example dashboard: commerce operations, built only from Pikore UI components.
// Every name, number and time is fictional. Underscore files are not routes.
import { useEffect, useRef, useState } from 'react'
import type { Severity } from '@openvanta/pikore-react'
import { Avatar } from '@openvanta/pikore-react/avatar'
import { Badge } from '@openvanta/pikore-react/badge'
import { Banner } from '@openvanta/pikore-react/banner'
import { Button } from '@openvanta/pikore-react/button'
import { Card, CardBody } from '@openvanta/pikore-react/card'
import { Chart } from '@openvanta/pikore-react/chart'
import { HealthScore, scoreSeverity } from '@openvanta/pikore-react/health-score'
import { DownloadIcon, GaugeIcon, GridIcon, LayersIcon, ListCheckIcon, SeverityIcon, SettingsIcon, UserIcon, BellOffIcon } from '@openvanta/pikore-react/icons'
import { IconButton } from '@openvanta/pikore-react/icon-button'
import { LimitedNumberInput, type LimitState } from '@openvanta/pikore-react/limited-number-input'
import { Menu, MenuItem } from '@openvanta/pikore-react/menu'
import { ProgressBar } from '@openvanta/pikore-react/progress-bar'
import { SideNav, SideNavItem } from '@openvanta/pikore-react/side-nav'
import { Sparkline } from '@openvanta/pikore-react/sparkline'
import { Table, type TableColumn } from '@openvanta/pikore-react/table'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { ToastProvider, useToast } from '@openvanta/pikore-react/toast'
import { VitalTile } from '@openvanta/pikore-react/vital-tile'

/* ------------------------------------------------------------------ Scenario data (fictional) */

const wobble = (i: number, seed: number) => Math.sin(i * 12.9898 + seed * 78.233)
/** A short trend that drifts from `from` and ends exactly on `to`. */
const curve = (from: number, to: number, seed: number, n = 10) =>
  Array.from({ length: n }, (_, i) => (i === n - 1 ? to : Math.round((from + ((to - from) * i) / (n - 1) + wobble(i, seed) * Math.abs(to - from) * 0.06) * 100) / 100))

type Period = 'today' | '7d' | '30d'
const PERIODS: Record<
  Period,
  { sub: string; revenue: number; orders: number; conversion: number; refunds: number; revenueTarget: number; ordersTarget: number; change: [string, string, string, string]; since: string }
> = {
  today: { sub: 'Today, compared with the same day last week', revenue: 184210, orders: 2431, conversion: 3.1, refunds: 2.8, revenueTarget: 150000, ordersTarget: 2000, change: ['+6.2% wk', '+4.1% wk', '−0.3 pts', '+0.6 pts'], since: '11:00' },
  '7d': { sub: 'The last 7 days, compared with the 7 before', revenue: 1215000, orders: 15882, conversion: 3.2, refunds: 2.6, revenueTarget: 1050000, ordersTarget: 14000, change: ['+3.8% wk', '+2.9% wk', '−0.2 pts', '+0.3 pts'], since: 'Friday' },
  '30d': { sub: 'The last 30 days, compared with the 30 before', revenue: 4963000, orders: 66840, conversion: 3.3, refunds: 2.4, revenueTarget: 4500000, ordersTarget: 60000, change: ['+9.4% mo', '+7.7% mo', '−0.1 pts', '−0.2 pts'], since: 'the 12th' },
}

const money = (v: number) => (v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1e3)}k`)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Revenue in thousands of dollars: this period against the one before it. */
function revenueSeries(period: Period) {
  if (period === 'today') {
    const shape = [2, 1, 1, 1, 1, 2, 4, 7, 10, 12, 13, 14, 13, 12, 13]
    const total = shape.reduce((a, n) => a + n, 0)
    let now = 0
    let prev = 0
    return shape.map((w, i) => {
      now += (w * 184.2) / total
      prev += (w * (1 + wobble(i, 3) * 0.08) * 173) / total
      return { label: `${String(i).padStart(2, '0')}:00`, now: Math.round(now * 10) / 10, prev: Math.round(prev * 10) / 10 }
    })
  }
  if (period === '7d') {
    const now = [158, 165, 168, 171, 178, 192, 184]
    const prev = [150, 158, 160, 166, 172, 186, 178]
    return now.map((v, i) => ({ label: DAYS[(2 + i) % 7]!, now: v, prev: prev[i]! }))
  }
  return Array.from({ length: 30 }, (_, i) => {
    const weekend = i % 7 >= 5 ? 14 : 0
    const d = new Date(Date.UTC(2026, 10, 23 - (29 - i)))
    return {
      label: `${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${d.getUTCDate()}`,
      now: i === 29 ? 184 : Math.round(140 + i * 1.6 + weekend + wobble(i, 1) * 5),
      prev: Math.round(133 + i * 1.3 + weekend + wobble(i, 4) * 5),
    }
  })
}

const CHANNELS = [
  { channel: 'Web', now: 1180, prev: 1090 },
  { channel: 'iOS', now: 640, prev: 600 },
  { channel: 'Android', now: 410, prev: 430 },
  { channel: 'Marketplace', now: 160, prev: 140 },
  { channel: 'Wholesale', now: 41, prev: 52 },
]

type Account = { id: string; name: string; plan: string; mrr: number; health: number; trend: number[]; csm: string; renews: string }
const ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Northwind Traders', plan: 'Enterprise', mrr: 18400, health: 91, trend: curve(86, 91, 1), csm: 'P. Shah', renews: 'Jan 14' },
  { id: 'a2', name: 'Contoso Retail', plan: 'Business', mrr: 6200, health: 64, trend: curve(80, 64, 2), csm: 'A. Kumar', renews: 'Dec 02' },
  { id: 'a3', name: 'Fabrikam Foods', plan: 'Enterprise', mrr: 22800, health: 38, trend: curve(79, 38, 3), csm: 'M. Shah', renews: 'Nov 30' },
  { id: 'a4', name: 'Tailspin Toys', plan: 'Business', mrr: 4100, health: 77, trend: curve(84, 77, 4), csm: 'L. Torres', renews: 'Feb 03' },
  { id: 'a5', name: 'Adventure Works', plan: 'Enterprise', mrr: 15900, health: 88, trend: curve(85, 88, 5), csm: 'P. Shah', renews: 'Mar 21' },
  { id: 'a6', name: 'Litware Inc', plan: 'Starter', mrr: 900, health: 93, trend: curve(90, 93, 6), csm: 'A. Kumar', renews: 'Apr 09' },
]

const NAV = [
  { id: 'overview', label: 'Overview', icon: <GridIcon /> },
  { id: 'orders', label: 'Orders', icon: <ListCheckIcon /> },
  { id: 'products', label: 'Products', icon: <LayersIcon /> },
  { id: 'customers', label: 'Customers', icon: <UserIcon /> },
  { id: 'support', label: 'Support', icon: <BellOffIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

const SUPPORT: { label: string; value: string; severity: Severity; note?: string }[] = [
  { label: 'Open tickets', value: '142', severity: 'normal' },
  { label: 'First response, median', value: '38 min', severity: 'caution', note: 'target 30 min' },
  { label: 'Breaching SLA', value: '6', severity: 'critical', note: 'act now' },
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

/** A discount with two limits: past 25% it asks for a reason, past 60% it is blocked. */
function Promotion({ revenue }: { revenue: number }) {
  const { toast } = useToast()
  const [pct, setPct] = useState<number | null>(15)
  const [state, setState] = useState<LimitState>('ok')
  const [why, setWhy] = useState('')
  const allowed = pct !== null && pct > 0 && state !== 'hard' && (state !== 'soft' || why.trim().length > 3)
  return (
    <Card as="h4" title="Spring sale" action={<Badge variant="outline">Draft</Badge>}>
      <div className="flex flex-col gap-4">
        <LimitedNumberInput
          label="Storewide discount"
          unit="%"
          softMax={25}
          hardMax={60}
          hardMin={0}
          value={pct}
          onValueChange={setPct}
          onStateChange={setState}
          justification={why}
          onJustificationChange={setWhy}
          justificationPlaceholder="Recorded in the price log"
          className="max-w-xs"
        />
        <p className="text-ui-sm text-fg-muted">
          {pct !== null && pct > 0 && state !== 'hard'
            ? `At ${pct}%, about ${money((revenue * pct) / 100)} of today's revenue is given back as discount.`
            : 'Enter a discount to see what it costs.'}
        </p>
        <div>
          <Button
            variant="primary"
            disabled={!allowed}
            onClick={() => {
              toast({
                severity: state === 'soft' ? 'caution' : 'normal',
                title: `${pct}% discount scheduled`,
                description: state === 'soft' ? `Above the usual range. Reason recorded: ${why.trim()}` : 'Starts Friday 09:00. Recorded in the price log.',
              })
              setWhy('')
            }}
          >
            Schedule discount
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ The screen */

function Commerce() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<Period>('today')
  const [banner, setBanner] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const p = PERIODS[period]
  const mult = p.orders / 2431
  const rev = revenueSeries(period)
  const soon = (label: string) =>
    toast({ severity: 'info', title: `${label} is not part of this example`, description: 'The docs show the overview only.', duration: 3000 })

  const exportCsv = () => {
    toast({ id: 'export', severity: 'info', loading: true, title: 'Preparing export', description: `commerce-${period}.csv`, duration: 0 })
    timer.current = setTimeout(
      () => toast({ id: 'export', severity: 'normal', loading: false, title: 'Export ready', description: `commerce-${period}.csv, ${p.orders.toLocaleString('en-US')} orders.`, duration: 5000 }),
      1400,
    )
  }

  const columns: TableColumn<Account>[] = [
    {
      key: 'name',
      header: 'Account',
      rowHeader: true,
      sortable: true,
      accessor: (a) => (
        <span className="flex flex-col">
          <span>{a.name}</span>
          <span className="text-xs font-normal text-fg-subtle">{a.plan}</span>
        </span>
      ),
      sortValue: (a) => a.name,
    },
    {
      key: 'health',
      header: 'Health',
      sortable: true,
      accessor: (a) => (
        <span className="flex items-center gap-2.5">
          <span className="num w-6 text-right text-ui-sm">{a.health}</span>
          <ProgressBar value={a.health} severity={scoreSeverity(a.health) === 'normal' ? undefined : scoreSeverity(a.health)} aria-label={`Health ${a.health} of 100`} className="w-16" />
        </span>
      ),
      sortValue: (a) => a.health,
    },
    { key: 'mrr', header: 'MRR', numeric: true, sortable: true, accessor: (a) => `$${a.mrr.toLocaleString('en-US')}`, sortValue: (a) => a.mrr },
    {
      key: 'trend',
      header: '90 days',
      accessor: (a) => <Sparkline data={a.trend} severity={a.health >= 85 ? undefined : scoreSeverity(a.health)} height={22} className="w-24" />,
    },
    {
      key: 'csm',
      header: 'Owner',
      accessor: (a) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Avatar name={a.csm} size="sm" />
          {a.csm}
        </span>
      ),
    },
    { key: 'renews', header: 'Renews', numeric: true },
  ]

  const sideNav = (collapsed: boolean) => (
    <SideNav aria-label="Store" collapsed={collapsed}>
      {NAV.map((n) => (
        <SideNavItem
          key={n.id}
          icon={n.icon}
          active={n.id === 'overview'}
          badge={n.id === 'orders' ? { severity: 'critical', count: 3 } : n.id === 'support' ? { severity: 'info', count: 142 } : undefined}
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
              <GaugeIcon />
            </span>
            <span className="hidden @5xl:inline">Lumen Store</span>
          </div>
          <div className="@5xl:hidden">{sideNav(true)}</div>
          <div className="hidden @5xl:block">{sideNav(false)}</div>
          <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-border pt-3 text-ui-sm @5xl:justify-start @5xl:px-2">
            <Avatar name="M. Shah" size="sm" />
            <div className="hidden @5xl:block">
              <div className="font-[550]">M. Shah</div>
              <div className="text-xs text-fg-muted">Ops manager</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-raised px-5 py-3.5">
            <NavMenu onPick={soon} />
            <div className="min-w-0">
              <h3 className="text-lg">Commerce overview</h3>
              <p className="text-ui-sm text-fg-muted">{p.sub}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Tabs variant="segmented" value={period} onValueChange={(v) => setPeriod(v as Period)} aria-label="Period">
                <Tab value="today">Today</Tab>
                <Tab value="7d">7d</Tab>
                <Tab value="30d">30d</Tab>
              </Tabs>
              <Button size="sm" iconStart={<DownloadIcon />} onClick={exportCsv}>
                Export
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-4 p-4 @3xl:p-5">
            {banner ? (
              <Banner
                severity="advisory"
                title={`Checkout conversion below target since ${p.since}`}
                onDismiss={() => setBanner(false)}
                action={
                  <Button
                    size="sm"
                    severity="advisory"
                    onClick={() => toast({ severity: 'info', title: 'Investigation opened', description: 'Mobile Safari checkout, 12 related signals grouped. Assigned to M. Shah.' })}
                  >
                    Investigate
                  </Button>
                }
              >
                {p.conversion}% against a 3.4% target. Mobile Safari accounts for most of the drop. 12 related signals grouped.
              </Banner>
            ) : null}

            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @7xl:grid-cols-4">
              <VitalTile
                label="Revenue"
                value={p.revenue}
                unit="USD"
                format={money}
                data={curve(p.revenue * 0.78, p.revenue, 1)}
                threshold={{ value: p.revenueTarget, severity: 'caution', direction: 'below' }}
                footer={`target ${money(p.revenueTarget)}`}
                change={p.change[0]}
              />
              <VitalTile
                label="Orders"
                value={p.orders}
                data={curve(p.orders * 0.86, p.orders, 2)}
                threshold={{ value: p.ordersTarget, severity: 'caution', direction: 'below' }}
                footer={`target ${p.ordersTarget.toLocaleString('en-US')}`}
                change={p.change[1]}
              />
              <VitalTile
                label="Conversion"
                value={p.conversion}
                unit="%"
                data={curve(3.5, p.conversion, 3)}
                threshold={{ value: 3.4, severity: 'advisory', direction: 'below' }}
                footer="target 3.4%"
                change={p.change[2]}
              />
              <VitalTile
                label="Refund rate"
                value={p.refunds}
                unit="%"
                data={curve(1.9, p.refunds, 4)}
                threshold={{ value: 2.5, severity: 'caution' }}
                change={p.change[3]}
              />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2 @6xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Card as="h4" title="Revenue" action={<span className="text-ui-sm text-fg-subtle">{period === 'today' ? 'cumulative, by hour' : period === '7d' ? 'daily' : 'daily, last 30 days'}</span>}>
                <Chart
                  key={period}
                  type="area"
                  label={`Revenue, ${p.sub.toLowerCase()}`}
                  data={rev}
                  x="label"
                  series={[
                    { key: 'now', label: 'This period', color: 'accent' },
                    { key: 'prev', label: 'Previous', color: 'neutral', dashed: true },
                  ]}
                  format={(v) => `$${Math.round(v)}k`}
                  height={240}
                />
              </Card>
              <Card as="h4" title="Orders by channel" action={<span className="text-ui-sm text-fg-subtle">{period === 'today' ? 'today' : period}</span>}>
                <Chart
                  key={period}
                  type="bar"
                  label="Orders by channel"
                  data={CHANNELS.map((c) => ({ channel: c.channel, now: Math.round(c.now * mult), prev: Math.round(c.prev * mult) }))}
                  x="channel"
                  series={[
                    { key: 'now', label: 'This period', color: 'accent' },
                    { key: 'prev', label: 'Previous', color: 'neutral' },
                  ]}
                  height={240}
                />
              </Card>
            </div>

            <Card as="h4" title="Accounts" action={<span className="text-ui-sm text-fg-subtle">Needs attention first</span>}>
              <CardBody className="p-0">
                <Table<Account>
                  aria-label="Accounts by health, worst first"
                  columns={columns}
                  data={ACCOUNTS}
                  getRowSeverity={(a) => scoreSeverity(a.health)}
                  density="compact"
                  className="rounded-t-none border-0"
                />
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2 @7xl:grid-cols-3">
              <Promotion revenue={PERIODS.today.revenue} />
              <Card as="h4" title="Fulfilment health" action={<Badge severity="advisory">Advisory</Badge>}>
                <HealthScore
                  size="sm"
                  label="Fulfilment"
                  value={81}
                  factors={[
                    { label: 'On-time shipping', weight: 30, impact: -8, severity: 'advisory' },
                    { label: 'Stockouts', weight: 25, impact: -6, severity: 'advisory' },
                    { label: 'Returns', weight: 25, impact: -3, severity: 'normal' },
                    { label: 'Support SLA', weight: 20, impact: -2, severity: 'normal' },
                  ]}
                />
              </Card>
              <Card as="h4" title="Support queue" action={<Badge severity="caution">Caution</Badge>}>
                <ul className="m-0 flex list-none flex-col p-0">
                  {SUPPORT.map((s) => (
                    <li key={s.label} data-tone={s.severity} className="flex items-center gap-2.5 border-t border-border py-2.5 text-ui-sm first:border-t-0 first:pt-0 last:pb-0">
                      <SeverityIcon severity={s.severity} className="text-tone-fg" />
                      <span>{s.label}</span>
                      <span className="ml-auto flex items-baseline gap-2">
                        {s.note ? <span className="text-[11px] text-fg-subtle">{s.note}</span> : null}
                        <span className={s.severity === 'normal' ? 'num text-ui text-fg' : 'num text-ui text-tone-fg'}>{s.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BusinessOps() {
  return (
    <ToastProvider>
      <Commerce />
    </ToastProvider>
  )
}

export default BusinessOps
