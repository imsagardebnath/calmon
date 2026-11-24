'use client'

import { useEffect, useId, useImperativeHandle, useRef, type ReactNode } from 'react'
import { Field, useFieldContext } from '../field/index.ts'
import { SeverityIcon } from '../icons/index.ts'
import { inputBase } from '../input/input-variants.ts'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { NumberInput, type NumberInputProps } from '../number-input/index.ts'

/** Where the value sits: `ok` is the usual range, `soft` is past a soft limit (allowed with a reason), `hard` is past a hard limit (blocked). */
export type LimitState = 'ok' | 'soft' | 'hard'

export type LimitedNumberInputProps = Omit<
  NumberInputProps,
  'value' | 'defaultValue' | 'onValueChange' | 'min' | 'max' | 'invalid' | 'warning' | 'className'
> & {
  /** Visible label. Leave it out inside a `Field`, which supplies its own. Without either, pass `aria-label`. */
  label?: string
  /** Soft lower limit. Below it the value is allowed, but the person must say why. Default none. */
  softMin?: number
  /** Soft upper limit. Above it the value is allowed, but the person must say why. Default none. */
  softMax?: number
  /** Hard lower limit. Below it the value is blocked: the form cannot be submitted. Default none. */
  hardMin?: number
  /** Hard upper limit. Above it the value is blocked: the form cannot be submitted. Default none. */
  hardMax?: number
  /** Controlled value. `null` is an empty field. What was typed is never changed, even past a hard limit. */
  value?: number | null
  /** Initial value when uncontrolled. Default empty. */
  defaultValue?: number | null
  /** Called with every number typed or stepped, past a limit or not, and `null` when cleared. Use `onStateChange` to tell whether it is allowed. */
  onValueChange?: (value: number | null) => void
  /** Called with `ok`, `soft` or `hard` on mount and whenever the value crosses a limit. */
  onStateChange?: (state: LimitState) => void
  /** Past a soft limit, shows a required reason field and blocks submit until it is filled. Default `true`. */
  requireJustification?: boolean
  /** Controlled justification text. Use with `onJustificationChange`. */
  justification?: string
  /** Initial justification when uncontrolled. Default empty. */
  defaultJustification?: string
  /** Called with the reason as it is typed. Record it, for example on the entity's timeline. */
  onJustificationChange?: (justification: string) => void
  /** Label of the reason field. Default `Justification`. */
  justificationLabel?: string
  /** Placeholder of the reason field. Default `Why is this value safe this time?`. */
  justificationPlaceholder?: string
  /** `name` of the reason field, so a native form submits it. Default none. */
  justificationName?: string
  /** Text shown while the value is in range. Default: the usual range, such as `Usual range up to 25%.`. `false` hides it. */
  hint?: ReactNode | false
  /** Shows the scale of soft and hard zones under the field. It needs an upper limit (`softMax` or `hardMax`). Default `true`. */
  showScale?: boolean
  /** Styles the outer wrapper. Set a width here. All other props go to the `<input>`. */
  className?: string
}

interface Limits {
  softMin?: number
  softMax?: number
  hardMin?: number
  hardMax?: number
}

/** Which zone the value is in, and which side of the range it left. Hard limits win over soft ones. */
function check(v: number | null, l: Limits): { state: LimitState; high: boolean } {
  if (v === null || Number.isNaN(v)) return { state: 'ok', high: true }
  if (l.hardMax !== undefined && v > l.hardMax) return { state: 'hard', high: true }
  if (l.hardMin !== undefined && v < l.hardMin) return { state: 'hard', high: false }
  if (l.softMax !== undefined && v > l.softMax) return { state: 'soft', high: true }
  if (l.softMin !== undefined && v < l.softMin) return { state: 'soft', high: false }
  return { state: 'ok', high: true }
}

