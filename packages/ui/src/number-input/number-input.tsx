'use client'

import { useState, type ChangeEvent, type ComponentPropsWithRef, type FocusEvent, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { useFieldControl } from '../field/control.ts'
import { ChevronDownIcon, ChevronUpIcon } from '../icons/index.ts'
import { inputVariants } from '../input/input-variants.ts'

export type NumberInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'size' | 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> & {
  /** Controlled value. `null` is an empty field. */
  value?: number | null
  /** Initial value when uncontrolled. Default empty. */
  defaultValue?: number | null
  /** Called with the new number, or `null` when the field is cleared. Out-of-range numbers are never sent: they clamp on blur. */
  onValueChange?: (value: number | null) => void
  /** Hard lower bound. Typing below it clamps on blur; the stepper and arrows stop here. */
  min?: number
  /** Hard upper bound. Typing above it clamps on blur; the stepper and arrows stop here. */
  max?: number
  /** Arrow and stepper increment. Page Up and Page Down move by 10 steps. Default `1`. */
  step?: number
  /** Unit shown after the value, such as `sec` or `%`. Always show one when the number has a unit. */
  unit?: string
  /** Show the increment and decrement buttons. Keyboard stepping works either way. Default `true`. */
  steppers?: boolean
  /** Height: 30, 38 or 44px. Follows the page `density` when unset. */
  size?: 'sm' | 'md' | 'lg'
  /** Error styling and `aria-invalid`. Field sets this for you when it has an `error`. Default `false`. */
  invalid?: boolean
  /** Caution styling that does not block. Field sets this for you when it has a `warning`. Default `false`. */
  warning?: boolean
}

const decimals = (n: number) => String(n).split('.')[1]?.length ?? 0

const parse = (text: string) => (/^-?\.?$/.test(text) ? NaN : Number(text))

const STEP_BUTTON =
  'grid w-7 flex-1 cursor-pointer place-items-center bg-surface-raised p-0 text-fg-muted ' +
  'enabled:hover:bg-surface-sunken enabled:hover:text-fg disabled:cursor-not-allowed disabled:text-fg-subtle'

/** Numeric entry: a `spinbutton`. `className` styles the outer wrapper; other props go to the `<input>`. */
export function NumberInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  steppers = true,
  size,
  invalid,
  warning,
  disabled,
  readOnly,
  className,
  id,
  'aria-describedby': describedBy,
  onChange,
  onBlur,
  onKeyDown,
  ...props
}: NumberInputProps) {
  const attrs = useFieldControl({ id, describedBy, invalid, warning })

  const [num, setNum] = useControllable<number | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState<string | null>(null)
  const locked = disabled || readOnly
  // The number on screen: the text being typed when it reads as a number, else the last committed value.
  const typed = draft === null ? NaN : parse(draft)
  const shown = typed === typed ? typed : num

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const commit = (n: number | null) => {
    if (n !== num) setNum(n)
  }
  const settle = () => {
    if (draft === null) return
    const n = parse(draft)
    if (!draft) commit(null)
    else if (n === n) commit(clamp(n))
    setDraft(null)
  }
  const jump = (n: number) => {
    commit(n)
    setDraft(null)
  }
  const bump = (dir: number, times = 1) => {
    const base = shown ?? 0
    jump(Number(clamp(base + dir * step * times).toFixed(Math.max(decimals(step), decimals(base)))))
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only a point separates decimals. A comma is not guessed at: "1,000" could mean one or a thousand.
    const text = e.target.value
    if (!/^-?\d*\.?\d*$/.test(text) || (text.startsWith('-') && min !== undefined && min >= 0)) return
    setDraft(text)
    const n = parse(text)
    if (text === '') commit(null)
    else if (!Number.isNaN(n) && n === clamp(n)) commit(n)
    onChange?.(e)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    settle()
    onBlur?.(e)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || locked) return
    const k = e.key
    const dir = k === 'ArrowUp' || k === 'PageUp' ? 1 : k === 'ArrowDown' || k === 'PageDown' ? -1 : 0
    if (dir) bump(dir, e.shiftKey || k[0] === 'P' ? 10 : 1)
    else if (k === 'Home' && min !== undefined) jump(min)
    else if (k === 'End' && max !== undefined) jump(max)
    else {
      if (k === 'Enter') settle()
      return
    }
    e.preventDefault()
  }

  return (
    <div className={cn('flex w-full items-stretch rounded-control', className)}>
      <input
        type="text"
        inputMode="decimal"
        role="spinbutton"
        autoComplete="off"
        value={draft ?? (num === null ? '' : String(num))}
        aria-valuenow={num ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={unit && num !== null ? `${num} ${unit}` : undefined}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          inputVariants({ size: size ?? 'auto' }),
          'relative z-1 rounded-r-none font-mono tabular-nums',
          size === undefined ? 'text-ui-sm [[data-density=station]_&]:text-(length:--control-fs)' : size === 'md' && 'text-ui-sm',
        )}
        {...props}
        {...attrs}
      />
      {unit ? (
        <span
          className={cn(
            'flex shrink-0 items-center border border-l-0 border-border-strong bg-surface-sunken px-[11px] text-ui-sm text-fg-muted',
            !steppers && 'rounded-r-control',
          )}
        >
          {unit}
        </span>
      ) : null}
      {steppers ? (
        <span className="flex shrink-0 flex-col overflow-hidden rounded-r-control border border-l-0 border-border-strong">
          {[1, -1].map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              aria-label={dir > 0 ? 'Increase' : 'Decrease'}
              disabled={locked || (shown !== null && (dir > 0 ? shown >= (max ?? Infinity) : shown <= (min ?? -Infinity)))}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => bump(dir)}
              className={cn(STEP_BUTTON, dir < 0 && 'border-t border-border')}
            >
              {dir > 0 ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />}
            </button>
          ))}
        </span>
      ) : null}
    </div>
  )
}
