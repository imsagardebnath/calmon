import { IconButton } from '@openvanta/calmon-react/icon-button'
import { MoreIcon, PlusIcon, SettingsIcon, TrashIcon } from '@openvanta/calmon-react/icons'

/** Variants. Every icon button has a label, which is also its hover tooltip. */
export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Settings" icon={<SettingsIcon />} />
      <IconButton label="More actions" variant="ghost" icon={<MoreIcon />} />
      <IconButton label="Add service" variant="primary" icon={<PlusIcon />} />
      <IconButton label="Delete" variant="primary" severity="critical" icon={<TrashIcon />} />
    </div>
  )
}

/** Sizes are 30, 36 and 44px square. When unset, the button follows the page density. */
export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton size="sm" label="Settings" icon={<SettingsIcon />} />
      <IconButton size="md" label="Settings" icon={<SettingsIcon />} />
      <IconButton size="lg" label="Settings" icon={<SettingsIcon />} />
    </div>
  )
}

/** Intent aliases give risky actions their colour. Danger is critical: name the target in the label. */
export function WithIntent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Delete" intent="danger" icon={<TrashIcon />} />
      <IconButton label="Delete" variant="primary" intent="danger" icon={<TrashIcon />} />
    </div>
  )
}

/** Loading swaps the icon for a spinner and blocks clicks. The label stays the accessible name. */
export function Loading() {
  return <IconButton label="Saving settings" loading icon={<SettingsIcon />} />
}

/** Disabled buttons look inactive and cannot be focused or clicked. */
export function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Settings" disabled icon={<SettingsIcon />} />
      <IconButton label="Add service" variant="primary" disabled icon={<PlusIcon />} />
    </div>
  )
}
