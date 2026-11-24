import { Field } from '@openvanta/calmon-react/field'
import { Input } from '@openvanta/calmon-react/input'
import { SearchIcon } from '@openvanta/calmon-react/icons'

/** Wrap an Input in a Field for a visible label. A placeholder is not a label. */
export function Basic() {
  return (
    <div className="w-72">
      <Field label="Service name">
        <Input placeholder="payments-api" />
      </Field>
    </div>
  )
}

/** The Field shows the expected format before anyone gets it wrong, and marks the field required. */
export function HintAndRequired() {
  return (
    <div className="w-72">
      <Field label="Alert email" hint="We send critical alerts here." required>
        <Input type="email" placeholder="oncall@company.com" />
      </Field>
    </div>
  )
}

/** An icon inside the start of the field. It is decorative, so the field still needs a label. */
export function WithPrefixIcon() {
  return (
    <div className="w-72">
      <Input iconStart={<SearchIcon />} placeholder="Search services" aria-label="Search services" />
    </div>
  )
}

/** Sizes are 30, 38 and 44px. When unset, the input follows the page density. */
export function Sizes() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="md" placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  )
}

/** A warning is a caution, not a block. An error blocks submit and tells the person how to fix it. */
export function WarningAndError() {
  return (
    <div className="flex w-72 flex-col gap-4">
      <Field label="Service name" warning="Name already used in staging. Pick another to avoid confusion.">
        <Input defaultValue="payments-api" />
      </Field>
      <Field label="Alert email" required error="Enter a full email address, like oncall@company.com.">
        <Input type="email" defaultValue="oncall@" />
      </Field>
    </div>
  )
}

/** Disabled inputs look inactive and cannot be focused. Say why in the hint. */
export function Disabled() {
  return (
    <div className="w-72">
      <Field label="Region" hint="Locked while a deploy runs.">
        <Input defaultValue="eu-west-1" disabled />
      </Field>
    </div>
  )
}
