import { Tab, Tabs, TabsList, TabsPanel } from '@calmon/react/tabs'
import { useState } from 'react'

/** Tabs directly inside Tabs make a plain tab list. Name the list with aria-label. */
export function Underline() {
  return (
    <Tabs defaultValue="overview" aria-label="Service sections">
      <Tab value="overview">Overview</Tab>
      <Tab value="timeline">Timeline</Tab>
      <Tab value="settings">Settings</Tab>
    </Tabs>
  )
}

/** The segmented style suits filters and time ranges. */
export function Segmented() {
  return (
    <Tabs variant="segmented" defaultValue="1h" aria-label="Time range">
      <Tab value="1h">1h</Tab>
      <Tab value="24h">24h</Tab>
      <Tab value="7d">7d</Tab>
    </Tabs>
  )
}

/** Use TabsList and TabsPanel when each tab shows its own content. Only the selected panel renders. */
export function WithPanels() {
  return (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList aria-label="Service sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="timeline">Timeline</Tab>
        <Tab value="settings">Settings</Tab>
      </TabsList>
      <TabsPanel value="overview" className="pt-3 text-ui-sm text-fg-muted">
        Health, latency and error rate for the last hour.
      </TabsPanel>
      <TabsPanel value="timeline" className="pt-3 text-ui-sm text-fg-muted">
        Deploys, alerts and notes, newest first.
      </TabsPanel>
      <TabsPanel value="settings" className="pt-3 text-ui-sm text-fg-muted">
        Thresholds, owners and notification routes.
      </TabsPanel>
    </Tabs>
  )
}

/** A count shows how much needs attention. Add a severity so the badge says how urgent it is, in words as well as colour. */
export function WithCounts() {
  return (
    <Tabs defaultValue="alerts" aria-label="Incident views">
      <Tab value="alerts" count={3} severity="critical">
        Alerts
      </Tab>
      <Tab value="changes" count={12}>
        Changes
      </Tab>
      <Tab value="notes" severity="advisory">
        Notes
      </Tab>
      <Tab value="history" disabled>
        History
      </Tab>
    </Tabs>
  )
}

/** Controlled: keep the selected tab in your own state, for example to sync it with the URL. */
export function Controlled() {
  const [range, setRange] = useState('24h')
  return (
    <div className="flex flex-col items-start gap-3">
      <Tabs variant="segmented" value={range} onValueChange={setRange} aria-label="Time range">
        <Tab value="1h">1h</Tab>
        <Tab value="24h">24h</Tab>
        <Tab value="7d">7d</Tab>
      </Tabs>
      <p className="text-ui-sm text-fg-muted">Showing the last {range}.</p>
    </div>
  )
}
