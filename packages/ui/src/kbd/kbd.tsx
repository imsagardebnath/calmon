'use client'

import { Children, Fragment, useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'

const CAP =
  'inline-grid h-5 min-w-5 place-items-center rounded-[5px] bg-surface-raised px-[5px] font-mono text-[10.5px] ' +
  'leading-none text-fg-muted shadow-[inset_0_0_0_1px_var(--border-strong),0_1px_0_var(--border-strong)]'

export type KbdProps = Omit<ComponentPropsWithRef<'kbd'>, 'children'> & {
  /**
   * The key name, for example `Esc` or `K`. For a shortcut, pass a `+`-separated string
   * (`Ctrl+K`) or several children: each part becomes its own key cap. The key `mod` shows
   * `⌘` on Apple platforms and `Ctrl` elsewhere.
   */
  children: ReactNode
}

const isMod = (part: ReactNode) => typeof part === 'string' && part.toLowerCase() === 'mod'

/** Apple platform check. Runs in an effect so server and first client render agree (both show Ctrl). */
function useIsApple(needed: boolean) {
  const [apple, setApple] = useState(false)
  useEffect(() => {
    if (needed) setApple(/Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent))
  }, [needed])
  return apple
}

/**
 * A keyboard key cap, or a shortcut made of several caps. Show the key of the reader's own
 * platform: use `mod` for Cmd on a Mac and Ctrl elsewhere.
 */
export function Kbd({ children, className, ...props }: KbdProps) {
  const parts = Children.toArray(children).flatMap((c) =>
    typeof c === 'string' ? c.split(/(?!^)\+(?=.)/).map((s) => s.trim()) : [c],
  )
  const apple = useIsApple(parts.some(isMod))
  const keys = parts.map((p) => (isMod(p) ? (apple ? '⌘' : 'Ctrl') : p))

  if (keys.length < 2) {
    return (
      <kbd className={cn(CAP, className)} {...props}>
        {keys}
      </kbd>
    )
  }
  return (
    <kbd className={cn('inline-flex items-center gap-1', className)} {...props}>
      {keys.map((key, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sr-only">+</span>}
          <kbd className={CAP}>{key}</kbd>
        </Fragment>
      ))}
    </kbd>
  )
}
