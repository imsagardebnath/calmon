import { useState } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Field } from '@openvanta/calmon-react/field'
import { LimitedNumberInput, type LimitState } from '@openvanta/calmon-react/limited-number-input'

/** Two limits: past 25% asks for a reason, past 60% is blocked. The usual range shows before anyone types. */
export function Basic() {
  return (
    <div className="w-72">
      <LimitedNumberInput label="Shift traffic to canary" unit="%" softMax={25} hardMax={60} defaultValue={10} />
    </div>
  )
}

/** Past a soft limit the value is allowed. The field turns caution and a reason becomes required. */
export function SoftLimit() {
  return (
    <div className="w-72">
      <LimitedNumberInput label="Shift traffic to canary" unit="%" softMax={25} hardMax={60} defaultValue={40} />
    </div>
  )
}

/** Past a hard limit the value is blocked: critical, `aria-invalid`, and a form cannot submit. The number is never clamped for you. */
export function HardLimit() {
  return (
    <div className="w-72">
      <LimitedNumberInput label="Shift traffic to canary" unit="%" softMax={25} hardMax={60} defaultValue={75} />
    </div>
  )
}

/** Limits on both sides, for a value that is wrong when it is too small as well as too large. */
export function BothSides() {
  return (
    <div className="w-72">
      <LimitedNumberInput
        label="Replicas"
        unit="pods"
        softMin={3}
        softMax={12}
        hardMin={1}
        hardMax={40}
        defaultValue={6}
        hint="Usual range 3 to 12 pods."
      />
    </div>
  )
}

/** In a form, a blocked value or a missing reason stops submit. Record the reason with `onJustificationChange`. */
export function RecordTheReason() {
  const [state, setState] = useState<LimitState>('ok')
  const [reason, setReason] = useState('')
  const [applied, setApplied] = useState<string | null>(null)
  return (
    <form
      className="flex w-80 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setApplied(state === 'soft' ? `Applied. Reason recorded: ${reason}` : 'Applied.')
      }}
    >
      <LimitedNumberInput
        label="Shift traffic to canary"
        unit="%"
        softMax={25}
        hardMax={60}
        defaultValue={35}
        onStateChange={setState}
        onJustificationChange={setReason}
        onValueChange={() => setApplied(null)}
      />
      <div className="flex items-center gap-3">
        <Button variant="primary" type="submit">
          Apply shift
        </Button>
        <span role="status" className="text-ui-sm text-fg-muted">
          {applied}
        </span>
      </div>
    </form>
  )
}

/** Without a justification field: past a soft limit it warns, and nothing more. Use it when no one needs a record. */
export function WarnOnly() {
  return (
    <div className="w-72">
      <LimitedNumberInput
        label="Alert threshold"
        unit="ms"
        softMax={500}
        hardMax={5000}
        defaultValue={800}
        requireJustification={false}
      />
    </div>
  )
}

/** Inside a Field, the Field supplies the label and the required marker. */
export function InsideField() {
  return (
    <div className="w-72">
      <Field label="Rollout speed" required>
        <LimitedNumberInput unit="%" softMax={25} hardMax={60} defaultValue={20} />
      </Field>
    </div>
  )
}
