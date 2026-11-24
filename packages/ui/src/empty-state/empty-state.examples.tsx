import { Button } from '@calmon/react/button'
import { EmptyState } from '@calmon/react/empty-state'
import { PlusIcon } from '@calmon/react/icons'

/** Say what is empty and why, plainly. */
export function NoData() {
  return (
    <div className="w-[360px] max-w-full">
      <EmptyState title="No alerts in the last 24 hours">Everything on this service is in range.</EmptyState>
    </div>
  )
}

/** Offer the action that fills the empty area. */
export function WithAction() {
  return (
    <div className="w-[360px] max-w-full">
      <EmptyState
        title="No services connected"
        action={
          <Button variant="primary" size="sm" iconStart={<PlusIcon />}>
            Connect a source
          </Button>
        }
      >
        Connect a data source to see health scores and vitals here.
      </EmptyState>
    </div>
  )
}

/** The icon slot takes any decorative icon or illustration. Set `headingLevel` to fit the page outline. */
export function WithIcon() {
  return (
    <div className="w-[360px] max-w-full">
      <EmptyState
        title="No services match “billing”"
        headingLevel={2}
        icon={
          <svg viewBox="0 0 180 40" width="180" height="40" aria-hidden="true">
            <path d="M0 20h60l6-8 6 16 6-8h102" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
          </svg>
        }
        action={<Button size="sm">Clear filter</Button>}
      >
        Check the spelling or clear the filter.
      </EmptyState>
    </div>
  )
}
