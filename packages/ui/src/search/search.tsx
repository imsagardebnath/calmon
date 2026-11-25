'use client'

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../lib/cn.ts'
import type { Severity } from '../lib/tone.ts'
import { useControllable } from '../lib/use-controllable.ts'
import { EnterIcon, SearchIcon, XIcon } from '../icons/index.ts'
import { inputVariants } from '../input/input-variants.ts'

/** One suggestion or recent search. Add any other fields you need: `groupBy` and `onSelect` can read them. */
export interface SearchItem {
  /** Main text. Also the text put in the field when the item is chosen, and the part that is highlighted. */
  label: string
  /** Second line under the label, such as a status or an owner. */
  description?: string
  /** Icon before the text. Decorative: hidden from screen readers. */
  icon?: ReactNode
  /** Colours the icon with this severity. Pair it with a severity icon so colour is never the only signal. */
  severity?: Severity
  /** Key for the option. Defaults to its position and label. */
  id?: string
  [field: string]: unknown
}

export type SearchProps<T extends SearchItem = SearchItem> = Omit<
  ComponentPropsWithRef<'input'>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onSelect'
> & {
  /** Controlled query text. */
  value?: string
  /** Initial query text when uncontrolled. Default empty. */
  defaultValue?: string
  /** Called with the new query text as the person types or clears the field. */
  onValueChange?: (value: string) => void
  /** Say what can be searched: "Search services". Also the accessible name unless you pass `aria-label`. Default `"Search"`. */
  placeholder?: string
  /** Turns on the suggestion list. Gets the query (after `debounce`) and returns items, or a Promise of items. */
  suggestions?: (query: string) => T[] | Promise<T[]>
  /** Name of an item field to group suggestions by, such as `"type"`. Groups show in order of first appearance. */
  groupBy?: string
  /** Items shown when the field is empty and focused. Keep the app's own list of recent searches here. */
  recent?: T[]
  /** Called when the person clears the recent list. The "Clear" button only shows when this is set. */
  onClearRecent?: () => void
  /** Key that focuses the field from anywhere on the page, such as `"/"`. Shown as a key hint while the field is empty. */
  shortcut?: string
  /** Shows the spinner while results load. A `suggestions` Promise shows it on its own. Default `false`. */
  loading?: boolean
  /** Milliseconds to wait after typing before `suggestions` runs. Default `150`. */
  debounce?: number
  /** Filter chips under the field, such as `["All", "Critical", "Caution"]`. The first is selected at first. */
  scopes?: string[]
  /** Controlled selected scope. */
  scope?: string
  /** Initially selected scope when uncontrolled. Default the first of `scopes`. */
  defaultScope?: string
  /** Called with the chosen scope. */
  onScopeChange?: (scope: string) => void
  /** Height: 30, 38 or 46px. Follows the page `density` when unset. */
  size?: 'sm' | 'md' | 'lg'
  /** Corner style. `pill` is fully rounded. Default `default`. */
  shape?: 'default' | 'pill'
  /** Called with the item when the person presses Enter on it or clicks it. */
  onSelect?: (item: T) => void
}

const HEAD = 'px-2.5 pt-2 pb-1 text-xs font-semibold text-fg-subtle'
const KBD =
  'inline-grid h-5 min-w-5 place-items-center rounded-[5px] bg-surface-raised px-[5px] font-mono text-[10.5px] leading-none text-fg-muted ' +
  'shadow-[inset_0_0_0_1px_var(--border-strong),0_1px_0_var(--border-strong)]'

function mark(text: string, q: string): ReactNode {
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-advisory-soft px-px text-fg">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  )
}

