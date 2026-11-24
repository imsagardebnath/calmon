import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { Dialog } from '@calmon/react/dialog'

/** Confirm a destructive action. The intent shows the critical icon, and the confirm button names what it does. */
export function ConfirmDelete() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button severity="critical" onClick={() => setOpen(true)}>
        Delete service
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        intent="danger"
        title="Delete checkout-web?"
        description="Its dashboards, alerts and 90 days of history are removed. This can’t be undone."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" intent="danger" onClick={() => setOpen(false)}>
              Delete service
            </Button>
          </>
        }
      />
    </>
  )
}

/** A form in a dialog. The submit button sits in the footer and points at the form with the `form` attribute. */
export function FormDialog() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Add service
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Add service"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="add-service">
              Add service
            </Button>
          </>
        }
      >
        <form
          id="add-service"
          className="flex flex-col gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            setOpen(false)
          }}
        >
          <label htmlFor="service-name" className="text-ui-sm font-medium">
            Service name
          </label>
          <input
            id="service-name"
            placeholder="payments-api"
            autoComplete="off"
            className="h-9 rounded-control border border-border-strong bg-surface-raised px-3 text-ui"
          />
          <span className="text-xs text-fg-subtle">Lowercase letters, numbers and hyphens.</span>
        </form>
      </Dialog>
    </>
  )
}

/** The icon follows the severity or intent: caution for a risky change, info for a heads-up, success for a result. */
export function Severities() {
  const [kind, setKind] = useState<'caution' | 'info' | 'normal' | null>(null)
  const close = () => setKind(null)
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button severity="caution" onClick={() => setKind('caution')}>
          Restart service
        </Button>
        <Button severity="info" onClick={() => setKind('info')}>
          Turn on grouping
        </Button>
        <Button severity="normal" onClick={() => setKind('normal')}>
          Finish setup
        </Button>
      </div>
      <Dialog
        open={kind !== null}
        onOpenChange={close}
        severity={kind ?? 'info'}
        size="sm"
        title={kind === 'caution' ? 'Restart checkout-api?' : kind === 'normal' ? 'Setup complete' : 'Turn on alert grouping?'}
        description={
          kind === 'caution'
            ? 'Pods restart one at a time. Expect about 40 seconds of reduced capacity.'
            : kind === 'normal'
              ? '12 services are reporting. Your station view is ready.'
              : 'Repeats of the same alert within 10 minutes show as one, with a count.'
        }
        footer={
          <>
            {kind !== 'normal' && <Button onClick={close}>Cancel</Button>}
            <Button variant="primary" severity={kind ?? 'info'} onClick={close}>
              {kind === 'caution' ? 'Restart service' : kind === 'normal' ? 'Open station view' : 'Turn on'}
            </Button>
          </>
        }
      />
    </>
  )
}

/** Widths are 360, 480 (default) and 720px. */
export function Sizes() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null)
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setSize('sm')}>Small</Button>
        <Button onClick={() => setSize('md')}>Medium</Button>
        <Button onClick={() => setSize('lg')}>Large</Button>
      </div>
      <Dialog
        open={size !== null}
        onOpenChange={() => setSize(null)}
        size={size ?? 'md'}
        title={`A ${size === 'sm' ? '360' : size === 'lg' ? '720' : '480'}px dialog`}
        footer={
          <Button variant="primary" onClick={() => setSize(null)}>
            Got it
          </Button>
        }
      >
        <p className="text-ui-sm text-fg-muted">Keep dialogs short. If the content needs scrolling, consider a page or a drawer.</p>
      </Dialog>
    </>
  )
}

/** Not dismissible: Escape and backdrop clicks do nothing, so only the button ends it. Use mid-action, never as a trap. */
export function NotDismissible() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Apply changes</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        dismissible={false}
        intent="warning"
        size="sm"
        title="Applying changes"
        description="Closing this window now could leave the config half applied. It is safe to leave once it finishes."
        footer={
          <Button variant="primary" intent="warning" onClick={() => setOpen(false)}>
            Finish and close
          </Button>
        }
      />
    </>
  )
}
