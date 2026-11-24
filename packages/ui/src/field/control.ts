'use client'

import { createContext, useContext } from 'react'

/** What a Field shares with the control inside it. */
export interface FieldContextValue {
  /** Id for the control. The Field's label points at it with `htmlFor`. */
  id: string
  /** Space-separated ids of the hint, warning and error text, or undefined when there are none. */
  describedBy: string | undefined
  /** An error message is showing. */
  invalid: boolean
  /** A warning message is showing. */
  warning: boolean
  /** The Field is marked required. */
  required: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** The surrounding Field's wiring, or `null` when the control is used on its own. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

/** Attributes a control spreads onto its native element. Keys are left out when they do not apply. */
export interface FieldControlAttrs {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
  /** `critical` when invalid, `caution` when warning, otherwise `neutral`. */
  'data-tone': 'critical' | 'caution' | 'neutral'
}

/** Merges a control's own props with the Field's: the Field's id wins, describedby is joined, an error outranks a warning. */
export function useFieldControl(own: {
  id?: string
  describedBy?: string
  invalid?: boolean
  warning?: boolean
}): FieldControlAttrs {
  const field = useFieldContext()
  const invalid = own.invalid ?? field?.invalid ?? false
  const warning = !invalid && (own.warning ?? field?.warning ?? false)
  const id = field?.id ?? own.id
  const describedBy = [own.describedBy, field?.describedBy].filter(Boolean).join(' ')
  const attrs: FieldControlAttrs = { 'data-tone': invalid ? 'critical' : warning ? 'caution' : 'neutral' }
  if (id) attrs.id = id
  if (describedBy) attrs['aria-describedby'] = describedBy
  if (invalid) attrs['aria-invalid'] = true
  if (field?.required) attrs['aria-required'] = true
  return attrs
}
