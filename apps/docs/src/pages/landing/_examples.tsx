// "Build any dashboard": four small, inert compositions of real library components. Each card links to the example
// dashboards page. The previews are laid out at 167% width and scaled to 60%, so they fit any card width.
import type { ReactNode } from 'react'
import { Avatar } from '@openvanta/pikore-react/avatar'
import { Badge } from '@openvanta/pikore-react/badge'
import { Banner } from '@openvanta/pikore-react/banner'
import { Button } from '@openvanta/pikore-react/button'
import { Chart } from '@openvanta/pikore-react/chart'
import { ArrowRIcon, GaugeIcon, PulseIcon, RoomIcon, SettingsIcon } from '@openvanta/pikore-react/icons'
import { StationGrid, type StationItem } from '@openvanta/pikore-react/station-grid'
import { VitalTile } from '@openvanta/pikore-react/vital-tile'
import { docsHref } from '../../site/router.ts'
import { Section, SectionHead } from './_ui.tsx'

/** Frame of one preview. `inert` keeps it out of the tab order and the accessibility tree, and out of reach of the mouse. */
function Thumb({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="relative h-[176px] overflow-hidden border-b border-border bg-surface-sunken p-3">
      <div inert className="pointer-events-none w-[166.667%] origin-top-left scale-[0.6]">
        {children}
      </div>
    </div>
  )
}

const BEDS: StationItem[] = [
  { id: 'b7', name: 'Bed 7', severity: 'critical', score: 9, detail: 'HR 128 · SpO₂ 89' },
  { id: 'b3', name: 'Bed 3', severity: 'caution', score: 6, detail: 'HR 112 · SpO₂ 93' },
  { id: 'b11', name: 'Bed 11', severity: 'caution', score: 5, detail: 'HR 96 · SpO₂ 88' },
  { id: 'b1', name: 'Bed 1', severity: 'advisory', score: 3, detail: 'HR 104 · SpO₂ 97' },
  { id: 'b5', name: 'Bed 5', severity: 'normal', score: 2, detail: 'HR 84 · SpO₂ 95' },
  { id: 'b9', name: 'Bed 9', severity: 'normal', score: 1, detail: 'HR 76 · SpO₂ 98' },
]

const REVENUE = [
  { day: 'Mon', now: 152, before: 144 },
  { day: 'Tue', now: 158, before: 147 },
  { day: 'Wed', now: 171, before: 150 },
  { day: 'Thu', now: 166, before: 156 },
  { day: 'Fri', now: 183, before: 161 },
  { day: 'Sat', now: 205, before: 178 },
  { day: 'Sun', now: 198, before: 170 },
]

const MEMBERS: [string, string][] = [
  ['Priya Shah', 'Owner'],
  ['Arjun Kumar', 'Admin'],
  ['Lena Torres', 'Editor'],
  ['Mei Ong', 'Viewer'],
]

const CARDS: { id: string; title: string; text: string; icon: ReactNode; preview: ReactNode }[] = [
  {
    id: 'patients',
    title: 'Patient monitoring',
    text: 'Twelve beds sorted by early-warning score, grouped alarms, patient detail and a safe dose change.',
    icon: <RoomIcon className="size-4" />,
    preview: <StationGrid label="Beds" items={BEDS} columns={3} summary={false} />,
  },
  {
    id: 'ops',
    title: 'Infrastructure operations',
    text: 'Service health, incidents, latency against limits, deploys and on-call.',
    icon: <PulseIcon className="size-4" />,
    preview: (
      <div className="flex flex-col gap-3">
        <Banner severity="critical" title="Payments failing in eu-west">
          Error rate is 4.2%. R. Iyer is on it.
        </Banner>
        <div className="grid grid-cols-2 gap-3">
          <VitalTile
            density="compact"
            label="p95 latency"
            value={412}
            unit="ms"
            data={[310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]}
            threshold={{ value: 400, severity: 'caution' }}
          />
          <VitalTile
            density="compact"
            label="Queue depth"
            value={2310}
            unit="jobs"
            data={[400, 420, 480, 600, 750, 900, 1100, 1350, 1600, 1900, 2100, 2310]}
            threshold={{ value: 1000, severity: 'critical' }}
          />
        </div>
      </div>
    ),
  },
  {
    id: 'business',
    title: 'Commerce overview',
    text: 'Revenue, orders, conversion and refunds against targets, with fulfilment health.',
    icon: <GaugeIcon className="size-4" />,
    preview: (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <VitalTile density="compact" label="Revenue" value={184} format={(v) => `$${v}k`} severity="normal" />
          <VitalTile density="compact" label="Refunds" value={2.8} unit="%" severity="caution" />
        </div>
        <Chart
          type="area"
          label="Revenue, this week and last"
          data={REVENUE}
          x="day"
          height={120}
          legend={false}
          series={[
            { key: 'now', label: 'This week', color: 'accent' },
            { key: 'before', label: 'Last week', color: 'neutral', dashed: true },
          ]}
        />
      </div>
    ),
  },
  {
    id: 'admin',
    title: 'Workspace admin',
    text: 'Members, roles, API limits, audit log and a protected danger zone.',
    icon: <SettingsIcon className="size-4" />,
    preview: (
      <div className="flex flex-col rounded-card border border-border bg-surface-raised px-4 shadow-low">
        {MEMBERS.map(([name, role]) => (
          <div key={name} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
            <Avatar name={name} size="sm" />
            <span className="text-ui-sm font-[550]">{name}</span>
            <Badge className="ml-auto" variant="outline">
              {role}
            </Badge>
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-border py-2.5">
          <span className="text-ui-sm text-fg-muted">Danger zone</span>
          <Button size="sm" severity="critical" className="ml-auto" tabIndex={-1}>
            Delete workspace
          </Button>
        </div>
      </div>
    ),
  },
]

export function Examples() {
  return (
    <Section id="dashboards">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          id="dashboards"
          title={
            <>
              Build any dashboard. <span className="block">Start from one of these.</span>
            </>
          }
          lede="Complete screens made only from Pikore UI components, in both themes. Open one, then copy what you need."
        />
        <Button asChild variant="secondary">
          <a href={docsHref('dashboards')}>
            See all dashboards
            <ArrowRIcon className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
      <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 min-[68.75rem]:grid-cols-4">
        {CARDS.map((c) => (
          <li key={c.id} className="min-w-0">
            <a
              href={docsHref('dashboards')}
              className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-surface-raised text-fg no-underline shadow-[0_0_0_1px_var(--border),var(--shadow-1)] transition-[box-shadow,transform] duration-(--duration-base) hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--border-strong),var(--shadow-2)]"
            >
              <Thumb>{c.preview}</Thumb>
              <div className="flex flex-1 flex-col gap-1 px-4 pt-3.5 pb-4">
                <b className="flex items-center gap-2 font-semibold">
                  <span className="text-accent-fg">{c.icon}</span>
                  {c.title}
                  <ArrowRIcon
                    aria-hidden="true"
                    className="ml-auto size-4 -translate-x-1 text-fg-subtle opacity-0 transition-[opacity,translate] duration-(--duration-base) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </b>
                <span className="text-ui-sm leading-[1.5] text-fg-muted">{c.text}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
