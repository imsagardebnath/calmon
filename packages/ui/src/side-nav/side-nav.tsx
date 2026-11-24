'use client'

import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '../lib/cn.ts'
import { Slot } from '../lib/slot.tsx'
import { SEVERITY_LABEL, type Severity } from '../lib/tone.ts'

/** Whether the nav is an icon rail, and how deep the current group is. */
const NavContext = createContext({ collapsed: false, depth: 0 })

export type SideNavProps = ComponentPropsWithRef<'nav'> & {
  /** Shows an icon-only rail. Labels stay in the page for screen readers and appear as tooltips. Default `false`. */
  collapsed?: boolean
}

/**
 * The main app navigation: groups of links with icons and alert counts. Name it with `aria-label`
 * (default "Main") when the page has more than one navigation.
 */
export function SideNav({ collapsed = false, className, 'aria-label': label = 'Main', ...props }: SideNavProps) {
  return (
    <NavContext value={{ collapsed, depth: 0 }}>
      <nav
        aria-label={label}
        data-collapsed={collapsed || undefined}
        className={cn('flex flex-col gap-px text-ui-sm', collapsed && 'w-14 items-center', className)}
        {...props}
      />
    </NavContext>
  )
}

export type SideNavGroupProps = Omit<ComponentPropsWithRef<'div'>, 'role'> & {
  /** Heading of the group. A group inside another group gets a smaller sub-heading and its items are indented. */
  label: string
}

/** A titled set of items. In a collapsed rail the heading is read out but not shown, and a line separates groups. */
export function SideNavGroup({ label, className, children, ...props }: SideNavGroupProps) {
  const { collapsed, depth } = use(NavContext)
  const id = useId()
  return (
    <NavContext value={{ collapsed, depth: depth + 1 }}>
      <div
        role="group"
        aria-labelledby={id}
        className={cn(
          'flex flex-col gap-px first:[&>:first-child]:pt-0',
          depth > 0 && 'pl-6',
          collapsed && 'items-center [&:not(:first-child)]:mt-2 [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-2',
          className,
        )}
        {...props}
      >
        <div
          id={id}
          className={cn(
            depth === 0
              ? 'px-2.5 pt-[18px] pb-1.5 text-xs font-semibold text-fg-subtle'
              : 'px-2.5 pt-2.5 pb-1 text-[11.5px] font-[550] text-fg-subtle',
            collapsed && 'sr-only',
          )}
        >
          {label}
        </div>
        {children}
      </div>
    </NavContext>
  )
}

export type SideNavItemProps = Omit<ComponentPropsWithRef<'a'>, 'children'> & {
  /** Icon before the label. Decorative: hidden from screen readers. Required in a collapsed rail. */
  icon?: ReactNode
  /** Marks this item as the current page (`aria-current="page"`). Router links that set it themselves need no `active`. */
  active?: boolean
  /** An alert count: the number is always shown, and the severity name is read out. Show it only when it needs action. */
  badge?: { severity: Severity; count: number }
  /**
   * Render the single child element (an `<a>` or a router `<Link>`) as the item, keeping its icon and badge. The child must
   * pass `className`, `aria-current` and `title` on to its element. When the child is not a single element, `asChild`
   * is ignored and the item renders as a normal link or button. Default `false`.
   */
  asChild?: boolean
  /** The label. With `asChild`, the link element that holds the label. */
  children?: ReactNode
}

const ITEM =
  'group/item relative flex w-full cursor-pointer items-center gap-[9px] rounded-[7px] bg-transparent px-2.5 py-1.5 text-left ' +
  'text-fg-muted no-underline transition-colors duration-(--duration-fast) ' +
  '[&:not([aria-current=page])]:hover:bg-surface-sunken [&:not([aria-current=page])]:hover:text-fg ' +
  'aria-[current=page]:bg-surface-raised aria-[current=page]:font-[550] aria-[current=page]:text-fg ' +
  'aria-[current=page]:shadow-[0_0_0_1px_var(--border),var(--shadow-1)]'

const RAIL = 'size-9 justify-center p-0'

/** The label as a tooltip, shown on keyboard focus. (On hover the browser shows the `title`.) */
const TIP =
  'pointer-events-none absolute top-1/2 left-full z-10 ml-2 -translate-y-1/2 rounded-md bg-fg px-[9px] py-1.5 text-xs font-medium ' +
  'whitespace-nowrap text-surface opacity-0 shadow-mid transition-opacity duration-(--duration-fast) group-focus-visible/item:opacity-100'

/** The plain text of a label, for the tooltip. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** One link in the nav. With no `href` it renders a button, for items that run an action. */
export function SideNavItem({ icon, active, badge, asChild = false, className, children, ...props }: SideNavItemProps) {
  const { collapsed } = use(NavContext)
  const shared = {
    'aria-current': active ? ('page' as const) : undefined,
    className: cn(ITEM, collapsed && RAIL, className),
  }
  // In a collapsed rail the label is only a tooltip: the `title` for hover, and a visible tip for keyboard focus.
  const tip = (label: ReactNode) => (collapsed ? textOf(label) || undefined : undefined)
  const inside = (label: ReactNode) => (
    <>
      {icon ? (
        <span aria-hidden="true" className="inline-flex text-fg-subtle group-aria-[current=page]/item:text-accent-fg">
          {icon}
        </span>
      ) : null}
      <span className={collapsed ? 'sr-only' : 'min-w-0 truncate'}>{label}</span>
      {badge ? (
        <span
          data-tone={badge.severity}
          className={cn(
            'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-tone px-1.5 text-[10.5px] leading-none font-[550] text-tone-on',
            collapsed ? 'absolute top-0 right-0 h-4 min-w-4 px-1 text-[9.5px]' : 'ml-auto',
          )}
        >
          {badge.count}
          <span className="sr-only"> {SEVERITY_LABEL[badge.severity]}</span>
        </span>
      ) : null}
      {tip(label) ? (
        <span aria-hidden="true" className={TIP}>
          {tip(label)}
        </span>
      ) : null}
    </>
  )

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ children?: ReactNode }>
    return (
      <Slot title={tip(child.props.children)} {...shared} {...props}>
        {cloneElement(child, undefined, inside(child.props.children))}
      </Slot>
    )
  }
  if (props.href === undefined) {
    // No link target: a button, so the item can still run an action with the keyboard.
    return (
      <button
        type="button"
        title={tip(children)}
        {...shared}
        {...(props as unknown as ComponentPropsWithRef<'button'>)}
      >
        {inside(children)}
      </button>
    )
  }
  return (
    <a title={tip(children)} {...shared} {...props}>
      {inside(children)}
    </a>
  )
}
