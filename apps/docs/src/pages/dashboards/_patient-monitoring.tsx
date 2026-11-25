// Example dashboard: an ICU central station, built only from Pikore UI components.
// Every name, number and time is fictional. Underscore files are not routes.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Severity } from '@openvanta/pikore-react'
import { Avatar } from '@openvanta/pikore-react/avatar'
import { Badge } from '@openvanta/pikore-react/badge'
import { Banner } from '@openvanta/pikore-react/banner'
import { Button } from '@openvanta/pikore-react/button'
import { Card } from '@openvanta/pikore-react/card'
import { Chart } from '@openvanta/pikore-react/chart'
import { Dialog } from '@openvanta/pikore-react/dialog'
import { Field } from '@openvanta/pikore-react/field'
import { HealthScore, type HealthFactor } from '@openvanta/pikore-react/health-score'
import { BellOffIcon, FileIcon, GridIcon, PulseIcon, SettingsIcon, TimelineIcon, UserIcon } from '@openvanta/pikore-react/icons'
import { IconButton } from '@openvanta/pikore-react/icon-button'
import { Input } from '@openvanta/pikore-react/input'
import { LimitedNumberInput, type LimitState } from '@openvanta/pikore-react/limited-number-input'
import { Menu, MenuItem } from '@openvanta/pikore-react/menu'
import { PausePoint } from '@openvanta/pikore-react/pause-point'
import { SideNav, SideNavItem } from '@openvanta/pikore-react/side-nav'
import { StationGrid, type StationItem } from '@openvanta/pikore-react/station-grid'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { Timeline, type TimelineEvent } from '@openvanta/pikore-react/timeline'
import { ToastProvider, useToast } from '@openvanta/pikore-react/toast'
import { VitalTile } from '@openvanta/pikore-react/vital-tile'

/* ------------------------------------------------------------------ Scenario data (fictional) */

/** The screen is frozen at 14:32 UTC and then ticks, so it reads the same on every visit. */
const NOW = Date.UTC(2026, 10, 23, 14, 32)
const LOADED_AT = Date.now()
const screenNow = () => NOW + (Date.now() - LOADED_AT)
const at = (hh: number, mm: number, daysAgo = 0) => new Date(Date.UTC(2026, 10, 23 - daysAgo, hh, mm))
const ev = (id: string, time: Date, title: string, rest: Partial<TimelineEvent> = {}): TimelineEvent => ({ id, time, title, ...rest })

type Metric = 'hr' | 'spo2' | 'sbp' | 'rr'
type Vitals = Record<Metric, number> & { temp: number }
type Infusion = { drug: string; rate: number; softMin: number; softMax: number; hardMax: number }
type RawBed = { bed: number; patient: string; age: number; dx: string; note?: string; vitals: Vitals; infusion?: Infusion; events?: TimelineEvent[] }

