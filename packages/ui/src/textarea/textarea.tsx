'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
} from 'react'
import { cn } from '../lib/cn.ts'
import { useFieldControl } from '../field/control.ts'
import { inputBase } from '../input/input-variants.ts'

export type TextareaProps = ComponentPropsWithRef<'textarea'> & {
  /** Grow with the content, up to `maxRows`, then scroll. Turns off manual resizing. Default `true`. */
  autoGrow?: boolean
  /** Height limit in rows before the field scrolls. Only used with `autoGrow`. Default `10`. */
  maxRows?: number
  /** Maximum characters. Shows a live counter (used / max) and announces the characters left once 20 or fewer remain. */
  maxLength?: number
  /** Error styling and `aria-invalid`. Field sets this for you when it has an `error`. Default `false`. */
  invalid?: boolean
  /** Caution styling that does not block. Field sets this for you when it has a `warning`. Default `false`. */
  warning?: boolean
}

const px = (v: string) => parseFloat(v) || 0

/** Size the box to its content, capped at `maxRows` lines. */
function fit(el: HTMLTextAreaElement, maxRows: number) {
  el.style.height = 'auto'
  if (!el.scrollHeight) return // not rendered (display: none, or no layout)
  const cs = getComputedStyle(el)
  const border = px(cs.borderTopWidth) + px(cs.borderBottomWidth)
  const line = px(cs.lineHeight) || px(cs.fontSize) * 1.5
  const cap = line * maxRows + px(cs.paddingTop) + px(cs.paddingBottom) + border
  const need = el.scrollHeight + border
  el.style.height = `${Math.min(need, cap)}px`
  el.style.overflowY = need > cap ? 'auto' : 'hidden'
}

/**
 * Multi-line text for notes, reasons and descriptions. With `maxLength` it shows a live
 * counter, and announces the characters left once there are 20 or fewer.
 * `className` styles the `<textarea>`; all other props go to it too.
 */
export function Textarea({
  autoGrow = true,
  maxRows = 10,
  invalid,
  warning,
  maxLength,
  className,
  id,
  'aria-describedby': describedBy,
  ref,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const attrs = useFieldControl({ id, describedBy, invalid, warning })
  const inner = useRef<HTMLTextAreaElement | null>(null)
  // One ref callback for our own use and the consumer's. It changes only when `ref` does, so a consumer's
  // callback ref is not called with null and the element again on every render.
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      inner.current = el
      if (typeof ref === 'function') return ref(el)
      if (ref) ref.current = el
    },
    [ref],
  )
  const counted = maxLength !== undefined
  const [typed, setTyped] = useState(String(defaultValue ?? '').length)
  const length = value !== undefined ? String(value).length : typed

  useLayoutEffect(() => {
    if (autoGrow && inner.current) fit(inner.current, maxRows)
  }, [autoGrow, maxRows, value])

  // Refit when the width changes (the text re-wraps) or the field first gets a size (it was hidden), which
  // neither the value nor a keystroke tells us about. Only a width change counts: fitting changes the height.
  useEffect(() => {
    const el = inner.current
    if (!autoGrow || !el || typeof ResizeObserver === 'undefined') return
    let width = el.offsetWidth
    let frame = 0
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === width) return
      width = el.offsetWidth
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => fit(el, maxRows))
    })
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [autoGrow, maxRows, counted])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTyped(e.target.value.length)
    if (autoGrow) fit(e.target, maxRows)
    onChange?.(e)
  }

  const field = (
    <textarea
      ref={setRef}
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChange={handleChange}
      className={cn(
        inputBase,
        'min-h-[88px] px-3 py-2.5 text-ui leading-normal',
        autoGrow ? 'resize-none' : 'resize-y',
        className,
      )}
      {...props}
      {...attrs}
    />
  )
  if (maxLength === undefined) return field

  const left = maxLength - length
  const near = left <= 20
  return (
    <div className="w-full">
      {field}
      <div className="mt-1.5 flex justify-end">
        <span
          aria-hidden="true"
          className={cn('text-xs tabular-nums text-fg-subtle', near && 'text-caution-fg', left <= 0 && 'text-critical-fg')}
        >
          {length} / {maxLength}
        </span>
        <span role="status" className="sr-only">
          {near ? `${left} character${left === 1 ? '' : 's'} left` : ''}
        </span>
      </div>
    </div>
  )
}
