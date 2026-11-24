import { Button } from '@calmon/react/button'
import { CommandPalette } from '@calmon/react/command-palette'
import { BellOffIcon, BookIcon, GridIcon, PulseIcon, SettingsIcon, TimelineIcon, TrashIcon } from '@calmon/react/icons'
import { useState } from 'react'

/** Controlled: open it from a button, and also with Ctrl K (Cmd K on macOS). Enter runs the highlighted command. */
export function Basic() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState('none yet')
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <p className="text-ui-sm text-fg-muted">Last command: {last}</p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => setLast(item.label)}
        groups={[
          {
            label: 'Go to',
            items: [
              { id: 'station', label: 'Station' },
              { id: 'services', label: 'Services' },
              { id: 'timeline', label: 'Timeline' },
            ],
          },
          {
            label: 'Actions',
            items: [
              { id: 'theme', label: 'Toggle theme' },
              { id: 'copy', label: 'Copy install command' },
            ],
          },
        ]}
      />
    </div>
  )
}

/** Icons, a second line of context and shortcut hints help people recognise a command. Matches are highlighted. */
export function IconsAndShortcuts() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Search commands</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={() => {}}
        placeholder="Search components, guides and actions"
        groups={[
          {
            label: 'Components',
            items: [
              { id: 'button', label: 'Button', description: 'Actions · Starts an action', icon: <GridIcon />, shortcut: 'G+B' },
              { id: 'tabs', label: 'Tabs', description: 'Navigation · Switch views', icon: <GridIcon /> },
              { id: 'timeline', label: 'Timeline', description: 'Data display · One record per entity', icon: <TimelineIcon /> },
            ],
          },
          {
            label: 'Guides',
            items: [
              { id: 'theming', label: 'Theming', description: 'Tokens, dark mode, custom accent', icon: <BookIcon /> },
              { id: 'density', label: 'Density', description: 'Comfortable, compact and station', icon: <BookIcon /> },
            ],
          },
        ]}
      />
    </div>
  )
}

/** Keywords find a command by words that are not in its label. Try typing "dark" or "copy". */
export function Keywords() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <p className="text-ui-sm text-fg-muted">Try typing “dark” or “clipboard”.</p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={() => {}}
        groups={[
          {
            label: 'Actions',
            items: [
              { id: 'theme', label: 'Toggle theme', description: 'Switch between light and dark', keywords: ['dark', 'light', 'mode'] },
              { id: 'copy', label: 'Copy install command', keywords: ['clipboard', 'npm'] },
              { id: 'llms', label: 'Open llms.txt', description: 'Plain-text docs for coding agents', keywords: ['agents', 'ai'] },
            ],
          },
        ]}
      />
    </div>
  )
}

/** The palette only picks. A destructive command opens a confirm step that names the target, instead of acting at once. */
export function ConfirmBeforeDestructive() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  return (
    <div className="flex w-80 flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      {pending ? (
        <div className="flex flex-col gap-2 rounded-card bg-critical-soft p-3 text-ui-sm" role="alert">
          <span>Delete service “{pending}”? This cannot be undone.</span>
          <div className="flex gap-2">
            <Button variant="primary" severity="critical" size="sm" onClick={() => setPending(null)}>
              Delete service “{pending}”
            </Button>
            <Button size="sm" onClick={() => setPending(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => item.id === 'delete' && setPending('api-gateway')}
        groups={[
          {
            label: 'Services',
            items: [
              { id: 'restart', label: 'Restart service “api-gateway”', icon: <PulseIcon /> },
              { id: 'delete', label: 'Delete service “api-gateway”', icon: <TrashIcon />, keywords: ['remove'] },
            ],
          },
        ]}
      />
    </div>
  )
}

/** Uncontrolled: with no open prop it opens and closes itself on the shortcut. Change the keys with shortcut. */
export function ShortcutOnly() {
  const [last, setLast] = useState('none yet')
  return (
    <div className="flex flex-col gap-2 text-ui-sm text-fg-muted">
      <p>
        Press Ctrl J (Cmd J on macOS) to open the palette.
      </p>
      <p>Last command: {last}</p>
      <CommandPalette
        shortcut="mod+j"
        onSelect={(item) => setLast(item.label)}
        groups={[
          {
            label: 'Actions',
            items: [
              { id: 'silence', label: 'Silence alerts for 1 hour', icon: <BellOffIcon />, keywords: ['mute', 'pause'] },
              { id: 'settings', label: 'Open settings', icon: <SettingsIcon />, shortcut: 'G+S' },
            ],
          },
        ]}
      />
    </div>
  )
}
