/** The five severity levels, least to most urgent. */
export const SEVERITIES = ['normal', 'info', 'advisory', 'caution', 'critical'] as const
export type Severity = (typeof SEVERITIES)[number]

/** Familiar colour names that map onto the severity scale (see INTENT_TONE). */
export const INTENTS = ['primary', 'secondary', 'success', 'warning', 'danger'] as const
export type Intent = (typeof INTENTS)[number]

/** Value of the `data-tone` attribute. `accent` is the brand colour, `neutral` is grey. */
export type Tone = Severity | 'accent' | 'neutral'

export const SEVERITY_LABEL: Record<Severity, string> = {
  normal: 'Normal',
  info: 'Info',
  advisory: 'Advisory',
  caution: 'Caution',
  critical: 'Critical',
}

const INTENT_TONE: Record<Intent, Tone> = {
  primary: 'accent',
  secondary: 'neutral',
  success: 'normal',
  warning: 'caution',
  danger: 'critical',
}

/**
 * Resolve the `severity` / `intent` props of a component to a tone.
 * `severity` wins when both are set. With neither, returns `fallback`.
 */
export function toneOf(severity?: Severity | null, intent?: Intent | null, fallback?: Tone): Tone
export function toneOf(severity: Severity | null | undefined, intent: Intent | null | undefined, fallback: null): Tone | null
export function toneOf(severity?: Severity | null, intent?: Intent | null, fallback: Tone | null = 'neutral'): Tone | null {
  if (severity) return severity
  if (intent) return INTENT_TONE[intent]
  return fallback
}

/** Sort comparator: most urgent first ("worst first"). */
export function bySeverityDesc(a: Severity, b: Severity): number {
  return SEVERITIES.indexOf(b) - SEVERITIES.indexOf(a)
}

/** Numeric rank, 0 (normal) to 4 (critical). */
export function severityRank(s: Severity): number {
  return SEVERITIES.indexOf(s)
}
