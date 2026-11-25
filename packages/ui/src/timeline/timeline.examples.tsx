import { FileIcon, LayersIcon, ListCheckIcon, UserIcon } from '@openvanta/pikore-react/icons'
import { Timeline, type TimelineEvent } from '@openvanta/pikore-react/timeline'

/** Alerts, deploys, notes and people in one ordered record, grouped by day. Each node has a severity shape. */
export function EntityTimeline() {
  const events: TimelineEvent[] = [
    { id: 'e1', time: '2026-03-12T14:24:00Z', severity: 'info', title: 'R. Iyer acknowledged', description: 'Investigating card issuer timeouts.', actor: 'R. Iyer' },
    { id: 'e2', time: '2026-03-12T14:21:00Z', severity: 'critical', title: 'Error rate above 4%', description: '23 alerts from 6 pods grouped into one.', type: 'alert' },
    { id: 'e3', time: '2026-03-12T14:05:00Z', severity: 'info', title: 'Deploy v2.31.0 started', description: 'Rolling, 4 of 12 pods updated.', type: 'deploy' },
    { id: 'e4', time: '2026-03-12T13:52:00Z', severity: 'caution', title: 'p95 latency above 800 ms', type: 'alert' },
    { id: 'e5', time: '2026-03-11T17:40:00Z', severity: 'normal', title: 'Config v42 published', description: 'PausePoint completed by A. Kaur.', actor: 'A. Kaur', type: 'change' },
    { id: 'e6', time: '2026-03-11T11:10:00Z', title: 'Note added', description: 'Issuer rate-limits us above 900 requests per second.', actor: 'M. Rossi', type: 'note' },
  ]
  return (
    <div className="w-[26rem] max-w-full">
      <Timeline events={events} groupBy="day" timeZone="UTC" now="2026-03-12T14:30:00Z" />
    </div>
  )
}

/** Without grouping, each time shows the date as well. Use it for short histories. */
export function Flat() {
  const events: TimelineEvent[] = [
    { id: 'a', time: '2026-03-12T14:21:00Z', severity: 'critical', title: 'Error rate above 4%' },
    { id: 'b', time: '2026-03-12T13:52:00Z', severity: 'caution', title: 'p95 latency above 800 ms' },
    { id: 'c', time: '2026-03-11T17:40:00Z', severity: 'normal', title: 'Config v42 published', actor: 'A. Kaur' },
  ]
  return (
    <div className="w-[26rem] max-w-full">
      <Timeline events={events} groupBy="none" timeZone="UTC" now="2026-03-12T14:30:00Z" />
    </div>
  )
}

/** Say who did it. The actor and the type show under the title. */
export function WithActors() {
  const events: TimelineEvent[] = [
    { id: 'a', time: '2026-03-12T14:24:00Z', severity: 'info', title: 'Alert acknowledged', description: 'Investigating card issuer timeouts.', actor: 'R. Iyer', type: 'alert' },
    { id: 'b', time: '2026-03-12T14:05:00Z', severity: 'info', title: 'Deploy v2.31.0 started', actor: 'deploy-bot', type: 'deploy' },
    { id: 'c', time: '2026-03-12T09:12:00Z', severity: 'advisory', title: 'Soft limit exceeded', description: 'Reason: planned load test, ticket OPS-218.', actor: 'J. Okafor', type: 'limit' },
  ]
  return (
    <div className="w-[26rem] max-w-full">
      <Timeline events={events} timeZone="UTC" now="2026-03-12T14:30:00Z" />
    </div>
  )
}

/** Replace the node icon for events that are about a person or a thing rather than a severity. */
export function CustomIcons() {
  const events: TimelineEvent[] = [
    { id: 'a', time: '2026-03-12T14:24:00Z', severity: 'info', icon: <UserIcon width={13} height={13} />, title: 'R. Iyer acknowledged' },
    { id: 'b', time: '2026-03-12T14:05:00Z', severity: 'info', icon: <LayersIcon width={13} height={13} />, title: 'Deploy v2.31.0 started' },
    { id: 'c', time: '2026-03-11T17:40:00Z', severity: 'normal', icon: <ListCheckIcon width={13} height={13} />, title: 'Config v42 published' },
    { id: 'd', time: '2026-03-11T11:10:00Z', icon: <FileIcon width={13} height={13} />, title: 'Note added' },
  ]
  return (
    <div className="w-[26rem] max-w-full">
      <Timeline events={events} timeZone="UTC" now="2026-03-12T14:30:00Z" />
    </div>
  )
}

/** Day headings stick to the top of a scrolling panel. Set --timeline-bg to the panel colour if it is not raised. */
export function Scrolling() {
  const events: TimelineEvent[] = Array.from({ length: 12 }, (_, i) => ({
    id: `e${i}`,
    time: new Date(Date.UTC(2026, 2, 12 - Math.floor(i / 4), 16 - (i % 4) * 3, 10)),
    severity: i % 5 === 0 ? 'caution' : 'normal',
    title: i % 5 === 0 ? 'Latency above limit' : 'Health check passed',
  }))
  return (
    <div className="h-64 w-[26rem] max-w-full overflow-auto rounded-card border border-border bg-surface-raised px-4 shadow-low">
      <Timeline events={events} timeZone="UTC" now="2026-03-12T17:00:00Z" />
    </div>
  )
}
