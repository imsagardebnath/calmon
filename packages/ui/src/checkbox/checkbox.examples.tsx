import { useState } from 'react'
import { Field } from '@openvanta/calmon-react/field'
import { Checkbox, CheckboxGroup } from '@openvanta/calmon-react/checkbox'

/** Related checkboxes go in a CheckboxGroup, which renders a fieldset with a legend. */
export function Group() {
  return (
    <CheckboxGroup label="Notify me about" defaultValue={['critical', 'caution']}>
      <Checkbox value="critical">Critical alerts</Checkbox>
      <Checkbox value="caution">Caution alerts</Checkbox>
      <Checkbox value="advisory">Advisory alerts</Checkbox>
    </CheckboxGroup>
  )
}

/** A single choice. Phrase the label positively: "Send alerts", not "Don't send alerts". */
export function Single() {
  return <Checkbox defaultChecked>Send me a weekly summary</Checkbox>
}

/** Indeterminate means "some selected". Clicking it checks everything. */
export function Indeterminate() {
  const [picked, setPicked] = useState<string[]>(['eu-west-1'])
  const regions = ['eu-west-1', 'us-east-1', 'ap-south-1']
  const all = picked.length === regions.length
  return (
    <div className="flex flex-col gap-2.5">
      <Checkbox
        checked={all ? true : picked.length ? 'indeterminate' : false}
        onCheckedChange={(on) => setPicked(on ? regions : [])}
      >
        All regions
      </Checkbox>
      <div className="ml-7 flex flex-col gap-2.5">
        {regions.map((r) => (
          <Checkbox
            key={r}
            checked={picked.includes(r)}
            onCheckedChange={(on) => setPicked(on ? [...picked, r] : picked.filter((x) => x !== r))}
          >
            {r}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}

/** Inside a Field, an error links to the checkbox and sets aria-invalid. */
export function WithError() {
  return (
    <div className="w-80">
      <Field label="Terms" error="Accept the terms to continue.">
        <Checkbox>I accept the data processing terms</Checkbox>
      </Field>
    </div>
  )
}

/** Disabled checkboxes look inactive and cannot be changed. */
export function Disabled() {
  return (
    <div className="flex flex-col gap-2.5">
      <Checkbox disabled>Advisory alerts</Checkbox>
      <Checkbox disabled defaultChecked>
        Critical alerts (always on)
      </Checkbox>
    </div>
  )
}
