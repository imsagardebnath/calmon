import { useState } from 'react'
import { Radio, RadioGroup } from '@openvanta/calmon-react/radio'

/** Pick exactly one. Preselect the safest option, and say why an option is unavailable. */
export function DeployStrategy() {
  return (
    <RadioGroup label="Deploy strategy" defaultValue="rolling">
      <Radio value="rolling">Rolling</Radio>
      <Radio value="blue-green">Blue-green</Radio>
      <Radio value="canary" disabled>
        Canary (needs 3 pods)
      </Radio>
    </RadioGroup>
  )
}

/** Horizontal layout, for two or three short options. */
export function Horizontal() {
  return (
    <RadioGroup label="Environment" orientation="horizontal" defaultValue="staging">
      <Radio value="staging">Staging</Radio>
      <Radio value="prod">Production</Radio>
    </RadioGroup>
  )
}

/** Controlled with value and onValueChange. Arrow keys move the selection. */
export function Controlled() {
  const [region, setRegion] = useState('eu-west-1')
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup label="Region" value={region} onValueChange={setRegion}>
        <Radio value="eu-west-1">eu-west-1</Radio>
        <Radio value="us-east-1">us-east-1</Radio>
        <Radio value="ap-south-1">ap-south-1</Radio>
      </RadioGroup>
      <p className="text-ui-sm text-fg-muted">Selected: {region}</p>
    </div>
  )
}

/** Invalid marks the group with aria-invalid. Pair it with text that says what to do. */
export function Invalid() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup label="Rollback plan" invalid>
        <Radio value="auto">Roll back automatically</Radio>
        <Radio value="manual">Ask me first</Radio>
      </RadioGroup>
      <p className="text-ui-sm text-critical-fg">Choose a rollback plan to continue.</p>
    </div>
  )
}
