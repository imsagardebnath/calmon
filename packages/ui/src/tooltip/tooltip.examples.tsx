import { Button } from '@openvanta/calmon-react/button'
import { IconButton } from '@openvanta/calmon-react/icon-button'
import { CopyIcon } from '@openvanta/calmon-react/icons'
import { Tooltip } from '@openvanta/calmon-react/tooltip'

/** Explain why something is disabled. Use `aria-disabled` rather than `disabled` so the button stays focusable. */
export function DisabledReason() {
  return (
    <div className="pt-10">
      <Tooltip content="Locked until all checks pass">
        <Button variant="primary" aria-disabled="true">
          Publish
        </Button>
      </Tooltip>
    </div>
  )
}

/** Name an icon-only button. The tooltip replaces the native title, so there is only one. */
export function IconLabel() {
  return (
    <div className="pt-10">
      <Tooltip content="Copy service ID">
        <IconButton label="Copy service ID" icon={<CopyIcon />} />
      </Tooltip>
    </div>
  )
}

/** Pick a preferred side. The tooltip flips when there is no room. */
export function Sides() {
  return (
    <div className="flex flex-wrap items-center gap-3 px-16 py-12">
      {(['top', 'bottom', 'start', 'end'] as const).map((side) => (
        <Tooltip key={side} side={side} content={`Shown on the ${side}`}>
          <Button>{side}</Button>
        </Tooltip>
      ))}
    </div>
  )
}

/** `delay` is how long the pointer rests before it shows. Keyboard focus always shows it at once. */
export function Delay() {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-10">
      <Tooltip content="Shows at once" delay={0}>
        <Button>No delay</Button>
      </Tooltip>
      <Tooltip content="Shows after one second" delay={1000}>
        <Button>One second</Button>
      </Tooltip>
    </div>
  )
}
