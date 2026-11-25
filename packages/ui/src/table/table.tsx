'use client'

import { useEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode, type RefObject } from 'react'
import { ChevronDownIcon, ChevronUpIcon, SeverityIcon, XIcon } from '../icons/index.ts'
import { cn } from '../lib/cn.ts'
import { SEVERITY_LABEL, severityRank, type Severity } from '../lib/tone.ts'
import { useControllable } from '../lib/use-controllable.ts'
import type { Density } from '../provider/index.ts'

export type SortDirection = 'asc' | 'desc'
/** Which column the rows are sorted by, and in which direction. */
export interface TableSort {
  /** The `key` of a column. */
  key: string
  /** `asc` for smallest first, `desc` for largest first. For severity, `desc` means worst first. */
  dir: SortDirection
}
/** Identifies a row for selection. */
export type RowId = string | number

export interface TableColumn<T> {
  /** Unique id of the column. Also the sort key, and the row field to show when there is no `accessor`. */
  key: string
  /** Header content. Keep it short: it never wraps. */
  header: ReactNode
  /** A field of the row to show, or a function that renders the cell. Defaults to the field named by `key`. */
  accessor?: Extract<keyof T, string> | ((row: T) => ReactNode)
  /** Text alignment. Default `left`, or `right` when `numeric` is set. */
  align?: 'left' | 'center' | 'right'
  /** Column width as a CSS length, or a number of pixels. Default: sized by content. */
  width?: number | string
  /** Makes the header a sort button. Default `false`. */
  sortable?: boolean
  /** Figures: right-aligned, in tabular numerals so digits line up. Default `false`. */
  numeric?: boolean
  /** Marks the identifying column (a name or id). It becomes the row header for screen readers, is set a little bolder, and is never truncated. Default `false`. */
  rowHeader?: boolean
  /** Value to sort by when `accessor` renders JSX instead of a plain value. Missing values sort last. */
  sortValue?: (row: T) => string | number | null | undefined
}

export type TableProps<T extends object> = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** The columns, left to right. A column with `key: 'severity'` and no `accessor` shows the row's severity as an icon and a word. */
  columns: TableColumn<T>[]
  /** The rows to show. */
  data: readonly T[]
  /** Returns a stable id for a row, used for selection and React keys. Default: the row's `id` field, else its position in `data`. */
  getRowId?: (row: T, index: number) => RowId
  /** Returns the severity of a row. Default: the row's `severity` field. Severe rows get a left status bar and a Status column with an icon and a word. */
  getRowSeverity?: (row: T) => Severity | undefined
  /** Adds a checkbox column with select-all, and a bulk-actions bar while rows are selected. Default `false`. */
  selectable?: boolean
  /** The selected row ids (controlled). Pair with `onSelectedChange`. */
  selected?: RowId[]
  /** The initially selected row ids (uncontrolled). */
  defaultSelected?: RowId[]
  /** Called with the new list of selected ids when the selection changes. */
  onSelectedChange?: (ids: RowId[]) => void
  /** Accessible name of a row, used in its checkbox label ("Select payments-api"). Default: the value of the row header column, or the first column. */
  rowLabel?: (row: T) => string
  /** Buttons shown in the bulk-actions bar next to the "N selected" count. Use small buttons: the bar is dark in light mode. */
  bulkActions?: ReactNode
  /** The initial sort (uncontrolled). Default: severity, worst first, when rows have a severity; otherwise the order of `data`. Pass `null` to keep the order of `data`. */
  defaultSort?: TableSort | null
  /** The current sort (controlled). Pair with `onSortChange`. Rows are always sorted here, in the browser. */
  sort?: TableSort | null
  /** Called when a sortable header is activated. */
  onSortChange?: (sort: TableSort | null) => void
  /** Row height and type size: `compact` rows are 32px, `station` rows are large for wall displays. Default: inherits the page density. */
  density?: Density
  /** What to show when `data` is empty. `true` shows a built-in message, `false` shows nothing, or pass your own content. Default `true`. */
  empty?: ReactNode | boolean
  /** Shown instead of the rows when loading the data failed. `true` shows a built-in message, or pass your own content (with a retry button). Default `false`. */
  error?: ReactNode | boolean
  /** Shows placeholder rows while data loads. `true` shows skeleton rows, or pass your own content. Default `false`. */
  loading?: ReactNode | boolean
}

