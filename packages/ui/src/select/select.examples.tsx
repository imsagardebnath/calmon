import { Field } from '@openvanta/pikore-react/field'
import { Select } from '@openvanta/pikore-react/select'

/** A native select built from options. Order options by frequency or alphabetically. */
export function Basic() {
  const regions = [
    { label: 'eu-west-1', value: 'eu-west-1' },
    { label: 'us-east-1', value: 'us-east-1' },
    { label: 'ap-south-1', value: 'ap-south-1' },
  ]
  return (
    <div className="w-60">
      <Field label="Region">
        <Select options={regions} defaultValue="eu-west-1" />
      </Field>
    </div>
  )
}

/** A placeholder shows while nothing is chosen. It cannot be picked again. */
export function WithPlaceholder() {
  return (
    <div className="w-60">
      <Field label="Environment" required>
        <Select
          placeholder="Choose an environment"
          options={[
            { label: 'Production', value: 'prod' },
            { label: 'Staging', value: 'staging' },
            { label: 'Development', value: 'dev' },
          ]}
        />
      </Field>
    </div>
  )
}

/** Disabled selects look inactive. Explain why in the hint. */
export function Disabled() {
  return (
    <div className="w-60">
      <Field label="Region" hint="Locked while a deploy runs.">
        <Select options={[{ label: 'eu-west-1', value: 'eu-west-1' }]} disabled />
      </Field>
    </div>
  )
}

/** Individual options can be disabled. An error blocks submit. */
export function WithError() {
  return (
    <div className="w-60">
      <Field label="Deploy window" required error="Choose a window that is not in a freeze.">
        <Select
          defaultValue="fri"
          options={[
            { label: 'Tuesday 10:00', value: 'tue' },
            { label: 'Thursday 10:00', value: 'thu' },
            { label: 'Friday 16:00 (freeze)', value: 'fri', disabled: true },
          ]}
        />
      </Field>
    </div>
  )
}

/** Sizes are 30, 38 and 44px. When unset, the select follows the page density. */
export function Sizes() {
  const options = [{ label: 'eu-west-1', value: 'eu-west-1' }]
  return (
    <div className="flex w-60 flex-col gap-3">
      <Select size="sm" options={options} aria-label="Small" />
      <Select size="md" options={options} aria-label="Medium" />
      <Select size="lg" options={options} aria-label="Large" />
    </div>
  )
}
