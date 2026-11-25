// "Example dashboards": four complete screens in a browser-style frame, each with its real source one click away.
// The screens live in _*.tsx files next to this one. They are lazy, so only the one on show is downloaded, and
// their source is loaded with ?raw only when someone asks for it, so the code on screen is the code that runs.
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { Badge } from '@openvanta/pikore-react/badge'
import { Button } from '@openvanta/pikore-react/button'
import { Card } from '@openvanta/pikore-react/card'
import { Code } from '@openvanta/pikore-react/code'
import { CheckIcon, CopyIcon } from '@openvanta/pikore-react/icons'
import { Skeleton } from '@openvanta/pikore-react/skeleton'
import { Tab, Tabs, TabsList, TabsPanel } from '@openvanta/pikore-react/tabs'
import { pages } from '../../site/pages.ts'
import { docsHref } from '../../site/router.ts'
import { Bullets, Callout, Lead } from '../../site/doc.tsx'

interface Dashboard {
  id: string
  /** Other anchors that open this dashboard, such as the ids the landing page used. */
  aliases: string[]
  title: string
  /** Address shown in the frame's title bar. */
  address: string
  /** One sentence for the card in "What each screen shows". */
  shows: string
  /** Things to try, shown above the frame. */
  tryThis: string[]
  /** Component names, as in each component's doc. */
  uses: string[]
  /** Safety patterns the screen puts into practice: [route id, title]. */
  patterns: [string, string][]
  file: string
  /** Starts downloading the screen. Called early, when someone points at its tab. */
  load: () => Promise<{ default: ComponentType }>
  Screen: LazyExoticComponent<ComponentType>
  loadSource: () => Promise<string>
}

/** A screen that downloads when it is first shown. */
const screen = (load: () => Promise<{ default: ComponentType }>) => ({ load, Screen: lazy(load) })

const DASHBOARDS: Dashboard[] = [
  {
    id: 'patient-monitoring',
    aliases: ['patients'],
    title: 'Patient monitoring',
    address: 'northfield.example/icu/central-station',
    shows: 'An ICU central station. Twelve beds sorted by early-warning score, grouped alarms, bedside vitals with their limits and a safe dose change.',
    tryThis: ['Select a bed', 'Acknowledge the alarm', 'Switch to Wall display', 'Change an infusion rate above 12 mL/h'],
    uses: ['StationGrid', 'VitalTile', 'HealthScore', 'Timeline', 'Banner', 'Chart', 'LimitedNumberInput', 'PausePoint', 'Dialog', 'Tabs'],
    patterns: [
      ['alarm-fatigue', 'Fight alarm fatigue'],
      ['composite-score', 'One composite score'],
      ['limits', 'Soft and hard limits'],
      ['station-display', 'Readable across the room'],
    ],
    file: '_patient-monitoring.tsx',
    ...screen(() => import('./_patient-monitoring.tsx').then((m) => ({ default: m.PatientMonitoring }))),
    loadSource: () => import('./_patient-monitoring.tsx?raw').then((m) => m.default),
  },
  {
    id: 'it-ops',
    aliases: ['ops'],
    title: 'IT operations',
    address: 'ops.northwind.example/production/eu-west',
    shows: 'Service health for twelve services, an open incident, latency against its limit, a release behind a pause point and a rollback that names its target.',
    tryThis: ['Change the time range', 'Select a service', 'Acknowledge an alert', 'Deploy, then roll back'],
    uses: ['StationGrid', 'HealthScore', 'VitalTile', 'Chart', 'Table', 'Timeline', 'PausePoint', 'ConfirmTarget', 'Banner', 'Toast'],
    patterns: [
      ['alarm-fatigue', 'Fight alarm fatigue'],
      ['pause-points', 'Pause points'],
      ['confirm-target', 'Confirm the target'],
      ['timeline', 'One timeline per entity'],
    ],
    file: '_it-ops.tsx',
    ...screen(() => import('./_it-ops.tsx').then((m) => ({ default: m.ItOps }))),
    loadSource: () => import('./_it-ops.tsx?raw').then((m) => m.default),
  },
  {
    id: 'business-ops',
    aliases: ['business'],
    title: 'Business operations',
    address: 'admin.lumen.example/overview',
    shows: 'Revenue, orders, conversion and refunds against targets, accounts ranked by health, and a discount with a soft and a hard limit.',
    tryThis: ['Switch to 7d or 30d', 'Set the discount to 40', 'Set the discount to 75', 'Sort the accounts'],
    uses: ['VitalTile', 'Sparkline', 'Chart', 'Table', 'HealthScore', 'ProgressBar', 'LimitedNumberInput', 'Banner'],
    patterns: [
      ['composite-score', 'One composite score'],
      ['limits', 'Soft and hard limits'],
    ],
    file: '_business-ops.tsx',
    ...screen(() => import('./_business-ops.tsx').then((m) => ({ default: m.BusinessOps }))),
    loadSource: () => import('./_business-ops.tsx?raw').then((m) => m.default),
  },
  {
    id: 'admin-console',
    aliases: ['admin'],
    title: 'Admin console',
    address: 'lumen.example/settings/members',
    shows: 'Workspace members with search, selection and bulk actions, row menus, toasts with Undo, an audit log and a protected danger zone.',
    tryThis: ['Search for a member', 'Select two rows', 'Open a row menu and remove someone', 'Invite a member with a bad email'],
    uses: ['SideNav', 'Search', 'Table', 'Menu', 'Toast', 'ConfirmTarget', 'Avatar', 'Dialog', 'Field', 'Switch', 'Timeline'],
    patterns: [
      ['confirm-target', 'Confirm the target'],
      ['timeline', 'One timeline per entity'],
    ],
    file: '_admin-console.tsx',
    ...screen(() => import('./_admin-console.tsx').then((m) => ({ default: m.AdminConsole }))),
    loadSource: () => import('./_admin-console.tsx?raw').then((m) => m.default),
  },
]

