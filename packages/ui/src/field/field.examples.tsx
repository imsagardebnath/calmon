import { Field } from '@calmon/react/field'
import { Input } from '@calmon/react/input'
import { NumberInput } from '@calmon/react/number-input'
import { Select } from '@calmon/react/select'
import { Textarea } from '@calmon/react/textarea'

/** An error blocks submit. Say how to fix the problem, not just that it is wrong. */
export function WithError() {
  return (
    <div className="w-72">
      <Field label="Alert email" required error="Enter a full email address, like oncall@company.com.">
        <Input type="email" defaultValue="oncall@" />
      </Field>
    </div>
  )
}

/** A hint shows the expected format up front. required adds the marker and aria-required. */
export function HintAndRequired() {
  return (
    <div className="w-72">
      <Field label="Service name" hint="Lowercase letters, numbers and dashes." required>
        <Input placeholder="payments-api" />
      </Field>
    </div>
  )
}

/** A warning asks for a second look but does not block submit. */
export function Warning() {
  return (
    <div className="w-72">
      <Field label="Canary traffic" warning="Higher than usual, add justification.">
        <NumberInput defaultValue={35} unit="%" min={0} max={100} />
      </Field>
    </div>
  )
}

/** Field works with Select and Textarea too: the label, hint and error are wired the same way. */
export function WithOtherControls() {
  return (
    <div className="flex w-80 flex-col gap-4">
      <Field label="Region" hint="Locked while a deploy runs.">
        <Select options={[{ label: 'eu-west-1', value: 'eu-west-1' }]} disabled />
      </Field>
      <Field label="Reason for change" hint="Shown on the service timeline." required>
        <Textarea placeholder="What changed and why" />
      </Field>
    </div>
  )
}
