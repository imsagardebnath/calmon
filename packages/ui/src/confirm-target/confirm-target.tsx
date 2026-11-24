'use client'

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Banner } from '../banner/index.ts'
import { Button } from '../button/index.ts'
import { Dialog, type DialogProps } from '../dialog/index.ts'
import { SeverityIcon, TrashIcon } from '../icons/index.ts'
import { Input } from '../input/index.ts'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { EnvironmentBadge } from './environment-badge.tsx'

export type ConfirmTargetProps = Omit<
  DialogProps,
  'title' | 'description' | 'footer' | 'severity' | 'intent' | 'dismissible' | 'children' | 'open' | 'defaultOpen' | 'onOpenChange'
> & {
  /** The record's exact name. The person types it to confirm, and it is shown beside the environment. Case-sensitive. Required. */
  name: string
  /** The environment the record lives in. Its badge shows in the dialog header and beside the name. PROD is critical and uppercase. Required. */
  env: 'prod' | 'staging' | 'dev'
  /** Label of the confirm button. Name what happens: "Delete database", not "OK". Default `Delete`. */
  action?: string
  /** Called when the person confirms (the button, or Enter in the field once the name matches). The dialog closes right after. */
  onConfirm?: () => void
  /** Controlled open state. Use with `onOpenChange`, or leave it out and pass a trigger as `children`. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called when the dialog wants to open or close: the trigger, Escape, Cancel or a confirmed action. A backdrop click never closes it. */
  onOpenChange?: (open: boolean) => void
  /** The heading, which names the dialog. Default: the action and the name, such as `Delete “orders-prod-eu”?`. The environment badge is added after it. */
  title?: ReactNode
  /** Supporting text under the title. It describes the dialog (`aria-describedby`). */
  description?: ReactNode
  /** What will happen, one line each, in a critical notice headed "This can’t be undone". Be concrete: what is removed and what breaks. */
  consequences?: string[]
  /** Extra facts beside the name, such as `284 GB · 3 replicas`, to tell look-alike records apart. */
  detail?: ReactNode
  /** Makes the person type the exact `name` before the confirm button unlocks. Paste is allowed. Turn it off only for low-risk actions. Default `true`. */
  requireTyping?: boolean
  /** The element that opens the dialog, usually a `Button`. It must accept `onClick`. Leave it out when you control `open` yourself. */
  children?: ReactElement
}

type Trigger = ReactElement<{ onClick?: MouseEventHandler<HTMLElement>; 'aria-haspopup'?: 'dialog' }>

/**
 * A confirmation for anything that cannot be undone. The person reads the target and its environment,
 * then types the exact name to unlock the confirm button. Enter confirms only on a match, Escape and
 * Cancel close it, and a stray click on the backdrop does nothing. Pass the button that opens it as `children`.
 */
export function ConfirmTarget({
  name,
  env,
  action = 'Delete',
  onConfirm,
  open: openProp,
  defaultOpen,
  onOpenChange,
  title,
  description,
  consequences,
  detail,
  requireTyping = true,
  children,
  onClickCapture,
  ...props
}: ConfirmTargetProps) {
  const id = useId()
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange })
  const [typed, setTyped] = useState('')
  // The Dialog unmounts its content when closed, but this state lives out here: clear it ourselves.
  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  const status = typed === '' ? 'empty' : typed === name ? 'match' : name.startsWith(typed) ? 'partial' : 'wrong'
  const ready = !requireTyping || status === 'match'
  const confirm = () => {
    if (!ready) return
    onConfirm?.()
    setOpen(false)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    confirm()
  }

  const trigger = isValidElement(children)
    ? cloneElement(children as Trigger, {
        'aria-haspopup': 'dialog',
        onClick: (e: MouseEvent<HTMLElement>) => {
          ;(children as Trigger).props.onClick?.(e)
          if (!e.defaultPrevented) setOpen(true)
        },
      })
    : null

  return (
    <>
      {trigger}
      <Dialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        severity="critical"
        // Dialog's dismissible={false} would block Escape too. Only the backdrop click is swallowed here.
        onClickCapture={(e) => {
          onClickCapture?.(e)
          if (e.target === e.currentTarget) e.stopPropagation()
        }}
        title={
          <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {title ?? `${action} “${name}”?`}
            <EnvironmentBadge env={env} />
          </span>
        }
        description={description}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" severity="critical" iconStart={<TrashIcon />} disabled={!ready} onClick={confirm}>
              {action}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-2.5 rounded-control border border-border bg-surface-sunken px-3 py-2.5">
          <span className="min-w-0 font-mono text-ui-sm font-medium break-all">{name}</span>
          <EnvironmentBadge env={env} />
          {detail ? <span className="ml-auto text-ui-sm text-fg-muted">{detail}</span> : null}
        </div>
        {consequences?.length ? (
          <Banner severity="critical" title="This can’t be undone">
            <ul className="m-0 list-disc pl-4">
              {consequences.map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ul>
          </Banner>
        ) : null}
        {requireTyping ? (
          <div className="flex flex-col gap-[7px]">
            <label htmlFor={`${id}i`} className="text-ui-sm font-[550] text-fg">
              Type{' '}
              <code className="rounded-[5px] bg-surface-sunken px-1.5 py-px font-mono text-[.84em] shadow-[inset_0_0_0_1px_var(--border)]">
                {name}
              </code>{' '}
              to confirm
            </label>
            <Input
              id={`${id}i`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={onKeyDown}
              invalid={status === 'wrong'}
              aria-describedby={`${id}m`}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="font-mono text-ui-sm"
            />
            <p
              id={`${id}m`}
              aria-live="polite"
              className={cn(
                'flex items-start gap-1.5 text-ui-sm text-fg-muted',
                status === 'match' && 'text-normal-fg',
                status === 'wrong' && 'text-critical-fg',
              )}
            >
              {status === 'match' || status === 'wrong' ? (
                <SeverityIcon severity={status === 'match' ? 'normal' : 'critical'} className="mt-px" />
              ) : null}
              {status === 'match'
                ? 'Name matches.'
                : status === 'wrong'
                  ? `Doesn’t match ${name}.`
                  : status === 'partial'
                    ? 'Keep typing…'
                    : 'Names are case-sensitive.'}
            </p>
          </div>
        ) : null}
      </Dialog>
    </>
  )
}
