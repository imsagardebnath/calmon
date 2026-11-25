import { ProgressBar } from '@openvanta/pikore-react/progress-bar'

/** A level against capacity. Past a threshold the bar turns caution or critical, and screen readers hear the severity. */
export function Capacity() {
  return (
    <div className="w-80">
      <ProgressBar value={87} label="Disk" thresholds={{ caution: 85, critical: 95 }} />
    </div>
  )
}

/** Thresholds at work: normal, caution and critical. */
export function Thresholds() {
  const thresholds = { caution: 85, critical: 95 }
  return (
    <div className="flex w-80 flex-col gap-4">
      <ProgressBar value={42} label="Memory" thresholds={thresholds} />
      <ProgressBar value={87} label="Disk" thresholds={thresholds} />
      <ProgressBar value={97} label="Queue" thresholds={thresholds} />
    </div>
  )
}

/** Known progress with a label and the number beside it. */
export function Determinate() {
  return (
    <div className="w-80">
      <ProgressBar value={66} label="Deploying v2.31.0" />
    </div>
  )
}

/** Without a value the bar is indeterminate. Without a label, give it an accessible name. */
export function Indeterminate() {
  return (
    <div className="w-80">
      <ProgressBar aria-label="Loading services" />
    </div>
  )
}

/** A fixed severity or intent colours the bar when you already know the state. */
export function Severity() {
  return (
    <div className="flex w-80 flex-col gap-4">
      <ProgressBar value={100} label="Backup" severity="normal" />
      <ProgressBar value={30} label="Import" intent="danger" />
    </div>
  )
}
