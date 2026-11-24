import { useState } from 'react'
import { Switch } from '@calmon/react/switch'

/** Settings that take effect at once, with no save step. */
export function Settings() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultChecked>Group repeat alerts</Switch>
      <Switch>Page me on advisory</Switch>
      <Switch disabled>Maintenance mode (admins only)</Switch>
    </div>
  )
}

/** Controlled with checked and onCheckedChange. The callback fires immediately. */
export function Controlled() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Switch checked={on} onCheckedChange={setOn}>
        Mute alerts for this service
      </Switch>
      <p className="text-ui-sm text-fg-muted">{on ? 'Muted. Critical alerts still page.' : 'Alerts are on.'}</p>
    </div>
  )
}

/** With no visible text, give the switch an aria-label. */
export function WithoutVisibleLabel() {
  return <Switch aria-label="Dark mode" defaultChecked />
}
