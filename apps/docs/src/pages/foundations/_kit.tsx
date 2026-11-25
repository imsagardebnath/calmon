// Shared building blocks for the Foundations pages: headings, copy, callouts, specimen frames, tables,
// link cards and colour swatches. Underscore files are not routes.
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Badge } from '@openvanta/pikore-react/badge'
import { Button } from '@openvanta/pikore-react/button'
import { Code } from '@openvanta/pikore-react/code'
import { CheckIcon, CopyIcon, GridIcon, XIcon } from '@openvanta/pikore-react/icons'
import { entries } from '../../registry.ts'
import { formatRatio, showValue } from './_tokens.ts'

/* ------------------------------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------------------------------- */

/** Same rules as the docs layout, so an id written here matches the one the layout and search compute. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** "HealthScore" becomes "health-score": the route id of a component page. */
export const componentSlug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/** Page body wrapper: the layout renders the h1 and description, the body starts here. */
export function Page({ children }: { children: ReactNode }) {
  return <div className="[&>h2:first-child]:mt-8">{children}</div>
}

/**
 * Class names for a section heading. Pages write a literal `<h2 id="kebab-case-text" className={H2}>Text</h2>`
 * (not a component) for two reasons: the id lets the "On this page" list link to it, and the docs search finds
 * headings by reading `<h2>` elements in the page source.
 */
export const H2 = 'mt-16 mb-3 scroll-mt-20 text-2xl leading-[1.15] font-semibold tracking-[-0.02em]'

export function H3({ children, id, className = '' }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h3 id={id} className={`mt-8 mb-2 scroll-mt-20 text-lg leading-[1.15] font-semibold tracking-[-0.018em] ${className}`}>
      {children}
    </h3>
  )
}

/** Intro paragraph under a heading. */
export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mb-5 max-w-[68ch] leading-[1.65] text-fg-muted ${className}`}>{children}</p>
}

/** Strong text inside muted copy. */
export function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-fg">{children}</strong>
}

export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="mb-4 max-w-[68ch] list-disc pl-5 leading-[1.7] text-fg-muted marker:text-fg-subtle">{children}</ul>
}

/** Inline code. */
export function C({ children }: { children: string }) {
  return <Code inline>{children}</Code>
}

/** A link in running text. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-accent-fg underline decoration-1 underline-offset-[3px] hover:decoration-2">
      {children}
    </a>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Frames
 * ---------------------------------------------------------------------------------------------- */

/** A raised, bordered card for a specimen, with an optional title. */
export function Specimen({
  title,
  children,
  className = '',
  ...props
}: { title?: ReactNode; children: ReactNode } & ComponentPropsWithoutRef<'div'>) {
  return (
    // data-no-prose keeps the page prose styles (the docs layout's h2 and h3 rules) off the title inside.
    <div data-no-prose className={`rounded-card border border-border bg-surface-raised p-6 shadow-low ${className}`} {...props}>
      {title ? <h3 className="mb-5 text-ui leading-[1.15] font-semibold tracking-[-0.018em]">{title}</h3> : null}
      {children}
    </div>
  )
}

/** A note with an icon, on a sunken surface. */
export function Callout({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-xl bg-surface-sunken px-4 py-3.5 text-ui-sm leading-[1.6] text-fg-muted shadow-[inset_0_0_0_1px_var(--border)]">
      {icon ? (
        <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-accent-fg">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/** Do and Don't, side by side. Each side is a card with a coloured top edge, a word and an icon (never colour alone). */
export function DoDont({
  doPreview,
  dontPreview,
  doText,
  dontText,
}: {
  doPreview?: ReactNode
  dontPreview?: ReactNode
  doText: ReactNode
  dontText: ReactNode
}) {
  const side = (tone: 'normal' | 'critical', label: string, icon: ReactNode, preview: ReactNode, text: ReactNode) => (
    <div data-tone={tone} className="overflow-hidden rounded-card bg-surface-raised shadow-[0_0_0_1px_var(--border)]">
      {preview ? (
        <div className="flex min-h-[110px] flex-wrap items-center justify-center gap-2.5 bg-surface p-6">{preview}</div>
      ) : null}
      <div className="border-t-[3px] border-tone px-4 py-3 text-ui-sm leading-[1.55] text-fg-muted">
        <b className="mb-0.5 flex items-center gap-1.5 text-tone-fg">
          {icon}
          {label}
        </b>
        {text}
      </div>
    </div>
  )
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {side('normal', 'Do', <CheckIcon />, doPreview, doText)}
      {side('critical', 'Don’t', <XIcon />, dontPreview, dontText)}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Tables (the design's table.t, in a rounded wrapper)
 * ---------------------------------------------------------------------------------------------- */

export function TableWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-card border border-border bg-surface-raised ${className}`}>
      <table className="w-full border-collapse text-ui-sm [&_tbody_tr:last-child_td]:border-b-0">{children}</table>
    </div>
  )
}

export function Th({ className = '', ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className={`border-b border-border px-3.5 py-[11px] text-left text-xs font-[550] whitespace-nowrap text-fg-subtle ${className}`}
      {...props}
    />
  )
}

export function Td({ className = '', ...props }: ComponentPropsWithoutRef<'td'>) {
  return <td className={`border-b border-border px-3.5 py-[11px] align-middle ${className}`} {...props} />
}

/* ------------------------------------------------------------------------------------------------
 * Links to other pages
 * ---------------------------------------------------------------------------------------------- */