const RAW: RawBed[] = [
  {
    bed: 7, patient: 'M.K.', age: 68, dx: 'Sepsis, day 2', note: 'MAP 58, RR 28, SpO₂ 89%',
    vitals: { hr: 128, spo2: 89, sbp: 86, rr: 28, temp: 38.9 },
    infusion: { drug: 'Noradrenaline', rate: 8, softMin: 2, softMax: 12, hardMax: 20 },
    events: [
      ev('7a', at(14, 21), 'SpO₂ below 90%', { severity: 'critical', type: 'alarm', description: '7 repeats grouped in the last 10 min.' }),
      ev('7b', at(14, 12), 'Systolic BP below 90 mmHg', { severity: 'caution', type: 'alarm', description: 'MAP 58 mmHg.' }),
      ev('7c', at(13, 40), 'Lactate 3.8 mmol/L', { severity: 'advisory', actor: 'Lab', type: 'result' }),
      ev('7d', at(13, 5), 'Noradrenaline started at 6 mL/h', { actor: 'T. Rossi, RN', type: 'order' }),
      ev('7e', at(22, 10, 1), 'Blood cultures taken', { actor: 'N. Haddad, RN', type: 'note' }),
    ],
  },
  {
    bed: 3, patient: 'A.R.', age: 54, dx: 'Post-op CABG', note: 'HR rising for 40 min',
    vitals: { hr: 112, spo2: 95, sbp: 104, rr: 22, temp: 37.4 },
    infusion: { drug: 'Heparin', rate: 12, softMin: 6, softMax: 18, hardMax: 30 },
    events: [
      ev('3a', at(14, 0), 'Heart rate above 110 bpm', { severity: 'caution', type: 'alarm', description: 'Rising for 40 minutes.' }),
      ev('3b', at(12, 15), 'Chest drain output 40 mL', { actor: 'J. Cole, RN', type: 'note' }),
      ev('3c', at(18, 30, 1), 'Returned from theatre', { actor: 'Theatre team', type: 'transfer' }),
    ],
  },
  {
    bed: 11, patient: 'S.P.', age: 71, dx: 'COPD exacerbation', note: 'RR 24, on 4 L oxygen',
    vitals: { hr: 96, spo2: 92, sbp: 128, rr: 24, temp: 37.1 },
    events: [
      ev('11a', at(14, 5), 'SpO₂ below 93%', { severity: 'caution', type: 'alarm', description: 'On 4 L/min oxygen.' }),
      ev('11b', at(11, 30), 'Nebuliser given', { actor: 'S. Park, RN', type: 'note' }),
      ev('11c', at(20, 45, 1), 'Admitted from emergency', { actor: 'Dr. Ahmed', type: 'transfer' }),
    ],
  },
  {
    bed: 1, patient: 'J.D.', age: 45, dx: 'DKA', note: 'RR 22, glucose falling',
    vitals: { hr: 104, spo2: 97, sbp: 118, rr: 22, temp: 36.9 },
    infusion: { drug: 'Insulin', rate: 6, softMin: 1, softMax: 10, hardMax: 16 },
    events: [
      ev('1a', at(13, 50), 'Glucose falling', { severity: 'advisory', type: 'result', description: '9.8 mmol/L, down from 14.2.' }),
      ev('1b', at(12, 0), 'Insulin rate reviewed', { actor: 'Dr. Ahmed', type: 'order' }),
    ],
  },
  { bed: 5, patient: 'L.M.', age: 62, dx: 'Pneumonia', vitals: { hr: 84, spo2: 95, sbp: 126, rr: 18, temp: 37.2 } },
  { bed: 9, patient: 'R.T.', age: 39, dx: 'Trauma, stable', vitals: { hr: 76, spo2: 98, sbp: 122, rr: 14, temp: 36.8 } },
  { bed: 2, patient: 'H.N.', age: 80, dx: 'Stroke, day 4', vitals: { hr: 68, spo2: 96, sbp: 142, rr: 15, temp: 36.6 } },
  { bed: 4, patient: 'K.W.', age: 57, dx: 'GI bleed', vitals: { hr: 92, spo2: 97, sbp: 108, rr: 16, temp: 36.9 } },
  { bed: 6, patient: 'E.B.', age: 66, dx: 'Heart failure', vitals: { hr: 72, spo2: 95, sbp: 118, rr: 17, temp: 36.7 } },
  { bed: 8, patient: 'T.O.', age: 49, dx: 'Pancreatitis', vitals: { hr: 82, spo2: 98, sbp: 124, rr: 15, temp: 37.0 } },
  { bed: 10, patient: 'C.F.', age: 73, dx: 'Post-op hip', vitals: { hr: 70, spo2: 97, sbp: 130, rr: 14, temp: 36.5 } },
  { bed: 12, patient: 'V.S.', age: 58, dx: 'Overdose, extubated', vitals: { hr: 74, spo2: 99, sbp: 120, rr: 13, temp: 36.6 } },
]

/** What each reading is judged against. `above` means a high value is bad, `below` means a low one is. */
const LIMITS: Record<Metric, { label: string; unit: string; value: number; direction: 'above' | 'below' }> = {
  hr: { label: 'Heart rate', unit: 'bpm', value: 110, direction: 'above' },
  spo2: { label: 'SpO₂', unit: '%', value: 93, direction: 'below' },
  sbp: { label: 'Systolic BP', unit: 'mmHg', value: 100, direction: 'below' },
  rr: { label: 'Resp rate', unit: '/min', value: 20, direction: 'above' },
}
const METRICS: Metric[] = ['hr', 'spo2', 'sbp', 'rr']
const BASELINE: Record<Metric, number> = { hr: 78, spo2: 97, sbp: 124, rr: 16 }
const SPREAD: Record<Metric, number> = { hr: 3, spo2: 0.6, sbp: 4, rr: 1 }