const LABEL = 'text-ui-sm font-[550] text-fg'
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** The zone scale under the field: normal and caution zones, ticks at the soft limits, and a knob at the value. Decorative: hidden from screen readers. */
function LimitScale({ value, softMin, softMax, hardMin, hardMax }: Limits & { value: number | null }) {
  const lo = hardMin ?? Math.min(0, softMin ?? 0)
  const hi = hardMax ?? (softMax === undefined ? lo : softMax + (softMax - lo) / 2)
  if (hi <= lo) return null
  const at = (n: number) => clamp01((n - lo) / (hi - lo)) * 100
  const a = softMin === undefined ? 0 : at(softMin)
  const b = softMax === undefined ? 100 : at(softMax)
  const tick = (left: number) => (
    <span className="absolute -top-1 -ml-px h-3 w-0.5 rounded-[1px] bg-fg" style={{ left: `${left}%` }} />
  )
  const mark = (left: number, text: string) => (
    <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${left}%` }}>
      {text}
    </span>
  )
  return (
    <div aria-hidden="true" className="flex flex-col gap-1.5">
      <div
        className="relative h-1 rounded-pill"
        style={{
          background: `linear-gradient(90deg,var(--caution) 0 ${a}%,var(--normal) ${a}% ${b}%,var(--caution) ${b}% 100%)`,
        }}
      >
        {a > 0 ? tick(a) : null}
        {b < 100 ? tick(b) : null}
        {value === null ? null : (
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_var(--border-strong),var(--shadow-2)] transition-[left] duration-(--duration-base) ease-calmon"
            style={{ left: `${at(value)}%` }}
          />
        )}
      </div>
      <div className="relative h-3.5 font-mono text-[11px] text-fg-subtle">
        <span className="absolute left-0">{hardMin === undefined ? lo : `hard ${hardMin}`}</span>
        {a > 0 && softMin !== undefined ? mark(a, `soft ${softMin}`) : null}
        {b < 100 && softMax !== undefined ? mark(b, `soft ${softMax}`) : null}
        {hardMax === undefined ? null : <span className="absolute right-0">{`hard ${hardMax}`}</span>}
      </div>
    </div>
  )
}

/**
 * Number entry with two kinds of limit. Past a soft limit the value is allowed, but the field turns caution
 * and asks for a reason. Past a hard limit it is blocked: the field turns critical, says the limit, and the
 * form cannot be submitted. What was typed is never silently changed. Works on its own (with `label`) or
 * inside a `Field`. `className` styles the outer wrapper; all other props go to the `<input>`.
 */
export function LimitedNumberInput({ label, ...props }: LimitedNumberInputProps) {
  const field = useFieldContext()
  // On its own, a `label` gets the same wrapper, label and required marker a Field draws.
  if (!label || field !== null) return <LimitedBody {...props} />
  return (
    <Field label={label} required={props.required} id={props.id} className={props.className}>
      <LimitedBody {...props} className={undefined} />
    </Field>
  )
}

function LimitedBody({
  softMin,
  softMax,
  hardMin,
  hardMax,
  value: valueProp,
  defaultValue,
  onValueChange,
  onStateChange,
  requireJustification = true,
  justification: justificationProp,
  defaultJustification,
  onJustificationChange,
  justificationLabel = 'Justification',
  justificationPlaceholder = 'Why is this value safe this time?',
  justificationName,
  hint,
  showScale = true,
  unit,
  className,
  id,
  required,
  disabled,
  readOnly,
  'aria-describedby': describedBy,
  ref,
  ...props
}: Omit<LimitedNumberInputProps, 'label'>) {
  const field = useFieldContext()
  const auto = useId()
  const controlId = field?.id ?? id ?? auto
  const messageId = `${controlId}-limit`
  const whyId = `${controlId}-why`

  const [value, setValue] = useControllable<number | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })
  const [why, setWhy] = useControllable({
    value: justificationProp,
    defaultValue: defaultJustification ?? '',
    onChange: onJustificationChange,
  })

  const limits = { softMin, softMax, hardMin, hardMax }
  const { state, high } = check(value, limits)
  const hard = state === 'hard'
  const soft = state === 'soft'
  const askWhy = soft && requireJustification

  const withUnit = (n: number) => `${n}${unit ? (unit === '%' ? '%' : ` ${unit}`) : ''}`
  const usual =
    softMin !== undefined && softMax !== undefined
      ? `${softMin}–${withUnit(softMax)}`
      : softMax !== undefined
        ? `up to ${withUnit(softMax)}`
        : softMin !== undefined
          ? `from ${withUnit(softMin)}`
          : null
  const text = hard
    ? `${high ? 'Maximum' : 'Minimum'} allowed is ${withUnit((high ? hardMax : hardMin) ?? 0)}.`
    : soft
      ? `${high ? 'Higher' : 'Lower'} than usual${usual ? ` (usual range ${usual})` : ''}.` +
        (requireJustification ? ' Add a justification to continue.' : '')
      : hint === undefined
        ? usual && `Usual range ${usual}.`
        : hint

  // A custom validity message is what makes a native form refuse to submit.
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current as HTMLInputElement)
  const blocked = hard && typeof text === 'string' ? text : ''
  useEffect(() => {
    input.current?.setCustomValidity(blocked)
  }, [blocked])

  // A disabled or read-only field is not being edited, so its reason must not hold up a submit either.
  const locked = Boolean(disabled || readOnly)
  const reason = useRef<HTMLTextAreaElement>(null)
  const missing = why.trim() === ''
  useEffect(() => {
    reason.current?.setCustomValidity(missing && !locked ? 'Add a justification to continue.' : '')
  }, [askWhy, missing, locked])

  const notify = useRef(onStateChange)
  notify.current = onStateChange
  useEffect(() => {
    notify.current?.(state)
  }, [state])

  return (
    <div
      data-state={state}
      data-tone={hard ? 'critical' : soft ? 'caution' : 'neutral'}
      className={cn('flex min-w-0 flex-col gap-1.5', className)}
    >
      <NumberInput
        ref={input}
        id={controlId}
        value={value}
        onValueChange={setValue}
        unit={unit}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        invalid={hard || undefined}
        warning={soft || undefined}
        aria-describedby={[messageId, describedBy].filter(Boolean).join(' ')}
        aria-valuemin={hardMin}
        aria-valuemax={hardMax}
        {...props}
      />
      {showScale ? <LimitScale value={value} {...limits} /> : null}
      <div id={messageId} aria-live="polite" aria-atomic="true">
        {text ? (
          <p
            className={cn('flex items-start gap-1.5 text-ui-sm', hard || soft ? 'text-tone-fg' : 'text-fg-muted')}
          >
            {hard || soft ? <SeverityIcon severity={hard ? 'critical' : 'caution'} className="mt-px" /> : null}
            <span>{text}</span>
          </p>
        ) : null}
      </div>
      {askWhy ? (
        <div className="mt-0.5 flex flex-col gap-[7px]">
          <label htmlFor={whyId} className={LABEL}>
            {justificationLabel}
            {locked ? null : (
              <span aria-hidden="true" className="ml-0.5 text-critical-fg">
                *
              </span>
            )}
          </label>
          <textarea
            ref={reason}
            id={whyId}
            name={justificationName}
            required={!locked}
            disabled={disabled}
            readOnly={readOnly}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder={justificationPlaceholder}
            className={cn(inputBase, 'min-h-16 resize-y px-3 py-2.5 text-ui leading-normal')}
          />
        </div>
      ) : null}
    </div>
  )
}
