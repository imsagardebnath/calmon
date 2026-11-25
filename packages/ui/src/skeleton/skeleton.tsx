'use client'

import type { ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'

/** The shimmering placeholder fill: a soft gradient that slides across (`animate-pikore-shim`). */
const FILL =
  'rounded-[6px] bg-[linear-gradient(90deg,var(--surface-sunken)_0%,color-mix(in_oklab,var(--border),var(--surface-sunken))_50%,var(--surface-sunken)_100%)] bg-[length:200%_100%] animate-pikore-shim'

/** Widths of the last line and the one before it. Earlier lines are full width. */
const TAPER = ['w-[45%]', 'w-[70%]']

export type SkeletonProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Number of text lines. The last two lines are shorter, like a paragraph. Default 1. */
  lines?: number
  /** Round shape, for avatars. Use `size` for the diameter. Default false. */
  circle?: boolean
  /**
   * Circle diameter, or the height of each line, as a number of px or a CSS length.
   * Default 36px for a circle and 10px for a line.
   */
  size?: number | string
}

/**
 * A placeholder in the shape of content that is loading, so the layout doesn't jump. It is hidden
 * from screen readers: set `aria-busy="true"` on the container that is loading instead.
 */
export function Skeleton({ lines = 1, circle = false, size, className, style, ...props }: SkeletonProps) {
  if (circle) {
    const d = size ?? 36
    return <div aria-hidden="true" className={cn(FILL, 'shrink-0 rounded-full', className)} style={{ width: d, height: d, ...style }} {...props} />
  }
  const height = size === undefined ? undefined : { height: size }
  if (lines <= 1) {
    return <div aria-hidden="true" className={cn(FILL, 'h-2.5 w-full', className)} style={{ ...height, ...style }} {...props} />
  }
  return (
    <div aria-hidden="true" className={cn('flex w-full flex-col gap-1.5', className)} style={style} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={cn(FILL, 'h-2.5', TAPER[lines - 1 - i] ?? 'w-full')} style={height} />
      ))}
    </div>
  )
}
