import { useState } from 'react'
import { Field } from '@openvanta/calmon-react/field'
import { NumberInput } from '@openvanta/calmon-react/number-input'

/** A unit sits after the value. min and max are hard bounds: typing outside them clamps on blur. */
export function WithUnit() {
  return (
    <div className="w-52">
      <Field label="Timeout">
        <NumberInput defaultValue={30} unit="sec" min={1} max={300} />
      </Field>
    </div>
  )
}

/** Steppers and the keyboard change the value by step. Page Up and Page Down move by ten steps. */
export function Steppers() {
  return (
    <div className="w-32">
      <Field label="Replicas" hint="Up and Down to step.">
        <NumberInput defaultValue={6} min={0} max={20} />
      </Field>
    </div>
  )
}

/** Decimals step without floating-point noise: 0.1 + 0.2 stays 0.3. */
export function DecimalStep() {
  return (
    <div className="w-44">
      <Field label="Error budget">
        <NumberInput defaultValue={0.4} step={0.1} min={0} max={5} unit="%" />
      </Field>
    </div>
  )
}

/** Controlled with a number or null. The value is null while the field is empty. */
export function Controlled() {
  const [value, setValue] = useState<number | null>(12)
  return (
    <div className="w-44">
      <Field label="Retries" hint={value === null ? 'Empty.' : `Value: ${value}`}>
        <NumberInput value={value} onValueChange={setValue} min={0} max={50} />
      </Field>
    </div>
  )
}

/** Steppers can be hidden when the number is usually typed. */
export function WithoutSteppers() {
  return (
    <div className="w-44">
      <Field label="Canary traffic">
        <NumberInput defaultValue={5} unit="%" steppers={false} min={0} max={100} />
      </Field>
    </div>
  )
}

/** A warning keeps the value but asks for a second look. For soft and hard limits, use LimitedNumberInput. */
export function Warning() {
  return (
    <div className="w-52">
      <Field label="Canary traffic" warning="Higher than usual, add justification.">
        <NumberInput defaultValue={35} unit="%" min={0} max={100} />
      </Field>
    </div>
  )
}
