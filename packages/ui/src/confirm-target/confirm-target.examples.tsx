import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { ConfirmTarget, EnvironmentBadge } from '@calmon/react/confirm-target'

/** Pass the button that opens it as the child. The person types the exact name, and the environment shows beside it. */
export function Basic() {
  return (
    <ConfirmTarget name="orders-prod-eu" env="prod" action="Delete database" onConfirm={() => {}}>
      <Button severity="critical">Delete database</Button>
    </ConfirmTarget>
  )
}

/** Say what will happen. Detail beside the name tells look-alike records apart. */
export function WithConsequences() {
  return (
    <ConfirmTarget
      name="orders-prod-eu"
      env="prod"
      action="Delete database"
      detail="284 GB · 3 replicas"
      description="Services that read from it will start to fail."
      consequences={['All tables and backups are removed.', 'The 3 replicas are shut down.']}
      onConfirm={() => {}}
    >
      <Button severity="critical">Delete database</Button>
    </ConfirmTarget>
  )
}

/** Staging gets its own badge, so it is never mistaken for production. */
export function Staging() {
  return (
    <ConfirmTarget name="orders-staging-eu" env="staging" action="Delete queue" onConfirm={() => {}}>
      <Button variant="ghost" severity="critical">
        Delete queue
      </Button>
    </ConfirmTarget>
  )
}

/** Control `open` when the trigger lives elsewhere, such as a menu item. */
export function Controlled() {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Button severity="critical" disabled={deleted} onClick={() => setOpen(true)}>
        Delete cache
      </Button>
      <ConfirmTarget
        name="session-cache"
        env="dev"
        action="Delete cache"
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => setDeleted(true)}
      />
      <span role="status" className="text-ui-sm text-fg-muted">
        {deleted ? 'Deleted session-cache.' : ''}
      </span>
    </div>
  )
}

/** The badge on its own: PROD and STAGING are solid, DEV is quiet. Put it beside any name people are about to change. */
export function Environments() {
  return (
    <div className="flex items-center gap-2">
      <EnvironmentBadge env="prod" />
      <EnvironmentBadge env="staging" />
      <EnvironmentBadge env="dev" />
    </div>
  )
}
