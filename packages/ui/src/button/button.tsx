'use client'

import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn.ts'
import { Slot } from '../lib/slot.tsx'
import { toneOf, type Intent, type Severity } from '../lib/tone.ts'

/*
 * Colour comes from data-tone (see styles.css): bg-tone, text-tone-on, text-tone-fg, ...
 * Full class strings are written out so Tailwind's scanner can find every class.
 */
const SOLID =
  'bg-linear-to-b from-white/10 to-white/0 bg-tone text-tone-on ' +
  'shadow-[inset_0_1px_0_rgb(255_255_255/.18),0_0_0_1px_color-mix(in_oklab,var(--s),#000_12%),0_1px_2px_color-mix(in_oklab,var(--s),transparent_60%)] ' +
  'hover:bg-[color:color-mix(in_oklab,var(--s),#000_9%)] dark:hover:bg-[color:color-mix(in_oklab,var(--s),#fff_12%)]'

/**
 * Greyed-out look, for a native `disabled` button and for an `aria-disabled` link (asChild).
 * Skipped while loading so a loading button keeps its colour: it stays focusable and is marked aria-disabled.
 */
const DISABLED =
  '[&:disabled:not([data-loading])]:cursor-not-allowed [&:disabled:not([data-loading])]:bg-none ' +
  '[&:disabled:not([data-loading])]:bg-surface-sunken [&:disabled:not([data-loading])]:text-fg-subtle ' +
  '[&:disabled:not([data-loading])]:shadow-[0_0_0_1px_var(--border)] [&:disabled:not([data-loading])]:active:translate-y-0 ' +
  'not-data-loading:aria-disabled:cursor-not-allowed not-data-loading:aria-disabled:bg-none ' +
  'not-data-loading:aria-disabled:bg-surface-sunken not-data-loading:aria-disabled:text-fg-subtle ' +
  'not-data-loading:aria-disabled:shadow-[0_0_0_1px_var(--border)] not-data-loading:aria-disabled:pointer-events-none'

/** A loading or aria-disabled control stays in the tab order, so its clicks are swallowed here instead. */
const swallow = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap select-none no-underline',
    'font-[550] tracking-[-0.005em] transition-[background-color,box-shadow,color,transform]',
    'duration-(--duration-fast) ease-pikore active:translate-y-[.5px] data-loading:pointer-events-none',
    DISABLED,
  ],
  {
    variants: {
      variant: { primary: '', secondary: '', ghost: '' },
      toned: { true: '', false: '' },
      size: {
        // Unset: follow the page density (see --btn-* in styles.css).
        auto: 'h-(--btn-h) px-(--btn-px) text-(length:--btn-fs) rounded-(--btn-radius)',
        sm: 'h-[30px] px-[11px] text-ui-sm rounded-[7px]',
        md: 'h-9 px-3.5 text-ui rounded-control',
        lg: 'h-11 px-5 text-base rounded-[10px]',
      },
    },
    compoundVariants: [
      { variant: 'primary', class: SOLID },
      {
        variant: 'secondary',
        toned: false,
        class: 'bg-surface-raised text-fg shadow-[0_0_0_1px_var(--border-strong),var(--shadow-1)] hover:bg-surface-sunken',
      },
      {
        variant: 'secondary',
        toned: true,
        class: 'bg-surface-raised text-tone-fg shadow-[inset_0_0_0_1px_var(--s-border),var(--shadow-1)] hover:bg-tone-soft',
      },
      { variant: 'ghost', toned: false, class: 'bg-transparent text-fg-muted hover:bg-surface-sunken hover:text-fg' },
      { variant: 'ghost', toned: true, class: 'bg-transparent text-tone-fg hover:bg-tone-soft' },
    ],
    defaultVariants: { variant: 'secondary', toned: false, size: 'auto' },
  },
)

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> &
  Pick<VariantProps<typeof buttonVariants>, 'variant' | 'size'> & {
    /** Visual emphasis. `primary` for the one main action in a view, `ghost` for the quietest. Default `secondary`. */
    variant?: 'primary' | 'secondary' | 'ghost'
    /** Height: 30, 36 or 44px. Follows the page `density` when unset. */
    size?: 'sm' | 'md' | 'lg'
    /** Overrides the colour for risky or status actions. Use `critical` for destructive ones and confirm them. */
    severity?: Severity
    /** Familiar colour names: `primary`, `secondary`, `success`, `warning`, `danger`. Same as the matching severity. */
    intent?: Intent
    /**
     * Shows a spinner, sets `aria-busy`, and blocks clicks. The label stays visible. The button keeps keyboard
     * focus (it is `aria-disabled`, not natively disabled), so focus is not lost when loading starts. Default `false`.
     */
    loading?: boolean
    /** Icon before the label. Decorative: hidden from screen readers. */
    iconStart?: ReactNode
    /** Icon after the label. Decorative: hidden from screen readers. */
    iconEnd?: ReactNode
    /**
     * Render the single child element (an `<a>` or a router `<Link>`) with button styles instead of a
     * `<button>`. `loading`, `iconStart` and `iconEnd` are ignored. A link cannot be natively disabled, so
     * `disabled` sets `aria-disabled`, takes the link out of the tab order and blocks its click.
     */
    asChild?: boolean
    children?: ReactNode
  }

/**
 * Starts an action. Defaults to `type="button"` so it never submits a form by accident;
 * pass `type="submit"` explicitly inside forms.
 */
export function Button({
  variant = 'secondary',
  size,
  severity,
  intent,
  loading = false,
  iconStart,
  iconEnd,
  asChild = false,
  disabled,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const tone = toneOf(severity, intent, null)
  const dataTone = tone ?? (variant === 'primary' ? 'accent' : 'neutral')
  // The neutral tone (`intent="secondary"`) is the untoned look, so it must not pick the toned styles.
  const classes = cn(buttonVariants({ variant, toned: tone !== null && tone !== 'neutral', size: size ?? 'auto' }), className)

  if (asChild) {
    return (
      <Slot
        data-tone={dataTone}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? swallow : onClick}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      type={type}
      data-tone={dataTone}
      data-loading={loading || undefined}
      className={classes}
      disabled={disabled}
      aria-disabled={loading && !disabled ? true : undefined}
      aria-busy={loading || undefined}
      onClick={loading ? swallow : onClick}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-3.5 animate-pikore-spin rounded-full border-2 border-current/25 border-t-current"
        />
      ) : iconStart ? (
        <span aria-hidden="true" className="inline-flex">
          {iconStart}
        </span>
      ) : null}
      {children}
      {iconEnd && !loading ? (
        <span aria-hidden="true" className="inline-flex">
          {iconEnd}
        </span>
      ) : null}
    </button>
  )
}
