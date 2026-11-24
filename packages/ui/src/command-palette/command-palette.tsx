'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { EnterIcon, SearchIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { useControllable } from '../lib/use-controllable.ts'

export type CommandItem = {
  /** Unique within the palette. */
  id: string
  /** What the command is called. Matches are highlighted. */
  label: string
  /** A second line under the label, for context such as where the command lives. */
  description?: string
  /** Icon in a small tile before the label. Decorative: hidden from screen readers. */
  icon?: ReactNode
  /** A shortcut to show on the right, such as `G+D`. Keys are split on `+`. Display only: it does not bind the key. */
  shortcut?: string
  /** Extra words that also find this command, such as synonyms. They are not shown. */
  keywords?: string[]
}

export type CommandGroup = {
  /** Heading shown above the group's commands. Labels do not have to be unique. */
  label: string
  /** The commands in this group. */
  items: CommandItem[]
}

export type CommandPaletteProps = Omit<
  ComponentPropsWithRef<'dialog'>,
  'children' | 'open' | 'onSelect' | 'onClose' | 'onCancel' | 'onClick' | 'onKeyDown'
> & {
  /** The commands, in groups. Required. When the search box is empty, show what people use most. */
  groups: CommandGroup[]
  /** Called with the chosen command (Enter or click). The palette closes first. Required. */
  onSelect: (item: CommandItem) => void
  /** Whether the palette is open, for controlled use. Pair it with `onOpenChange`. */
  open?: boolean
  /** Whether the palette starts open, when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called when the palette wants to open or close: the shortcut, Escape, a click outside, or a chosen command. */
  onOpenChange?: (open: boolean) => void
  /** Keys that toggle the palette from anywhere. `mod` is Cmd on macOS and Ctrl elsewhere. Pass `""` to turn it off. Default `"mod+k"`. */
  shortcut?: string
  /** Placeholder of the search box. Default "Search or run a command". */
  placeholder?: string
  /** Hint under "No results", for example what else to try. Default "Check the spelling, or try a shorter search.". */
  emptyText?: string
}

/** Does this key press match a shortcut such as "mod+k" or "ctrl+shift+p"? */
function pressed(e: KeyboardEvent, shortcut: string) {
  const keys = shortcut.toLowerCase().split('+').map((k) => k.trim())
  const key = keys.pop()
  const mac = /mac|iphone|ipad/i.test(navigator.platform)
  const has = (...names: string[]) => names.some((n) => keys.includes(n))
  return (
    e.key.toLowerCase() === key &&
    e.metaKey === (has('meta', 'cmd') || (has('mod') && mac)) &&
    e.ctrlKey === (has('ctrl') || (has('mod') && !mac)) &&
    e.altKey === has('alt', 'option') &&
    e.shiftKey === has('shift')
  )
}

type Match = { score: number; hits: number[]; desc: number[] }

const range = (at: number, n: number) => Array.from({ length: n }, (_, i) => at + i)

/** Positions of `q` inside `text` as one run of characters, or null. */
function find(text: string | undefined, q: string) {
  const at = text ? text.toLowerCase().indexOf(q) : -1
  return at < 0 ? null : range(at, q.length)
}

/** Positions of the characters of `text` that spell `q` in order (spaces in `q` are skipped), or null. */
function spell(text: string, q: string) {
  const t = text.toLowerCase()
  const out: number[] = []
  let from = 0
  for (const ch of q) {
    if (ch === ' ') continue
    const at = t.indexOf(ch, from)
    if (at < 0) return null
    out.push(at)
    from = at + 1
  }
  return out.length ? out : null
}

/** How well a command matches. Lower `score` is better: 0 starts with it, 1 contains it, 2 matches the description or a keyword, 3 has the letters in order. */
function rank(item: CommandItem, q: string): Match | null {
  if (!q) return { score: 0, hits: [], desc: [] }
  const label = find(item.label, q)
  const desc = find(item.description, q)
  if (label) return { score: label[0] === 0 ? 0 : 1, hits: label, desc: desc ?? [] }
  if (desc || item.keywords?.some((k) => k.toLowerCase().includes(q))) return { score: 2, hits: [], desc: desc ?? [] }
  const letters = spell(item.label, q)
  return letters && { score: 3, hits: letters, desc: [] }
}

