'use client'

import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react'
import { CheckIcon, CopyIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { highlight } from './highlight.tsx'

/** Token colours for the highlighter's [data-t] spans. */
const TOKENS =
  '[&_[data-t=k]]:text-info-fg [&_[data-t=s]]:text-normal-fg [&_[data-t=c]]:text-fg-subtle ' +
  '[&_[data-t=t]]:text-accent-fg [&_[data-t=a]]:text-advisory-fg'

/*
 * A small ghost button, written out here instead of importing Button, to keep the component light.
 * The icons are tree-shaken, so only the copy and check icons are bundled.
 */
const COPY_BUTTON =
  'ml-auto inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-2 rounded-[7px] px-[11px] text-ui-sm font-[550] ' +
  'tracking-[-0.005em] whitespace-nowrap text-fg-muted transition-[background-color,color] duration-(--duration-fast) ' +
  'ease-pikore select-none hover:bg-surface-sunken hover:text-fg'

/* Languages whose lines may start with a `$ ` prompt. */
const SHELL = new Set(['bash', 'sh', 'shell', 'zsh'])

export type CodeProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** The code or text to show. Use a template literal for several lines. */
  children: string
  /** Syntax to highlight: `tsx`, `ts`, `js`, `json`, `css` or `bash`. Anything else is shown as plain text. Default `tsx`. */
  language?: string
  /** Shows a Copy button in the header. It announces "Copied" to screen readers, and leaves a leading `$ ` prompt out of the copied shell text. Ignored when `inline`. Default `true`. */
  copyable?: boolean
  /** Renders a small inline `<code>` for use inside a sentence, with no header, copy button or highlighting. */
  inline?: boolean
  /** Text in the block header, such as a file name or "Terminal". Defaults to the language. */
  label?: string
}

/**
 * Inline code and copyable code blocks. The block scrolls sideways instead of wrapping,
 * so keep lines short. Do not use it for emphasis in prose.
 */
export function Code({
  children,
  language = 'tsx',
  copyable = true,
  inline = false,
  label,
  className,
  ...props
}: CodeProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  if (inline) {
    return (
      <code
        className={cn(
          'rounded-[5px] bg-surface-sunken px-1.5 py-px font-mono text-[.84em] text-fg',
          'shadow-[inset_0_0_0_1px_var(--border)]',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  }

  const source = [children].flat().join('').replace(/\n$/, '')
  // A shell prompt is shown but not copied, so the pasted command runs.
  const copyText = SHELL.has(language.toLowerCase()) ? source.replace(/^\$ /gm, '') : source
  const copy = () => {
    navigator.clipboard?.writeText(copyText).then(
      () => {
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }

  return (
    <div
      data-language={language}
      className={cn('relative overflow-hidden rounded-xl border border-border bg-surface-sunken', TOKENS, className)}
      {...props}
    >
      {(copyable || label) && (
        <div className="flex items-center gap-2 border-b border-border bg-surface-raised py-1.5 pr-2 pl-3.5 text-xs text-fg-subtle">
          <span className="min-w-0 truncate">{label ?? language}</span>
          {copyable && (
            <>
              <button type="button" onClick={copy} className={COPY_BUTTON}>
                {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <span role="status" aria-live="polite" className="sr-only">
                {copied ? 'Copied' : ''}
              </span>
            </>
          )}
        </div>
      )}
      {/* Focusable so keyboard users can scroll a long line sideways. */}
      <pre
        tabIndex={0}
        className="m-0 overflow-x-auto px-[18px] py-4 font-mono text-[12.5px] leading-[1.75] text-fg focus-visible:-outline-offset-2"
      >
        <code>{highlight(source, language)}</code>
      </pre>
    </div>
  )
}

/** Alias of `Code` for block use. */
export function CodeBlock(props: Omit<CodeProps, 'inline'>) {
  return <Code {...props} />
}