const byAnchor = (anchor: string) => DASHBOARDS.find((d) => d.id === anchor || d.aliases.includes(anchor))

/** `#/docs/dashboards#it-ops`: the part after the second `#`. */
const anchorFromHash = () => {
  const raw = window.location.hash.split('#')[2] ?? ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** The route of a component's page. A name that is not found falls back to the overview. */
const componentHref = (name: string) => docsHref(pages.find((p) => p.entry?.name === name)?.id ?? 'components')

function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[520px] flex-col gap-4 p-6">
      <span className="sr-only">Loading the dashboard</span>
      <Skeleton className="h-9 w-1/3" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton lines={6} />
    </div>
  )
}

/** A browser-style window around one dashboard, with a View code toggle and a Copy button. */
function Frame({ dash }: { dash: Dashboard }) {
  const [code, setCode] = useState(false)
  const [source, setSource] = useState<string>()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const load = () => (source !== undefined ? Promise.resolve(source) : dash.loadSource().then((s) => (setSource(s), s)))
  const toggle = () => {
    const next = !code
    setCode(next)
    if (next) void load()
  }
  const copy = () =>
    void load().then(async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 2000)
      } catch {
        /* the clipboard can be blocked; the code is still on screen */
      }
    })

  return (
    <figure id={dash.id} data-no-prose data-no-toc className="m-0 min-w-0 scroll-mt-24">
      <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-high">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-surface-sunken px-4 py-2.5">
          <div aria-hidden="true" className="hidden gap-1.5 sm:flex">
            <i className="size-2.5 rounded-full bg-border-strong" />
            <i className="size-2.5 rounded-full bg-border-strong" />
            <i className="size-2.5 rounded-full bg-border-strong" />
          </div>
          <div
            title={dash.address}
            className="hidden h-7 min-w-0 max-w-[440px] flex-1 items-center rounded-[8px] bg-surface-raised px-3 font-mono text-xs text-fg-muted shadow-[inset_0_0_0_1px_var(--border)] sm:flex sm:mx-auto"
          >
            <span className="truncate">{dash.address}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <Button size="sm" variant={code ? 'primary' : 'secondary'} aria-pressed={code} onClick={toggle}>
              View code
            </Button>
            <Button size="sm" iconStart={copied ? <CheckIcon /> : <CopyIcon />} onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <span role="status" className="sr-only">
              {copied ? `Copied ${dash.file}` : ''}
            </span>
          </div>
        </div>

        {/* The screen stays mounted while the code is open, so nothing you did on it is lost. */}
        <div hidden={code}>
          <Suspense fallback={<Loading />}>
            <dash.Screen />
          </Suspense>
        </div>
        {code ? (
          <div className="max-h-[760px] overflow-auto">
            {source === undefined ? (
              <div role="status" className="p-6 text-ui-sm text-fg-muted">
                Loading the source…
              </div>
            ) : (
              <Code language="tsx" label={dash.file} copyable={false} className="rounded-none border-0 bg-surface">
                {source}
              </Code>
            )}
          </div>
        ) : null}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
        <span>Fictional data. Everything on the screen is a Pikore UI component, so it follows the theme and the density.</span>
      </figcaption>
    </figure>
  )
}

