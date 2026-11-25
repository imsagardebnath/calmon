import { useState } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { GaugeIcon } from '@openvanta/pikore-react/icons'
import { Popover } from '@openvanta/pikore-react/popover'

/** Explain a number in place. Focus moves into the popover, and Escape brings it back to the button. */
export function ExplainScore() {
  return (
    <Popover trigger={<Button iconStart={<GaugeIcon />}>Why 62?</Button>} label="Score explanation">
      <b className="mb-1 block">Why 62?</b>
      <span className="text-fg-muted">Latency is the largest factor (−21). Error rate is normal.</span>
      <a href="#/components/popover" className="mt-2 block font-[550]">
        See all factors
      </a>
    </Popover>
  )
}

/** Choose the preferred side. The popover flips when there is no room. */
export function Sides() {
  return (
    <div className="flex flex-wrap items-center gap-2 py-24">
      {(['top', 'bottom', 'start', 'end'] as const).map((side) => (
        <Popover key={side} side={side} trigger={<Button>{side}</Button>}>
          This popover prefers the {side} side.
        </Popover>
      ))}
    </div>
  )
}

/** Controlled: close it from inside with `open` and `onOpenChange`. Focus goes back to the trigger. */
export function WithCloseButton() {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} trigger={<Button>Snooze</Button>}>
      <p className="mb-3">Pause alerts for this service for one hour?</p>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={() => setOpen(false)}>
          Not now
        </Button>
        <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
          Snooze for 1 hour
        </Button>
      </div>
    </Popover>
  )
}
