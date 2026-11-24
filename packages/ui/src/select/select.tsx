'use client'

import { useState, type ChangeEvent, type ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'
import { useFieldControl } from '../field/control.ts'
import { ChevronDownIcon } from '../icons/index.ts'
import { inputVariants } from '../input/input-variants.ts'

export interface SelectOption {
  /** Text shown for the choice. */
  label: string
  /** Value submitted and passed to `onChange`. */
  value: string
  /** Shows the choice greyed out and unselectable. Default `false`. */
  disabled?: boolean
}

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'size' | 'children' | 'multiple'> & {
  /** The choices, in the order shown. Order by frequency or alphabetically. */
  options: SelectOption[]
  /** Shown while nothing is chosen, as a greyed first row that cannot be picked. Use it with no `defaultValue`. */
  placeholder?: string
  /** Greys the select out and blocks changes. Explain why in the hint. Default `false`. */
  disabled?: boolean
  /** Height: 30, 38 or 44px. Follows the page `density` when unset. */
  size?: 'sm' | 'md' | 'lg'
  /** Error styling and `aria-invalid`. Field sets this for you when it has an `error`. Default `false`. */
  invalid?: boolean
  /** Caution styling that does not block. Field sets this for you when it has a `warning`. Default `false`. */
  warning?: boolean
}

/**
 * Choose one option from a short list. Renders a native `<select>`, so keyboard and
 * screen-reader support is the platform's. `className` styles the `<select>`; all other props go to it too.
 */
export function Select({
  options,
  placeholder,
  size,
  invalid,
  warning,
  className,
  id,
  'aria-describedby': describedBy,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectProps) {
  const attrs = useFieldControl({ id, describedBy, invalid, warning })
  const [typed, setTyped] = useState(String(defaultValue ?? ''))
  const empty = placeholder !== undefined && (value !== undefined ? String(value) : typed) === ''

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTyped(e.target.value)
    onChange?.(e)
  }

  return (
    <span className="relative block w-full">
      <select
        value={value}
        defaultValue={value === undefined ? (defaultValue ?? (placeholder !== undefined ? '' : undefined)) : undefined}
        onChange={handleChange}
        className={cn(
          inputVariants({ size: size ?? 'auto' }),
          'appearance-none pr-[34px] *:text-fg',
          empty && 'text-fg-subtle',
          className,
        )}
        {...props}
        {...attrs}
      >
        {placeholder !== undefined ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-[11px] -translate-y-1/2 text-fg-subtle" />
    </span>
  )
}