/** Points per parameter, in the style of the NEWS2 early-warning score. */
const POINTS = {
  rr: (v: number) => (v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : 3),
  spo2: (v: number) => (v <= 91 ? 3 : v <= 93 ? 2 : v <= 95 ? 1 : 0),
  sbp: (v: number) => (v <= 90 ? 3 : v <= 100 ? 2 : v <= 110 ? 1 : v <= 219 ? 0 : 3),
  hr: (v: number) => (v <= 40 ? 3 : v <= 50 ? 1 : v <= 90 ? 0 : v <= 110 ? 1 : v <= 130 ? 2 : 3),
  temp: (v: number) => (v <= 35 ? 3 : v <= 36 ? 1 : v <= 38 ? 0 : v <= 39 ? 1 : 2),
}
const PARAMS: { key: keyof Vitals; label: string }[] = [
  { key: 'rr', label: 'Resp rate' },
  { key: 'spo2', label: 'SpO₂' },
  { key: 'sbp', label: 'Systolic BP' },
  { key: 'hr', label: 'Heart rate' },
  { key: 'temp', label: 'Temperature' },
]
const pointSeverity = (p: number): Severity => (p >= 3 ? 'critical' : p === 2 ? 'caution' : p === 1 ? 'advisory' : 'normal')
const severityOf = (ews: number): Severity => (ews >= 7 ? 'critical' : ews >= 5 ? 'caution' : ews >= 3 ? 'advisory' : 'normal')
/** One score for the whole patient: 100 minus 5 points per early-warning point. These bands match the severities above. */
const BANDS = { advisory: 88, caution: 78, critical: 68 }

const wobble = (i: number, seed: number) => Math.sin(i * 12.9898 + seed * 78.233)
/** Twelve half-hourly readings that drift from `from` and end exactly on `last`. */
const trend = (from: number, last: number, seed: number, spread: number) =>
  Array.from({ length: 12 }, (_, i) => (i === 11 ? last : Math.round((from + ((last - from) * i) / 11 + wobble(i, seed) * spread) * 10) / 10))
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const isOut = (k: Metric, v: number) => (LIMITS[k].direction === 'above' ? v > LIMITS[k].value : v < LIMITS[k].value)

const BEDS = RAW.map((b) => {
  const points = Object.fromEntries(PARAMS.map((p) => [p.key, POINTS[p.key](b.vitals[p.key])])) as Record<keyof Vitals, number>
  const ews = Object.values(points).reduce((a, n) => a + n, 0)
  const trends = Object.fromEntries(
    METRICS.map((k) => [k, trend(isOut(k, b.vitals[k]) ? BASELINE[k] : b.vitals[k], b.vitals[k], b.bed + k.length, SPREAD[k])]),
  ) as Record<Metric, number[]>
  const factors: HealthFactor[] = PARAMS.map((p) => ({
    label: p.label,
    weight: 15,
    impact: -5 * points[p.key],
    severity: pointSeverity(points[p.key]),
  }))
  const events = b.events ?? [
    ev(`${b.bed}-a`, at(13, 0), 'Observations in range', { actor: 'Day shift', type: 'obs' }),
    ev(`${b.bed}-b`, at(21, 0, 1), 'Handover note', { actor: 'Night shift', type: 'note', description: `${b.dx}. Plan unchanged.` }),
  ]
  return { ...b, id: `bed-${b.bed}`, ews, severity: severityOf(ews), score: Math.max(0, 100 - 5 * ews), trends, factors, events }
})
type Bed = (typeof BEDS)[number]

const SEVERITY_WORD: Record<Severity, string> = { normal: 'Normal', info: 'Info', advisory: 'Advisory', caution: 'Caution', critical: 'Critical' }
const RANK: Record<Severity, number> = { normal: 0, info: 1, advisory: 2, caution: 3, critical: 4 }
const WORST_FIRST = [...BEDS].sort((a, b) => RANK[b.severity] - RANK[a.severity] || b.ews - a.ews)

