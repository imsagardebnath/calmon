import { useEffect, useState } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Spinner } from '@openvanta/calmon-react/spinner'

/** Three sizes: 16, 20 and 32px. */
export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  )
}

/** The label is read by screen readers. Say what is loading. */
export function Labelled() {
  return (
    <div className="flex items-center gap-2 text-ui-sm text-fg-muted">
      <Spinner size="sm" label="Loading services" />
      <span aria-hidden="true">Loading services</span>
    </div>
  )
}

/** Delay a spinner by 300ms, so a wait shorter than that never flashes one. */
export function Delayed() {
  const [loading, setLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  useEffect(() => {
    if (!loading) {
      setShowSpinner(false)
      return
    }
    const timer = setTimeout(() => setShowSpinner(true), 300)
    return () => clearTimeout(timer)
  }, [loading])
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setLoading((on) => !on)}>{loading ? 'Finish refresh' : 'Refresh'}</Button>
      {showSpinner ? <Spinner size="sm" label="Refreshing services" /> : null}
    </div>
  )
}
