import { VitalTile } from '@openvanta/calmon-react/vital-tile'

/** A metric over its limit. The tile takes the threshold's severity and says so with an icon and a word. */
export function Tile() {
  const series = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]
  return (
    <div className="w-[300px]">
      <VitalTile
        label="p95 latency"
        value={412}
        unit="ms"
        data={series}
        threshold={{ value: 400, severity: 'caution' }}
        change="+12% 1h"
      />
    </div>
  )
}

/** Inside its limit, the tile stays quiet: a neutral number and an "In range" badge. */
export function InRange() {
  return (
    <div className="w-[300px]">
      <VitalTile
        label="Error rate"
        value={0.42}
        unit="%"
        data={[0.5, 0.48, 0.52, 0.45, 0.47, 0.44, 0.46, 0.43, 0.45, 0.41, 0.44, 0.42]}
        threshold={{ value: 1, severity: 'critical' }}
        change="−0.06 1h"
      />
    </div>
  )
}

/** Critical when the limit is far over. The badge, the top rule and the number all change, and the limit stays visible. */
export function Critical() {
  return (
    <div className="w-[300px]">
      <VitalTile
        label="Queue depth"
        value={2310}
        unit="jobs"
        data={[400, 420, 480, 600, 750, 900, 1100, 1350, 1600, 1900, 2100, 2310]}
        threshold={{ value: 1000, severity: 'critical' }}
        change="+410% 1h"
      />
    </div>
  )
}

/** Some metrics are bad when they fall. Use direction="below" for availability, SpO2 or revenue. */
export function LowerIsWorse() {
  return (
    <div className="w-[300px]">
      <VitalTile
        label="SpO₂"
        value={89}
        unit="%"
        data={[97, 96, 96, 95, 94, 93, 92, 91, 91, 90, 90, 89]}
        threshold={{ value: 92, severity: 'critical', direction: 'below' }}
        change="−8 pts 1h"
      />
    </div>
  )
}

/** Density follows the page, or set it on the tile. Compact fits dense dashboards, station reads across a room. */
export function Densities() {
  const series = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]
  const threshold = { value: 400, severity: 'caution' } as const
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="w-48">
        <VitalTile density="compact" label="p95" value={412} unit="ms" data={series} threshold={threshold} />
      </div>
      <div className="w-[300px]">
        <VitalTile density="comfortable" label="p95 latency" value={412} unit="ms" data={series} threshold={threshold} />
      </div>
      <div className="w-[460px] max-w-full">
        <VitalTile density="station" label="p95 latency" value={412} unit="ms" data={series} threshold={threshold} />
      </div>
    </div>
  )
}

/** Without a threshold or severity the tile is neutral and has no badge. Use it for context, not for status. */
export function Plain() {
  return (
    <div className="w-[300px]">
      <VitalTile
        label="Throughput"
        value={1284}
        unit="req/s"
        data={[1100, 1180, 1220, 1250, 1210, 1300, 1280, 1310, 1270, 1284]}
        footer="capacity 2,000"
        change="+4% 1h"
      />
    </div>
  )
}
