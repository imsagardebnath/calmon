'use client'

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { Button, type ButtonProps } from '../button/button.tsx'
import { cn } from '../lib/cn.ts'

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> &
  Pick<ButtonProps, 'severity' | 'intent' | 'size'> & {
    /** Accessible name, also shown as the hover tooltip. Required: an icon alone has no name. */
    label: string
    /** The icon to show. Decorative: `label` provides the name. */
    icon: ReactNode
    /** Visual emphasis. Default `secondary`. */
    variant?: 'primary' | 'secondary' | 'ghost'
    /**
     * Replaces the icon with a spinner, sets `aria-busy`, and blocks clicks. The button keeps keyboard focus
     * and `label` stays its accessible name. Default `false`.
     */
    loading?: boolean
  }

/** A button that shows only an icon. Use it for repeated, well-known actions in toolbars and table rows. */
export function IconButton({ label, icon, size, loading, className, ...props }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={label}
      size={size}
      loading={loading}
      className={cn(
        'p-0',
        size === 'sm' ? 'w-[30px]' : size === 'md' ? 'w-9' : size === 'lg' ? 'w-11' : 'w-(--btn-h)',
        className,
      )}
      {...props}
    >
      {loading ? null : (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      )}
    </Button>
  )
}