const NAV = [
  { id: 'station', label: 'Central station', icon: <GridIcon /> },
  { id: 'patients', label: 'Patients', icon: <UserIcon /> },
  { id: 'alarms', label: 'Alarms', icon: <BellOffIcon /> },
  { id: 'handover', label: 'Handover', icon: <TimelineIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

/* ------------------------------------------------------------------ Small pieces */

function Clock() {
  const [t, setT] = useState(screenNow)
  useEffect(() => {
    const id = setInterval(() => setT(screenNow()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono text-xs text-fg-subtle tabular-nums">{new Date(t).toISOString().slice(11, 19)} UTC</span>
}

function Live() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-normal-fg">
      <i aria-hidden="true" className="size-[7px] animate-pikore-blink rounded-full bg-normal shadow-[0_0_0_3px_color-mix(in_oklab,var(--normal),transparent_80%)]" />
      Live
    </span>
  )
}

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

/* ------------------------------------------------------------------ Safe dose change */

/** A dose change: a limited number first, then a pause point that starts over whenever the rate changes. */
function InfusionForm({ bed, rate: current, onCancel, onConfirm }: { bed: Bed; rate: number; onCancel: () => void; onConfirm: (rate: number, reason: string) => void }) {
  const inf = bed.infusion!
  const [rate, setRate] = useState<number | null>(current)
  const [state, setState] = useState<LimitState>('ok')
  const [why, setWhy] = useState('')
  const allowed = rate !== null && state !== 'hard' && (state !== 'soft' || why.trim().length > 3)
  return (
    <>
      <LimitedNumberInput
        label={`${inf.drug} rate`}
        unit="mL/h"
        softMin={inf.softMin}
        softMax={inf.softMax}
        hardMax={inf.hardMax}
        value={rate}
        onValueChange={setRate}
        onStateChange={setState}
        justification={why}
        onJustificationChange={setWhy}
        justificationPlaceholder="Recorded on the patient timeline"
        className="max-w-xs"
      />
      {allowed ? (
        <PausePoint
          key={rate}
          title="Before you change the rate"
          description={`${inf.drug} is a high-alert medicine. Check each item.`}
          action="Update infusion"
          onCancel={onCancel}
          onConfirm={() => onConfirm(rate, why.trim())}
          items={[
            { label: 'Wristband scanned', evidence: `Matches ${bed.patient}, ${bed.age}, MRN 40-${2200 + bed.bed * 13}` },
            'Pump channel B confirmed',
            'Second nurse checked the dose',
          ]}
        />
      ) : (
        <p className="text-ui-sm text-fg-muted">Enter an allowed rate to see the checks.</p>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ Selected bed */

function BedDetail({ bed, rate, events, now, onInfuse, onNote }: { bed: Bed; rate?: number; events: TimelineEvent[]; now: number; onInfuse: () => void; onNote: (text: string) => void }) {
  const [note, setNote] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    onNote(note.trim())
    setNote('')
  }
  const tone = bed.severity === 'normal' ? 'accent' : bed.severity
  return (
    <Card
      as="h4"
      className="@container"
      title={
        <>
          Bed {bed.bed} <span className="font-normal text-fg-muted">· {bed.patient}, {bed.age}</span>
        </>
      }
      action={<Badge severity={bed.severity}>{SEVERITY_WORD[bed.severity]}</Badge>}
    >
      <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-ui-sm text-fg-muted">{bed.dx}</p>
          <HealthScore
            key={`${bed.id}-score`}
            size="sm"
            label="Stability score"
            meta={`EWS ${bed.ews}`}
            value={bed.score}
            bands={BANDS}
            factors={bed.factors}
            defaultOpen={bed.severity !== 'normal'}
          />
          <div className="grid grid-cols-1 gap-2.5 @sm:grid-cols-2">
            {METRICS.map((k) => {
              const lim = LIMITS[k]
              const first = bed.trends[k][0] ?? bed.vitals[k]
              const delta = Math.round(bed.vitals[k] - first)
              return (
                <VitalTile
                  key={`${bed.id}-${k}`}
                  density="compact"
                  label={lim.label}
                  value={bed.vitals[k]}
                  unit={lim.unit}
                  data={bed.trends[k]}
                  threshold={{ value: lim.value, direction: lim.direction, severity: bed.severity === 'critical' ? 'critical' : 'caution' }}
                  change={`${delta >= 0 ? '+' : '−'}${Math.abs(delta)} 6h`}
                />
              )
            })}
          </div>
          <Chart
            key={`${bed.id}-chart`}
            label={`Heart rate, ${bed.patient}, last 6 hours`}
            data={HOURS.map((time, i) => ({ time, hr: bed.trends.hr[i] ?? 0 }))}
            x="time"
            series={[{ key: 'hr', label: 'Heart rate', color: tone }]}
            threshold={{ value: 110, label: 'alarm 110 bpm' }}
            unit="bpm"
            min={40}
            height={150}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {bed.infusion ? (
              <Button variant="primary" size="sm" iconStart={<PulseIcon />} onClick={onInfuse}>
                Change infusion
              </Button>
            ) : null}
            <span className="text-ui-sm text-fg-muted">
              {bed.infusion ? `${bed.infusion.drug} ${rate ?? bed.infusion.rate} mL/h` : 'No active infusions'}
            </span>
          </div>
          <form onSubmit={submit} className="flex items-end gap-2">
            <Field label="Add a note" className="flex-1">
              <Input size="sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Seen at the bedside, plan unchanged" />
            </Field>
            <Button type="submit" size="sm" disabled={!note.trim()}>
              Add
            </Button>
          </form>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <Timeline events={events} timeZone="UTC" now={now} />
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ The screen */

function CentralStation() {
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState('bed-7')
  const [wall, setWall] = useState(false)
  const [acked, setAcked] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, TimelineEvent[]>>({})
  const [rates, setRates] = useState<Record<string, number>>({})
  const [infusing, setInfusing] = useState(false)
  const [now, setNow] = useState(screenNow)
  const gridRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  useEffect(() => {
    const id = setInterval(() => setNow(screenNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  const bed = BEDS.find((b) => b.id === selectedId) ?? BEDS[0]!
  const open = WORST_FIRST.filter((b) => b.severity !== 'normal' && !acked.includes(b.id))
  const alarm = open[0]
  const critical = BEDS.filter((b) => b.severity === 'critical').length

  // StationTile has no selected state, so mark the chosen tile for CSS and for assistive tech.
  useEffect(() => {
    gridRef.current?.querySelectorAll<HTMLElement>('button[aria-label]').forEach((el) => {
      el.setAttribute('aria-pressed', String(el.getAttribute('aria-label')?.startsWith(`Bed ${bed.bed} `) ?? false))
    })
  })

  const record = (id: string, e: Partial<TimelineEvent> & { title: string }) =>
    setNotes((n) => ({ ...n, [id]: [{ id: `new-${++seq.current}`, time: new Date(screenNow()), ...e }, ...(n[id] ?? [])] }))
  const soon = (label: string) =>
    toast({ severity: 'info', title: `${label} is not part of this example`, description: 'The docs show the central station only.', duration: 3000 })

  const acknowledge = (b: Bed) => {
    setAcked((a) => [...a, b.id])
    record(b.id, { severity: 'info', title: 'Alarm acknowledged', actor: 'R. Iyer', type: 'ack', description: 'Repeats stay grouped for 15 minutes.' })
    toast({ severity: 'info', title: `Bed ${b.bed} alarm acknowledged`, description: 'Repeats stay grouped for 15 minutes.' })
  }

  const items: StationItem[] = BEDS.map((b) => ({
    id: b.id,
    name: `Bed ${b.bed} · ${b.patient}, ${b.age}`,
    score: b.score,
    severity: b.severity,
    detail: b.severity === 'normal' ? b.dx : `EWS ${b.ews} · ${b.note}`,
    data: b.trends.hr,
  }))

  const alarmCount = open.length
  const events = [...(notes[bed.id] ?? []), ...bed.events]

  // The side navigation is an icon rail on a medium screen and full width on a wide one. Both are in the
  // page and the container query shows one of them.
  const sideNav = (collapsed: boolean) => (
    <SideNav aria-label="Central station" collapsed={collapsed}>
      {NAV.map((n) => (
        <SideNavItem
          key={n.id}
          icon={n.icon}
          active={n.id === 'station'}
          badge={
            n.id === 'station' && critical > 0
              ? { severity: 'critical', count: critical }
              : n.id === 'alarms' && alarmCount > 0 && alarm
                ? { severity: alarm.severity, count: alarmCount }
                : undefined
          }
          onClick={n.id === 'station' ? undefined : () => soon(n.label)}
        >
          {n.label}
        </SideNavItem>
      ))}
    </SideNav>
  )

  return (
    <div data-density={wall ? 'station' : undefined} className="@container bg-surface text-fg">
      <div className="grid min-h-[680px] grid-cols-1 @3xl:grid-cols-[80px_minmax(0,1fr)] @5xl:grid-cols-[216px_minmax(0,1fr)]">
        <aside className="hidden flex-col border-r border-border bg-surface px-3 py-[18px] @3xl:flex">
          <div className="flex items-center justify-center gap-2.5 pb-4 font-semibold @5xl:justify-start @5xl:px-2">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent text-accent-on">
              <PulseIcon />
            </span>
            <span className="hidden @5xl:inline">Northfield Health</span>
          </div>
          <div className="@5xl:hidden">{sideNav(true)}</div>
          <div className="hidden @5xl:block">{sideNav(false)}</div>
          <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-border pt-3 text-ui-sm @5xl:justify-start @5xl:px-2">
            <Avatar name="R. Iyer" size="sm" status="online" />
            <div className="hidden @5xl:block">
              <div className="font-[550]">R. Iyer</div>
              <div className="text-xs text-fg-muted">Charge nurse</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-raised px-5 py-3.5">
            <NavMenu onPick={soon} />
            <div className="min-w-0">
              <h3 className="text-lg">Central station</h3>
              <p className="text-ui-sm text-fg-muted">ICU, 12 beds, day shift. Worst first by early-warning score.</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Live />
              <Clock />
              <Tabs variant="segmented" value={wall ? 'wall' : 'desk'} onValueChange={(v) => setWall(v === 'wall')} aria-label="Display size">
                <Tab value="desk">Desk</Tab>
                <Tab value="wall">Wall display</Tab>
              </Tabs>
            </div>
          </header>

          <div className="flex flex-col gap-4 p-4 @3xl:p-5">
            {alarm ? (
              <Banner
                severity={alarm.severity}
                variant={wall ? 'solid' : 'soft'}
                title={`Bed ${alarm.bed} · ${alarm.patient}, ${alarm.age}: early-warning score ${alarm.ews}`}
                action={
                  <>
                    <Button size="sm" severity={alarm.severity} onClick={() => acknowledge(alarm)}>
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedId(alarm.id)}>
                      Show bed
                    </Button>
                  </>
                }
              >
                {alarm.note}. 34 alarms in the last hour are grouped into 4. {alarmCount > 1 ? `${alarmCount - 1} more waiting.` : ''}
              </Banner>
            ) : (
              <Banner severity="normal" variant={wall ? 'solid' : 'soft'} title="All alarms acknowledged">
                Repeats stay grouped for 15 minutes. A new alarm appears here first.
              </Banner>
            )}

            <div className={wall ? 'flex flex-col gap-4' : 'grid grid-cols-1 items-start gap-4 @6xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'}>
              {wall ? (
                <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
                  {METRICS.map((k) => (
                    <VitalTile
                      key={`${bed.id}-${k}`}
                      density="station"
                      label={`${LIMITS[k].label}, Bed ${bed.bed}`}
                      value={bed.vitals[k]}
                      unit={LIMITS[k].unit}
                      data={bed.trends[k]}
                      threshold={{ value: LIMITS[k].value, direction: LIMITS[k].direction, severity: bed.severity === 'critical' ? 'critical' : 'caution' }}
                    />
                  ))}
                </div>
              ) : null}
              <div
                ref={gridRef}
                className="min-w-0 [&_[aria-pressed=true]]:outline-2 [&_[aria-pressed=true]]:outline-accent"
              >
                <StationGrid label="ICU beds" items={items} onSelect={(i) => setSelectedId(i.id)} />
              </div>
              {wall ? null : (
                <BedDetail
                  bed={bed}
                  rate={rates[bed.id]}
                  events={events}
                  now={now}
                  onInfuse={() => setInfusing(true)}
                  onNote={(text) => record(bed.id, { title: text, actor: 'R. Iyer', type: 'note', icon: <FileIcon width={13} height={13} /> })}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={infusing}
        onOpenChange={setInfusing}
        title={`Change infusion, Bed ${bed.bed}`}
        description={`${bed.patient}, ${bed.age}. ${bed.dx}.`}
      >
        {bed.infusion ? (
          <InfusionForm
            bed={bed}
            rate={rates[bed.id] ?? bed.infusion.rate}
            onCancel={() => setInfusing(false)}
            onConfirm={(rate, reason) => {
              setRates((r) => ({ ...r, [bed.id]: rate }))
              record(bed.id, {
                title: `${bed.infusion!.drug} set to ${rate} mL/h`,
                actor: 'R. Iyer',
                type: 'order',
                description: reason ? `Reason: ${reason}` : undefined,
              })
              setInfusing(false)
              toast({ severity: 'normal', title: 'Infusion updated', description: `Bed ${bed.bed} ${bed.infusion!.drug.toLowerCase()} ${rate} mL/h, recorded on the timeline.` })
            }}
          />
        ) : null}
      </Dialog>
    </div>
  )
}

export function PatientMonitoring() {
  return (
    <ToastProvider>
      <CentralStation />
    </ToastProvider>
  )
}

export default PatientMonitoring
