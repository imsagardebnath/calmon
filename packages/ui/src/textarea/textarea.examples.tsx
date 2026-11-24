import { Field } from '@openvanta/calmon-react/field'
import { Textarea } from '@openvanta/calmon-react/textarea'

/** Ask for a reason when a change needs one later. It grows with the text, up to maxRows. */
export function Justification() {
  return (
    <div className="w-80">
      <Field label="Reason for change" hint="Shown on the service timeline." required>
        <Textarea autoGrow maxRows={8} placeholder="What changed and why" />
      </Field>
    </div>
  )
}

/** With maxLength the counter is always visible, turns to caution near the limit, and is announced politely. */
export function WithCounter() {
  return (
    <div className="w-80">
      <Field label="Status update" hint="Posted to the status page.">
        <Textarea maxLength={140} defaultValue="Investigating elevated error rates in eu-west." />
      </Field>
    </div>
  )
}

/** Turn autoGrow off for a fixed box the person can resize by hand. */
export function FixedHeight() {
  return (
    <div className="w-80">
      <Field label="Notes">
        <Textarea autoGrow={false} rows={5} />
      </Field>
    </div>
  )
}

/** An error says how to fix the problem. */
export function WithError() {
  return (
    <div className="w-80">
      <Field label="Reason for change" required error="Add a reason of at least ten characters.">
        <Textarea defaultValue="fix" />
      </Field>
    </div>
  )
}
