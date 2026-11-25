// One timeline per entity: an incident on checkout-web, with every deploy, change, alert and message in order.
import { useState, type FormEvent } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { EnvironmentBadge } from '@openvanta/pikore-react/confirm-target'
import { Input } from '@openvanta/pikore-react/input'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { Timeline, type TimelineEvent } from '@openvanta/pikore-react/timeline'
import { Panel, PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

/** A fixed moment, so the page reads the same on every visit: 12 March 2026, 14:34 UTC. */
const START = Date.UTC(2026, 2, 12, 14, 34)
const at = (day: number, hour: number, minute: number) => new Date(Date.UTC(2026, 2, day, hour, minute))

/** Newest first. The timeline shows events in the order it is given. */
const SEED: TimelineEvent[] = [
  { id: 'e1', time: at(12, 14, 32), severity: 'critical', type: 'alert', title: 'Error rate above 4%', description: '23 alerts from 6 pods grouped into one.' },
  { id: 'e2', time: at(12, 14, 27), severity: 'info', type: 'note', actor: 'R. Iyer', title: 'Rolling back v2.31.0', description: 'Card issuer timeouts began as the rollout reached 8 pods.' },
  { id: 'e3', time: at(12, 14, 24), severity: 'info', type: 'note', actor: 'R. Iyer', title: 'Acknowledged the alert', description: 'Investigating card issuer timeouts.' },
  { id: 'e4', time: at(12, 14, 21), severity: 'caution', type: 'alert', title: 'p95 latency above 800 ms', description: '3 min after config v43 was published.' },
  { id: 'e5', time: at(12, 14, 18), severity: 'normal', type: 'change', actor: 'A. Kaur', title: 'Config v43 published', description: 'Payment timeout 3 s to 10 s. Pause point completed: 4 of 4 checks.' },
  { id: 'e6', time: at(12, 14, 5), severity: 'info', type: 'deploy', actor: 'deploy-bot', title: 'Deploy v2.31.0 started', description: 'Rolling, 4 of 12 pods updated.' },
  { id: 'e7', time: at(11, 17, 40), severity: 'normal', type: 'change', actor: 'A. Kaur', title: 'Config v42 published', description: 'Pause point completed: 4 of 4 checks.' },
  { id: 'e8', time: at(11, 11, 10), type: 'note', actor: 'M. Rossi', title: 'Note added', description: 'Issuer rate-limits us above 900 requests per second.' },
]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'alert', label: 'Alerts' },
  { value: 'change', label: 'Changes' },
  { value: 'deploy', label: 'Deploys' },
  { value: 'note', label: 'Notes' },
] as const

const EMPTY: Record<string, string> = {
  alert: 'No alerts.',
  change: 'No changes.',
  deploy: 'No deploys.',
  note: 'No notes yet.',
}

function TimelineDemo() {
  const [events, setEvents] = useState<TimelineEvent[]>(SEED)
  const [filter, setFilter] = useState<string>('all')
  const [now, setNow] = useState(START)
  const [draft, setDraft] = useState('')

  const count = (value: string) => (value === 'all' ? events.length : events.filter((e) => e.type === value).length)
  const visible = filter === 'all' ? events : events.filter((e) => e.type === filter)

  /** A note goes to the top of the record, one minute after the last thing that happened. */
  function addNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const time = now + 60_000
    setNow(time)
    setEvents((list) => [{ id: `note-${list.length}`, time: new Date(time), type: 'note', actor: 'You', title: text }, ...list])
    setDraft('')
  }

  return (
    <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-semibold">checkout-web</span>
        <EnvironmentBadge env="prod" />
        <span className="text-ui-sm text-fg-muted">eu-west-1 · incident INC-2041</span>
      </div>

      <Tabs variant="segmented" value={filter} onValueChange={setFilter} aria-label="Event type" className="self-start max-w-full overflow-x-auto">
        {FILTERS.map((f) => (
          <Tab key={f.value} value={f.value} count={count(f.value)}>
            {f.label}
          </Tab>
        ))}
      </Tabs>

      <Panel>
        <div className="max-h-[26rem] overflow-auto">
          {visible.length === 0 ? (
            <p className="m-0 py-2 text-ui-sm text-fg-muted">{EMPTY[filter] ?? 'Nothing here.'}</p>
          ) : (
            <Timeline events={visible} timeZone="UTC" now={now} />
          )}
        </div>
      </Panel>

      <form className="flex gap-2" onSubmit={addNote}>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for whoever picks this up"
          aria-label="Add a note"
          autoComplete="off"
        />
        <Button type="submit" disabled={draft.trim() === ''}>
          Add note
        </Button>
      </form>
    </div>
  )
}

