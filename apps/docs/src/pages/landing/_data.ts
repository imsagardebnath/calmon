// Sample data for the landing page. Fictional services, the same ones as the approved design.
import type { StationItem } from '@calmon/react/station-grid'
import { STATIC_SECTIONS } from '../../nav.ts'
import { pages } from '../../site/pages.ts'

/** Twelve services for the live station. `data` is the last hour; scores are "now". */
export const SERVICES: StationItem[] = [
  { id: 'payments-api', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2% · 23 alerts grouped', data: [2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42] },
  { id: 'checkout-web', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s, limit 1.2 s', data: [8, 9, 8, 10, 12, 11, 14, 15, 16, 18, 17, 19] },
  { id: 'search-index', name: 'search-index', severity: 'caution', score: 64, detail: 'Replica lag 92 s', data: [5, 5, 6, 8, 11, 10, 13, 15, 14, 16, 18, 17] },
  { id: 'auth-service', name: 'auth-service', severity: 'advisory', score: 77, detail: 'CPU 78%, rising', data: [50, 52, 55, 54, 58, 60, 63, 64, 66, 70, 72, 78] },
  { id: 'orders-api', name: 'orders-api', severity: 'normal', score: 88, detail: 'All vitals in range', data: [20, 22, 21, 23, 22, 24, 22, 21, 23, 22, 24, 23] },
  { id: 'inventory', name: 'inventory', severity: 'normal', score: 91, detail: 'All vitals in range', data: [12, 13, 12, 12, 14, 13, 12, 13, 14, 13, 12, 13] },
  { id: 'notifications', name: 'notifications', severity: 'normal', score: 93, detail: 'All vitals in range', data: [30, 28, 31, 29, 30, 32, 29, 30, 31, 29, 30, 31] },
  { id: 'catalog-api', name: 'catalog-api', severity: 'normal', score: 94, detail: 'All vitals in range', data: [9, 10, 9, 9, 10, 9, 10, 10, 9, 10, 9, 10] },
  { id: 'ledger', name: 'ledger', severity: 'normal', score: 95, detail: 'All vitals in range', data: [5, 5, 6, 5, 5, 6, 5, 5, 6, 5, 6, 5] },
  { id: 'shipping', name: 'shipping', severity: 'normal', score: 96, detail: 'All vitals in range', data: [14, 15, 14, 15, 14, 14, 15, 14, 15, 14, 15, 14] },
  { id: 'cdn-edge', name: 'cdn-edge', severity: 'normal', score: 97, detail: 'All vitals in range', data: [40, 42, 41, 40, 42, 41, 40, 41, 42, 40, 41, 42] },
  { id: 'gateway', name: 'gateway', severity: 'normal', score: 98, detail: 'All vitals in range', data: [22, 22, 23, 22, 23, 22, 22, 23, 22, 23, 22, 22] },
]

/** The environment's composite health, as in the design. Its band comes from the library (`scoreSeverity`). */
export const ENVIRONMENT_SCORE = 72

/*
 * Numbers shown in the trust strip. Each one is derived from the source of truth, so it cannot drift:
 *  - components: one generated docs page per folder in packages/ui/src (the Changelog counts them the same way)
 *  - patterns: the Safety patterns section of nav.ts
 * The two constants below cannot be read at runtime; how they were checked is noted next to them.
 */
export const COMPONENT_COUNT = pages.filter((p) => p.entry).length
/** The signature components: everything in the Monitoring and Safety categories (StationGrid, HealthScore, VitalTile, Timeline, LimitedNumberInput, PausePoint, ConfirmTarget). */
export const SIGNATURE_COUNT = pages.filter((p) => p.signature).length
export const PATTERN_COUNT = STATIC_SECTIONS.find((s) => s.name === 'Safety patterns')?.pages.length ?? 0
/** `node scripts/check-size.mjs`: the whole library entry, minified and gzipped, without React and floating-ui (38.83 KB). */
export const GZIP_KB = 40
