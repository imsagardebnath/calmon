'use client'

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { SeverityIcon } from '../icons/index.ts'
import { FieldContext } from './control.ts'

export type FieldProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Visible label. Always shown: a placeholder is not a label. */
  label: string
  /** Helper text below the control. Use it to show the expected format before someone gets it wrong. */
  hint?: ReactNode
  /** Caution text, in the caution colour. It does not block submit. Use it for unusual but allowed values. */
  warning?: ReactNode
  /** Error text, in the critical colour. Sets `aria-invalid` on the control. Say how to fix the problem. */
  error?: ReactNode
  /** Adds the required marker to the label and `aria-required` to the control. Default `false`. */
  required?: boolean
  /** Id for the control (the label's `htmlFor`). Generated when unset. An `id` on the control itself is replaced by this one. */
  id?: string
  /** The one control to label: Input, NumberInput, Textarea, Select, Checkbox or Switch. */
  children?: ReactNode
}

const has = (n: ReactNode) => n !== undefined && n !== null && n !== false && n !== ''

/**
 * Wraps one control with a label, hint, warning or error, and wires up the accessibility
 * attributes: the label's `htmlFor`, `aria-describedby`, `aria-invalid` and `aria-required`.
 * Controls inside it read this through `useFieldContext()`.
 */
export function Field({ label, hint, warning, error, required = false, id, className, children, ...props }: FieldProps) {
  const auto = useId()
  const controlId = id ?? auto
  const hintId = `${controlId}-hint`
  const warnId = `${controlId}-warn`
  const errId = `${controlId}-err`
  const showHint = has(hint)
  const showWarn = has(warning)
  const showErr = has(error)
  const describedBy = [showHint && hintId, showWarn && warnId, showErr && errId].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={cn('flex min-w-0 flex-col gap-[7px] [[data-density=compact]_&]:gap-1', className)}
      {...props}
    >
      <label
        htmlFor={controlId}
        className="text-ui-sm font-[550] text-fg [[data-density=compact]_&]:text-xs [[data-density=station]_&]:text-lg"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-critical-fg">
            *
          </span>
        ) : null}
      </label>
      <FieldContext value={{ id: controlId, describedBy, invalid: showErr, warning: showWarn, required }}>
        {children}
      </FieldContext>
      {showHint ? (
        <p id={hintId} className="text-ui-sm text-fg-muted">
          {hint}
        </p>
      ) : null}
      {showWarn ? (
        <p id={warnId} role="status" className="flex items-start gap-1.5 text-ui-sm text-caution-fg">
          <SeverityIcon severity="caution" className="mt-px" />
          <span>{warning}</span>
        </p>
      ) : null}
      {showErr ? (
        <p id={errId} role="alert" className="flex items-start gap-1.5 text-ui-sm text-critical-fg">
          <SeverityIcon severity="critical" className="mt-px" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}
