// "Forty-two components. Seven built for safety.": the design's bento, every card a live component.
// The seven are the Monitoring and Safety components (StationGrid is the hero above, the rest are here).
import { useCallback, useState } from 'react'
import type { TimelineEvent } from '@calmon/react/timeline'
import {
  BannerDemo,
  ChartDemo,
  ConfirmDemo,
  HealthDemo,
  LimitDemo,
  PauseDemo,
  PaletteDemo,
  TimelineDemo,
  ToastDemo,
  VitalDemo,
  type Publish,
} from './_demos.tsx'
import { COMPONENT_COUNT, SIGNATURE_COUNT } from './_data.ts'
import { Section, SectionHead } from './_ui.tsx'

const MIN = 60_000

/** A believable history for one service, measured back from when the page loaded. Newest first. */
const seedEvents = (now: number): TimelineEvent[] => [
  { id: 's1', time: new Date(now - 6 * MIN), severity: 'info', title: 'R. Iyer acknowledged', description: 'Investigating card issuer timeouts.', actor: 'R. Iyer' },
  { id: 's2', time: new Date(now - 8 * MIN), severity: 'critical', title: 'Error rate above 4%', description: '23 alerts from 6 pods grouped into one.', type: 'alert' },
  { id: 's3', time: new Date(now - 24 * MIN), severity: 'info', title: 'Deploy v2.31.0 started', description: 'Rolling, 4 of 12 pods updated.', type: 'deploy' },
  { id: 's4', time: new Date(now - 130 * MIN), severity: 'advisory', title: 'Soft limit exceeded', description: 'Canary at 35%. Reason: planned load test, OPS-218.', actor: 'J. Okafor', type: 'limit' },
  { id: 's5', time: new Date(now - 26 * 60 * MIN), severity: 'normal', title: 'Config v42 published', description: 'PausePoint completed by A. Kaur.', actor: 'A. Kaur', type: 'change' },
]

export function Showcase() {
  const [events, setEvents] = useState(() => seedEvents(Date.now()))
  const publish = useCallback<Publish>((event) => {
    setEvents((list) => [{ ...event, id: `n${Date.now()}`, time: new Date() }, ...list].slice(0, 6))
  }, [])

  return (
    <Section id="components" tone="sunken">
      <SectionHead
        id="components"
        title={`${words(COMPONENT_COUNT)} components. ${words(SIGNATURE_COUNT)} built for safety.`}
        lede="The basics are quiet and dense. The signature components carry the safety patterns, and everything here is the real thing: try it."
      />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 min-[68.75rem]:grid-cols-12">
        <HealthDemo className="sm:col-span-2 min-[68.75rem]:col-span-5" />
        <VitalDemo className="sm:col-span-2 min-[68.75rem]:col-span-7" />

        <LimitDemo className="min-[68.75rem]:col-span-4" />
        <PauseDemo className="min-[68.75rem]:col-span-4" publish={publish} />
        <ConfirmDemo className="sm:col-span-2 min-[68.75rem]:col-span-4" publish={publish} />

        <TimelineDemo className="sm:col-span-2 min-[68.75rem]:col-span-5" events={events} />
        <ChartDemo className="sm:col-span-2 min-[68.75rem]:col-span-7" />

        <ToastDemo className="min-[68.75rem]:col-span-4" />
        <BannerDemo className="min-[68.75rem]:col-span-4" />
        <PaletteDemo className="sm:col-span-2 min-[68.75rem]:col-span-4" />
      </div>
    </Section>
  )
}

const WORDS: Record<number, string> = {
  7: 'Seven',
  40: 'Forty',
  41: 'Forty-one',
  42: 'Forty-two',
  43: 'Forty-three',
  44: 'Forty-four',
  45: 'Forty-five',
}
/** "Forty-two" for the common counts, the digits for anything else. */
function words(n: number): string {
  return WORDS[n] ?? String(n)
}
