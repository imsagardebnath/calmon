import { Button } from '@openvanta/calmon-react/button'
import { Toast, ToastProvider, useToast } from '@openvanta/calmon-react/toast'

/** Wrap the app in a ToastProvider once, then call toast() from useToast(). The toast leaves after 5 seconds; hovering pauses it. */
export function Basic() {
  function Publish() {
    const { toast } = useToast()
    return (
      <Button
        variant="primary"
        onClick={() => toast({ severity: 'normal', title: 'Published', description: 'Config v43 is live in production.' })}
      >
        Publish
      </Button>
    )
  }
  return (
    <ToastProvider>
      <Publish />
    </ToastProvider>
  )
}

/** Offer Undo instead of a confirmation for reversible actions. Pressing the action also dismisses the toast. */
export function WithUndo() {
  function Archive() {
    const { toast } = useToast()
    return (
      <Button
        onClick={() =>
          toast({
            intent: 'primary',
            title: '3 rows archived',
            description: 'Restore them from Archive for 30 days.',
            duration: 7000,
            action: { label: 'Undo', onClick: () => toast({ severity: 'normal', title: 'Restored 3 rows' }) },
          })
        }
      >
        Archive rows
      </Button>
    )
  }
  return (
    <ToastProvider>
      <Archive />
    </ToastProvider>
  )
}

/** A dedupeKey merges repeats into one toast with a count, instead of stacking one per alert. Critical toasts stay until dismissed. */
export function Grouped() {
  function Alerts() {
    const { toast, dismissAll } = useToast()
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          severity="caution"
          onClick={() =>
            toast({
              severity: 'caution',
              title: 'Disk above 85%',
              description: 'db-03 will slow down writes at 90%.',
              dedupeKey: 'disk-85',
            })
          }
        >
          Disk alert
        </Button>
        <Button
          severity="critical"
          onClick={() =>
            toast({ severity: 'critical', title: 'Could not publish', description: 'The change window closed at 18:00.' })
          }
        >
          Failed publish
        </Button>
        <Button variant="ghost" onClick={dismissAll}>
          Dismiss all
        </Button>
      </div>
    )
  }
  return (
    <ToastProvider>
      <Alerts />
    </ToastProvider>
  )
}

/** Call toast() again with the same id to update a toast in place, such as a progress bar. Use duration 0 while it runs. */
export function Progress() {
  function Deploy() {
    const { toast } = useToast()
    return (
      <Button
        onClick={() => {
          const id = toast({ severity: 'info', loading: true, title: 'Deploying v2.31.0', description: '8 of 12 pods updated', progress: 66, duration: 0 })
          setTimeout(() => toast({ id, severity: 'normal', loading: false, title: 'Deployed v2.31.0', description: 'All 12 pods are healthy.', progress: undefined, duration: 5000 }), 3000)
        }}
      >
        Deploy
      </Button>
    )
  }
  return (
    <ToastProvider>
      <Deploy />
    </ToastProvider>
  )
}

/** The Toast component on its own, for docs and previews. In an app, use ToastProvider and useToast. */
export function Static() {
  return (
    <div className="flex flex-col gap-3">
      <Toast severity="normal" title="Published" description="Config v43 is live in production." onDismiss={() => {}} />
      <Toast severity="info" title="Deploy queued" description="Starts after the current rollout finishes." count={3} onDismiss={() => {}} />
      <Toast severity="caution" title="Disk above 85%" description="db-03 will slow down writes at 90%." onDismiss={() => {}} />
      <Toast severity="critical" title="Could not publish" description="The change window closed at 18:00." onDismiss={() => {}} />
      <Toast solid intent="secondary" title="Copied to clipboard" icon={false} />
    </div>
  )
}
