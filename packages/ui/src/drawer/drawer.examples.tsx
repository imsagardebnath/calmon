import { useState } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Drawer } from '@openvanta/calmon-react/drawer'

/** Detail and actions for the item you were looking at. The primary action stays in the footer. */
export function DetailSheet() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open detail sheet</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="payments-api"
        description="Critical for 12 minutes"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Assign</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Acknowledge
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-ui-sm">
          <p>
            Error rate is <span className="num">4.2%</span>, above the <span className="num">2%</span> limit.
          </p>
          <p className="text-fg-muted">The last deploy, v2.31.0, finished 14 minutes before the alert started.</p>
        </div>
      </Drawer>
    </>
  )
}

/** `side="start"` slides in from the left edge. */
export function FromStart() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open filters</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="start"
        size={320}
        title="Filters"
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Apply filters
          </Button>
        }
      >
        <p className="text-ui-sm text-fg-muted">Choose which services to show on the station view.</p>
      </Drawer>
    </>
  )
}

/** `size` is the width in px. The default is 420. */
export function WideSheet() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open wide sheet</Button>
      <Drawer open={open} onOpenChange={setOpen} size={560} title="Deploy history">
        <p className="text-ui-sm text-fg-muted">A wider sheet suits tables and timelines.</p>
      </Drawer>
    </>
  )
}
