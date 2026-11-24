// Fight alarm fatigue: a station grid sorted worst first with calm tiles, and toasts that group by cause.
import { useRef, useState } from 'react'
import { Banner } from '@openvanta/calmon-react/banner'
import { Button } from '@openvanta/calmon-react/button'
import { StationGrid, StationTile, type StationItem } from '@openvanta/calmon-react/station-grid'
import { Switch } from '@openvanta/calmon-react/switch'
import { Toast, ToastProvider, useToast } from '@openvanta/calmon-react/toast'
import { PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

/** The services of the eu-west-1 production cluster. payments-api is added in `AlarmDemo`, because its state changes. */
const SERVICES: StationItem[] = [
  { id: 'ledger', name: 'ledger', severity: 'normal', score: 95, data: [5, 5, 6, 5, 5, 6, 5, 5, 6, 5, 6, 5] },
  { id: 'orders', name: 'orders-api', severity: 'normal', score: 88, detail: 'All vitals in range', data: [20, 22, 21, 23, 22, 24, 22, 21, 23, 22, 24, 23] },
  { id: 'inventory', name: 'inventory', severity: 'normal', score: 91, detail: 'All vitals in range', data: [12, 13, 12, 12, 14, 13, 12, 13, 14, 13, 12, 13] },
  { id: 'notifications', name: 'notifications', severity: 'normal', score: 93, detail: 'All vitals in range', data: [30, 28, 31, 29, 30, 32, 29, 30, 31, 29, 30, 31] },
  { id: 'auth', name: 'auth-service', severity: 'advisory', score: 77, detail: 'CPU 78%, rising', data: [50, 52, 55, 54, 58, 60, 63, 64, 66, 70, 72, 78] },
  { id: 'checkout', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s, limit 1.2 s', data: [8, 9, 8, 10, 12, 11, 14, 15, 16, 18, 17, 19] },
  { id: 'search', name: 'search-index', severity: 'caution', score: 64, detail: 'Replica lag 92 s', data: [5, 5, 6, 8, 11, 10, 13, 15, 14, 16, 18, 17] },
]

const PAYMENTS_CALM = [2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2]
const PAYMENTS_SPIKE = [2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42]

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-[550] text-fg-subtle">{label}</dt>
      <dd className="num m-0 text-numeral-md text-fg">{value}</dd>
    </div>
  )
}

function AlarmDemo() {
  const { toast, dismissAll } = useToast()
  const [grouped, setGrouped] = useState(true)
  const [raised, setRaised] = useState(0)
  const [popups, setPopups] = useState(0)
  const lastToast = useRef<string | null>(null)

  /** Raise `n` alerts for the same cause. Grouped alerts share a dedupeKey, so they update one toast instead of adding more. */
  function raise(n: number) {
    let created = 0
    for (let i = 0; i < n; i++) {
      const pod = ((raised + i) % 6) + 1
      const id = toast({
        severity: 'critical',
        title: 'Error rate above 4%',
        description: grouped ? 'payments-api · 6 pods, eu-west-1' : `payments-api-${pod} · eu-west-1`,
        dedupeKey: grouped ? 'payments-5xx' : undefined,
      })
      // A repeat of a grouped alert returns the id of the toast already on screen.
      if (id !== lastToast.current) created++
      lastToast.current = id
    }
    setRaised((r) => r + n)
    setPopups((p) => p + created)
  }

  function clear() {
    dismissAll()
    lastToast.current = null
    setRaised(0)
    setPopups(0)
  }

  const items: StationItem[] = [
    ...SERVICES,
    raised === 0
      ? { id: 'payments', name: 'payments-api', severity: 'normal', score: 88, detail: 'All vitals in range', data: PAYMENTS_CALM }
      : {
          id: 'payments',
          name: 'payments-api',
          severity: 'critical',
          score: 41,
          detail: grouped ? `Errors 4.2% · ${raised} alerts grouped` : `Errors 4.2% · ${raised} alerts`,
          data: PAYMENTS_SPIKE,
        },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => raise(1)}>Raise one alert</Button>
          <Button variant="primary" onClick={() => raise(23)}>
            Raise 23 alerts
          </Button>
          <Button variant="ghost" onClick={clear} disabled={raised === 0}>
            Clear alerts
          </Button>
        </div>
        <Switch checked={grouped} onCheckedChange={setGrouped} className="text-ui-sm font-[550]">
          Group alerts that share a cause
        </Switch>
      </div>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <dl className="m-0 flex gap-8">
          <Count label="Alerts raised" value={raised} />
          <Count label="Toasts shown" value={popups} />
        </dl>
        <p className="m-0 max-w-[44ch] text-ui-sm leading-[1.5] text-fg-muted" role="status">
          {raised === 0
            ? 'Toasts appear at the bottom right of the window.'
            : grouped
              ? 'Same cause, one toast with a count, and one digest banner below.'
              : 'Same cause, one toast each. Hover the pile to spread it out.'}
        </p>
      </div>

      {grouped && raised > 0 ? (
        <Banner severity="critical" title="payments-api: error rate above 4%">
          {raised} {raised === 1 ? 'alert' : 'alerts'} from 6 pods grouped into one. First seen 14:02 UTC.
        </Banner>
      ) : null}

      <StationGrid label="Production services, eu-west-1" items={items} />
    </div>
  )
}

