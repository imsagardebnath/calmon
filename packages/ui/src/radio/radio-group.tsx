'use client'

import { createContext, useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  select: (value: string) => void
}
/** Shared by RadioGroup and its Radio options. `null` for a Radio used on its own. */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export type RadioGroupProps = Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'onChange' | 'role'> & {
  /** Visible legend naming the group, such as "Deploy strategy". Without one, pass `aria-label`. */
  label?: string
  /** Controlled selected value. */
  value?: string
  /** Initially selected value when uncontrolled. Preselect the safest option. */
  defaultValue?: string
  /** Called with the new value when the selection changes. */
  onValueChange?: (value: string) => void
  /** Layout of the options. Default `vertical`. */
  orientation?: 'vertical' | 'horizontal'
  /** Shared `name` of the radios, for form submission. Generated when unset. */
  name?: string
  /** Error styling and `aria-invalid` on the group. Default `false`. */
  invalid?: boolean
  /** Disables every option (native fieldset behaviour). Default `false`. */
  disabled?: boolean
  /** The Radio options. */
  children?: ReactNode
}

/**
 * Pick exactly one from two to five visible options. The options are native radios sharing one
 * `name`, so Arrow keys move the selection and Tab leaves the group.
 */
export function RadioGroup({
  label,
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  name,
  invalid,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const auto = useId()
  const [value, select] = useControllable<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (v) => {
      if (v !== undefined) onValueChange?.(v)
    },
  })
  return (
    <fieldset
      role="radiogroup"
      aria-invalid={invalid || undefined}
      data-orientation={orientation}
      className={cn('group/rg m-0 min-w-0 border-0 p-0', className)}
      {...props}
    >
      {label ? <legend className="mb-2 p-0 text-ui-sm font-[550] text-fg">{label}</legend> : null}
      <RadioGroupContext value={{ name: name ?? auto, value, select }}>
        <div className={cn('flex gap-2.5', orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-5' : 'flex-col')}>
          {children}
        </div>
      </RadioGroupContext>
    </fieldset>
  )
}