/* Row height, padding and type size follow the density. Everything else is sized in em from --t-fs. */
const DENSITY = {
  comfortable: '[--t-fs:var(--fs-sm)] [--t-rh:41px] [--t-px:14px]',
  compact: '[--t-fs:var(--fs-sm)] [--t-rh:32px] [--t-px:12px]',
  station: '[--t-fs:1.125rem] [--t-rh:72px] [--t-px:20px]',
} satisfies Record<Density, string>
const INHERIT =
  `${DENSITY.comfortable} [[data-density=compact]_&]:[--t-rh:32px] [[data-density=compact]_&]:[--t-px:12px] ` +
  '[[data-density=station]_&]:[--t-fs:1.125rem] [[data-density=station]_&]:[--t-rh:72px] [[data-density=station]_&]:[--t-px:20px]'

const TH =
  'sticky top-0 z-[1] h-[calc(var(--t-rh)*.9)] border-b border-border bg-surface-raised px-(--t-px) py-1.5 text-[length:.92em] font-[550] whitespace-nowrap text-fg-subtle'
const TD = 'h-(--t-rh) border-b border-border px-(--t-px) py-1.5 align-middle'
const ROW =
  '[&:hover>*]:bg-[color-mix(in_oklab,var(--surface-sunken),transparent_30%)] data-selected:[&>*]:bg-[color-mix(in_oklab,var(--accent-soft),transparent_30%)] [&:last-child>*]:border-b-0'
const BAR = 'shadow-[inset_3px_0_0_var(--s)]'
const NUM = 'font-mono text-[length:.92em] tabular-nums'
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }
const SKEL =
  'block h-[.9em] animate-pikore-shim rounded-md bg-[linear-gradient(90deg,var(--surface-sunken)_0%,color-mix(in_oklab,var(--border),var(--surface-sunken))_50%,var(--surface-sunken)_100%)] bg-[length:200%_100%]'
const SKEL_WIDTHS = ['62%', '40%', '74%', '52%']

/* A native checkbox, styled like the Checkbox component. */
const CHECK =
  'm-0 grid size-[18px] shrink-0 cursor-pointer appearance-none place-items-center rounded-[5px] border border-border-strong bg-surface-raised shadow-[0_1px_2px_rgb(16_24_40/.05)] transition-[background-color,border-color] duration-(--duration-fast) ' +
  "checked:border-accent checked:bg-accent checked:after:h-[5px] checked:after:w-[9px] checked:after:-translate-y-px checked:after:-rotate-45 checked:after:border-2 checked:after:border-t-0 checked:after:border-r-0 checked:after:border-accent-on " +
  "indeterminate:border-accent indeterminate:bg-accent indeterminate:after:h-0.5 indeterminate:after:w-2 indeterminate:after:rounded-sm indeterminate:after:bg-accent-on " +
  'disabled:cursor-not-allowed disabled:opacity-50'

/* In the bulk bar the neutral tokens are swapped, so buttons inside read on the dark bar without extra props. */
const BULK =
  'flex items-center gap-2.5 px-3.5 py-2 text-ui-sm text-surface [--border-strong:var(--surface-sunken)] [--fg-muted:var(--surface)] [--fg:var(--surface)] [--ring:var(--surface)] [--surface-raised:var(--surface-sunken)] [--surface-sunken:color-mix(in_oklab,var(--surface),transparent_85%)]'

const defaultId = (row: object, index: number): RowId => (row as { id?: RowId }).id ?? index
const defaultSeverity = (row: object): Severity | undefined => (row as { severity?: Severity }).severity

const raw = <T,>(col: TableColumn<T>, row: T): unknown =>
  typeof col.accessor === 'function' ? col.accessor(row) : (row as Record<string, unknown>)[col.accessor ?? col.key]

const isStatus = <T,>(col: TableColumn<T>) => col.key === 'severity' && !col.accessor

function sortKey<T>(col: TableColumn<T>, row: T, sev: Severity | undefined): string | number | null {
  const v = isStatus(col) && !col.sortValue ? (sev ? severityRank(sev) : -1) : col.sortValue ? col.sortValue(row) : raw(col, row)
  return typeof v === 'number' || typeof v === 'string' ? v : typeof v === 'boolean' ? Number(v) : null
}

function Check({ label, checked, indeterminate, disabled, onChange, inputRef }: {
  label: string
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: () => void
  inputRef?: RefObject<HTMLInputElement | null>
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate
        if (inputRef) inputRef.current = el
      }}
      className={CHECK}
    />
  )
}