function Demo() {
  return (
    <ToastProvider>
      <AlarmDemo />
    </ToastProvider>
  )
}

const components: PatternComponent[] = [
  { name: 'StationGrid', role: 'Sorts tiles worst first, keeps normal tiles quiet, and pulses only the critical ones.' },
  { name: 'Toast', role: 'A dedupeKey merges repeats into one toast with a ×n count instead of stacking another.' },
  { name: 'Banner', role: 'One banner for one cause, with a count. Two at most, and critical ones are announced at once.' },
]

const pod = (n: number) => `payments-api-${n} · eu-west-1`
const MINI = [8, 9, 8, 10, 12, 11, 14, 15]

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[340px]">
        <Toast severity="critical" title="Error rate above 4%" description="payments-api · 23 alerts grouped" count={23} />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[340px] flex-col gap-1.5">
        <Toast severity="critical" title="Error rate above 4%" description={pod(1)} />
        <Toast severity="critical" title="Error rate above 4%" description={pod(2)} />
        <p className="m-0 text-center text-xs text-fg-subtle">and 21 more toasts</p>
      </div>
    ),
    doText: 'Group alerts that share a cause into one, and show the count.',
    dontText: 'Raise one toast per alert. By the twentieth, nobody is reading them.',
  },
  {
    doPreview: (
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5">
        <StationTile name="orders-api" severity="normal" score={88} data={[20, 22, 21, 23, 22, 24, 22, 23]} />
        <StationTile name="checkout-web" severity="caution" score={58} detail="p95 1.8 s" data={MINI} />
      </div>
    ),
    dontPreview: (
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5">
        <div data-tone="normal" className="flex flex-col gap-2 rounded-[12px] bg-tone px-3.5 py-3 text-tone-on">
          <span className="text-[12.5px] font-[550]">orders-api</span>
          <span className="num text-numeral-md leading-[.9]">88</span>
          <span className="text-[11.5px] font-semibold">Normal</span>
        </div>
        <StationTile name="checkout-web" severity="caution" score={58} detail="p95 1.8 s" data={MINI} />
      </div>
    ),
    doText: 'Keep normal quiet: no fill and no badge, so the one that needs a look is the one you see.',
    dontText: 'Fill every healthy tile in green. The problem tile no longer stands out.',
  },
]

export default function AlarmFatigue() {
  return (
    <PatternPage
      principle={PRINCIPLES['alarm-fatigue']}
      components={components}
      demoTitle="Production services and an incoming alert storm"
      demoIntro={
        <>
          Raise 23 alerts for the same cause, then switch grouping off and do it again. The grid re-sorts so the failing
          service is top left, and the counters show how many times a person was interrupted.
        </>
      }
      demo={<Demo />}
      dos={dos}
    />
  )
}
