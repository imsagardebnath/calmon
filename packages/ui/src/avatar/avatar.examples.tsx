import { Avatar, AvatarGroup } from '@calmon/react/avatar'

/** Initials come from the name, on a tint chosen from the name, so the same person always looks the same. */
export function Initials() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Priya Shah" />
      <Avatar name="Lena Torres" />
      <Avatar name="Ravi Iyer" />
      <Avatar name="Alex Kaur" />
    </div>
  )
}

/** Three sizes: 24, 32 (default) and 44px. */
export function Sizes() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Maya Rao" size="sm" />
      <Avatar name="Maya Rao" size="md" />
      <Avatar name="Maya Rao" size="lg" />
    </div>
  )
}

/** A presence dot. Online is a filled dot and away is a hollow ring, and both are part of the accessible name. */
export function Presence() {
  return (
    <div className="flex items-center gap-4">
      <Avatar name="Alex Kaur" status="online" />
      <Avatar name="Jo Okafor" status="away" />
    </div>
  )
}

/** Show the name next to the avatar. An avatar alone is a weak way to identify someone. */
export function WithName() {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name="Ravi Iyer" status="online" />
      <div className="leading-tight">
        <div className="text-ui-sm font-medium">Ravi Iyer</div>
        <div className="text-xs text-fg-subtle">On call until 18:00</div>
      </div>
    </div>
  )
}

/** A group overlaps its avatars and collapses the rest into "+N". The tail names them for screen readers. */
export function Group() {
  const team = [
    { name: 'Priya Shah' },
    { name: 'Lena Torres', status: 'online' as const },
    { name: 'Maya Rao' },
    { name: 'Jo Okafor' },
    { name: 'Alex Kaur' },
    { name: 'Ravi Iyer' },
  ]
  return <AvatarGroup max={3} people={team} />
}