/** Text with the characters at `hits` wrapped in `<mark>`. */
function Marked({ text, hits }: { text: string; hits: number[] }) {
  if (!hits.length) return <>{text}</>
  const on = new Set(hits)
  const parts: ReactNode[] = []
  let i = 0
  while (i < text.length) {
    const hit = on.has(i)
    let j = i
    while (j < text.length && on.has(j) === hit) j++
    const part = text.slice(i, j)
    parts.push(
      hit ? (
        <mark key={i} className="rounded-[3px] bg-advisory-soft px-px text-fg">
          {part}
        </mark>
      ) : (
        part
      ),
    )
    i = j
  }
  return <>{parts}</>
}

const KBD =
  'inline-grid h-5 min-w-5 place-items-center rounded-[5px] bg-surface-raised px-[5px] font-mono text-[10.5px] leading-none text-fg-muted ' +
  'shadow-[inset_0_0_0_1px_var(--border-strong),0_1px_0_var(--border-strong)]'

const DIALOG =
  'm-0 mx-auto mt-[12vh] w-[640px] max-w-[calc(100vw-32px)] overflow-visible border-0 bg-transparent p-0 text-fg ' +
  'open:animate-calmon-dialog backdrop:bg-[color-mix(in_oklab,var(--fg),transparent_82%)] backdrop:backdrop-blur-[2px] ' +
  'dark:backdrop:bg-[rgb(0_0_0/.55)]'

type BodyProps = {
  uid: string
  groups: CommandGroup[]
  placeholder: string
  emptyText: string
  onPick: (item: CommandItem) => void
}