export default function Dashboards() {
  const [id, setId] = useState(() => byAnchor(anchorFromHash())?.id ?? DASHBOARDS[0]!.id)

  // A link such as #/docs/dashboards#it-ops opens that screen, also when the page is already showing.
  useEffect(() => {
    const onHash = () => {
      const found = byAnchor(anchorFromHash())
      if (found) setId(found.id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const choose = (next: string) => {
    setId(next)
    // Keep the address shareable without a hashchange, which would scroll and re-run the route.
    window.history.replaceState(null, '', docsHref('dashboards', next))
  }
  const preload = (d: Dashboard) => void d.load().catch(() => {})
  const active = DASHBOARDS.find((d) => d.id === id) ?? DASHBOARDS[0]!

  return (
    <>
      <Lead>
        Four complete screens, built only from Pikore UI components and Tailwind with the tokens. They run on fictional data, they look right in
        both themes, and every control works. Open the code to see how any of it is put together, then copy what you need.
      </Lead>

      <h2 id="four-screens">Four screens</h2>
      <Tabs variant="segmented" value={id} onValueChange={choose}>
        <div className="max-w-full overflow-x-auto pb-1" data-no-prose>
          <TabsList aria-label="Example dashboards">
            {DASHBOARDS.map((d) => (
              <Tab key={d.id} value={d.id} onPointerEnter={() => preload(d)} onFocus={() => preload(d)}>
                {d.title}
              </Tab>
            ))}
          </TabsList>
        </div>
        {DASHBOARDS.map((d) => (
          <TabsPanel key={d.id} value={d.id} className="mt-4 flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-ui-sm text-fg-muted" data-no-prose>
              <span className="font-semibold text-fg">Try:</span>
              {d.tryThis.map((t, i) => (
                <span key={t}>
                  {t}
                  {i < d.tryThis.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>
            <Frame dash={d} />
          </TabsPanel>
        ))}
      </Tabs>

      <h2 id="what-each-screen-shows">What each screen shows</h2>
      <Lead>
        Each one is a real task with a real risk, and each uses the safety patterns where they matter. {active.title} is open above; pick another to
        open it.
      </Lead>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-no-prose>
        {DASHBOARDS.map((d) => (
          <Card
            key={d.id}
            as="h3"
            title={d.title}
            action={
              <Button
                size="sm"
                variant={d.id === id ? 'primary' : 'ghost'}
                aria-label={`${d.id === id ? 'Showing' : 'Show'} ${d.title}`}
                onClick={() => {
                  choose(d.id)
                  document.getElementById('four-screens')?.scrollIntoView({ block: 'start' })
                }}
              >
                {d.id === id ? 'Showing' : 'Show'}
              </Button>
            }
          >
            <div className="flex flex-col gap-3.5">
              <p className="text-ui-sm leading-normal text-fg-muted">{d.shows}</p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Components used">
                {d.uses.map((u) => (
                  <li key={u}>
                    <a href={componentHref(u)} className="no-underline">
                      <Badge>{u}</Badge>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-ui-sm text-fg-muted">
                Patterns:{' '}
                {d.patterns.map(([pid, label], i) => (
                  <span key={pid}>
                    {i > 0 ? ', ' : ''}
                    <a className="textlink" href={docsHref(pid)}>
                      {label}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <h2 id="how-they-are-built">How they are built</h2>
      <Bullets>
        <li>
          <b>One file each.</b> A screen is a single component with its own data. There are no shared helpers to chase: what you see under View
          code is everything that runs above.
        </li>
        <li>
          <b>Status has one vocabulary.</b> Severity decides the icon, the colour and the word everywhere: tiles, table rows, banners, timeline
          nodes and toasts. A caution looks the same in the alert table as it does on the service grid.
        </li>
        <li>
          <b>Worst first.</b> Grids, tables and alarms sort by severity, so the thing that needs attention is the first thing you see.
        </li>
        <li>
          <b>Layout answers to the space it has.</b> Each screen is a container, and its columns, side navigation and tile sizes follow the width
          of the frame with container queries, not the width of the window. That is why the same screen works at phone width and on a wall display.
        </li>
        <li>
          <b>Risky actions slow down.</b> A deploy sits behind a pause point, a delete asks for the exact name, and an unusual number asks for a
          reason before it is allowed.
        </li>
      </Bullets>
      <Callout>
        Building with an AI agent? Give it a screen from here as the example to follow, along with the <a href={docsHref('agents')}>agent docs</a>.
      </Callout>
    </>
  )
}
