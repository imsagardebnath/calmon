import { useState } from 'react'
import { PausePoint } from '@openvanta/pikore-react/pause-point'

/** Plain strings are enough. The action unlocks when every box is checked. */
export function Basic() {
  return (
    <div className="w-96">
      <PausePoint
        title="Before you publish"
        action="Publish"
        onConfirm={() => {}}
        items={['Diff reviewed by a second person', 'Rollback plan is linked']}
      />
    </div>
  )
}

/** Evidence sits under each item, so people look at the proof instead of ticking from memory. */
export function WithEvidence() {
  return (
    <div className="w-[440px]">
      <PausePoint
        title="Before you publish config v43"
        description="Affects 4 services in production."
        env="prod"
        action="Publish config"
        onConfirm={() => {}}
        onCancel={() => {}}
        items={[
          { label: 'Diff reviewed by a second person', evidence: 'Approved by A. Kaur, 12 min ago' },
          { label: 'Rollback plan is linked', evidence: 'Previous version v42 is one click away' },
          { label: 'On-call engineer knows this is going out', evidence: 'Paged R. Iyer at 13:58 UTC' },
          { label: 'Inside the change window', evidence: 'Window closes 18:00 UTC' },
        ]}
      />
    </div>
  )
}

/** Items the system can verify start ticked, with their evidence. People confirm; they do not re-do the work. */
export function Prefilled() {
  return (
    <div className="w-[440px]">
      <PausePoint
        title="Before you deploy checkout-web"
        action="Deploy"
        onConfirm={() => {}}
        items={[
          { label: 'Tests passed on this commit', evidence: 'CI run #4812, 4 min ago', verified: true },
          { label: 'Rollback plan is linked', evidence: 'v2.31.0 is one click away', verified: true },
          'No incident is open in this region',
        ]}
      />
    </div>
  )
}

/** The button names the action and the confirmation repeats it: Publish, then Published. */
export function PublishFlow() {
  const [published, setPublished] = useState(false)
  return (
    <div className="flex w-96 flex-col gap-3">
      <PausePoint
        title="Before you publish"
        action="Publish"
        onConfirm={() => setPublished(true)}
        items={['Diff reviewed by a second person', 'Rollback plan is linked', 'On-call engineer knows']}
      />
      <p role="status" className="text-ui-sm text-normal-fg">
        {published ? 'Published. Config v43 is live.' : ''}
      </p>
    </div>
  )
}

/** Control the boxes yourself, for example to reset them or to record each tick. */
export function Controlled() {
  const [checked, setChecked] = useState([true, false, false])
  return (
    <div className="w-96">
      <PausePoint
        title="Before you restart"
        action="Restart service"
        onConfirm={() => setChecked([false, false, false])}
        checked={checked}
        onCheckedChange={setChecked}
        items={['Traffic is drained', 'Pending writes are flushed', 'A second engineer is on the call']}
      />
    </div>
  )
}
