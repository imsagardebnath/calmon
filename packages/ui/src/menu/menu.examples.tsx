import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { Dialog } from '@calmon/react/dialog'
import { IconButton } from '@calmon/react/icon-button'
import { BellOffIcon, ChevronDownIcon, CopyIcon, DownloadIcon, MoreIcon, TimelineIcon, TrashIcon } from '@calmon/react/icons'
import { Menu, MenuItem, MenuSeparator } from '@calmon/react/menu'

/** Row actions. The destructive item comes last, after a separator, and its ellipsis says it will ask first. */
export function RowActions() {
  return (
    <Menu trigger={<IconButton label="Actions" icon={<MoreIcon />} />}>
      <MenuItem icon={<TimelineIcon />} shortcut="T">
        Open timeline
      </MenuItem>
      <MenuItem icon={<BellOffIcon />} shortcut="S">
        Snooze alerts
      </MenuItem>
      <MenuItem icon={<CopyIcon />}>Copy ID</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} intent="danger">
        Delete service…
      </MenuItem>
    </Menu>
  )
}

/** A text button as the trigger, with the menu lined up to its right edge. A disabled item stays focusable and says why. */
export function AlignEnd() {
  return (
    <div className="flex justify-end">
      <Menu align="end" trigger={<Button iconEnd={<ChevronDownIcon />}>Export</Button>}>
        <MenuItem icon={<DownloadIcon />}>Download CSV</MenuItem>
        <MenuItem icon={<DownloadIcon />}>Download JSON</MenuItem>
        <MenuItem icon={<DownloadIcon />} disabled>
          Export PDF (no data)
        </MenuItem>
      </Menu>
    </div>
  )
}

/** An item that opens a confirmation. When the dialog closes, focus returns to the menu button. */
export function OpensConfirmation() {
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <Menu trigger={<IconButton label="Service actions" icon={<MoreIcon />} />}>
        <MenuItem icon={<CopyIcon />}>Copy ID</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<TrashIcon />} intent="danger" onClick={() => setConfirm(true)}>
          Delete service…
        </MenuItem>
      </Menu>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        intent="danger"
        size="sm"
        title="Delete checkout-web?"
        description="This can’t be undone."
        footer={
          <>
            <Button onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="primary" intent="danger" onClick={() => setConfirm(false)}>
              Delete service
            </Button>
          </>
        }
      />
    </>
  )
}
