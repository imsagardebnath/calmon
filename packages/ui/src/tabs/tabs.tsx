'use client'

import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, type Severity } from '../lib/tone.ts'
import { useControllable } from '../lib/use-controllable.ts'

type TabsVariant = 'underline' | 'segmented'

type TabsContextValue = {
  variant: TabsVariant
  value: string | undefined
  select: (value: string) => void
  id: string
  panels: readonly string[]
  addPanel: (value: string) => () => void
  /** True when a value is set but no enabled tab has it, so no tab would be in the tab order. */
  orphaned: boolean
  /** Registers an enabled tab, so `orphaned` can be worked out. */
  addTab: (value: string) => () => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = use(TabsContext)
  if (!ctx) throw new Error('Tab, TabsList and TabsPanel must be rendered inside <Tabs>.')
  return ctx
}

const part = (id: string, kind: 't' | 'p', value: string) => `${id}-${kind}-${value.replace(/\s+/g, '-')}`

const LIST: Record<TabsVariant, string> = {
  underline: 'flex gap-1 border-b border-border',
  segmented: 'inline-flex gap-1 rounded-[9px] bg-surface-sunken p-[3px] shadow-[inset_0_0_0_1px_var(--border)]',
}

const TAB =
  'inline-flex cursor-pointer items-center gap-2 whitespace-nowrap bg-transparent text-ui-sm font-[550] text-fg-muted ' +
  'transition-colors duration-(--duration-fast) hover:text-fg aria-selected:text-fg ' +
  'disabled:cursor-not-allowed disabled:text-fg-subtle disabled:opacity-60'

const TAB_VARIANT: Record<TabsVariant, string> = {
  underline: '-mb-px border-b-2 border-b-transparent px-3 py-2.5 aria-selected:border-b-fg',
  segmented:
    'rounded-[6px] px-[11px] py-[5px] aria-selected:bg-surface-raised aria-selected:shadow-[0_0_0_1px_var(--border),var(--shadow-1)]',
}

export type TabsProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'> & {
  /** Look of the tab list. `underline` for page sections, `segmented` for filters and time ranges. Default `underline`. */
  variant?: TabsVariant
  /** The selected tab's `value`, for controlled use. Pair it with `onValueChange`. */
  value?: string
  /** The tab selected first, when uncontrolled. */
  defaultValue?: string
  /** Called with the new tab's `value` when the selection changes. */
  onValueChange?: (value: string) => void
}

/**
 * Switches between views of the same thing. Put `Tab`s directly inside for a plain tab list, or use
 * `TabsList` and `TabsPanel` when each tab controls a panel. Arrow keys, Home and End move between tabs.
 */
export function Tabs({ variant = 'underline', value, defaultValue, onValueChange, children, ...props }: TabsProps) {
  const id = useId()
  const [current, select] = useControllable<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next)
    },
  })
  const [panels, setPanels] = useState<readonly string[]>([])
  const addPanel = useCallback((v: string) => {
    setPanels((p) => [...p, v])
    return () => setPanels((p) => p.filter((x) => x !== v))
  }, [])
  const [enabled, setEnabled] = useState<readonly string[]>([])
  const addTab = useCallback((v: string) => {
    setEnabled((e) => [...e, v])
    return () => setEnabled((e) => e.filter((x) => x !== v))
  }, [])
  const orphaned = current !== undefined && enabled.length > 0 && !enabled.includes(current)
  // With no TabsList or TabsPanel directly inside, the tabs are the list itself.
  const grouped = Children.toArray(children).some((c) => isValidElement(c) && (c.type === TabsList || c.type === TabsPanel))

  return (
    <TabsContext value={{ variant, value: current, select, id, panels, addPanel, orphaned, addTab }}>
      {grouped ? <div {...props}>{children}</div> : <TabsList {...props}>{children}</TabsList>}
    </TabsContext>
  )
}

/** The row of tabs (`role="tablist"`). Name it with `aria-label` when the page has more than one. */
export function TabsList({ className, onKeyDown, ...props }: ComponentPropsWithRef<'div'>) {
  const { variant } = useTabs()

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(e)
    if (e.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')]
    const here = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]')
    const from = here ? tabs.indexOf(here) : -1
    if (from < 0) return
    const step = e.key === 'ArrowRight' ? 1 : -1
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (from + step + tabs.length) % tabs.length
    const to = tabs[next]
    if (!to) return
    e.preventDefault()
    to.focus()
    to.click()
  }

  return <div role="tablist" className={cn(LIST[variant], className)} onKeyDown={handleKeyDown} {...props} />
}

export type TabProps = Omit<ComponentPropsWithRef<'button'>, 'value' | 'role'> & {
  /** Identifies the tab. A `TabsPanel` with the same `value` is its panel. */
  value: string
  /** Shows a count badge after the label, for example open alerts. Pair it with `severity` when it needs action. */
  count?: number
  /** Colours the count badge. Without `count` it shows a small dot instead. The severity name is read out, so colour is never the only signal. */
  severity?: Severity
}

/** One tab. Selected when its `value` matches the `Tabs` value. */
export function Tab({ value, count, severity, disabled, className, children, onClick, ...props }: TabProps) {
  const t = useTabs()
  const { addTab } = t
  const selected = t.value === value
  const label = severity && <span className="sr-only"> {SEVERITY_LABEL[severity]}</span>
  // Tell the list this tab can be selected, so a value that matches none of them can be spotted.
  useEffect(() => (disabled ? undefined : addTab(value)), [addTab, value, disabled])

  return (
    <button
      type="button"
      role="tab"
      id={part(t.id, 't', value)}
      aria-selected={selected}
      aria-controls={t.panels.includes(value) ? part(t.id, 'p', value) : undefined}
      // Roving tabindex: only the selected tab is in the tab order. While nothing is selected, or the value
      // matches no enabled tab, every tab is, so the list can still be reached with the keyboard.
      tabIndex={(!disabled && (selected || t.orphaned)) || t.value === undefined ? 0 : -1}
      disabled={disabled}
      className={cn(TAB, TAB_VARIANT[t.variant], className)}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) t.select(value)
      }}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span
          data-tone={severity ?? 'neutral'}
          className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-tone-soft px-1.5 text-[10.5px] leading-none font-[550] text-tone-fg shadow-[inset_0_0_0_1px_var(--s-border)]"
        >
          {count}
          {label}
        </span>
      ) : severity ? (
        <>
          <span aria-hidden="true" data-tone={severity} className="size-2 rounded-full bg-tone" />
          {label}
        </>
      ) : null}
    </button>
  )
}

export type TabsPanelProps = Omit<ComponentPropsWithRef<'div'>, 'role'> & {
  /** The `value` of the tab that shows this panel. */
  value: string
}

/** The content for one tab. Only the selected panel renders its children. */
export function TabsPanel({ value, children, ...props }: TabsPanelProps) {
  const t = useTabs()
  const { addPanel } = t
  const active = t.value === value
  // Tell the tab this panel exists, so its aria-controls never points at nothing.
  useEffect(() => addPanel(value), [addPanel, value])

  return (
    <div
      role="tabpanel"
      id={part(t.id, 'p', value)}
      aria-labelledby={part(t.id, 't', value)}
      tabIndex={0}
      hidden={!active}
      {...props}
    >
      {active ? children : null}
    </div>
  )
}
