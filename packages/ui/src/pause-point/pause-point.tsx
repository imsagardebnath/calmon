'use client'

import { useEffect, useId, useRef, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Button } from '../button/index.ts'
import { Checkbox } from '../checkbox/index.ts'
import { EnvironmentBadge } from '../confirm-target/environment-badge.tsx'
import { PauseIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'

/** One check. A plain string is just the label. */
export type PausePointItem =
  | string
  | {
      /** The fact to verify, phrased as a statement: "Rollback plan is linked". */
      label: string
      /** Proof shown under the label, such as who approved and when, so people look before they tick. */
      evidence?: ReactNode
      /** The system already verified this, so it starts ticked. The person can still untick it. Default `false`. */
      verified?: boolean
    }

export type PausePointProps = Omit<ComponentPropsWithRef<'fieldset'>, 'title' | 'children'> & {
  /** The checks, three to five of them. Each is a string or `{ label, evidence }`. More than seven warns in development. Required. */
  items: PausePointItem[]
  /** Label of the action button. It stays disabled until every item is checked. Name the action: "Publish config". Required. */
  action: string
  /** Called when the action button is pressed. */
  onConfirm?: () => void
  /** Called once when the last unchecked item gets checked. */
  onComplete?: () => void
  /** Shows a Cancel button before the action button and calls this when it is pressed. Leave it out for an inline checklist. */
  onCancel?: () => void
  /** Controlled checked state, one boolean per item in order. Use with `onCheckedChange`. */
  checked?: boolean[]
  /** Called with the full list of checked states whenever a box changes. */
  onCheckedChange?: (checked: boolean[]) => void
  /** The heading. It names the group. Say what is about to happen: "Before you publish config v43". Default `Before you continue`. */
  title?: ReactNode
  /** Supporting line under the title, such as what the action affects. It describes the group. */
  description?: ReactNode
  /** Shows the environment badge on the right of the header. Use it when the action touches production. */
  env?: 'prod' | 'staging' | 'dev'
}

/** More than this and people stop reading and start ticking. */
const MAX_ITEMS = 7
let warned = false

// `process.env.NODE_ENV` is replaced by the app's bundler. Without one it does not exist, so stay quiet.
declare const process: { env: { NODE_ENV?: string } }
function isDev() {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

/**
 * A short checklist at the moment of a risky action. The action button unlocks only when every
 * item is checked, and "2 of 4 checked" is announced as it changes. A `fieldset` named by its title.
 * Keep to three to five checks; show evidence for any the system already verified.
 */
export function PausePoint({
  items,
  action,
  onConfirm,
  onComplete,
  onCancel,
  checked: checkedProp,
  onCheckedChange,
  title = 'Before you continue',
  description,
  env,
  className,
  ...props
}: PausePointProps) {
  const id = useId()
  const [checked, setChecked] = useControllable<boolean[]>({
    value: checkedProp,
    defaultValue: items.map((item) => typeof item !== 'string' && item.verified === true),
    onChange: onCheckedChange,
  })
  const done = items.filter((_, i) => checked[i]).length
  const complete = items.length > 0 && done === items.length

  const completed = useRef({ was: complete, onComplete })
  completed.current.onComplete = onComplete
  useEffect(() => {
    if (complete && !completed.current.was) completed.current.onComplete?.()
    completed.current.was = complete
  }, [complete])

  useEffect(() => {
    if (items.length > MAX_ITEMS && !warned && isDev()) {
      warned = true
      console.warn(
        `PausePoint: ${items.length} items. Long checklists get ticked without being read. Keep it to three to five.`,
      )
    }
  }, [items.length])

  const toggle = (index: number, on: boolean) => setChecked(items.map((_, i) => (i === index ? on : checked[i] === true)))

  return (
    <fieldset
      data-tone="neutral"
      aria-labelledby={`${id}t`}
      aria-describedby={description ? `${id}d` : undefined}
      className={cn(
        'm-0 min-w-0 overflow-hidden rounded-card border border-border bg-surface-raised p-0 text-fg shadow-mid',
        className,
      )}
      {...props}
    >
      {/* A floated legend is rendered as a plain block, so the header can use a normal flex layout. */}
      <legend className="float-left w-full p-0">
        <span className="flex items-center gap-3 px-[18px] pt-[18px] pb-3.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-accent-soft text-accent-fg"
          >
            <PauseIcon />
          </span>
          <span className="min-w-0">
            <span id={`${id}t`} className="block font-semibold">
              {title}
            </span>
            {description ? (
              <span id={`${id}d`} className="block text-ui-sm font-normal text-fg-muted">
                {description}
              </span>
            ) : null}
          </span>
          {env ? <EnvironmentBadge env={env} className="ml-auto" /> : null}
        </span>
      </legend>
      <ul className="clear-both m-0 list-none px-2.5 pt-0 pb-2">
        {items.map((item, i) => {
          const text = typeof item === 'string' ? item : item.label
          const evidence = typeof item === 'string' ? null : item.evidence
          return (
            <li key={`${i}-${text}`} className="rounded-[9px] px-2 py-2.5 not-first:border-t hover:bg-surface-sunken">
              <Checkbox
                checked={checked[i] === true}
                onCheckedChange={(on) => toggle(i, on)}
                className="flex w-full items-start gap-3 [&>input]:mt-px"
              >
                <span>
                  {text}
                  {evidence ? <span className="mt-0.5 block text-ui-sm text-fg-muted">{evidence}</span> : null}
                </span>
              </Checkbox>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-border bg-surface-sunken px-[18px] py-3.5">
        <span role="status" className="font-mono text-ui-sm text-fg-muted tabular-nums">
          {`${done} of ${items.length} checked`}
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
          {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
          <Button variant="primary" disabled={!complete} onClick={() => onConfirm?.()}>
            {action}
          </Button>
        </span>
      </div>
    </fieldset>
  )
}
