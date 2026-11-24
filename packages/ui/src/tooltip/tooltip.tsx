'use client'

import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ComponentPropsWithRef, type ReactElement } from 'react'
import { cn } from '../lib/cn.ts'
import { placementOf, Portal, useDismiss, useMergedRef, usePopup } from '../popover/popup.tsx'

export type TooltipProps = Omit<ComponentPropsWithRef<'span'>, 'content'> & {
  /** The text to show. Plain text under 80 characters; never put links or actions in it. Required. */
  content: string
  /** Milliseconds the pointer must rest on the trigger before the tooltip shows. Keyboard focus shows it at once. Default `400`. */
  delay?: number
  /** Preferred side of the trigger. It flips when there is no room. `start` is always the left side and `end` the right: they do not flip in right-to-left layouts. Default `top`. */
  side?: 'top' | 'bottom' | 'start' | 'end'
}

const EDGE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

/**
 * A short label on hover or keyboard focus. Wraps its single child, which is described by the tooltip
 * (`aria-describedby`). Escape hides it. For a disabled control prefer `aria-disabled` over `disabled`,
 * so it stays focusable and the tooltip can still be reached by keyboard.
 */
export function Tooltip({
  content,
  delay = 400,
  side = 'top',
  className,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const timer = useRef<number>(undefined)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const { refs, floatingStyles, isPositioned, elements, placement, middlewareData } = usePopup(
    open,
    placementOf(side),
    arrowRef,
  )
  const hostRef = useMergedRef<HTMLSpanElement>(refs.setReference, ref)

  const show = (ms: number) => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), ms)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useDismiss(open, refs, hide, false)

  const child = isValidElement<{ 'aria-describedby'?: string }>(children) ? children : null
  const arrow = middlewareData.arrow

  return (
    <span
      {...props}
      ref={hostRef}
      className={cn('inline-flex [&>:disabled]:pointer-events-none', className)}
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        if (e.pointerType !== 'touch') show(delay)
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        hide()
      }}
      onFocus={(e) => {
        onFocus?.(e)
        show(0)
      }}
      onBlur={(e) => {
        onBlur?.(e)
        hide()
      }}
    >
      {child
        ? cloneElement(child as ReactElement<Record<string, unknown>>, {
            // The tooltip replaces any native title, which would show a second, unstyled tip.
            title: undefined,
            'aria-describedby': open ? [child.props['aria-describedby'], id].filter(Boolean).join(' ') : child.props['aria-describedby'],
          })
        : children}
      {open && (
        <Portal anchor={elements.reference as Element | null}>
          <div
            ref={refs.setFloating}
            id={id}
            role="tooltip"
            style={floatingStyles}
            className={cn(
              'pointer-events-none z-[60] w-max max-w-xs rounded-md bg-fg px-[9px] py-1.5 text-xs font-medium text-surface shadow-mid',
              !isPositioned && 'invisible',
            )}
          >
            {content}
            <span
              ref={arrowRef}
              aria-hidden="true"
              className="absolute size-[7px] rotate-45 bg-fg"
              style={{ left: arrow?.x, top: arrow?.y, [EDGE[placement.split('-')[0] as keyof typeof EDGE]]: -3.5 }}
            />
          </div>
        </Portal>
      )}
    </span>
  )
}
