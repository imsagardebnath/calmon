import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { StationGrid, StationTile, type StationItem } from './station-grid.tsx'
import * as examples from './station-grid.examples.tsx'

const items: StationItem[] = [
  { id: 'orders', name: 'orders-api', severity: 'normal', score: 88 },
  { id: 'search', name: 'search-index', severity: 'caution', score: 64, detail: 'Replica lag 92 s' },
  { id: 'payments', name: 'payments-api', severity: 'critical', score: 41, detail: 'Errors 4.2%', data: [2, 5, 9, 18, 42] },
  { id: 'checkout', name: 'checkout-web', severity: 'caution', score: 58, detail: 'p95 1.8 s' },
  { id: 'ledger', name: 'ledger', severity: 'normal', score: 95 },
  { id: 'auth', name: 'auth-service', severity: 'advisory', score: 77 },
]

const names = () => within(screen.getByRole('list')).getAllByRole('listitem').map((li) => li.textContent)

describe('StationGrid', () => {
  it('sorts worst first by default: severity, then the lowest score', () => {
    render(<StationGrid items={items} />)
    const tiles = within(screen.getByRole('list')).getAllByRole('group')
    expect(tiles.map((t) => t.getAttribute('aria-label')?.split(',')[0])).toEqual([
      'payments-api',
      'checkout-web',
      'search-index',
      'auth-service',
      'orders-api',
      'ledger',
    ])
  })

  it('keeps the DOM order equal to the visual order', () => {
    render(<StationGrid items={items} />)
    expect(names()[0]).toContain('payments-api')
    expect(names()[5]).toContain('ledger')
  })

  it('can sort by name, and never changes the order of the items it was given', () => {
    const copy = [...items]
    render(<StationGrid items={items} sort="name" />)
    expect(names().map((n) => n?.match(/[a-z-]+/)?.[0])).toEqual([
      'auth-service',
      'checkout-web',
      'ledger',
      'orders-api',
      'payments-api',
      'search-index',
    ])
    expect(items).toEqual(copy)
  })

  it('names each tile with its severity, score and detail', () => {
    render(<StationGrid items={items} />)
    expect(screen.getByRole('group', { name: 'payments-api, Critical, score 41, Errors 4.2%' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'ledger, Normal, score 95' })).toBeTruthy()
  })

  it('shows a severity icon on every tile, in a different shape per severity', () => {
    render(<StationGrid items={items} />)
    const shape = (name: string) =>
      screen.getByRole('group', { name: new RegExp(`^${name}`) }).querySelector('svg')?.innerHTML
    const shapes = new Set([shape('ledger'), shape('auth-service'), shape('checkout-web'), shape('payments-api')])
    expect(shapes.size).toBe(4)
  })

  it('says the severity word on tiles that are not normal, and keeps normal quiet', () => {
    render(<StationGrid items={items} summary={false} />)
    expect(within(screen.getByRole('group', { name: /^payments-api/ })).getByText('Critical')).toBeTruthy()
    expect(screen.getByRole('group', { name: /^ledger/ }).textContent).toBe('ledger95')
  })

  it('summarises the counts as text, worst first', () => {
    render(<StationGrid items={items} />)
    const summary = screen.getByText(/1 critical/).parentElement?.parentElement
    expect(summary?.textContent).toBe('1 critical, 2 caution, 1 advisory, 2 normal')
  })

  it('always shows the critical count, even at zero, and hides empty severities', () => {
    render(<StationGrid items={[{ id: 'a', name: 'a', severity: 'normal', score: 90 }]} />)
    expect(screen.getByText('0 critical')).toBeTruthy()
    expect(screen.queryByText(/caution/)).toBeNull()
  })

  it('announces only the critical count, politely, and nothing else', () => {
    const { container } = render(<StationGrid items={items} />)
    const live = container.querySelectorAll('[role="status"], [aria-live]')
    expect(live).toHaveLength(1)
    expect(live[0]?.textContent).toBe('1 critical')
    expect(screen.getByRole('list').closest('[aria-live]')).toBeNull()
  })

  it('updates the critical live region when the count changes', () => {
    const { rerender } = render(<StationGrid items={items} />)
    rerender(<StationGrid items={items.map((i) => ({ ...i, severity: 'critical' }))} />)
    expect(screen.getByRole('status').textContent).toBe('6 critical')
  })

  it('hides the summary with summary={false}', () => {
    render(<StationGrid items={items} summary={false} />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('is a labelled list', () => {
    render(<StationGrid items={items} label="Production" />)
    expect(screen.getByRole('list', { name: 'Production' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('fits columns to the width by default and honours a fixed number', () => {
    const { rerender } = render(<StationGrid items={items} />)
    expect(screen.getByRole('list').className).toContain('auto-fill')
    expect(screen.getByRole('list').style.gridTemplateColumns).toBe('')
    rerender(<StationGrid items={items} columns={4} />)
    expect(screen.getByRole('list').style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))')
  })

  it('tints and pulses only critical tiles, and turns the pulse off for reduced motion', () => {
    render(<StationGrid items={items} />)
    const cls = (name: RegExp) => screen.getByRole('group', { name }).className
    expect(cls(/^payments-api/)).toContain('after:animate-calmon-crit')
    expect(cls(/^payments-api/)).toContain('motion-reduce:after:animate-none')
    expect(cls(/^payments-api/)).toContain('bg-tone-soft')
    for (const name of [/^checkout-web/, /^auth-service/, /^ledger/]) {
      expect(cls(name)).not.toContain('animate')
      expect(cls(name)).not.toContain('bg-tone-soft')
    }
  })

  it('gives non-normal tiles a left rule and normal tiles none', () => {
    render(<StationGrid items={items} />)
    expect(screen.getByRole('group', { name: /^checkout-web/ }).className).toContain('before:bg-tone')
    expect(screen.getByRole('group', { name: /^ledger/ }).className).not.toContain('before:bg-tone')
  })

  it('makes tiles buttons with onSelect, and passes the item', () => {
    const onSelect = vi.fn()
    render(<StationGrid items={items} onSelect={onSelect} />)
    const button = screen.getByRole('button', { name: /^payments-api, Critical/ })
    fireEvent.click(button)
    expect(onSelect).toHaveBeenCalledWith(items[2])
    expect(screen.getAllByRole('button')).toHaveLength(6)
  })

  it('makes tiles links with an href, and an item onSelect wins over the grid one', () => {
    const grid = vi.fn()
    const own = vi.fn()
    render(
      <StationGrid
        items={[
          { id: 'a', name: 'a', severity: 'normal', score: 90, href: '/a' },
          { id: 'b', name: 'b', severity: 'normal', score: 91, onSelect: own },
        ]}
        onSelect={grid}
      />,
    )
    expect(screen.getByRole('link', { name: /^a,/ }).getAttribute('href')).toBe('/a')
    fireEvent.click(screen.getByRole('button', { name: /^b,/ }))
    expect(own).toHaveBeenCalledTimes(1)
    expect(grid).not.toHaveBeenCalled()
  })

  it('leaves tiles static without href or onSelect', () => {
    render(<StationGrid items={items} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('lets className override defaults and passes props to the root', () => {
    const { container } = render(<StationGrid items={items} className="gap-6" data-x="1" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('gap-6')
    expect(root.className).not.toContain('gap-3')
    expect(root.dataset.x).toBe('1')
  })
})

describe('StationTile', () => {
  it('hides the trend line from screen readers and draws it only with two or more points', () => {
    const { container, rerender } = render(<StationTile name="a" severity="caution" score={60} data={[1, 2, 3]} />)
    expect(container.querySelector('svg[aria-hidden="true"][viewBox="0 0 100 30"]')).not.toBeNull()
    rerender(<StationTile name="a" severity="caution" score={60} data={[1]} />)
    expect(container.querySelector('svg[viewBox="0 0 100 30"]')).toBeNull()
  })

  it('passes ref, id, data-* and aria-* props to the root, whichever element it is', () => {
    let group: HTMLElement | null = null
    let button: HTMLElement | null = null
    let link: HTMLElement | null = null
    render(
      <>
        <StationTile ref={(el) => { group = el }} id="g" data-x="1" aria-describedby="d" name="a" severity="normal" score={90} />
        <StationTile ref={(el) => { button = el }} id="b" data-x="2" name="b" severity="normal" score={90} onSelect={() => {}} />
        <StationTile ref={(el) => { link = el }} id="l" data-x="3" name="c" severity="normal" score={90} href="/c" />
      </>,
    )
    const g = group as HTMLElement | null
    const b = button as HTMLElement | null
    const l = link as HTMLElement | null
    expect(g?.tagName).toBe('DIV')
    expect(b?.tagName).toBe('BUTTON')
    expect(l?.tagName).toBe('A')
    expect([g?.id, b?.id, l?.id]).toEqual(['g', 'b', 'l'])
    expect([g?.dataset.x, b?.dataset.x, l?.dataset.x]).toEqual(['1', '2', '3'])
    expect(g?.getAttribute('aria-describedby')).toBe('d')
    // Still named and toned by the tile itself.
    expect(g?.getAttribute('aria-label')).toBe('a, Normal, score 90')
    expect(g?.dataset.tone).toBe('normal')
  })

  it('runs a caller onClick together with onSelect, and merges className', () => {
    const onClick = vi.fn()
    const onSelect = vi.fn()
    render(<StationTile name="a" severity="caution" score={60} onClick={onClick} onSelect={onSelect} className="h-full" />)
    const tile = screen.getByRole('button')
    expect(tile.className).toContain('h-full')
    fireEvent.click(tile)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('draws normal trend lines in grey and the others in their severity', () => {
    const { container, rerender } = render(<StationTile name="a" severity="normal" score={90} data={[1, 2, 3]} />)
    expect((container.querySelector('svg[viewBox="0 0 100 30"]') as SVGElement).dataset.tone).toBe('neutral')
    rerender(<StationTile name="a" severity="critical" score={30} data={[1, 2, 3]} />)
    expect((container.querySelector('svg[viewBox="0 0 100 30"]') as SVGElement).dataset.tone).toBe('critical')
  })
})

testExamplesAxe(examples)
