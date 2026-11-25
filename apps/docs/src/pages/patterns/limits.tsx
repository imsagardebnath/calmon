// Soft and hard limits: 25% asks for a reason, 60% is blocked, and the reason lands on the timeline.
import { useState, type FormEvent } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { Input } from '@openvanta/pikore-react/input'
import { LimitedNumberInput, type LimitState } from '@openvanta/pikore-react/limited-number-input'
import { Timeline, type TimelineEvent } from '@openvanta/pikore-react/timeline'
import { Panel, PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

const MIN = 60_000
const HOUR = 60 * MIN

/** What the entity's timeline already holds when the demo starts. */
function seedEvents(): TimelineEvent[] {
  const now = Date.now()
  return [
    {
      id: 'seed-1',
      time: new Date(now - 38 * MIN),
      severity: 'info',
      type: 'deploy',
      actor: 'deploy-bot',
      title: 'Canary started at 10%',
      description: 'checkout-web v2.31.0 in eu-west-1.',
    },
    {
      id: 'seed-2',
      time: new Date(now - 26 * HOUR),
      severity: 'advisory',
      type: 'limit',
      actor: 'J. Okafor',
      title: 'Soft limit passed: canary at 35%',
      description: 'Reason: planned load test, ticket OPS-218.',
    },
  ]
}

function LimitsDemo() {
  const [state, setState] = useState<LimitState>('ok')
  const [value, setValue] = useState<number | null>(10)
  const [reason, setReason] = useState('')
  const [events, setEvents] = useState<TimelineEvent[]>(seedEvents)
  const [applied, setApplied] = useState<string | null>(null)

  // A value past a hard limit never gets here: the field sets a validity message, so the browser refuses to submit.
  function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (value === null) return
    const soft = state === 'soft'
    const event: TimelineEvent = soft
      ? {
          id: `applied-${events.length}`,
          time: new Date(),
          severity: 'advisory',
          type: 'limit',
          actor: 'You',
          title: `Soft limit passed: canary at ${value}%`,
          description: `Reason: ${reason.trim()}`,
        }
      : {
          id: `applied-${events.length}`,
          time: new Date(),
          severity: 'normal',
          type: 'change',
          actor: 'You',
          title: `Canary shifted to ${value}%`,
        }
    setEvents((list) => [event, ...list])
    setApplied(soft ? 'Applied. The reason is on the timeline.' : 'Applied.')
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Panel title="Rollout, checkout-web in eu-west-1">
        <form className="flex flex-col gap-4" onSubmit={apply}>
          <LimitedNumberInput
            label="Shift traffic to canary"
            unit="%"
            softMax={25}
            hardMax={60}
            defaultValue={10}
            onValueChange={(v) => {
              setValue(v)
              setApplied(null)
            }}
            onStateChange={setState}
            onJustificationChange={setReason}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" type="submit">
              Apply shift
            </Button>
            <span role="status" className="text-ui-sm text-fg-muted">
              {applied}
            </span>
          </div>
        </form>
      </Panel>
      <Panel title="Timeline, checkout-web">
        <div className="max-h-[22rem] overflow-auto">
          <Timeline events={events} />
        </div>
      </Panel>
    </div>
  )
}

const components: PatternComponent[] = [
  {
    name: 'LimitedNumberInput',
    role: 'Shows the usual range first, asks for a reason past the soft limit, and blocks past the hard one. It never changes what was typed.',
  },
  {
    name: 'Timeline',
    role: 'Receives the reason with who gave it and when, so an override can be found again.',
  },
]

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[300px]">
        <LimitedNumberInput label="Shift traffic to canary" unit="%" softMax={25} hardMax={60} defaultValue={10} />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[300px] flex-col gap-1.5">
        <span className="text-ui-sm font-[550] text-fg">Shift traffic to canary</span>
        <Input defaultValue="60" readOnly />
        <p className="m-0 text-ui-sm text-fg-muted">You typed 75. Saved 60. Nobody said so.</p>
      </div>
    ),
    doText: 'Show the usual range before anyone types, and say the maximum when a value is blocked.',
    dontText: 'Clamp a value silently. The person believes what they typed was applied.',
  },
  {
    doPreview: (
      <div className="w-full max-w-[300px]">
        <LimitedNumberInput label="Shift traffic to canary" unit="%" softMax={25} hardMax={60} defaultValue={40} />
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[300px] rounded-card border border-border bg-surface-raised p-4 shadow-low">
        <p className="m-0 mb-3 text-ui-sm font-semibold text-fg">Are you sure?</p>
        <div className="flex justify-end gap-2">
          <Button size="sm">Cancel</Button>
          <Button size="sm" variant="primary">
            OK
          </Button>
        </div>
      </div>
    ),
    doText: 'Past the soft limit, ask why and record the answer on the timeline.',
    dontText: 'Ask “Are you sure?” with an OK button. Everyone clicks through, and nobody can say later why 40% was fine.',
  },
]

export default function Limits() {
  return (
    <PatternPage
      principle={PRINCIPLES.limits}
      components={components}
      demoTitle="Shift traffic to canary, soft limit 25%, hard limit 60%"
      demoIntro={
        <>
          Try 20, then 40, then 75. At 40 the field asks for a reason and Apply waits for it; at 75 it is blocked and says
          the maximum. Apply a value past 25 and the reason appears on the timeline beside it.
        </>
      }
      demo={<LimitsDemo />}
      dos={dos}
    />
  )
}
