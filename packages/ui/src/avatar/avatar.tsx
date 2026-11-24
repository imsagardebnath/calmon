'use client'

import { useState, type ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'
import type { Tone } from '../lib/tone.ts'

/*
 * Soft tints for the initials. Caution and critical are left out on purpose: those colours
 * mean "act now" everywhere else in the library, and a person's avatar must never look like an alert.
 */
const TINTS: readonly Tone[] = ['neutral', 'accent', 'info', 'normal', 'advisory']

const SIZE = { sm: 'size-6 text-[10px]', md: 'size-8 text-xs', lg: 'size-11 text-ui' }

/** Deterministic: the same name always gets the same tint. */
function tintOf(name: string): Tone {
  let h = 0
  for (const c of name.trim().toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length] ?? 'neutral'
}

const first = (s: string | undefined) => Array.from(s ?? '')[0] ?? ''

/** "Priya Shah" -> "PS", "R. Iyer" -> "RI", "Platform" -> "PL". */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/)
  const text =
    words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : Array.from(words[0] ?? '').slice(0, 2).join('')
  return text.toUpperCase()
}

const face = (size: keyof typeof SIZE, className?: string) =>
  cn(
    'relative inline-grid shrink-0 place-items-center rounded-full bg-tone-soft font-semibold text-tone-fg',
    'shadow-[inset_0_0_0_1px_var(--s-border)]',
    SIZE[size],
    className,
  )

export type AvatarProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** Full name of the person or team. Required: it gives the initials, the tint and the accessible name. */
  name: string
  /** Presence dot. `online` is a filled dot, `away` is a hollow ring. It is added to the accessible name. Default none. */
  status?: 'online' | 'away'
  /** Image URL. When it is missing or fails to load, the initials are shown instead. */
  src?: string
  /** Diameter: 24, 32 or 44px. Default `md`. */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * A person or team, shown as an image or as initials on a soft tint. Always show the name
 * nearby: an avatar alone is a poor way to identify someone.
 */
export function Avatar({ name, status, src, size = 'md', className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState<string>()
  return (
    <span
      role="img"
      aria-label={status ? `${name}, ${status}` : name}
      data-tone={tintOf(name)}
      className={face(size, className)}
      {...props}
    >
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} className="size-full rounded-full object-cover" />
      ) : (
        initialsOf(name)
      )}
      {status && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -right-px -bottom-px size-2.5 rounded-full border-2',
            status === 'online'
              ? 'border-surface-raised bg-normal'
              : 'border-advisory bg-surface-raised shadow-[0_0_0_1.5px_var(--surface-raised)]',
          )}
        />
      )}
    </span>
  )
}

export type AvatarPerson = Pick<AvatarProps, 'name' | 'status' | 'src'>

export type AvatarGroupProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** The people to show, in order. Each one needs a `name`; `status` and `src` are optional. */
  people: AvatarPerson[]
  /** How many avatars to show. The rest collapse into a "+N" tail that names them for screen readers. Default 4. */
  max?: number
  /** Diameter of every avatar in the group. Default `md`. */
  size?: AvatarProps['size']
}

const OVERLAP = '-ml-2 shadow-[0_0_0_2px_var(--surface-raised)] first:ml-0'

/** Overlapping avatars for owners or assignees, with a "+N" tail for the people who do not fit. */
export function AvatarGroup({ people, max = 4, size = 'md', className, ...props }: AvatarGroupProps) {
  const rest = people.slice(Math.max(0, max))
  return (
    <div className={cn('flex', className)} {...props}>
      {people.slice(0, Math.max(0, max)).map((p, i) => (
        // Only the documented fields: a person object may carry more (id, role...) that must not reach the span.
        <Avatar key={`${p.name}-${i}`} size={size} className={OVERLAP} name={p.name} status={p.status} src={p.src} />
      ))}
      {rest.length > 0 && (
        <span
          role="img"
          aria-label={`${rest.length} more: ${rest.map((p) => p.name).join(', ')}`}
          data-tone="neutral"
          className={face(size, OVERLAP)}
        >
          +{rest.length}
        </span>
      )}
    </div>
  )
}