/** A search field with live suggestions. `className` styles the outer wrapper; other props go to the `<input>`. */
export function Search<T extends SearchItem = SearchItem>({
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = 'Search',
  suggestions,
  groupBy,
  recent,
  onClearRecent,
  shortcut,
  loading = false,
  debounce = 150,
  scopes,
  scope: scopeProp,
  defaultScope,
  onScopeChange,
  size,
  shape = 'default',
  onSelect,
  className,
  disabled,
  'aria-label': ariaLabel,
  ref,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: SearchProps<T>) {
  const listId = useId()
  const inner = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inner.current as HTMLInputElement)

  const popup = useRef<HTMLDivElement>(null)

  const [value, setValue] = useControllable<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })
  const [scope, setScope] = useControllable<string | undefined>({
    value: scopeProp,
    defaultValue: defaultScope ?? scopes?.[0],
    onChange: (s) => {
      if (s !== undefined) onScopeChange?.(s)
    },
  })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [items, setItems] = useState<T[] | null>(null)
  const [pending, setPending] = useState(false)

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const run = useRef(0)
  const latest = useRef(suggestions)
  latest.current = suggestions
  const cancel = () => {
    clearTimeout(timer.current)
    run.current++
  }
  useEffect(() => cancel, [])

  const done = (list: T[]) => {
    setItems(list)
    setPending(false)
    setActive(0)
  }
  const fetchNow = (q: string) => {
    const id = ++run.current
    setPending(true)
    new Promise<T[] | undefined>((resolve) => resolve(latest.current?.(q))).then(
      (list) => id === run.current && done(list ?? []),
      () => id === run.current && done([]),
    )
  }
  const schedule = (q: string) => {
    cancel()
    setActive(0)
    if (!suggestions || !q.trim()) {
      setItems(null)
      setPending(false)
      return
    }
    setPending(true)
    timer.current = setTimeout(() => fetchNow(q), debounce)
  }

  const q = value.trim()
  const showRecent = !q && !!recent?.length
  const raw = showRecent ? (recent ?? []) : q ? (items ?? []) : []
  const groups = new Map<string, T[]>()
  for (const item of raw) {
    const key = groupBy && !showRecent ? String(item[groupBy] ?? '') : ''
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  const list = [...groups.values()].flat()
  const hl = showRecent ? '' : q
  const current = Math.min(active, list.length - 1)
  const settled = q !== '' && items !== null && !pending
  const noResults = settled && list.length === 0
  const shown = open && (list.length > 0 || noResults)
  const expanded = open && list.length > 0
  const busy = loading || pending
  const isCombobox = !!suggestions || !!recent
  const optionId = (i: number) => `${listId}-${i}`

  useEffect(() => {
    if (expanded) document.getElementById(`${listId}-${current}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [current, expanded, listId])

  useEffect(() => {
    if (!shortcut || disabled) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return
      e.preventDefault()
      inner.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut, disabled])

  const choose = (item: T) => {
    onSelect?.(item)
    setValue(item.label)
    cancel()
    setItems(null)
    setPending(false)
    setOpen(false)
  }
  const clear = () => {
    setValue('')
    schedule('')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setOpen(true)
    schedule(e.target.value)
    onChange?.(e)
  }
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setOpen(true)
    if (suggestions && q && items === null && !pending) fetchNow(value)
    onFocus?.(e)
  }
  // Focus may move between the field and the list's own button ("Clear"); only leaving both closes it.
  const closeUnlessWithin = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null
    if (next && (next === inner.current || popup.current?.contains(next))) return
    setOpen(false)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    closeUnlessWithin(e)
    onBlur?.(e)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const k = e.key
    if ((k === 'ArrowDown' || k === 'ArrowUp') && isCombobox) {
      e.preventDefault()
      if (!open) setOpen(true)
      else if (list.length) setActive((current + (k === 'ArrowDown' ? 1 : -1) + list.length) % list.length)
    } else if (k === 'Enter' && expanded) {
      e.preventDefault()
      const item = list[current]
      if (item) choose(item)
    } else if (k === 'Escape') {
      if (value) {
        e.preventDefault()
        clear()
      } else if (open) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  const name = ariaLabel ?? (props['aria-labelledby'] ? undefined : placeholder)
  const announce = settled ? (list.length ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'No results') : ''
  const lg = size === 'lg'
  let at = 0

  return (
    <div role="search" aria-label={name} className={cn('w-full max-w-[420px]', className)}>
      <div className="relative flex items-center">
        <SearchIcon className={cn('pointer-events-none absolute text-fg-subtle', lg ? 'left-[13px]' : 'left-[11px]')} />
        <input
          ref={inner}
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-label={name}
          aria-busy={busy || undefined}
          aria-keyshortcuts={shortcut}
          {...(isCombobox
            ? {
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': expanded,
                'aria-controls': listId,
                'aria-activedescendant': expanded ? optionId(current) : undefined,
              } as const
            : null)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            inputVariants({ size: size ?? 'auto' }),
            'pr-[72px] pl-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
            lg && 'h-[46px] pl-10',
            shape === 'pill' && 'rounded-pill',
          )}
          {...props}
        />
        <span className="absolute right-1.5 flex items-center gap-1">
          {busy ? (
            <span
              aria-hidden="true"
              className="size-3.5 animate-pikore-spin rounded-full border-2 border-accent/20 border-t-accent"
            />
          ) : null}
          {shortcut && !value && !disabled ? <kbd className={KBD}>{shortcut}</kbd> : null}
          {value && !disabled ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                clear()
                inner.current?.focus()
              }}
              className="grid size-6 cursor-pointer place-items-center rounded-md p-0 text-fg-subtle hover:bg-surface-sunken hover:text-fg"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}
        </span>
        <div
          ref={popup}
          hidden={!shown}
          onMouseDown={(e) => e.preventDefault()}
          onBlur={closeUnlessWithin}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[340px] animate-pikore-dialog overflow-auto rounded-xl bg-surface-raised p-1.5 shadow-[0_0_0_1px_var(--border),var(--shadow-3)]"
        >
          {showRecent ? (
            <div className={cn('flex justify-between', HEAD)}>
              <span>Recent</span>
              {onClearRecent ? (
                <button
                  type="button"
                  aria-label="Clear recent searches"
                  onClick={() => {
                    onClearRecent()
                    inner.current?.focus()
                  }}
                  className="cursor-pointer border-0 bg-transparent p-0 text-xs text-fg-subtle hover:text-fg hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}
          <div
            role="listbox"
            id={listId}
            aria-label={showRecent ? 'Recent searches' : 'Suggestions'}
            hidden={list.length === 0}
          >
            {[...groups].map(([name, items], gi) => {
              const options = items.map((item) => {
                const i = at++
                const on = i === current
                return (
                  <div
                    key={item.id ?? `${i}:${item.label}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={on}
                    data-tone={item.severity ?? 'neutral'}
                    onClick={() => choose(item)}
                    onMouseMove={() => i !== current && setActive(i)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-ui-sm aria-selected:bg-surface-sunken"
                  >
                    {item.icon ? (
                      <span
                        aria-hidden="true"
                        className={cn('flex', item.severity ? 'text-tone-fg' : on ? 'text-accent-fg' : 'text-fg-subtle')}
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-[550]">{mark(item.label, hl)}</span>
                      {item.description ? (
                        <span className="truncate text-xs text-fg-muted">{mark(item.description, hl)}</span>
                      ) : null}
                    </span>
                    {on ? <EnterIcon className="size-3.5 text-fg-subtle" /> : null}
                  </div>
                )
              })
              return name ? (
                <div key={name} role="group" aria-labelledby={`${listId}-g${gi}`}>
                  <div id={`${listId}-g${gi}`} className={HEAD}>
                    {name}
                  </div>
                  {options}
                </div>
              ) : (
                options
              )
            })}
          </div>
          {noResults ? (
            <div className="px-3 py-[18px] text-center text-ui-sm text-fg-muted">
              No results for “{value}”. Check the spelling or try a different term.
            </div>
          ) : null}
          {q && list.length ? (
            <div className="mt-1 flex gap-3 border-t border-border px-2.5 pt-2 pb-1 text-[11px] text-fg-subtle">
              {[
                ['↑↓', 'move'],
                ['Enter', 'open'],
                ['Esc', 'clear'],
              ].map(([key, what]) => (
                <span key={key}>
                  <kbd className={KBD}>{key}</kbd> {what}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {scopes?.length ? (
        <div role="group" aria-label="Search scope" className="mt-2.5 flex flex-wrap gap-1.5">
          {scopes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === scope}
              onClick={() => setScope(s)}
              className="h-[26px] cursor-pointer rounded-pill bg-transparent px-[11px] text-xs font-medium text-fg-muted shadow-[inset_0_0_0_1px_var(--border)] aria-pressed:bg-fg aria-pressed:text-surface aria-pressed:shadow-none"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <div role="status" className="sr-only">
        {announce}
      </div>
    </div>
  )
}
