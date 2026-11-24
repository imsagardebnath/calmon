import { cva } from 'class-variance-authority'

// `.input` in the design. Precedence: hover < focus < warning (data-tone) < error (aria-invalid); disabled shows none.
// The warning and error rules out-rank the focus rule, so each has its own focus-visible shadow: a focused control
// keeps its warning or error border and gets a stronger ring in that colour, so focus stays visible in every state.
export const inputBase =
  'block w-full min-w-0 rounded-control border border-border-strong bg-surface-raised text-fg ' +
  'shadow-[0_1px_2px_rgb(16_24_40/.04)] transition-[border-color,box-shadow] duration-(--duration-fast) ' +
  'placeholder:text-fg-subtle dark:bg-surface-sunken dark:shadow-none ' +
  'hover:border-[color-mix(in_oklab,var(--border-strong),var(--fg)_25%)] ' +
  'focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--ring),transparent_82%)] focus-visible:outline-none ' +
  'enabled:data-[tone=caution]:border-caution enabled:data-[tone=caution]:shadow-[0_0_0_4px_color-mix(in_oklab,var(--caution),transparent_88%)] ' +
  'enabled:data-[tone=caution]:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--caution),transparent_65%)] ' +
  'enabled:aria-invalid:border-critical enabled:aria-invalid:shadow-[0_0_0_4px_color-mix(in_oklab,var(--critical),transparent_88%)] ' +
  'enabled:aria-invalid:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--critical),transparent_65%)] ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-sunken disabled:text-fg-subtle disabled:shadow-none'

/** Height, padding and font size. `auto` follows the page density (`--control-*` in styles.css). */
export const inputVariants = cva(inputBase, {
  variants: {
    size: {
      auto: 'h-(--control-h) px-(--control-px) text-(length:--control-fs)',
      sm: 'h-[30px] px-[9px] text-ui-sm',
      md: 'h-[38px] px-3 text-ui',
      lg: 'h-11 px-3.5 text-base',
    },
  },
  defaultVariants: { size: 'auto' },
})
