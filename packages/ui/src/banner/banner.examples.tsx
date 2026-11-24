import { useState } from 'react'
import { Banner } from '@calmon/react/banner'
import { Button } from '@calmon/react/button'

/** A message across a section, with one action. The title says what happened, the body says why it matters. */
export function WithAction() {
  return (
    <div className="w-[480px] max-w-full">
      <Banner severity="caution" title="Disk above 85% on 3 hosts" action={<Button size="sm" severity="caution">View hosts</Button>}>
        Free space before 90%, when writes slow down.
      </Banner>
    </div>
  )
}

/** Severity sets the colour and the icon. Critical banners are announced at once; the others are polite. */
export function Severities() {
  return (
    <div className="flex w-[480px] max-w-full flex-col gap-3">
      <Banner severity="info" title="Maintenance tonight">
        Failover test from 02:00 to 02:30 UTC. Alerts from db-* are grouped.
      </Banner>
      <Banner severity="advisory" title="Certificate expires in 21 days">
        Renew before 14 Dec to avoid a forced rotation.
      </Banner>
      <Banner severity="normal" title="All checks passed">
        Config v42 is safe to publish.
      </Banner>
      <Banner severity="critical" title="Payments failing in eu-west">
        Error rate is 4.2%. R. Iyer is on it. Updates every 15 minutes.
      </Banner>
    </div>
  )
}

/** Intent aliases map onto severities: danger is critical, warning is caution, success is normal. */
export function Intent() {
  return (
    <div className="w-[480px] max-w-full">
      <Banner intent="warning" title="Queue is backing up">
        Workers are at capacity.
      </Banner>
    </div>
  )
}

/** Pass onDismiss to show a close button. A title alone makes a compact one-line banner. */
export function Dismissible() {
  const [open, setOpen] = useState(true)
  return (
    <div className="w-[480px] max-w-full">
      {open ? <Banner title="Compact, single line" onDismiss={() => setOpen(false)} /> : <Button onClick={() => setOpen(true)}>Show banner</Button>}
    </div>
  )
}

/** Solid fills the whole banner. Use it only on wall displays, when the alert must be seen across the room. */
export function Solid() {
  return (
    <div className="w-[480px] max-w-full">
      <Banner severity="critical" variant="solid" title="Solid, for wall displays only">
        Use when the alert must be seen from across the room.
      </Banner>
    </div>
  )
}
