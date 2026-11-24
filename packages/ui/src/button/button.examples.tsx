import { Button } from '@openvanta/calmon-react/button'
import { PlusIcon, TrashIcon } from '@openvanta/calmon-react/icons'

/** Primary action. Use one primary button per view. */
export function Primary() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Save changes</Button>
      <Button>Cancel</Button>
    </div>
  )
}

/** Variants, from most to least emphasis. */
export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  )
}

/** Sizes are 30, 36 and 44px. When unset, the button follows the page density. */
export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}

/** Severity changes the colour for risky actions. Name the target in the label, and confirm before acting. */
export function Severity() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" severity="critical">
        Delete service “api-gateway”
      </Button>
      <Button variant="primary" severity="caution">
        Pause alerts
      </Button>
      <Button severity="critical">Revoke key</Button>
      <Button variant="ghost" severity="critical">
        Remove
      </Button>
    </div>
  )
}

/** Intent aliases map onto severities: danger is critical, warning is caution, success is normal. */
export function Intent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" intent="success">
        Approve
      </Button>
      <Button variant="primary" intent="warning">
        Review
      </Button>
      <Button variant="primary" intent="danger">
        Delete
      </Button>
    </div>
  )
}

/** Icons are decorative and sit before or after the label. */
export function WithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" iconStart={<PlusIcon />}>
        Add service
      </Button>
      <Button severity="critical" iconStart={<TrashIcon />}>
        Delete
      </Button>
    </div>
  )
}

/** Loading keeps the label visible and blocks clicks. The button keeps keyboard focus. */
export function Loading() {
  return (
    <Button variant="primary" loading>
      Publishing
    </Button>
  )
}

/** Disabled buttons look inactive and cannot be focused or clicked. */
export function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" disabled>
        Publish
      </Button>
      <Button disabled>Cancel</Button>
    </div>
  )
}

/** A link styled as a button. Use asChild instead of wrapping a button in a link. */
export function AsLink() {
  return (
    <Button asChild variant="secondary">
      <a href="#/components/button">Read the docs</a>
    </Button>
  )
}