const components: PatternComponent[] = [
  {
    name: 'Timeline',
    role: 'Day groups, a severity shape on every node, and who did it and when under every event, in one ordered list.',
  },
]

const NOW = '2026-03-12T14:34:00Z'

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[320px]">
        <Timeline
          timeZone="UTC"
          now={NOW}
          events={[
            { id: 'a', time: at(12, 14, 21), severity: 'caution', type: 'alert', title: 'p95 latency above 800 ms' },
            { id: 'b', time: at(12, 14, 18), severity: 'normal', type: 'change', actor: 'A. Kaur', title: 'Config v43 published' },
            { id: 'c', time: at(12, 14, 5), severity: 'info', type: 'deploy', actor: 'deploy-bot', title: 'Deploy v2.31.0 started' },
          ]}
        />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[320px] flex-col gap-3">
        <Tabs defaultValue="alerts" aria-label="Tools" className="overflow-x-auto">
          <Tab value="alerts">Alerts</Tab>
          <Tab value="deploys">Deploys</Tab>
          <Tab value="config">Config</Tab>
          <Tab value="chat">Chat</Tab>
        </Tabs>
        <p className="m-0 text-ui-sm text-fg-muted">What changed before 14:21? Open all four and compare.</p>
      </div>
    ),
    doText: 'Put alerts, changes, deploys and notes in one list, in order, with who did each.',
    dontText: 'Split one entity’s history across tabs and tools. The first question takes five of them to answer.',
  },
  {
    doPreview: (
      <div className="w-full max-w-[320px]">
        <Timeline
          timeZone="UTC"
          now={NOW}
          events={[
            {
              id: 'a',
              time: at(12, 9, 12),
              severity: 'advisory',
              type: 'limit',
              actor: 'J. Okafor',
              title: 'Soft limit passed: canary at 35%',
              description: 'Reason: planned load test, ticket OPS-218.',
            },
            { id: 'b', time: at(12, 8, 40), severity: 'normal', type: 'change', actor: 'A. Kaur', title: 'Price list v42 published', description: 'Pause point completed: 4 of 4 checks.' },
          ]}
        />
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[320px]">
        <Timeline
          timeZone="UTC"
          now={NOW}
          events={[
            { id: 'a', time: at(12, 9, 12), severity: 'advisory', title: 'Value changed' },
            { id: 'b', time: at(12, 8, 40), title: 'Config updated' },
          ]}
        />
      </div>
    ),
    doText: 'Record why a limit was passed and which checks were confirmed, with the name of the person.',
    dontText: 'Log “Value changed” with no name and no reason. Next week nobody can say who or why.',
  },
]

export default function TimelinePattern() {
  return (
    <PatternPage
      principle={PRINCIPLES.timeline}
      components={components}
      demoTitle="checkout-web incident INC-2041"
      demoIntro={
        <>
          The question in every incident is what changed. Read upward from the alert: the config change landed three
          minutes before it. Filter by type, and add a note, which goes to the top with your name on it.
        </>
      }
      demo={<TimelineDemo />}
      dos={dos}
    />
  )
}
