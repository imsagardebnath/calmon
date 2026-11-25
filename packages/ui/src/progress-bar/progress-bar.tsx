'use client'

import { useId, type ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, toneOf, type Intent, type Severity } from '../lib/tone.ts'

export type ProgressBarProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Progress from 0 to 100. Omit it for an indeterminate bar (the length of the work is not known). */
  value?: number
  /**
   * Levels at which the bar turns `caution` and `critical`, for a level against capacity such as disk use.
   * The severity is also read out by screen readers.
   */
  thresholds?: { caution?: number; critical?: number }
  /** Bar colour when no threshold is reached. Wins over `intent`. Default is the accent colour. */
  severity?: Severity
  /** Familiar colour names: `primary`, `secondary`, `success`, `warning`, `danger`. Same as the matching severity. */
  intent?: Intent
  /** Visible label above the bar. It is also the accessible name; without it, pass `aria-label`. */
  label?: string
  /** Show the number next to the label, e.g. `87%`. Default true when `label` is set. */
  showValue?: boolean
}

/**
 * Shows known progress, or a level against capacity with severity. Show the number next to the bar
 * and don't rely on its colour alone to signal a problem. `aria-label`, `aria-labelledby`, `aria-describedby`
 * and `aria-valuetext` go on the progress bar itself; every other prop goes on the wrapper.
 */
export function ProgressBar({
  value,
  thresholds,
  severity,
  intent,
  label,
  showValue = label !== undefined,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-valuetext': ariaValueText,
  className,
  ...props
}: ProgressBarProps) {
  const id = useId()
  const pct = value === undefined ? undefined : Math.min(100, Math.max(0, value))
  const base = toneOf(severity, intent, 'accent')
  const tone =
    pct === undefined || !thresholds
      ? base
      : thresholds.critical !== undefined && pct >= thresholds.critical
        ? 'critical'
        : thresholds.caution !== undefined && pct >= thresholds.caution
          ? 'caution'
          : base
  const text = pct === undefined ? undefined : `${Math.round(pct)}%` + (tone !== base ? `, ${SEVERITY_LABEL[tone as Severity].toLowerCase()}` : '')
  // The visible `label` names the bar; otherwise a consumer's `aria-labelledby`, then `aria-label`.
  const labelledBy = label === undefined ? ariaLabelledBy : id
  return (
    <div data-tone={tone} className={cn('w-full', className)} {...props}>
      {label !== undefined || showValue ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-ui-sm">
          <span id={id}>{label}</span>
          {showValue && pct !== undefined ? <span className="num text-xs">{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={ariaValueText ?? text}
        aria-label={labelledBy === undefined ? (ariaLabel ?? 'Progress') : undefined}
        aria-labelledby={labelledBy}
        aria-describedby={ariaDescribedBy}
        className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunken"
      >
        <span
          className={cn('block h-full rounded-[inherit] bg-tone', pct === undefined && 'w-[30%] animate-pikore-indet')}
          style={pct === undefined ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
