'use client'

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Badge } from '../badge/index.ts'
import { Button } from '../button/index.ts'
import { ChevronDownIcon, SeverityIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, severityRank, type Severity } from '../lib/tone.ts'
import { useControllable } from '../lib/use-controllable.ts'

/** One signal that moved the score, such as "Latency p95". */
export type HealthFactor = {
  /** Name of the signal. */
  label: string
  /** The most points this factor can take off the score. Shown as `w35` and used to size the bar. */
  weight: number
  /** Points it took off, as a negative number (`-21`). `0` means it cost nothing. */
  impact: number
  /** How bad this factor is. Shown as an icon and a word, and sets the colour of its bar. */
  severity: Severity
}

/**
 * Score to severity mapping. Each value is the score a band starts below: with the defaults, 85 and
 * above is normal, 70 to 84 is advisory, 50 to 69 is caution and under 50 is critical. Info is never
 * used for a score.
 */
export type HealthBands = {
  /** The score advisory starts below. Default `85`. */
  advisory?: number
  /** The score caution starts below. Default `70`. */
  caution?: number
  /** The score critical starts below. Default `50`. */
  critical?: number
}

/** The default bands, shared by every entity type so the same score always reads the same. */
export const DEFAULT_HEALTH_BANDS = { advisory: 85, caution: 70, critical: 50 } as const

/** The severity a score falls in. Bands you leave out keep their default. A lower score is never less severe than a higher one. */
export function scoreSeverity(value: number, bands?: HealthBands): Severity {
  const b = { ...DEFAULT_HEALTH_BANDS, ...bands }
  if (value < b.critical) return 'critical'
  if (value < b.caution) return 'caution'
  if (value < b.advisory) return 'advisory'
  return 'normal'
}

const SIZES = {
  sm: { box: 'size-24', num: 'text-numeral-md', gap: 'gap-x-[18px] gap-y-3' },
  md: { box: 'size-[108px]', num: 'text-numeral-md', gap: 'gap-x-8 gap-y-4' },
  lg: { box: 'size-[140px]', num: 'text-numeral-lg', gap: 'gap-x-8 gap-y-4' },
}

const R = 56
const C = 2 * Math.PI * R
const sign = (n: number) => (n === 0 ? '0' : `${n < 0 ? '−' : '+'}${Math.abs(n)}`)

export type HealthScoreProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** The composite score from 0 to 100. Values outside the range are clamped. */
  value: number
  /** What moved the score. Listed biggest cost first, with the biggest named next to the score. Never leave it out. */
  factors: HealthFactor[]
  /** Score to severity mapping: each value is the score a band starts below. Default `{ advisory: 85, caution: 70, critical: 50 }`. */
  bands?: HealthBands
  /** Name of the thing being scored. Shown above the ring and used as its accessible name. Default `Health score`. */
  label?: string
  /** Small text on the right of the header, such as "Updated 14:32 UTC". */
  meta?: ReactNode
  /** Ring size: 96, 108 or 140px. Default `lg`. */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the factor breakdown is shown. Pass it with `onOpenChange` to control it. */
  open?: boolean
  /** Whether the breakdown starts open when uncontrolled. Default `true`. */
  defaultOpen?: boolean
  /** Called when the breakdown is opened or closed. */
  onOpenChange?: (open: boolean) => void
}

/**
 * One 0 to 100 number from many signals: a ring, its band as a word, the biggest factor, and a
 * breakdown of every factor that you can collapse. The ring is a meter with a text equivalent
 * ("Health score 62 of 100, caution"), so the score never depends on the ring or its colour.
 */
export function HealthScore({
  value,
  factors,
  bands,
  label = 'Health score',
  meta,
  size = 'lg',
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  className,
  ...props
}: HealthScoreProps) {
  const id = useId()
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const v = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  const shown = Math.round(v)
  const band = scoreSeverity(shown, bands)
  const bandLabel = SEVERITY_LABEL[band]
  const s = SIZES[size]
  const sorted = [...factors].sort((a, b) => a.impact - b.impact || severityRank(b.severity) - severityRank(a.severity))
  const top = sorted[0]

  return (
    <div data-tone={band} className={cn('min-w-0', className)} {...props}>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-ui font-semibold tracking-[-0.018em]">{label}</span>
        <Badge severity={band}>{bandLabel}</Badge>
        {meta && <span className="ml-auto text-ui-sm text-fg-muted">{meta}</span>}
      </div>
      {/* The factors sit beside the ring, and drop below it when the space is under about 20rem. */}
      <div className={cn('flex flex-wrap items-center', s.gap)}>
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
          aria-valuetext={`${shown} of 100, ${bandLabel.toLowerCase()}`}
          className={cn('relative shrink-0', s.box)}
        >
          <svg viewBox="0 0 132 132" aria-hidden="true" focusable="false" className="size-full -rotate-90">
            <circle cx={66} cy={66} r={R} className="fill-none stroke-surface-sunken stroke-8" />
            {shown > 0 && (
              <circle
                cx={66}
                cy={66}
                r={R}
                strokeLinecap="round"
                strokeDasharray={`${(C * v) / 100} ${C}`}
                className="fill-none stroke-tone stroke-8"
              />
            )}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <span className={cn('num leading-none', s.num)}>{shown}</span>
              <small className="mt-1 block text-xs text-fg-subtle">of 100</small>
            </div>
          </div>
        </div>
        <div className="flex min-w-40 flex-1 flex-col gap-3">
          {top && top.impact < 0 && (
            <p className="m-0 text-ui-sm text-fg-muted">
              Biggest factor: <span className="font-[550] text-fg">{top.label}</span>{' '}
              <span className="num text-xs">{sign(top.impact)}</span>
            </p>
          )}
          {top && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => setOpen(!open)}
              iconEnd={<ChevronDownIcon className={open ? 'rotate-180' : undefined} />}
            >
              Factors ({factors.length})
            </Button>
          )}
          {top && (
            <div id={id} hidden={!open}>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {sorted.map((f, i) => (
                  <li
                    key={`${f.label}-${i}`}
                    data-tone={f.severity}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 text-ui-sm"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <SeverityIcon severity={f.severity} width={14} height={14} className="text-tone-fg" />
                      <span className="sr-only">{SEVERITY_LABEL[f.severity]}: </span>
                      {f.label}
                      <span className="font-mono text-[11px] text-fg-subtle">
                        <span aria-hidden="true">w{f.weight}</span>
                        <span className="sr-only">, weight {f.weight}</span>
                      </span>
                    </span>
                    <span className={cn('num text-xs', f.impact < -5 ? 'text-tone-fg' : 'text-fg-muted')}>
                      {sign(f.impact)}
                      <span className="sr-only"> points</span>
                    </span>
                    <span aria-hidden="true" className="col-span-full h-1 overflow-hidden rounded-pill bg-surface-sunken">
                      <span
                        className="block h-full rounded-[inherit] bg-tone"
                        style={{ width: `${f.weight > 0 ? Math.min(100, Math.max(0, 100 + (f.impact * 100) / f.weight)) : 100}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 mb-0 text-xs text-fg-subtle">Score starts at 100. Each factor subtracts up to its weight.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
