'use client'

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { SeverityIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITIES, toneOf, type Intent, type Severity, type Tone } from '../lib/tone.ts'

/** Pill shape shared by every variant. Colours come from data-tone (see styles.css). */
const BASE =
  'inline-flex h-[22px] items-center gap-[5px] rounded-pill pr-2 pl-[7px] text-xs font-[550] tracking-normal whitespace-nowrap'

const NEUTRAL = {
  soft: 'bg-surface-sunken text-fg-muted shadow-[inset_0_0_0_1px_var(--border)]',
  solid: 'bg-fg text-surface',
  outline: 'bg-surface-raised text-fg-muted shadow-[inset_0_0_0_1px_var(--border)]',
}

const TONED = {
  soft: 'bg-tone-soft text-tone-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--s-border),transparent_35%)]',
  solid: 'bg-tone text-tone-on',
  outline: 'bg-surface-raised text-tone-fg shadow-[inset_0_0_0_1px_var(--s-border)]',
}

const DOT =
  'bg-surface-raised text-fg shadow-[inset_0_0_0_1px_var(--border)] before:size-1.5 before:shrink-0 before:rounded-full before:bg-tone'

/**
 * The icon slot shared by Badge, Banner and Toast: the icon for the tone's severity, a custom icon,
 * or nothing. Internal: it is not exported from the package.
 */
export function ToneIcon({
  tone,
  icon,
  size,
  solid,
  className,
}: {
  tone: Tone
  icon?: ReactNode | false
  size: number
  solid?: boolean
  className?: string
}) {
  const auto = (SEVERITIES as readonly string[]).includes(tone)
  const node = icon === undefined && auto ? <SeverityIcon severity={tone as Severity} width={size} height={size} /> : icon
  if (!node) return null
  return (
    <span
      aria-hidden="true"
      // On a solid fill the critical octagon takes the "on" colour and its "!" the fill colour.
      className={cn('inline-flex shrink-0', solid && tone === 'critical' && '[--critical-on:var(--critical)]', className)}
    >
      {node}
    </span>
  )
}

export type BadgeProps = Omit<ComponentPropsWithRef<'span'>, 'color'> & {
  /** Colour and icon. Every severity has its own icon shape, so status is never colour alone. Wins over `intent`. */
  severity?: Severity
  /** Familiar colour names: `primary`, `secondary`, `success`, `warning`, `danger`. Same as the matching severity. */
  intent?: Intent
  /** Emphasis. `soft` is quiet, `solid` is loud (save it for problems), `outline` is light, `dot` is a coloured dot. Default `soft`. */
  variant?: 'soft' | 'solid' | 'outline' | 'dot'
  /**
   * Icon before the text. By default a severity badge shows its severity icon (the `dot` variant shows a dot
   * instead). Pass `false` to hide it, or any node to replace it. Decorative: hidden from screen readers.
   */
  icon?: ReactNode | false
}

/**
 * A short status label of one or two words. A badge with a severity always shows its icon or a dot
 * next to the text, so colour is never the only signal.
 */
export function Badge({ severity, intent, variant = 'soft', icon, className, children, ...props }: BadgeProps) {
  const tone = toneOf(severity, intent)
  const look = variant === 'dot' ? DOT : (tone === 'neutral' ? NEUTRAL : TONED)[variant]
  return (
    <span data-tone={tone} className={cn(BASE, look, className)} {...props}>
      <ToneIcon tone={tone} icon={icon ?? (variant === 'dot' ? false : undefined)} size={13} solid={variant === 'solid'} />
      {children}
    </span>
  )
}