/** The search box, results and footer. Mounted only while open, so the query resets each time. */
function Body({ uid, groups, placeholder, emptyText, onPick }: BodyProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const q = query.trim().toLowerCase()

  const found = groups
    .map((g, key) => ({
      key,
      label: g.label,
      rows: g.items
        .flatMap((item) => {
          const m = rank(item, q)
          return m ? [{ item, ...m }] : []
        })
        .sort((a, b) => a.score - b.score),
    }))
    .filter((g) => g.rows.length)
  let n = 0
  const shown = found.map((g) => ({ key: g.key, label: g.label, rows: g.rows.map((r) => ({ ...r, i: n++ })) }))
  const flat = shown.flatMap((g) => g.rows)
  const cur = Math.min(active, flat.length - 1)
  const option = (i: number) => `${uid}-o${i}`

  useEffect(() => {
    document.getElementById(`${uid}-o${cur}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [uid, cur])

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || !flat.length) return
    const last = flat.length - 1
    const go = (i: number) => {
      e.preventDefault()
      setActive(i)
    }
    if (e.key === 'ArrowDown') go(cur >= last ? 0 : cur + 1)
    else if (e.key === 'ArrowUp') go(cur <= 0 ? last : cur - 1)
    // Home and End stay with the search box: in a text field they move the caret.
    else if (e.key === 'Enter' && flat[cur]) {
      e.preventDefault()
      onPick(flat[cur].item)
    }
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] bg-surface-raised shadow-[0_0_0_1px_var(--border),var(--shadow-3)]">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <SearchIcon className="size-[18px] text-fg-subtle" />
        <input
          type="text"
          role="combobox"
          aria-label="Search commands"
          aria-autocomplete="list"
          aria-expanded={flat.length > 0}
          aria-controls={flat.length ? `${uid}-list` : undefined}
          aria-activedescendant={flat.length ? option(cur) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="h-full flex-1 border-0 bg-transparent text-[1.0625rem] text-fg outline-none placeholder:text-fg-subtle"
        />
        <kbd className={KBD}>Esc</kbd>
      </div>

      {flat.length ? (
        // Keep focus in the search box when a result is pressed.
        <div
          id={`${uid}-list`}
          role="listbox"
          aria-label="Commands"
          onMouseDown={(e) => e.preventDefault()}
          className="max-h-[400px] overflow-auto px-2 py-1.5"
        >
          {shown.map((g, gi) => (
            <div key={g.key} role="group" aria-labelledby={`${uid}-g${gi}`}>
              <div id={`${uid}-g${gi}`} className="px-2.5 pt-3 pb-1.5 text-xs font-semibold text-fg-subtle">
                {g.label}
              </div>
              {g.rows.map(({ item, hits, desc, i }) => (
                <div
                  key={item.id}
                  id={option(i)}
                  role="option"
                  aria-selected={i === cur}
                  onMouseMove={() => i !== cur && setActive(i)}
                  onClick={() => onPick(item)}
                  className="group/row flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-[9px] aria-selected:bg-surface-sunken"
                >
                  {item.icon ? (
                    <span
                      aria-hidden="true"
                      className="grid size-[30px] flex-none place-items-center rounded-[8px] bg-surface-raised text-fg-muted shadow-[0_0_0_1px_var(--border)] group-aria-selected/row:text-accent-fg"
                    >
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-col">
                    <span className="text-ui-sm font-[550]">
                      <Marked text={item.label} hits={hits} />
                    </span>
                    {item.description ? (
                      <span className="truncate text-xs text-fg-muted">
                        <Marked text={item.description} hits={desc} />
                      </span>
                    ) : null}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    {item.shortcut ? (
                      <span className="flex gap-1">
                        {item.shortcut.split('+').map((k) => (
                          <kbd key={k} className={KBD}>
                            {k}
                          </kbd>
                        ))}
                      </span>
                    ) : null}
                    <span aria-hidden="true" className="hidden text-fg-subtle group-aria-selected/row:block">
                      <EnterIcon />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div role="status">
        {flat.length ? null : (
          <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
            <p className="text-lg font-semibold">{q ? `No results for “${query.trim()}”` : 'Nothing to show'}</p>
            <p className="max-w-[40ch] text-ui-sm leading-[1.55] text-fg-muted">{emptyText}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-border px-4 py-2.5 text-xs text-fg-subtle">
        <span className="flex items-center gap-[5px]">
          <kbd className={KBD}>↑</kbd>
          <kbd className={KBD}>↓</kbd>to move
        </span>
        <span className="flex items-center gap-[5px]">
          <kbd className={KBD}>Enter</kbd>to select
        </span>
        <span className="flex items-center gap-[5px]">
          <kbd className={KBD}>Esc</kbd>to close
        </span>
      </div>
    </div>
  )
}

/**
 * Search and run commands from anywhere with Ctrl K (Cmd K on macOS). Built on a native `<dialog>`, so it
 * traps focus, closes on Escape and returns focus to where it was. Destructive commands need a confirm step
 * after they are chosen: the palette only picks, it never confirms.
 */
export function CommandPalette({
  groups,
  onSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  shortcut = 'mod+k',
  placeholder = 'Search or run a command',
  emptyText = 'Check the spelling, or try a shorter search.',
  className,
  onMouseDown,
  ref: userRef,
  ...props
}: CommandPaletteProps) {
  const uid = useId()
  const ref = useRef<HTMLDialogElement | null>(null)
  // Whether the current press began inside the palette, so a drag that ends on the backdrop is not a backdrop click.
  const pressedInside = useRef(false)
  const setRef = useCallback(
    (node: HTMLDialogElement | null) => {
      ref.current = node
      if (typeof userRef === 'function') userRef(node)
      else if (userRef) userRef.current = node
    },
    [userRef],
  )
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })

  // The shortcut toggles the palette from anywhere on the page.
  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || !pressed(e, shortcut)) return
      e.preventDefault()
      if (!e.repeat) setOpen(!isOpen)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut, isOpen, setOpen])

  // Show and hide the dialog, and give focus back to where it came from.
  useEffect(() => {
    const el = ref.current
    if (!el || !isOpen) return
    const from = document.activeElement as HTMLElement | null
    if (typeof el.showModal === 'function') el.showModal()
    else el.setAttribute('open', '')
    el.querySelector('input')?.focus()
    return () => {
      if (typeof el.close === 'function') el.close()
      else el.removeAttribute('open')
      // Do not steal focus if the chosen command already moved it somewhere else.
      const now = document.activeElement
      if (from?.isConnected && (!now || now === document.body || el.contains(now))) from.focus()
    }
  }, [isOpen])

  return (
    <dialog
      ref={setRef}
      aria-label="Command palette"
      className={cn(DIALOG, className)}
      onKeyDown={(e) => {
        // Escape also cancels an input method composition: leave that to the input method.
        if (e.key !== 'Escape' || e.nativeEvent.isComposing) return
        e.preventDefault()
        setOpen(false)
      }}
      onCancel={(e) => {
        e.preventDefault()
        setOpen(false)
      }}
      onClose={() => isOpen && setOpen(false)}
      onMouseDown={(e) => {
        pressedInside.current = e.target !== e.currentTarget
        onMouseDown?.(e)
      }}
      // A click on the backdrop lands on the dialog itself. So does the end of a drag that started inside it.
      onClick={(e) => {
        const dragged = pressedInside.current
        pressedInside.current = false
        if (e.target === e.currentTarget && !dragged) setOpen(false)
      }}
      {...props}
    >
      {isOpen ? (
        <Body
          uid={uid}
          groups={groups}
          placeholder={placeholder}
          emptyText={emptyText}
          onPick={(item) => {
            setOpen(false)
            onSelect(item)
          }}
        />
      ) : null}
    </dialog>
  )
}
