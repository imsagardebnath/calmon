'use client'

import type { ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'

const SIZE = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-8 border-[2.5px]',
}

/**
 * The spinning ring: a faint track with an accent arc. The loading Toast draws the same ring, so the two
 * look alike. Internal: it is not exported from the package.
 */
export const SPIN_RING = 'animate-pikore-spin rounded-full border-accent/20 border-t-accent'

export type SpinnerProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** Diameter: 16, 20 or 32px. Default `md`. */
  size?: 'sm' | 'md' | 'lg'
  /** Text for screen readers, visually hidden. Say what is loading. Default `Loading`. */
  label?: string
}

/**
 * Shows a short wait of under a few seconds. For longer work show progress, and for page content use
 * Skeleton. Delay showing it by about 300ms to avoid flicker.
 */
export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn('inline-block shrink-0', SPIN_RING, SIZE[size], className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}
