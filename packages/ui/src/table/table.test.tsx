import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Table, type TableColumn, type TableSort } from './table.tsx'
import * as examples from './table.examples.tsx'

interface Svc {
  id: string
  name: string
  severity?: 'normal' | 'info' | 'advisory' | 'caution' | 'critical'
  score: number
}

const rows: Svc[] = [
  { id: 'a', name: 'ledger', severity: 'normal', score: 95 },
  { id: 'b', name: 'payments-api', severity: 'critical', score: 41 },
  { id: 'c', name: 'auth', severity: 'advisory', score: 77 },
  { id: 'd', name: 'checkout', severity: 'caution', score: 58 },
]

const columns: TableColumn<Svc>[] = [
  { key: 'name', header: 'Service', rowHeader: true, sortable: true },
  { key: 'score', header: 'Score', numeric: true, sortable: true },
]

/** Names of the rows in the order they are shown. */
const plain = rows.map(({ severity: _s, ...r }) => r)

interface Item {
  id: string
  name: string
  level?: 'normal' | 'info' | 'advisory' | 'caution' | 'critical'
}

interface Reading {
  id: string
  name: string
  value?: number | null
}

const order = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).getAllByRole('rowheader')[0]?.textContent)

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Table', () => {
  it('renders real table semantics', () => {
    render(<Table aria-label="Services" columns={columns} data={rows} />)
    expect(screen.getByRole('table', { name: 'Services' })).toBeTruthy()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3) // Status, Service, Score
    expect(screen.getAllByRole('rowheader')).toHaveLength(4)
  })

  it('sorts by severity, worst first, by default', () => {
    render(<Table columns={columns} data={rows} />)
    expect(order()).toEqual(['payments-api', 'checkout', 'auth', 'ledger'])
    expect(screen.getByRole('columnheader', { name: /Status/ }).getAttribute('aria-sort')).toBe('descending')
  })

  it('keeps the order of data when rows have no severity', () => {
    render(<Table columns={columns} data={plain} />)
    expect(order()).toEqual(['ledger', 'payments-api', 'auth', 'checkout'])
    expect(document.querySelector('[aria-sort]')).toBeNull()
  })

  it('marks severity with a status bar, an icon and a word, never colour alone', () => {
    render(<Table columns={columns} data={rows} />)
    const row = screen.getByText('payments-api').closest('tr') as HTMLElement
    expect(row.dataset.tone).toBe('critical')
    expect(within(row).getByText('Critical')).toBeTruthy()
    expect(row.querySelector('svg')).toBeTruthy()
    expect(row.firstElementChild?.className).toContain('inset_3px_0_0')
    // normal rows are calm: label, no bar
    const normal = screen.getByText('ledger').closest('tr') as HTMLElement
    expect(within(normal).getByText('Normal')).toBeTruthy()
    expect(normal.firstElementChild?.className).not.toContain('inset_3px_0_0')
  })

  it('honours defaultSort', () => {
    render(<Table columns={columns} data={rows} defaultSort={{ key: 'name', dir: 'asc' }} />)
    expect(order()).toEqual(['auth', 'checkout', 'ledger', 'payments-api'])
  })

  it('sorts when a sortable header is activated, and toggles the direction', () => {
    render(<Table columns={columns} data={rows} />)
    const score = () => screen.getByRole('columnheader', { name: /Score/ })
    fireEvent.click(within(score()).getByRole('button'))
    expect(order()).toEqual(['payments-api', 'checkout', 'auth', 'ledger']) // 41, 58, 77, 95 ascending
    expect(score().getAttribute('aria-sort')).toBe('ascending')
    expect(screen.getByRole('columnheader', { name: /Status/ }).getAttribute('aria-sort')).toBeNull()
    fireEvent.click(within(score()).getByRole('button'))
    expect(order()).toEqual(['ledger', 'auth', 'checkout', 'payments-api'])
    expect(score().getAttribute('aria-sort')).toBe('descending')
  })

  it('sorts severity descending first, then flips', () => {
    render(<Table columns={columns} data={rows} defaultSort={null} />)
    const status = () => screen.getByRole('columnheader', { name: /Status/ })
    fireEvent.click(within(status()).getByRole('button'))
    expect(order()[0]).toBe('payments-api')
    fireEvent.click(within(status()).getByRole('button'))
    expect(order()[0]).toBe('ledger')
  })

  it('does not render sort buttons for columns that are not sortable', () => {
    render(<Table columns={[{ key: 'name', header: 'Service' }]} data={plain} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('sorts by sortValue when the accessor renders JSX', () => {
    const cols: TableColumn<Svc>[] = [
      { key: 'name', header: 'Service', rowHeader: true },
      { key: 'score', header: 'Score', sortable: true, accessor: (r) => <b>{r.score}%</b>, sortValue: (r) => r.score },
    ]
    render(<Table columns={cols} data={plain} defaultSort={{ key: 'score', dir: 'desc' }} />)
    expect(order()).toEqual(['ledger', 'auth', 'checkout', 'payments-api'])
  })

  it('takes the severity of a row from getRowSeverity, for the status bar and the default sort', () => {
    const items: Item[] = [
      { id: '1', name: 'low', level: 'info' },
      { id: '2', name: 'bad', level: 'critical' },
      { id: '3', name: 'fine', level: 'normal' },
      { id: '4', name: 'none' },
    ]
    render(
      <Table<Item>
        columns={[{ key: 'name', header: 'Name', rowHeader: true }]}
        data={items}
        getRowSeverity={(r) => r.level}
      />,
    )
    expect(order()).toEqual(['bad', 'low', 'fine', 'none'])
    expect(screen.getByRole('columnheader', { name: /Status/ }).getAttribute('aria-sort')).toBe('descending')
    const bad = screen.getByText('bad').closest('tr') as HTMLElement
    expect(bad.dataset.tone).toBe('critical')
    expect(within(bad).getByText('Critical')).toBeTruthy()
    expect(bad.firstElementChild?.className).toContain('inset_3px_0_0')
    expect((screen.getByText('none').closest('tr') as HTMLElement).dataset.tone).toBe('neutral')
  })

  it('puts rows with a missing sort value last, in both directions', () => {
    const readings: Reading[] = [
      { id: '1', name: 'a', value: 5 },
      { id: '2', name: 'b' },
      { id: '3', name: 'c', value: 2 },
      { id: '4', name: 'd', value: null },
    ]
    render(
      <Table<Reading>
        columns={[
          { key: 'name', header: 'Name', rowHeader: true },
          { key: 'value', header: 'Value', sortable: true, accessor: (r) => r.value ?? '-', sortValue: (r) => r.value },
        ]}
        data={readings}
        defaultSort={{ key: 'value', dir: 'asc' }}
      />,
    )
    expect(order()).toEqual(['c', 'a', 'b', 'd'])
    fireEvent.click(within(screen.getByRole('columnheader', { name: /Value/ })).getByRole('button'))
    expect(order()).toEqual(['a', 'c', 'b', 'd'])
  })

  it('is controllable with sort and onSortChange', () => {
    const onSortChange = vi.fn()
    const { rerender } = render(<Table columns={columns} data={rows} sort={{ key: 'score', dir: 'asc' }} onSortChange={onSortChange} />)
    fireEvent.click(within(screen.getByRole('columnheader', { name: /Score/ })).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'score', dir: 'desc' })
    expect(order()[0]).toBe('payments-api') // unchanged until the parent updates `sort`
    rerender(<Table columns={columns} data={rows} sort={{ key: 'score', dir: 'desc' }} onSortChange={onSortChange} />)
    expect(order()[0]).toBe('ledger')
  })

  it('aligns numeric columns right in tabular figures', () => {
    render(<Table columns={columns} data={rows} />)
    const cell = screen.getByText('95')
    expect(cell.className).toContain('text-right')
    expect(cell.className).toContain('tabular-nums')
    expect(screen.getByRole('columnheader', { name: /Score/ }).className).toContain('text-right')
  })

  it('applies width and the identifying column as a row header', () => {
    render(<Table columns={[{ key: 'name', header: 'Service', rowHeader: true, width: 120 }]} data={plain} />)
    expect(screen.getByRole('columnheader').style.width).toBe('120px')
    expect(screen.getByRole('rowheader', { name: 'ledger' })).toBeTruthy()
  })

  describe('selection', () => {
    it('selects rows, with select-all and an indeterminate state', () => {
      render(<Table selectable columns={columns} data={rows} />)
      const all = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select payments-api' }))
      expect(all.indeterminate).toBe(true)
      expect(all.checked).toBe(false)
      expect(screen.getByRole('status').textContent).toBe('1 selected')
      fireEvent.click(all)
      expect(all.indeterminate).toBe(false)
      expect(all.checked).toBe(true)
      expect(screen.getByRole('status').textContent).toBe('4 selected')
      fireEvent.click(all)
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
    })

    it('shows the bulk bar with your actions and a clear button', () => {
      render(
        <Table
          selectable
          defaultSelected={['a', 'b']}
          columns={columns}
          data={rows}
          bulkActions={<button type="button">Acknowledge</button>}
        />,
      )
      const bar = screen.getByRole('region', { name: 'Bulk actions' })
      expect(within(bar).getByText('2 selected')).toBeTruthy()
      expect(within(bar).getByRole('button', { name: 'Acknowledge' })).toBeTruthy()
      fireEvent.click(within(bar).getByRole('button', { name: 'Clear selection' }))
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
    })

    it('marks selected rows', () => {
      render(<Table selectable defaultSelected={['b']} columns={columns} data={rows} />)
      expect((screen.getByText('payments-api').closest('tr') as HTMLElement).dataset.selected).toBe('true')
      expect((screen.getByText('ledger').closest('tr') as HTMLElement).dataset.selected).toBeUndefined()
    })

    it('is controllable and uses getRowId', () => {
      const onSelectedChange = vi.fn()
      const { rerender } = render(
        <Table selectable selected={[]} onSelectedChange={onSelectedChange} getRowId={(r) => r.name} columns={columns} data={rows} />,
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select auth' }))
      expect(onSelectedChange).toHaveBeenCalledWith(['auth'])
      expect((screen.getByRole('checkbox', { name: 'Select auth' }) as HTMLInputElement).checked).toBe(false)
      rerender(<Table selectable selected={['auth']} onSelectedChange={onSelectedChange} getRowId={(r) => r.name} columns={columns} data={rows} />)
      expect((screen.getByRole('checkbox', { name: 'Select auth' }) as HTMLInputElement).checked).toBe(true)
    })

    it('names row checkboxes with rowLabel when given', () => {
      render(<Table selectable rowLabel={(r) => `service ${r.name}`} columns={columns} data={rows} />)
      expect(screen.getByRole('checkbox', { name: 'Select service ledger' })).toBeTruthy()
    })

    it('moves focus to the select-all checkbox when "Clear selection" removes the bar', () => {
      render(<Table selectable defaultSelected={['a', 'b']} columns={columns} data={rows} />)
      const clear = screen.getByRole('button', { name: 'Clear selection' })
      clear.focus()
      expect(document.activeElement).toBe(clear)
      fireEvent.click(clear)
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
      expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Select all rows' }))
    })

    it('announces the count through one live region that is always mounted', () => {
      const { rerender } = render(<Table selectable columns={columns} data={rows} />)
      const status = screen.getByRole('status')
      expect(status.textContent).toBe('')
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select auth' }))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select ledger' }))
      expect(screen.getAllByRole('status')).toHaveLength(1)
      expect(screen.getByRole('status')).toBe(status) // the same element, so a screen reader hears the change
      expect(status.textContent).toBe('2 selected')
      // the visible count in the bar is plain text, not a second live region
      expect(within(screen.getByRole('region', { name: 'Bulk actions' })).queryByRole('status')).toBeNull()
      fireEvent.click(within(screen.getByRole('region', { name: 'Bulk actions' })).getByRole('button', { name: 'Clear selection' }))
      expect(status.textContent).toBe('')
      rerender(<Table selectable columns={columns} data={[]} loading />)
      expect(screen.getByRole('status')).toBe(status)
      expect(status.textContent).toBe('Loading')
    })

    it('disables select-all and hides the bulk bar while the rows are not shown', () => {
      const { rerender } = render(<Table selectable defaultSelected={['a', 'b']} columns={columns} data={rows} />)
      expect(screen.getByRole('region', { name: 'Bulk actions' })).toBeTruthy()
      rerender(<Table selectable defaultSelected={['a', 'b']} columns={columns} data={rows} loading />)
      expect((screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement).disabled).toBe(true)
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
      expect(screen.queryByRole('checkbox', { name: 'Select ledger' })).toBeNull()
      rerender(<Table selectable columns={columns} data={rows} error />)
      expect((screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement).disabled).toBe(true)
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
      // the selection is kept for when the rows come back
      rerender(<Table selectable defaultSelected={['a', 'b']} columns={columns} data={rows} />)
      expect((screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement).disabled).toBe(false)
      expect(within(screen.getByRole('region', { name: 'Bulk actions' })).getByText('2 selected')).toBeTruthy()
    })

    it('keeps selecting working after sorting', () => {
      render(<Table selectable columns={columns} data={rows} />)
      fireEvent.click(within(screen.getByRole('columnheader', { name: /Score/ })).getByRole('button'))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select ledger' }))
      expect(screen.getByRole('status').textContent).toBe('1 selected')
    })
  })

  describe('states', () => {
    it('shows skeleton rows while loading and marks the table busy', () => {
      render(<Table aria-label="T" columns={columns} data={[]} loading />)
      expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true')
      expect(screen.getAllByRole('row').length).toBeGreaterThan(2)
      expect(document.querySelector('.animate-calmon-shim')).toBeTruthy()
      expect(screen.getByText('Loading')).toBeTruthy()
    })

    it('shows custom loading, empty and error content', () => {
      const { rerender } = render(<Table columns={columns} data={[]} loading={<p>Fetching…</p>} />)
      expect(screen.getByText('Fetching…')).toBeTruthy()
      rerender(<Table columns={columns} data={[]} empty={<p>Nothing here</p>} />)
      expect(screen.getByText('Nothing here')).toBeTruthy()
      rerender(<Table columns={columns} data={rows} error={<p>Boom</p>} />)
      expect(screen.getByText('Boom')).toBeTruthy()
      expect(screen.queryByText('ledger')).toBeNull()
    })

    it('has built-in empty and error messages', () => {
      const { rerender } = render(<Table columns={columns} data={[]} />)
      expect(screen.getByText('No results')).toBeTruthy()
      rerender(<Table columns={columns} data={[]} error />)
      expect(screen.getByRole('alert').textContent).toContain('Couldn’t load the data')
    })

    it('shows nothing extra when empty is false', () => {
      render(<Table columns={columns} data={[]} empty={false} />)
      expect(screen.queryByText('No results')).toBeNull()
    })
  })

  describe('density', () => {
    it('inherits the page density unless a density prop is set', () => {
      const { container } = render(<Table columns={columns} data={rows} />)
      expect((container.firstElementChild as HTMLElement).hasAttribute('data-density')).toBe(false)
      expect((container.firstElementChild as HTMLElement).className).toContain('[[data-density=compact]_&]:[--t-rh:32px]')
    })

    it('sets 32px rows for compact and passes the density to nested controls', () => {
      const { container } = render(<Table density="compact" columns={columns} data={rows} />)
      const root = container.firstElementChild as HTMLElement
      expect(root.dataset.density).toBe('compact')
      expect(root.className).toContain('[--t-rh:32px]')
    })

    it('makes station rows large', () => {
      const { container } = render(<Table density="station" columns={columns} data={rows} />)
      expect((container.firstElementChild as HTMLElement).className).toContain('[--t-rh:72px]')
    })
  })

  it('merges className and passes other props to the root', () => {
    const { container } = render(<Table className="max-h-40" data-testid="t" columns={columns} data={rows} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('max-h-40')
    expect(root.dataset.testid).toBe('t')
  })

  it('makes the scroll area a tab stop only when it overflows', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    const scrollWidth = vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(500)
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(300)
    const wide = render(<Table columns={columns} data={rows} />)
    expect(wide.container.querySelector('div.overflow-auto')?.getAttribute('tabindex')).toBe('0')
    wide.unmount()
    scrollWidth.mockReturnValue(300)
    const fits = render(<Table columns={columns} data={rows} />)
    expect(fits.container.querySelector('div.overflow-auto')?.hasAttribute('tabindex')).toBe(false)
  })

  it('keeps the header sticky', () => {
    render(<Table columns={columns} data={rows} />)
    expect(screen.getAllByRole('columnheader')[0]?.className).toContain('sticky')
  })

  it('works when the parent owns the sort in state', () => {
    function Parent() {
      const [sort, setSort] = useState<TableSort | null>({ key: 'name', dir: 'asc' })
      return <Table columns={columns} data={rows} sort={sort} onSortChange={setSort} />
    }
    render(<Parent />)
    expect(order()[0]).toBe('auth')
    fireEvent.click(within(screen.getByRole('columnheader', { name: /Service/ })).getByRole('button'))
    expect(order()[0]).toBe('payments-api')
  })
})

testExamplesAxe(examples)
