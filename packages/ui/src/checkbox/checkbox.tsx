'use client'

import {
  useContext,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react'
import { cn } from '../lib/cn.ts'
import { useFieldControl } from '../field/control.ts'
import { CheckboxGroupContext } from './checkbox-group.tsx'

/*
 * The box and its check mark are drawn on the native <input> with appearance-none, as in the design:
 * `.check input` in design/pikore-design.html. The tick is the ::after of a checked box, the dash of an indeterminate one.
 */
const BOX =
  'm-0 grid size-[18px] flex-none cursor-pointer appearance-none place-items-center rounded-[5px] border border-border-strong ' +
  'bg-surface-raised shadow-[0_1px_2px_rgb(16_24_40/.05)] transition-[background-color,border-color] duration-(--duration-fast) ' +
  'checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent ' +
  "checked:after:h-[5px] checked:after:w-[9px] checked:after:border-2 checked:after:border-t-0 checked:after:border-r-0 checked:after:border-accent-on checked:after:content-[''] checked:after:[transform:rotate(-45deg)_translate(1px,-1px)] " +
  "indeterminate:after:h-0.5 indeterminate:after:w-2 indeterminate:after:rounded-sm indeterminate:after:bg-accent-on indeterminate:after:content-[''] " +
  'aria-invalid:border-critical aria-invalid:shadow-[0_0_0_3px_color-mix(in_oklab,var(--critical),transparent_88%)] ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-sunken disabled:shadow-none ' +
  'disabled:checked:border-border-strong disabled:checked:bg-border-strong'

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'checked' | 'defaultChecked'> & {
  /** Controlled state. `"indeterminate"` shows a dash for "some selected"; the next click makes it checked. Default `false`. */
  checked?: boolean | 'indeterminate'
  /** Initial state when uncontrolled. Default `false`. */
  defaultChecked?: boolean
  /** Called with the new checked state whenever the person toggles the box. */
  onCheckedChange?: (checked: boolean) => void
  /** Error styling and `aria-invalid`. Field sets this for you when it has an `error`. Default `false`. */
  invalid?: boolean
  /** Greys the box out and blocks changes. Default `false`. */
  disabled?: boolean
  /** The label. Phrase it positively: "Send alerts", not "Don't send alerts". Without one, pass `aria-label`. */
  children?: ReactNode
}

/**
 * An independent yes-or-no choice, or one box in a CheckboxGroup. Renders a native checkbox
 * inside its `<label>`. `className` styles the label; all other props go to the `<input>`.
 */
export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  invalid,
  value,
  disabled,
  className,
  children,
  id,
  'aria-describedby': describedBy,
  ref,
  onChange,
  ...props
}: CheckboxProps) {
  const attrs = useFieldControl({ id, describedBy, invalid })
  const group = useContext(CheckboxGroupContext)
  const grouped = group !== null && value !== undefined
  const indeterminate = !grouped && checked === 'indeterminate'
  const state = grouped ? group.value.includes(String(value)) : checked === 'indeterminate' ? false : checked

  const inner = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inner.current as HTMLInputElement)
  // `indeterminate` is a DOM property with no attribute. Set it after every render: a click clears it natively.
  useLayoutEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    if (grouped) group.toggle(String(value), e.target.checked)
    onCheckedChange?.(e.target.checked)
    // The click cleared the dash. Put it back now; if the parent changes `checked`, the next render updates it.
    e.target.indeterminate = indeterminate
  }

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 text-ui has-disabled:cursor-not-allowed has-disabled:text-fg-subtle',
        className,
      )}
    >
      <input
        ref={inner}
        type="checkbox"
        value={value}
        checked={state}
        defaultChecked={state === undefined ? defaultChecked : undefined}
        disabled={disabled}
        onChange={handleChange}
        className={BOX}
        {...props}
        {...attrs}
      />
      {children}
    </label>
  )
}
