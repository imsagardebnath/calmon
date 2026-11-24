'use client'

/* Shared by Dialog and Drawer, which are both native modal <dialog> elements. Internal. */

import {
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type Ref,
  type SyntheticEvent,
} from 'react'
import { XIcon } from '../icons/index.ts'
import { useControllable } from '../lib/use-controllable.ts'

export interface ModalOptions {
  /** Controlled open state. Use with `onOpenChange`. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called when it wants to open or close: Escape, a backdrop click, the close button. */
  onOpenChange?: (open: boolean) => void
  /** Set to `false` to stop Escape and backdrop clicks from closing it, for destructive flows mid-action. Give the user a button that closes it. Default `true`. */
  dismissible?: boolean
}

/** showModal() and close() follow the open state: native focus trap, Escape and inert page. Focus goes back to the previous element. */
export function useModal(
  ref: Ref<HTMLDialogElement> | undefined,
  { open, defaultOpen = false, onOpenChange, dismissible = true }: ModalOptions,
) {
  const [isOpen, change] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const el = useRef<HTMLDialogElement>(null)
  const from = useRef<Element | null>(null)
  const pressed = useRef(false)
  useImperativeHandle(ref, () => el.current as HTMLDialogElement)

  useEffect(() => {
    const d = el.current
    if (!d || isOpen === d.open) return
    if (isOpen) {
      from.current = document.activeElement
      if (d.showModal) d.showModal()
      else d.setAttribute('open', '')
    } else {
      if (d.close) d.close()
      else d.removeAttribute('open')
      if (from.current instanceof HTMLElement) from.current.focus()
    }
  }, [isOpen])

  return {
    isOpen,
    change,
    props: {
      ref: el,
      // Escape: React state decides, so the dialog never closes behind the app's back.
      onCancel: (e: SyntheticEvent) => {
        e.preventDefault()
        if (dismissible) change(false)
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (!dismissible && e.key === 'Escape') e.preventDefault()
      },
      // A <form method="dialog"> inside can close it natively: keep the state in step.
      onClose: () => {
        if (isOpen) change(false)
      },
      // The <dialog> box is transparent and fits its panel, so a click on it is a backdrop click.
      // It only counts if the press began there too, so dragging a text selection out does not close it.
      onPointerDown: (e: PointerEvent) => {
        pressed.current = e.target === e.currentTarget
      },
      onClick: (e: MouseEvent) => {
        if (dismissible && pressed.current && e.target === e.currentTarget) change(false)
      },
    },
  }
}

/** The header close button. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className="ml-auto grid size-[30px] shrink-0 cursor-pointer place-items-center rounded-[7px] text-fg-muted transition-colors duration-(--duration-fast) hover:bg-surface-sunken hover:text-fg"
    >
      <XIcon />
    </button>
  )
}

/** <dialog> classes: transparent, unpadded, unclipped, with a scrim (stronger in dark mode). Never add a `display` class: it would defeat `display: none` when closed. */
export const MODAL =
  'overflow-visible bg-transparent p-0 text-fg backdrop:bg-[color-mix(in_oklab,var(--fg),transparent_65%)] ' +
  'backdrop:backdrop-blur-[2px] dark:backdrop:bg-[color-mix(in_oklab,#000,transparent_40%)]'
