'use client'

import {
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { cloneTrigger, placementOf, Portal, triggerOf, useDismiss, useMergedRef, usePopup } from '../popover/popup.tsx'

export type MenuProps = Omit<ComponentPropsWithRef<'div'>, 'role' | 'onKeyDown' | 'onClick'> & {
  /** The element that opens the menu, usually a `Button` or `IconButton`. It is cloned with `aria-haspopup`, `aria-expanded` and key handlers. Required. */
  trigger: ReactElement
  /** Which edge of the trigger the menu lines up with. Default `start`. */
  align?: 'start' | 'end'
  /** Controlled open state. Use with `onOpenChange`. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
}

/**
 * A list of actions that opens from a button. Arrows, Home, End and typing move; Enter or Space picks;
 * Escape closes and refocuses the trigger. Picking runs the item's `onClick`. Put destructive items last.
 * The menu is named by its trigger; pass `aria-label` or `aria-labelledby` to name it otherwise.
 */
export function Menu({
  trigger,
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  id: idProp,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  className,
  children,
  ref,
  ...props
}: MenuProps) {
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const id = useId()
  const menuId = idProp ?? id
  const triggerId = (trigger.props as { id?: string }).id ?? `${id}t`
  const { refs, floatingStyles, isPositioned, elements } = usePopup(isOpen, placementOf('bottom', align))
  const triggerRef = useMergedRef<HTMLElement>(refs.setReference, (trigger.props as { ref?: Ref<HTMLElement> }).ref)
  const floatingRef = useMergedRef<HTMLDivElement>(refs.setFloating, ref)
  const first = useRef(true) // false: focus the last item on open
  const typed = useRef({ text: '', at: 0 })

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerOf(refs)?.focus()
  }
  useDismiss(isOpen, refs, close)

  const items = () => Array.from(refs.floating.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  const focusAt = (i: number) => {
    const all = items()
    all[((i % all.length) + all.length) % all.length]?.focus()
  }
  useEffect(() => {
    if (!isPositioned) return
    focusAt(first.current ? 0 : -1)
    first.current = true
  }, [isPositioned])

  const onKeyDown = (e: KeyboardEvent) => {
    const i = items().indexOf(document.activeElement as HTMLElement)
    const to: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i < 0 ? -1 : i - 1, Home: 0, End: -1 }
    const n = to[e.key]
    if (n !== undefined) focusAt(n)
    else if (e.key === 'Tab') return close(true) // focus lands on the trigger; Tab then moves on from there
    else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typed.current // letters typed within half a second build one search
      const now = Date.now()
      t.text = (now - t.at > 500 ? '' : t.text) + e.key.toLowerCase()
      t.at = now
      const all = items()
      const from = Math.max(t.text.length === 1 ? i + 1 : i, 0)
      ;[...all.slice(from), ...all.slice(0, from)].find((el) => el.textContent?.trim().toLowerCase().startsWith(t.text))?.focus()
    } else return
    e.preventDefault()
  }

  return (
    <>
      {cloneTrigger(trigger, triggerRef, {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? menuId : undefined,
        onClick: () => {
          first.current = true
          setOpen(!isOpen)
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
          e.preventDefault()
          first.current = e.key === 'ArrowDown'
          setOpen(true)
        },
      })}
      {isOpen && (
        <Portal anchor={elements.reference as Element | null}>
          <div
            {...props}
            ref={floatingRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            aria-labelledby={labelledBy ?? (ariaLabel ? undefined : triggerId)}
            data-popup=""
            style={{ ...floatingStyles, ...props.style }}
            onKeyDown={onKeyDown}
            onClick={(e) => (e.target as Element).closest('[role="menuitem"]') && close(true)}
            className={cn(
              'z-50 max-h-[calc(100dvh-16px)] w-[230px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl bg-surface-raised p-[5px] text-ui-sm text-fg',
              'shadow-[0_0_0_1px_var(--border),var(--shadow-2)]',
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

export type MenuItemProps = Omit<ComponentPropsWithRef<'button'>, 'role' | 'type' | 'disabled'> & {
  /** Icon before the label. Decorative: hidden from screen readers. */
  icon?: ReactNode
  /** Keyboard shortcut shown on the right as a hint. It does not register the shortcut. */
  shortcut?: string
  /** `danger` marks a destructive item. Put it last, after a `MenuSeparator`, and end the label with an ellipsis when it opens a confirmation. */
  intent?: 'danger'
  /** Greys the item out. It stays focusable (`aria-disabled`) so keyboard users can still find it, and cannot be picked. */
  disabled?: boolean
}

/** One action in a `Menu`. A native button, so `onClick` is how you run the action. */
export function MenuItem({ icon, shortcut, intent, disabled, className, children, onClick, onPointerEnter, ...props }: MenuItemProps) {
  const danger = intent === 'danger'
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-tone={danger ? 'critical' : 'neutral'}
      {...props}
      onClick={(e) => (disabled ? e.stopPropagation() : onClick?.(e))} // a disabled item must not close the menu
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        e.currentTarget.focus({ preventScroll: true })
      }}
      className={cn(
        'flex w-full cursor-default items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left focus:bg-surface-sunken focus-visible:-outline-offset-2',
        danger ? 'text-tone-fg [&_svg]:text-tone-fg' : 'text-fg [&_svg]:text-fg-subtle',
        disabled && 'text-fg-subtle',
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      )}
      {children}
      {shortcut && <span className="ml-auto font-mono text-[11px] text-fg-subtle">{shortcut}</span>}
    </button>
  )
}

/** A divider between groups of items. */
export function MenuSeparator({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div role="separator" className={cn('-mx-[5px] my-[5px] border-t border-border', className)} {...props} />
}
