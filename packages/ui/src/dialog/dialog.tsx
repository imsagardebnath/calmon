'use client'

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'
import { toneOf, type Intent, type Severity } from '../lib/tone.ts'
import { SeverityIcon } from '../icons/index.ts'
import { CloseButton, MODAL, useModal, type ModalOptions } from './modal.tsx'

const WIDTH = { sm: 'w-[360px]', md: 'w-[480px]', lg: 'w-[720px]' }

export type DialogProps = Omit<
  ComponentPropsWithRef<'dialog'>,
  'open' | 'title' | 'onClose' | 'onCancel' | 'onClick' | 'onKeyDown' | 'onPointerDown'
> &
  ModalOptions & {
    /** The heading. It names the dialog (`aria-labelledby`). Say what the confirm button does: "Delete service?". Required. */
    title: ReactNode
    /** Supporting text under the title. It describes the dialog (`aria-describedby`). */
    description?: ReactNode
    /** Risk level of what the dialog confirms. Shows that severity's icon and tints it. Use `critical` for deletions. Wins over `intent`. */
    severity?: Severity
    /** Familiar colour names: `danger` shows the critical icon, `warning` caution, `success` normal. Same as the matching severity. */
    intent?: Intent
    /** Width: 360, 480 or 720px. Default `md`. */
    size?: 'sm' | 'md' | 'lg'
    /** Buttons for the bottom row, right-aligned. Name the confirm button with its action ("Delete service"), never "OK". */
    footer?: ReactNode
    /** The body, between the heading and the footer. Scrolls when it is taller than the screen. */
    children?: ReactNode
  }

/**
 * Blocks the page for a decision. A native modal `<dialog>`: focus is trapped inside, Escape closes it,
 * and focus returns to the trigger. Open it by setting `open` from your trigger's `onClick`, and put the
 * confirm and cancel buttons in `footer`. The content is only rendered while open.
 */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  dismissible = true,
  title,
  description,
  severity,
  intent,
  size = 'md',
  footer,
  className,
  children,
  ref,
  ...rest
}: DialogProps) {
  const id = useId()
  const modal = useModal(ref, { open, defaultOpen, onOpenChange, dismissible })
  const tone = toneOf(severity, intent, null)
  const icon = tone && tone !== 'accent' && tone !== 'neutral' ? tone : null

  return (
    <dialog
      data-tone={tone ?? 'neutral'}
      aria-labelledby={`${id}t`}
      aria-describedby={description ? `${id}d` : undefined}
      {...rest}
      {...modal.props}
      className={cn(
        'm-auto max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)] open:animate-calmon-dialog',
        MODAL,
        WIDTH[size],
        className,
      )}
    >
      {modal.isOpen && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col rounded-2xl bg-surface-raised shadow-[0_0_0_1px_var(--border),var(--shadow-3)]">
          <div className={cn('flex gap-3.5', icon ? 'px-[22px] pt-[22px] pb-2' : 'items-center gap-2.5 px-[18px] py-4')}>
            {icon && (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tone-soft text-tone-fg [&>svg]:size-5">
                <SeverityIcon severity={icon} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 id={`${id}t`} className="text-lg leading-[1.15] font-semibold tracking-[-0.018em]">
                {title}
              </h2>
              {description && (
                <p id={`${id}d`} className="mt-1.5 text-ui-sm leading-[1.55] text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && !icon && <CloseButton onClick={() => modal.change(false)} />}
          </div>
          {children && <div className="flex min-h-0 flex-col gap-4 overflow-auto px-[18px] pb-[18px]">{children}</div>}
          {footer && <div className="flex justify-end gap-2 px-[18px] pt-3.5 pb-[18px]">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
