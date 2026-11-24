'use client'

import type { ChangeEvent, ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { useFieldControl } from '../field/control.ts'

/* `.switch input` in design/calmon-design.html: a pill track on the native input, with the thumb as its ::after. */
const TRACK =
  'relative m-0 h-5 w-[34px] flex-none cursor-pointer appearance-none rounded-pill bg-border-strong ' +
  'transition-colors duration-(--duration-base) ease-calmon checked:bg-accent ' +
  "after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:content-[''] " +
  'after:shadow-[0_1px_2px_rgb(0_0_0/.2),0_0_0_.5px_rgb(0_0_0/.06)] ' +
  'after:transition-transform after:duration-(--duration-base) after:ease-calmon checked:after:translate-x-3.5 ' +
  'disabled:cursor-not-allowed disabled:opacity-45'

export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'role'> & {
  /** Controlled state. Default `false`. */
  checked?: boolean
  /** Initial state when uncontrolled. Default `false`. */
  defaultChecked?: boolean
  /** Fires immediately when the person flips the switch, with the new state. The change takes effect at once: there is no save step. */
  onCheckedChange?: (checked: boolean) => void
  /** The label, shown after the switch. Without one, pass `aria-label`. */
  children?: ReactNode
}

/**
 * Turns a setting on or off immediately. A native checkbox with `role="switch"`, so Space toggles it.
 * `className` styles the label; all other props go to the `<input>`.
 */
export function Switch({
  onCheckedChange,
  className,
  children,
  id,
  'aria-describedby': describedBy,
  onChange,
  ...props
}: SwitchProps) {
  const attrs = useFieldControl({ id, describedBy })
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onCheckedChange?.(e.target.checked)
  }
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2.5 has-disabled:cursor-not-allowed has-disabled:text-fg-subtle', className)}>
      <input type="checkbox" role="switch" className={TRACK} onChange={handleChange} {...props} {...attrs} />
      {children}
    </label>
  )
}
