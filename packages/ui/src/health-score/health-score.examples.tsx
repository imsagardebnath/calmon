import { useState } from 'react'
import { HealthScore, type HealthFactor } from '@calmon/react/health-score'

/** A score with its factors. The ring, the band word and the biggest factor all say the same thing. */
export function Ring() {
  const factors: HealthFactor[] = [
    { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
    { label: 'Saturation', weight: 20, impact: -9, severity: 'advisory' },
    { label: 'Open alerts', weight: 15, impact: -4, severity: 'advisory' },
    { label: 'Error rate', weight: 30, impact: -4, severity: 'normal' },
  ]
  return (
    <div className="w-[34rem] max-w-full">
      <HealthScore
        label="checkout-web"
        meta="Updated 14:32 UTC"
        value={62}
        factors={factors}
        bands={{ advisory: 85, caution: 70, critical: 50 }}
      />
    </div>
  )
}

/** A smaller ring for dashboards. The breakdown starts closed, and the biggest factor stays in view. */
export function Compact() {
  return (
    <div className="w-96 max-w-full">
      <HealthScore
        size="md"
        label="Fulfilment health"
        value={81}
        defaultOpen={false}
        factors={[
          { label: 'On-time shipping', weight: 30, impact: -8, severity: 'advisory' },
          { label: 'Stockouts', weight: 25, impact: -6, severity: 'advisory' },
          { label: 'Returns', weight: 25, impact: -3, severity: 'normal' },
          { label: 'Support SLA', weight: 20, impact: -2, severity: 'normal' },
        ]}
      />
    </div>
  )
}

/** Every band uses the same colours, icons and words. Normal is 85 and up, critical is under 50. */
export function Bands() {
  const factors: HealthFactor[] = [{ label: 'Error rate', weight: 40, impact: -12, severity: 'caution' }]
  return (
    <div className="flex flex-wrap gap-8">
      {[96, 78, 62, 38].map((value) => (
        <div key={value} className="w-52">
          <HealthScore size="sm" label={`Service ${value}`} value={value} factors={factors} defaultOpen={false} />
        </div>
      ))}
    </div>
  )
}

/** Use the same bands for the same kind of entity. Each value is the score a band starts below. */
export function CustomBands() {
  return (
    <div className="w-96 max-w-full">
      <HealthScore
        size="md"
        label="Replication"
        value={92}
        bands={{ advisory: 97, caution: 90, critical: 80 }}
        defaultOpen={false}
        factors={[
          { label: 'Replica lag', weight: 60, impact: -6, severity: 'advisory' },
          { label: 'Failed syncs', weight: 40, impact: -2, severity: 'normal' },
        ]}
      />
    </div>
  )
}

/** Control the breakdown yourself with open and onOpenChange. */
export function Controlled() {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-[34rem] max-w-full">
      <HealthScore
        size="md"
        label="payments-api"
        value={41}
        open={open}
        onOpenChange={setOpen}
        factors={[
          { label: 'Error rate', weight: 40, impact: -28, severity: 'critical' },
          { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
          { label: 'Open alerts', weight: 25, impact: -10, severity: 'caution' },
        ]}
      />
      <p className="mt-3 text-ui-sm text-fg-muted">The breakdown is {open ? 'open' : 'closed'}.</p>
    </div>
  )
}
