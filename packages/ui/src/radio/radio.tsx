'use client'

import { useContext, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { RadioGroupContext } from './radio-group.tsx'

/* `.radio input` in design/calmon-design.html: a ring that thickens to a dot when checked. */
const DOT =
  'm-0 size-[18px] flex-none cursor-pointer appearance-none rounded-full border border-border-strong bg-surface-raised ' +
  'shadow-[0_1px_2px_rgb(16_24_40/.05)] transition-[background-color,border-color] duration-(--duration-fast) ' +
  'checked:border-[5.5px] checked:border-accent ' +
  'group-aria-invalid/rg:border-critical group-aria-invalid/rg:shadow-[0_0_0_3px_color-mix(in_oklab,var(--critical),transparent_88%)] ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-sunken disabled:shadow-none'

export type RadioProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'value'> & {
  /** What this option submits and what the group's `value` becomes when it is chosen. */
  value: string
  /** The option label. Without one, pass `aria-label`. */
  children?: ReactNode
}

/**
 * One option of a RadioGroup. Renders a native radio inside its `<label>`.
 * `className` styles the label; all other props go to the `<input>`.
 */
export function Radio({ value, className, children, onChange, ...props }: RadioProps) {
  const group = useContext(RadioGroupContext)
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 text-ui has-disabled:cursor-not-allowed has-disabled:text-fg-subtle',
        className,
      )}
    >
      <input
        type="radio"
        value={value}
        className={DOT}
        {...props}
        {...(group ? { name: group.name, checked: group.value === value } : null)}
        onChange={(e) => {
          onChange?.(e)
          if (group && e.target.checked) group.select(value)
        }}
      />
      {children}
    </label>
  )
}
