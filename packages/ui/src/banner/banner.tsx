'use client'

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { ToneIcon } from '../badge/badge.tsx'
import { IconButton } from '../icon-button/index.ts'
import { XIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { toneOf, type Intent, type Severity } from '../lib/tone.ts'

export type BannerProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** Colour and icon. Critical banners are announced at once (`role="alert"`); the others are polite (`role="status"`). Wins over `intent`. Default `info`. */
  severity?: Severity
  /** Familiar colour names: `primary`, `secondary`, `success`, `warning`, `danger`. Same as the matching severity. */
  intent?: Intent
  /** One-line summary, in bold. Say what happened and to what. Required. */
  title: string
  /** One action, usually a small `Button`. It sits under the message. */
  action?: ReactNode
  /** Called when the close button is pressed. The close button only shows when this is set. */
  onDismiss?: () => void
  /** Accessible name of the close button. Default `Dismiss`. */
  dismissLabel?: string
  /** Icon before the title. Defaults to the severity icon; pass `false` to hide it or a node to replace it. Decorative. */
  icon?: ReactNode | false
  /** `solid` fills the whole banner, for wall displays where the alert must be seen across the room. Default `soft`. */
  variant?: 'soft' | 'solid'
}

/**
 * A message across a page or section that stays until it is resolved or dismissed. `children` is the
 * body text. Group repeated causes into one banner with a count, and don't stack more than two.
 */
export function Banner({
  severity,
  intent,
  title,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  icon,
  variant = 'soft',
  className,
  children,
  ...props
}: BannerProps) {
  const tone = toneOf(severity, intent, 'info')
  const solid = variant === 'solid'
  // Title only (no body, no action): a compact one-line banner.
  const compact = !children && !action
  return (
    <div
      role={tone === 'critical' ? 'alert' : 'status'}
      data-tone={tone}
      className={cn(
        'flex items-start gap-3 rounded-[12px] px-4 py-[13px]',
        solid
          ? 'bg-tone text-tone-on'
          : 'bg-tone-soft text-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--s-border),transparent_30%)]',
        compact && 'items-center',
        className,
      )}
      {...props}
    >
      <ToneIcon tone={tone} icon={icon} size={18} solid={solid} className={cn('mt-px', solid ? 'text-tone-on' : 'text-tone-fg')} />
      <div className="min-w-0 flex-1">
        <strong className={cn('block font-semibold', !compact && 'mb-0.5', !solid && 'text-fg')}>{title}</strong>
        {children ? (
          <div className={cn('text-ui-sm leading-normal', !solid && 'text-fg-muted')}>{children}</div>
        ) : null}
        {action ? <div className="mt-2.5 flex gap-1.5">{action}</div> : null}
      </div>
      {onDismiss ? (
        <IconButton
          variant="ghost"
          size="sm"
          label={dismissLabel}
          icon={<XIcon />}
          onClick={onDismiss}
          className={cn(!compact && '-mt-1 -mr-1.5', solid && 'text-inherit hover:bg-white/15 hover:text-inherit')}
        />
      ) : null}
    </div>
  )
}
