import type { JSX } from 'react'
import type { Severity } from '../lib/tone.ts'
import { AdvisoryIcon, CautionIcon, CriticalIcon, InfoIcon, NormalIcon, type IconProps } from './icons.tsx'

const BY_SEVERITY = {
  normal: NormalIcon,
  info: InfoIcon,
  advisory: AdvisoryIcon,
  caution: CautionIcon,
  critical: CriticalIcon,
} satisfies Record<Severity, (props: IconProps) => JSX.Element>

export type SeverityIconProps = IconProps & {
  /** Which severity to draw: `normal`, `info`, `advisory`, `caution` or `critical`. */
  severity: Severity
}

/**
 * The icon for a severity. Every severity has its own shape (check, i, diamond, triangle,
 * octagon), so status never depends on colour alone. Decorative: pair it with a text label.
 */
export function SeverityIcon({ severity, ...props }: SeverityIconProps) {
  const Icon = BY_SEVERITY[severity]
  return <Icon {...props} />
}
