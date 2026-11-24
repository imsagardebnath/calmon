'use client'

import { createContext, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'

interface CheckboxGroupContextValue {
  value: string[]
  toggle: (value: string, checked: boolean) => void
}
/** Shared by CheckboxGroup and the Checkbox boxes inside it. `null` for a Checkbox used on its own. */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

export type CheckboxGroupProps = Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'onChange'> & {
  /** Visible legend naming the group, such as "Notify me about". */
  label: string
  /** Controlled list of the checked boxes' `value`s. */
  value?: string[]
  /** Initial checked values when uncontrolled. Default none. */
  defaultValue?: string[]
  /** Called with the full list of checked values on every change. */
  onValueChange?: (value: string[]) => void
  /** Disables every box in the group (native fieldset behaviour). Default `false`. */
  disabled?: boolean
  /** Checkboxes that carry a `value`. */
  children?: ReactNode
}

/** Related checkboxes in a `<fieldset>` with a legend, so screen readers announce what they belong to. */
export function CheckboxGroup({
  label,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
  ...props
}: CheckboxGroupProps) {
  const [value, setValue] = useControllable<string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  })
  const toggle = (v: string, on: boolean) => {
    setValue(on ? [...value.filter((x) => x !== v), v] : value.filter((x) => x !== v))
  }
  return (
    <fieldset disabled={disabled} className={cn('m-0 min-w-0 border-0 p-0', className)} {...props}>
      <legend className="mb-2 p-0 text-ui-sm font-[550] text-fg">{label}</legend>
      <CheckboxGroupContext value={{ value, toggle }}>
        <div className="flex flex-col gap-2.5">{children}</div>
      </CheckboxGroupContext>
    </fieldset>
  )
}
