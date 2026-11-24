import { useState } from 'react'
import { StationGrid, StationTile, type StationItem } from '@openvanta/calmon-react/station-grid'

/** Tiles are sorted worst first, whatever order the data arrives in. The top-left tile is the one to look at. */
export function Grid() {
  const services: StationItem[] = [
    { id: 'ledger', name: 'ledger', severity: 'normal', score: 95, data: [5, 5, 6, 5, 5, 6, 5, 5, 6, 5, 6, 5] },
    { id: 'orders', name: 'orders-api', severity: 'normal', score: 88, detail: 'All vitals in range', data: [20, 22, 21, 23, 22, 24, 22, 21, 23, 22, 24, 23] },
    { id: 'auth', name: 'auth-service', severity: 'advisory', score: 77, detail: 'CPU 78%, rising', data: [50, 52, 55, 54, 58, 60, 63, 64, 66, 70, 72, 78] },
    { id: 'payments', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2% · 23 alerts grouped', data: [2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42] },
    { id: 'inventory', name: 'inventory', severity: 'normal', score: 91, detail: 'All vitals in range', data: [12, 13, 12, 12, 14, 13, 12, 13, 14, 13, 12, 13] },
    { id: 'checkout', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s, limit 1.2 s', data: [8, 9, 8, 10, 12, 11, 14, 15, 16, 18, 17, 19] },
    { id: 'notifications', name: 'notifications', severity: 'normal', score: 93, detail: 'All vitals in range', data: [30, 28, 31, 29, 30, 32, 29, 30, 31, 29, 30, 31] },
    { id: 'search', name: 'search-index', severity: 'caution', score: 64, detail: 'Replica lag 92 s', data: [5, 5, 6, 8, 11, 10, 13, 15, 14, 16, 18, 17] },
  ]
  return (
    <div className="w-full max-w-4xl">
      <StationGrid label="Production services" items={services} sort="worst-first" columns={4} />
    </div>
  )
}

/** Leave out columns and the grid fits as many tiles as the width allows. */
export function AutoColumns() {
  const items: StationItem[] = [
    { id: 'a', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2%' },
    { id: 'b', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s' },
    { id: 'c', name: 'orders-api', severity: 'normal', score: 88 },
    { id: 'd', name: 'inventory', severity: 'normal', score: 91 },
  ]
  return (
    <div className="w-[26rem] max-w-full">
      <StationGrid label="Services" items={items} />
    </div>
  )
}

/** Give a tile an href to make it a link, or pass onSelect to make every tile a button. */
export function Selectable() {
  const [selected, setSelected] = useState<string | null>(null)
  const items: StationItem[] = [
    { id: 'a', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2%' },
    { id: 'b', name: 'auth-service', severity: 'advisory', score: 77, detail: 'CPU 78%, rising' },
    { id: 'c', name: 'orders-api', severity: 'normal', score: 88, href: '#/services/orders-api' },
    { id: 'd', name: 'ledger', severity: 'normal', score: 95 },
  ]
  return (
    <div className="w-[34rem] max-w-full">
      <StationGrid label="Services" columns={2} items={items} onSelect={(item) => setSelected(item.name)} />
      <p className="mt-3 text-ui-sm text-fg-muted">{selected ? `Selected ${selected}.` : 'Select a service.'}</p>
    </div>
  )
}

/** Sort by name when people look things up instead of scanning for problems. */
export function ByName() {
  const items: StationItem[] = [
    { id: 'a', name: 'payments-api', severity: 'critical', score: 41 },
    { id: 'b', name: 'auth-service', severity: 'advisory', score: 77 },
    { id: 'c', name: 'orders-api', severity: 'normal', score: 88 },
    { id: 'd', name: 'checkout-web', severity: 'caution', score: 58 },
  ]
  return (
    <div className="w-[34rem] max-w-full">
      <StationGrid label="Services" columns={2} items={items} sort="name" summary={false} />
    </div>
  )
}

/** A single tile. Normal stays quiet, and only critical is tinted and pulses. Reduced motion stops the pulse. */
export function Tiles() {
  return (
    <div className="grid w-[34rem] max-w-full grid-cols-2 gap-2.5">
      <StationTile name="payments-api" severity="critical" score={41} detail="Errors 4.2%" data={[2, 3, 5, 8, 12, 18, 24, 42]} />
      <StationTile name="checkout-web" severity="caution" score={58} detail="p95 1.8 s" data={[8, 10, 12, 14, 15, 16, 18, 19]} />
      <StationTile name="auth-service" severity="advisory" score={77} detail="CPU 78%, rising" />
      <StationTile name="orders-api" severity="normal" score={88} data={[20, 22, 21, 23, 22, 24, 22, 23]} />
    </div>
  )
}
