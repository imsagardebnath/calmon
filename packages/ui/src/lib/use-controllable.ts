'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * State that is either controlled (the parent passes `value`) or uncontrolled (it starts at
 * `defaultValue` and the component owns it). `onChange` fires in both modes.
 *
 * `value: undefined` means uncontrolled. For an optional value, make `T` include `undefined`
 * (`useControllable<string | undefined>`).
 *
 *   const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange })
 */
export function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined
  defaultValue: T
  onChange?: (next: T) => void
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal

  // Keep the latest callback and mode without changing the setter's identity.
  const latest = useRef({ controlled, onChange })
  latest.current = { controlled, onChange }

  const set = useCallback((next: T) => {
    if (!latest.current.controlled) setInternal(next)
    latest.current.onChange?.(next)
  }, [])

  return [current, set]
}
