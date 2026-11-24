'use client'

import { useEffect, useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { CloseButton, MODAL, useModal, type ModalOptions } from '../dialog/modal.tsx'

export type DrawerProps = Omit<
  ComponentPropsWithRef<'dialog'>,
  'open' | 'title' | 'onClose' | 'onCancel' | 'onClick' | 'onKeyDown' | 'onPointerDown'
> &
  ModalOptions & {
    /** The heading. It names the drawer (`aria-labelledby`). Required. */
    title: ReactNode
    /** Supporting text under the title. It describes the drawer (`aria-describedby`). */
    description?: ReactNode
    /** The screen edge it slides in from. `start` is always the left edge and `end` the right: they do not flip in right-to-left layouts. Default `end`. */
    side?: 'start' | 'end'
    /** Width in px. It never gets wider than the screen. Default `420`. */
    size?: number
    /** Buttons for the bottom row, right-aligned. Keep the primary action here. */
    footer?: ReactNode
    /** The body. It scrolls while the header and footer stay put. */
    children?: ReactNode
  }

/**
 * A side sheet for detail and editing without losing your place. Modal like `Dialog`: focus is trapped,
 * Escape closes it, and focus returns to the trigger. Do not stack drawers. The content is only rendered
 * while open.
 */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  dismissible = true,
  title,
  description,
  side = 'end',
  size = 420,
  footer,
  className,
  style,
  children,
  ref,
  ...rest
}: DrawerProps) {
  const id = useId()
  const modal = useModal(ref, { open, defaultOpen, onOpenChange, dismissible })
  const start = side === 'start'
  const { isOpen } = modal

  // The slide-in keyframe (`animate-calmon-slide`) moves in from the right, so a start drawer
  // plays the same motion from the left with the Web Animations API, on the same motion tokens.
  useEffect(() => {
    const d = modal.props.ref.current
    if (!start || !isOpen || !d?.animate) return
    const css = getComputedStyle(d)
    d.animate(
      { opacity: [0, 1], transform: ['translateX(-30px)', 'none'] },
      { duration: parseFloat(css.getPropertyValue('--duration-slow')) || 0, easing: css.getPropertyValue('--ease-calmon-curve').trim() || 'ease-out' },
    )
  }, [start, isOpen, modal.props.ref])

  return (
    <dialog
      data-tone="neutral"
      aria-labelledby={`${id}t`}
      aria-describedby={description ? `${id}d` : undefined}
      {...rest}
      {...modal.props}
      style={{ width: size, ...style }}
      className={cn(
        'm-0 h-dvh max-h-dvh max-w-full',
        start ? 'mr-auto' : 'ml-auto open:animate-calmon-slide',
        MODAL,
        className,
      )}
    >
      {isOpen && (
        <div className={cn('flex h-full min-h-0 flex-col bg-surface-raised shadow-high', start ? 'border-r border-border' : 'border-l border-border')}>
          <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-4">
            <div className="min-w-0 flex-1">
              <h2 id={`${id}t`} className="text-ui leading-[1.15] font-semibold tracking-[-0.018em]">
                {title}
              </h2>
              {description && (
                <p id={`${id}d`} className="mt-1 text-ui-sm leading-[1.55] text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && <CloseButton onClick={() => modal.change(false)} />}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-[18px]">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-border px-[18px] py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
