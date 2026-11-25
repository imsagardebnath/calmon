'use client'

import { Children, isValidElement, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '../lib/cn.ts'

export type CardProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** Header text, rendered as a heading. The header appears when `title` or `action` is set. */
  title?: ReactNode
  /** Right side of the header: a status, a badge or a menu button. */
  action?: ReactNode
  /** Footer content, aligned to the right. Use it for the actions that apply to the whole card. */
  footer?: ReactNode
  /**
   * Heading level for `title`, from `h1` to `h6`. Choose the level that fits the page outline.
   * It only changes the tag, never the look. Default `h4`.
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * The card body. For a custom layout, pass `CardHeader`, `CardBody` and `CardFooter` as the
   * children instead: they are rendered as they are, with no extra body wrapper.
   */
  children?: ReactNode
}

const has = (node: ReactNode) => node != null && node !== false && node !== ''

/**
 * Groups related content on a raised surface, with an optional header and footer.
 * Keep to one topic per card, and do not nest cards.
 */
export function Card({ title, action, footer, as: Heading = 'h4', className, children, ...props }: CardProps) {
  const composed = Children.toArray(children).some(
    (c) => isValidElement(c) && (c.type === CardHeader || c.type === CardBody || c.type === CardFooter),
  )
  return (
    <div className={cn('rounded-card border border-border bg-surface-raised shadow-low', className)} {...props}>
      {(has(title) || has(action)) && (
        <CardHeader>
          {has(title) && (
            <Heading className="min-w-0 text-ui leading-[1.15] font-semibold tracking-[-0.018em]">{title}</Heading>
          )}
          {has(action) && <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div>}
        </CardHeader>
      )}
      {composed ? children : has(children) && <CardBody>{children}</CardBody>}
      {has(footer) && <CardFooter>{footer}</CardFooter>}
    </div>
  )
}

/** Top row of a card: a title and an action side by side, with a divider below. */
export function CardHeader({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('flex items-center gap-2.5 border-b border-border px-[18px] py-4', className)} {...props} />
}

/** The padded content area of a card. */
export function CardBody({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('p-[18px]', className)} {...props} />
}

/** Bottom row of a card: actions aligned to the right, with a divider above. */
export function CardFooter({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('flex flex-wrap justify-end gap-2 rounded-b-card border-t border-border px-[18px] py-3', className)}
      {...props}
    />
  )
}