export function LinkCards({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">{children}</div>
}

export function LinkCard({ href, icon, title, children }: { href: string; icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      className="flex flex-col gap-1.5 rounded-card bg-surface-raised p-[18px] text-fg no-underline shadow-[0_0_0_1px_var(--border),var(--shadow-1)] transition-[box-shadow,transform] duration-(--duration-base) ease-pikore hover:-translate-y-px hover:shadow-[0_0_0_1px_var(--border-strong),var(--shadow-2)]"
    >
      <span aria-hidden="true" className="mb-1.5 grid size-9 place-items-center rounded-[10px] bg-accent-soft text-accent-fg">
        {icon ?? <GridIcon width={20} height={20} />}
      </span>
      <b className="font-semibold">{title}</b>
      {children ? <span className="text-ui-sm leading-[1.5] text-fg-muted">{children}</span> : null}
    </a>
  )
}

/**
 * Cards linking to component pages. Only components that have a doc page are shown, so a link is never dead.
 * `names` are the component names as written in the docs, such as "HealthScore" or "Button".
 */
export function ComponentLinks({ names }: { names: string[] }) {
  const found = names.flatMap((n) => {
    const slug = componentSlug(n)
    const e = entries.find((x) => x.slug === slug)
    return e ? [{ slug, name: e.name, description: e.description }] : []
  })
  if (found.length === 0) return null
  return (
    <LinkCards>
      {found.map((c) => (
        <LinkCard key={c.slug} href={`#/docs/${c.slug}`} title={c.name}>
          {c.description}
        </LinkCard>
      ))}
    </LinkCards>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Copy and announcements
 * ---------------------------------------------------------------------------------------------- */

let region: HTMLElement | null = null

/** Say something to screen readers through one shared polite live region. */
export function announce(message: string) {
  if (typeof document === 'undefined') return
  if (!region || !region.isConnected) {
    region = document.createElement('div')
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    region.className = 'sr-only'
    document.body.appendChild(region)
  }
  const target = region
  target.textContent = ''
  window.setTimeout(() => {
    target.textContent = message
  }, 30)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API needs a secure context. Fall back to a hidden textarea.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

/** `[copied, copy]`: copy text and show "copied" for a moment. */
export function useCopy(ms = 1400): [boolean, (text: string, message?: string) => void] {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = (text: string, message = 'Copied') => {
    void copyText(text).then((ok) => {
      if (!ok) return
      setCopied(true)
      announce(message)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), ms)
    })
  }
  return [copied, copy]
}

/** A small ghost button that copies text and says so, in words, to everyone. */
export function CopyButton({ text, label = 'Copy', message = 'Copied', className }: { text: string; label?: string; message?: string; className?: string }) {
  const [copied, copy] = useCopy(2000)
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      iconStart={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={() => copy(text, message)}
    >
      {copied ? 'Copied' : label}
    </Button>
  )
}

/**
 * A code block with a title bar and a copy button for the whole text, for blocks too long to show in full
 * (the block scrolls inside `maxHeight`).
 */
export function CodeFrame({
  title,
  text,
  language = 'css',
  maxHeight = 420,
  copyLabel = 'Copy',
}: {
  title: string
  text: string
  language?: string
  maxHeight?: number
  copyLabel?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-sunken">
      <div className="flex items-center gap-2 border-b border-border bg-surface-raised py-1.5 pr-2 pl-3.5 text-xs text-fg-subtle">
        <span className="min-w-0 truncate">{title}</span>
        <CopyButton text={text} label={copyLabel} message={`Copied ${title}`} className="ml-auto" />
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <Code language={language} copyable={false} className="rounded-none border-0 bg-transparent">
          {text}
        </Code>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Colour
 * ---------------------------------------------------------------------------------------------- */

/** A swatch and its hex code. Click to copy the code. `value` is any CSS colour; empty while tokens load. */
export function HexButton({ value, label }: { value: string | undefined; label?: string }) {
  const [copied, copy] = useCopy()
  if (!value) return <span className="text-fg-subtle">…</span>
  const shown = showValue(value)
  return (
    <button
      type="button"
      onClick={() => copy(shown, `Copied ${shown}`)}
      title={`Copy ${shown}`}
      aria-label={`Copy ${label ? label + ' ' : ''}${shown}`}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-transparent py-1 pr-2 pl-1 font-mono text-xs text-fg transition-colors duration-(--duration-fast) hover:bg-surface-sunken"
    >
      <span aria-hidden="true" className="size-[26px] flex-none rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/.1)]" style={{ background: value }} />
      <span className="min-w-[4.5em] text-left">{copied ? 'Copied' : shown}</span>
    </button>
  )
}

/** A small round-cornered chip of a colour, for tables. */
export function Chip({ value, className = '' }: { value: string | undefined; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-3 flex-none rounded-[3px] shadow-[inset_0_0_0_1px_rgb(0_0_0/.1)] ${className}`}
      style={{ background: value || 'transparent' }}
    />
  )
}

/**
 * A contrast ratio with a pass or fail mark. The mark is an icon and a word, not only a colour.
 * `min` is 4.5 for text and 3 for focus rings.
 */
export function Ratio({ ratio, min }: { ratio: number | null; min: number }) {
  if (ratio === null) return <span className="text-fg-subtle">–</span>
  const pass = ratio >= min
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${pass ? 'text-normal-fg' : 'text-critical-fg'}`}>
      {pass ? <CheckIcon width={13} height={13} /> : <XIcon width={13} height={13} />}
      {formatRatio(ratio)}
      <span className="sr-only">{pass ? 'passes' : 'fails'}</span>
    </span>
  )
}

/** Pass or fail as a badge: severity, icon and word. */
export function PassBadge({ ratio, min }: { ratio: number | null; min: number }) {
  if (ratio === null) return <span className="text-fg-subtle">–</span>
  const pass = ratio >= min
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-xs text-fg">{formatRatio(ratio)}</span>
      <Badge severity={pass ? 'normal' : 'critical'}>{pass ? 'Pass' : 'Fail'}</Badge>
    </span>
  )
}
