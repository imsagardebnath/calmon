import type { SVGProps } from 'react'
import {
  BellOffIcon,
  BookIcon,
  GaugeIcon,
  GridIcon,
  LayersIcon,
  LimitsIcon,
  PauseIcon,
  PulseIcon,
  RoomIcon,
  TargetIcon,
  TimelineIcon,
} from '@openvanta/pikore-react/icons'
import type { NavIcon } from '../nav.ts'

const SECTION_ICONS = {
  book: BookIcon,
  layers: LayersIcon,
  pulse: PulseIcon,
  grid: GridIcon,
  room: RoomIcon,
} as const

/** The icon of a sidebar section (the `icon` name in nav.ts). */
export function SectionIcon({ name, className }: { name: NavIcon; className?: string }) {
  const Icon = SECTION_ICONS[name]
  return <Icon className={className} />
}

const PATTERN_ICONS = {
  'alarm-fatigue': BellOffIcon,
  'composite-score': GaugeIcon,
  limits: LimitsIcon,
  'pause-points': PauseIcon,
  'confirm-target': TargetIcon,
  timeline: TimelineIcon,
  'station-display': RoomIcon,
} as const

/** The icon of a safety pattern page (by route id). */
export function PatternIcon({ id, className }: { id: string; className?: string }) {
  const Icon = PATTERN_ICONS[id as keyof typeof PATTERN_ICONS] ?? PulseIcon
  return <Icon className={className} />
}

/** Three lines. The library icon set has no menu glyph, so the docs shell draws its own. */
export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Two chevrons moving apart or together: the density menu. (The library's settings gear looks too much like the theme sun.) */
export function DensityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" {...props}>
      <path d="M8 7.5l4-4 4 4M8 16.5l4 4 4-4M4.5 12h15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
