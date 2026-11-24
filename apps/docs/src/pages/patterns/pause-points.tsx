// Pause points: a short checklist before publishing a price list, with evidence, and a record left on the timeline.
import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { Checkbox } from '@calmon/react/checkbox'
import { PausePoint, type PausePointItem } from '@calmon/react/pause-point'
import { Timeline, type TimelineEvent } from '@calmon/react/timeline'
import { Toast } from '@calmon/react/toast'
import { Panel, PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

const HOUR = 60 * 60_000

/** Four facts. The system verified two of them, so they start ticked with their evidence; people confirm the other two. */
const ITEMS: PausePointItem[] = [
  { label: 'Diff reviewed by a second person', evidence: 'Approved by A. Kaur, 12 min ago' },
  { label: 'Rollback list is linked', evidence: 'Price list v42 is one click away', verified: true },
  { label: 'Support knows prices change at 14:00 UTC', evidence: 'Notified #support-eu at 13:58 UTC' },
  { label: 'Inside the pricing change window', evidence: 'Window closes 18:00 UTC', verified: true },
]

const START = ITEMS.map((item) => typeof item !== 'string' && item.verified === true)

function seedEvents(): TimelineEvent[] {
  const now = Date.now()
  return [
    {
      id: 'seed-1',
      time: new Date(now - 3 * HOUR),
      severity: 'info',
      type: 'change',
      actor: 'M. Rossi',
      title: 'Draft v43 saved',
      description: '142 price changes across 3 storefronts.',
    },
    {
      id: 'seed-2',
      time: new Date(now - 20 * HOUR),
      severity: 'normal',
      type: 'change',
      actor: 'A. Kaur',
      title: 'Price list v42 published',
      description: 'Pause point completed: 4 of 4 checks confirmed.',
    },
  ]
}

function PauseDemo() {
  const [checked, setChecked] = useState<boolean[]>(START)
  const [published, setPublished] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>(seedEvents)

  function publish() {
    setPublished(true)
    setEvents((list) => [
      {
        id: 'published',
        time: new Date(),
        severity: 'normal',
        type: 'change',
        actor: 'You',
        title: 'Price list v43 published',
        description: 'Pause point completed: 4 of 4 checks confirmed.',
      },
      ...list,
    ])
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <PausePoint
        title="Before you publish the price list"
        description="Affects 3 storefronts in production."
        env="prod"
        action="Publish price list"
        items={ITEMS}
        checked={checked}
        onCheckedChange={setChecked}
        onConfirm={publish}
        onCancel={() => setChecked(START)}
        disabled={published}
      />
      <div className="flex flex-col gap-4">
        {published ? (
          <Toast severity="normal" title="Published price list" description="Version 43 is live on 3 storefronts." />
        ) : null}
        <Panel title="Timeline, price list">
          <Timeline events={events} />
        </Panel>
      </div>
    </div>
  )
}

const components: PatternComponent[] = [
  {
    name: 'PausePoint',
    role: 'Three to five checks with evidence under each. The action button unlocks when every box is ticked, and the count is announced.',
  },
]

const QUESTIONS = [
  'Did you think about this?',
  'Is everything OK?',
  'Have you read the runbook?',
  'Are you ready?',
  'Did you tell the team?',
  'Is this the right time?',
  'Do you accept the risk?',
]

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="w-full max-w-[320px]">
        <PausePoint
          title="Before you restart"
          action="Restart service"
          items={[
            { label: 'Traffic is drained', evidence: '0 requests in the last 2 min', verified: true },
            { label: 'Pending writes are flushed', evidence: 'Queue empty at 13:41 UTC', verified: true },
            'A second engineer is on the call',
          ]}
        />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[320px] flex-col gap-2 rounded-card border border-border bg-surface-raised p-4 shadow-low">
        {QUESTIONS.map((q) => (
          <Checkbox key={q} className="text-ui-sm">
            {q}
          </Checkbox>
        ))}
      </div>
    ),
    doText: 'Keep to three to five checks, phrased as facts, with the evidence shown. Pre-fill what the system knows.',
    dontText: 'Ask a long list of vague questions. Past five items people tick without reading.',
  },
  {
    doPreview: (
      <div className="flex w-full max-w-[320px] flex-col items-start gap-3">
        <Button variant="primary">Publish price list</Button>
        <Toast severity="normal" title="Published price list" description="Version 43 is live on 3 storefronts." />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[320px] flex-col items-start gap-3">
        <Button variant="primary">OK</Button>
        <Toast severity="normal" title="Done" />
      </div>
    ),
    doText: 'Name the action on the button, and repeat it in the toast: Publish becomes Published.',
    dontText: 'Label the button OK. The confirmation says Done, and nobody knows what was done.',
  },
]

export default function PausePoints() {
  return (
    <PatternPage
      principle={PRINCIPLES['pause-points']}
      components={components}
      demoTitle="Before you publish the price list"
      demoIntro={
        <>
          Two checks are ticked already because the system verified them, and each shows its evidence. Confirm the other
          two to unlock Publish, then publish. Cancel puts the boxes back.
        </>
      }
      demo={<PauseDemo />}
      dos={dos}
    />
  )
}