/** Icon and word: severity never depends on colour alone. */
function Status({ severity }: { severity: Severity }) {
  return (
    <span
      data-tone={severity}
      className="inline-flex h-[1.83em] items-center gap-[.42em] rounded-pill bg-tone-soft pr-[.67em] pl-[.58em] text-[length:.92em] leading-none font-[550] whitespace-nowrap text-tone-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--s-border),transparent_35%)]"
    >
      <SeverityIcon severity={severity} className="size-[1.08em]" />
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

/** Whether the scroll area overflows, so it only becomes a tab stop when it has to be scrolled. */
function useOverflow(ref: RefObject<HTMLDivElement | null>) {
  const [over, setOver] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const check = () => setOver(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    check()
    return () => ro.disconnect()
  }, [ref])
  return over
}

/**
 * Rows of records with sorting, selection and bulk actions. Rows are sorted worst first by default
 * when they have a `severity`. Renders a real `<table>`; wide tables scroll sideways.
 */
export function Table<T extends object>({
  columns,
  data,
  getRowId,
  getRowSeverity,
  selectable = false,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  rowLabel,
  bulkActions,
  defaultSort,
  sort: sortProp,
  onSortChange,
  density,
  empty = true,
  error = false,
  loading = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  ...props
}: TableProps<T>) {
  const idOf = getRowId ?? defaultId
  const sevOf = getRowSeverity ?? defaultSeverity
  const hasSeverity = data.some((r) => sevOf(r))
  const cols: TableColumn<T>[] =
    hasSeverity && !columns.some((c) => c.key === 'severity')
      ? [{ key: 'severity', header: 'Status', sortable: true }, ...columns]
      : columns

  // Sorting: `sort` controls it; otherwise `defaultSort`; otherwise worst first when rows have a severity.
  const [innerSort, setInnerSort] = useState(defaultSort)
  const sort = sortProp !== undefined ? sortProp : innerSort !== undefined ? innerSort : hasSeverity ? ({ key: 'severity', dir: 'desc' } as const) : null
  const sortCol = sort ? cols.find((c) => c.key === sort.key) : undefined
  const items = data.map((row, i) => ({ row, i }))
  if (sort && sortCol) {
    const m = sort.dir === 'asc' ? 1 : -1
    const keys = new Map(items.map((it) => [it, sortKey(sortCol, it.row, sevOf(it.row))]))
    items.sort((a, b) => {
      const x = keys.get(a) ?? null
      const y = keys.get(b) ?? null
      if (x === null || y === null) return x === y ? a.i - b.i : x === null ? 1 : -1 // missing values last
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })
      return c * m || a.i - b.i
    })
  }
  const rows = items

  const changeSort = (col: TableColumn<T>) => {
    const next: TableSort = {
      key: col.key,
      dir: sort?.key === col.key ? (sort.dir === 'asc' ? 'desc' : 'asc') : col.key === 'severity' ? 'desc' : 'asc',
    }
    if (sortProp === undefined) setInnerSort(next)
    onSortChange?.(next)
  }

  // Selection. Only rows that are on screen count: while loading or after an error the body shows no rows.
  const [selected, setSelected] = useControllable<RowId[]>({
    value: selectedProp,
    defaultValue: defaultSelected ?? [],
    onChange: onSelectedChange,
  })
  const ids = loading || error ? [] : rows.map(({ row, i }) => idOf(row, i))
  const idSet = new Set(ids)
  const selSet = new Set(selected)
  const nSel = ids.filter((id) => selSet.has(id)).length
  const allOn = ids.length > 0 && nSel === ids.length
  const toggle = (id: RowId) => setSelected(selSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id])
  const labelCol = columns.find((c) => c.rowHeader) ?? columns[0]
  const labelOf = (row: T, id: RowId) => {
    if (rowLabel) return rowLabel(row)
    const v = labelCol ? raw(labelCol, row) : null
    return typeof v === 'string' || typeof v === 'number' ? String(v) : String(id)
  }

  const selectAll = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const overflowing = useOverflow(scroller)
  const colSpan = cols.length + (selectable ? 1 : 0)
  const message = (node: ReactNode) => (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        {node}
      </td>
    </tr>
  )

  let body: ReactNode
  if (loading) {
    body =
      loading !== true
        ? message(loading)
        : Array.from({ length: 5 }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: colSpan }, (_, c) => (
                <td key={c} className={TD}>
                  <span aria-hidden="true" className={SKEL} style={{ width: SKEL_WIDTHS[(r + c) % 4] }} />
                </td>
              ))}
            </tr>
          ))
  } else if (error) {
    body = message(
      error !== true ? (
        error
      ) : (
        <div role="alert" className="flex flex-col items-center gap-1.5">
          <SeverityIcon severity="critical" className="size-5 text-critical-fg" />
          <p className="text-lg font-medium">Couldn’t load the data</p>
          <p className="max-w-[40ch] text-fg-muted">Check your connection and try again.</p>
        </div>
      ),
    )
  } else if (rows.length === 0) {
    body = empty
      ? message(
          empty !== true ? (
            empty
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-lg font-medium">No results</p>
              <p className="max-w-[40ch] text-fg-muted">There are no rows to show.</p>
            </div>
          ),
        )
      : null
  } else {
    body = rows.map(({ row, i }) => {
      const id = idOf(row, i)
      const sev = sevOf(row)
      const bar = sev && sev !== 'normal' ? BAR : ''
      return (
        <tr key={id} data-tone={sev ?? 'neutral'} data-severity={sev} data-selected={selSet.has(id) || undefined} className={ROW}>
          {selectable ? (
            <td className={cn(TD, 'w-10 pr-0', bar)}>
              <Check label={`Select ${labelOf(row, id)}`} checked={selSet.has(id)} onChange={() => toggle(id)} />
            </td>
          ) : null}
          {cols.map((col, ci) => {
            const v = raw(col, row)
            const content = isStatus(col) ? (sev ? <Status severity={sev} /> : null) : typeof col.accessor === 'function' ? (v as ReactNode) : v == null ? null : String(v)
            const cls = cn(TD, ALIGN[col.align ?? (col.numeric ? 'right' : 'left')], col.numeric && NUM, ci === 0 && !selectable && bar)
            return col.rowHeader ? (
              <th key={col.key} scope="row" className={cn(cls, 'font-[550]')}>
                {content}
              </th>
            ) : (
              <td key={col.key} className={cls}>
                {content}
              </td>
            )
          })}
        </tr>
      )
    })
  }

  // One live region that is always mounted, so changes to its text are announced.
  const announcement = loading === true ? 'Loading' : selectable && nSel > 0 ? `${nSel} selected` : ''

  return (
    <div
      data-tone="neutral"
      data-density={density}
      {...props}
      className={cn('flex flex-col overflow-hidden rounded-card border border-border bg-surface-raised', density ? DENSITY[density] : INHERIT, className)}
    >
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {selectable && nSel > 0 ? (
        <div className="bg-fg">
          <div role="region" aria-label="Bulk actions" className={BULK}>
            <b aria-hidden="true" className="font-semibold">
              {nSel} selected
            </b>
            <div className="ml-auto flex items-center gap-2">
              {bulkActions}
              <button
                type="button"
                aria-label="Clear selection"
                onClick={() => {
                  setSelected(selected.filter((id) => !idSet.has(id)))
                  // The bar unmounts when nothing is selected, so keep focus on a control that stays.
                  selectAll.current?.focus()
                }}
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[7px] hover:bg-surface-sunken"
              >
                <XIcon />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div ref={scroller} tabIndex={overflowing ? 0 : undefined} className="min-h-0 flex-1 overflow-auto focus-visible:outline-offset-[-2px]">
        <table
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-busy={loading ? true : undefined}
          className="w-full border-separate border-spacing-0 text-(length:--t-fs)"
        >
          <thead>
            <tr>
              {selectable ? (
                <th scope="col" className={cn(TH, 'w-10 pr-0')}>
                  <Check
                    label="Select all rows"
                    checked={allOn}
                    indeterminate={nSel > 0 && !allOn}
                    disabled={ids.length === 0}
                    inputRef={selectAll}
                    onChange={() => setSelected(allOn ? selected.filter((id) => !idSet.has(id)) : [...selected, ...ids.filter((id) => !selSet.has(id))])}
                  />
                </th>
              ) : null}
              {cols.map((col) => {
                const on = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    style={col.width === undefined ? undefined : { width: col.width }}
                    className={cn(TH, ALIGN[col.align ?? (col.numeric ? 'right' : 'left')], col.numeric && NUM)}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => changeSort(col)}
                        className={cn('inline-flex cursor-pointer items-center gap-1 rounded-[5px] hover:text-fg', on && 'text-fg')}
                      >
                        {col.header}
                        <span aria-hidden="true" className={on ? 'inline-flex' : 'inline-flex opacity-45'}>
                          {on && sort.dir === 'asc' ? <ChevronUpIcon className="size-2.5" /> : <ChevronDownIcon className="size-2.5" />}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  )
}
