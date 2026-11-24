'use client'

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { useFieldControl } from '../field/control.ts'
import { inputVariants } from './input-variants.ts'

export type InputProps = Omit<ComponentPropsWithRef<'input'>, 'size' | 'value'> & {
  /** Controlled value. Pair it with `onChange`. Leave it out for an uncontrolled field with `defaultValue`. */
  value?: string
  /** Height: 30, 38 or 44px. Follows the page `density` when unset. */
  size?: 'sm' | 'md' | 'lg'
  /** Error styling and `aria-invalid`. Field sets this for you when it has an `error`. Default `false`. */
  invalid?: boolean
  /** Caution styling that does not block. Field sets this for you when it has a `warning`. Default `false`. */
  warning?: boolean
  /** Blocks input and greys the field out. Explain why in the hint. Default `false`. */
  disabled?: boolean
  /** Icon inside the start of the field. Decorative: hidden from screen readers. */
  iconStart?: ReactNode
}

/**
 * Single-line text entry. Wrap it in Field for a label, hint and error.
 * `className` styles the `<input>` itself; all other props go to it too.
 */
export function Input({
  size,
  invalid,
  warning,
  iconStart,
  className,
  id,
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
  const attrs = useFieldControl({ id, describedBy, invalid, warning })
  const input = (
    <input className={cn(inputVariants({ size: size ?? 'auto' }), iconStart && 'pl-[34px]', className)} {...props} {...attrs} />
  )
  if (!iconStart) return input
  return (
    <span className="relative block w-full">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[11px] flex items-center text-fg-subtle">
        {iconStart}
      </span>
      {input}
    </span>
  )
}
