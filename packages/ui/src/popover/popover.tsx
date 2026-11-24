'use client'

import { useEffect, useId, useRef, type ComponentPropsWithRef, type ReactElement, type Ref } from 'react'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { cloneTrigger, placementOf, Portal, POPUP, triggerOf, useDismiss, useMergedRef, usePopup } from './popup.tsx'

export type PopoverProps = Omit<ComponentPropsWithRef<'div'>, 'role' | 'onBlur'> & {
  /** The element that opens the popover, usually a `Button`. It is cloned with `aria-expanded`, `aria-controls` and a click handler. Required. */
  trigger: ReactElement
  /** Preferred side of the trigger. It flips to the other side when there is no room. `start` is always the left side and `end` the right: they do not flip in right-to-left layouts. Default `bottom`. */
  side?: 'top' | 'bottom' | 'start' | 'end'
  /** Controlled open state. Use with `onOpenChange`. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called when the popover wants to open or close: trigger click, Escape, outside click, Tab or focus leaving. */
  onOpenChange?: (open: boolean) => void
  /** Accessible name for the popover. When unset, `aria-label` or `aria-labelledby` is used if you pass one, otherwise the trigger's name. */
  label?: string
}

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]'

/**
 * Rich content anchored to a trigger, such as an explanation or a small form. Click the trigger to toggle;
 * Escape, a click outside, or tabbing out closes it. Focus moves into the popover on open and back to
 * the trigger when it closes from inside, on Escape, or on Tab. Do not put required steps in it.
 */
export function Popover({
  trigger,
  side = 'bottom',
  open,
  defaultOpen = false,
  onOpenChange,
  label,
  id: idProp,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  onFocus,
  onKeyDown,
  className,
  children,
  ref,
  ...props
}: PopoverProps) {
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const id = useId()
  const popupId = idProp ?? id
  const name = label ?? ariaLabel
  const triggerId = (trigger.props as { id?: string }).id ?? `${id}t`
  const { refs, floatingStyles, isPositioned, elements } = usePopup(isOpen, placementOf(side, 'start'))
  const triggerRef = useMergedRef<HTMLElement>(refs.setReference, (trigger.props as { ref?: Ref<HTMLElement> }).ref)
  const floatingRef = useMergedRef<HTMLDivElement>(refs.setFloating, ref)
  const inside = useRef(false) // focus is inside the popover

  const close = (refocus: boolean) => {
    inside.current = false
    setOpen(false)
    if (refocus) triggerOf(refs)?.focus()
  }
  useDismiss(isOpen, refs, close)
  useEffect(() => {
    if (isPositioned) refs.floating.current?.focus({ preventScroll: true })
  }, [isPositioned, refs])
  // Closed by the parent while focus was inside (a button in the content calling `setOpen(false)`): the
  // focused element is gone and focus would drop to <body>, so hand it back to the trigger.
  useEffect(() => {
    if (isOpen || !inside.current) return
    inside.current = false
    const active = document.activeElement
    if (!active || active === document.body) triggerOf(refs)?.focus()
  }, [isOpen, refs])

  return (
    <>
      {cloneTrigger(trigger, triggerRef, {
        id: triggerId,
        'aria-haspopup': 'dialog',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? popupId : undefined,
        onClick: () => setOpen(!isOpen),
      })}
      {isOpen && (
        <Portal anchor={elements.reference as Element | null}>
          <div
            tabIndex={-1}
            {...props}
            ref={floatingRef}
            id={popupId}
            role="dialog"
            aria-label={name}
            aria-labelledby={labelledBy ?? (name ? undefined : triggerId)}
            data-popup=""
            style={{ ...floatingStyles, ...props.style }}
            onFocus={(e) => {
              inside.current = true
              onFocus?.(e)
            }}
            onBlur={(e) => {
              const to = e.relatedTarget
              if (!(to instanceof Node) || e.currentTarget.contains(to)) return // focus lost to nothing, or still inside
              inside.current = false
              if (!triggerOf(refs)?.contains(to)) close(false)
            }}
            onKeyDown={(e) => {
              onKeyDown?.(e)
              if (e.key !== 'Tab' || e.defaultPrevented) return
              const box = e.currentTarget
              if ((e.target as Element).closest(POPUP) !== box) return // a popup nested inside handles its own Tab
              const tabbable = Array.from(box.querySelectorAll<HTMLElement>(TABBABLE)).filter(
                (el) => el.tabIndex >= 0 && el.closest(POPUP) === box,
              )
              const leaving = e.shiftKey
                ? !tabbable.length || e.target === box || e.target === tabbable[0]
                : !tabbable.length || e.target === tabbable[tabbable.length - 1]
              if (!leaving) return
              // The popover follows its trigger in reading order: Shift+Tab goes back to the trigger,
              // and Tab carries on from it, as if the content were inline.
              if (e.shiftKey) e.preventDefault()
              close(true)
            }}
            className={cn(
              'z-50 w-[250px] max-w-[calc(100vw-16px)] rounded-xl bg-surface-raised px-4 py-3.5 text-ui-sm leading-normal text-fg',
              'shadow-[0_0_0_1px_var(--border),var(--shadow-2)] outline-none',
              isPositioned ? 'animate-calmon-dialog' : 'invisible',
              className,
            )}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  )
}
