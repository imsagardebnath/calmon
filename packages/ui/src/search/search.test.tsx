import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Search, type SearchItem } from './search.tsx'
import * as examples from './search.examples.tsx'

const index = [
  { label: 'payments-api', description: 'Caution, score 71', type: 'Services' },
  { label: 'payments-worker', description: 'Normal, score 90', type: 'Services' },
  { label: 'P. Shah', description: 'Payments, on call', type: 'People' },
  { label: 'INC-2041 Payments failing', description: 'Critical', type: 'Incidents' },
]
const find = (q: string) => index.filter((x) => `${x.label} ${x.description}`.toLowerCase().includes(q.trim().toLowerCase()))

const input = () => screen.getByRole('combobox') as HTMLInputElement
const options = () => screen.queryAllByRole('option')

function renderLive(props: Partial<React.ComponentProps<typeof Search<(typeof index)[number]>>> = {}) {
  const suggestions = vi.fn(find)
  const onSelect = vi.fn()
  const utils = render(<Search placeholder="Search services" suggestions={suggestions} debounce={10} onSelect={onSelect} {...props} />)
  return { suggestions, onSelect, ...utils }
}

describe('Search: plain field', () => {
  it('is a search landmark with a search box named by its placeholder', () => {
    render(<Search placeholder="Search services" />)
    expect(screen.getByRole('search')).toBeTruthy()
    const box = screen.getByRole('searchbox', { name: 'Search services' }) as HTMLInputElement
    expect(box.type).toBe('search')
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('names the search landmark like the input, so several searches stay distinguishable', () => {
    render(
      <>
        <Search placeholder="Search services" />
        <Search aria-label="Search the docs" />
      </>,
    )
    expect(screen.getByRole('search', { name: 'Search services' })).toBeTruthy()
    expect(screen.getByRole('search', { name: 'Search the docs' })).toBeTruthy()
  })

  it('defaults the placeholder to "Search"', () => {
    render(<Search />)
    expect((screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement).placeholder).toBe('Search')
  })

  it('lets aria-label win over the placeholder', () => {
    render(<Search placeholder="Search" aria-label="Find a service" />)
    expect(screen.getByRole('searchbox', { name: 'Find a service' })).toBeTruthy()
  })

  it('is named by aria-labelledby instead of the placeholder, and passes id and aria-describedby through', () => {
    render(
      <>
        <h2 id="title">Services</h2>
        <p id="hint">Type a name.</p>
        <Search id="svc" placeholder="payments-api" aria-labelledby="title" aria-describedby="hint" />
      </>,
    )
    const box = screen.getByRole('searchbox', { name: 'Services' })
    expect(box.getAttribute('aria-label')).toBeNull()
    expect(box.id).toBe('svc')
    expect(box.getAttribute('aria-describedby')).toBe('hint')
  })

  it('works uncontrolled and reports the text', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Search onValueChange={onValueChange} />)
    await user.type(screen.getByRole('searchbox'), 'ab')
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(['a', 'ab'])
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('ab')
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    render(<Search value="fixed" onValueChange={() => {}} />)
    await user.type(screen.getByRole('searchbox'), 'x')
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('fixed')
  })

  it('starts from defaultValue', () => {
    render(<Search defaultValue="payments" />)
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('payments')
  })

  it('shows a clear button only while there is text, and clearing refocuses the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Search onValueChange={onValueChange} />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    await user.type(screen.getByRole('searchbox'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('')
    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
  })

  it('shows the spinner state while loading', () => {
    render(<Search loading />)
    expect(screen.getByRole('searchbox').getAttribute('aria-busy')).toBe('true')
  })

  it('does not show clear or shortcut when disabled', () => {
    render(<Search disabled defaultValue="x" shortcut="/" />)
    expect((screen.getByRole('searchbox') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    expect(document.querySelector('kbd')).toBeNull()
  })

  it('follows density by default, with 30, 38 and 46px for explicit sizes', () => {
    render(
      <>
        <Search aria-label="auto" />
        <Search aria-label="sm" size="sm" />
        <Search aria-label="md" size="md" />
        <Search aria-label="lg" size="lg" />
      </>,
    )
    expect(screen.getByRole('searchbox', { name: 'auto' }).className).toContain('h-(--control-h)')
    expect(screen.getByRole('searchbox', { name: 'sm' }).className).toContain('h-[30px]')
    expect(screen.getByRole('searchbox', { name: 'md' }).className).toContain('h-[38px]')
    expect(screen.getByRole('searchbox', { name: 'lg' }).className).toContain('h-[46px]')
    expect(screen.getByRole('searchbox', { name: 'lg' }).className).toContain('pl-10')
  })

  it('has a pill shape', () => {
    render(
      <>
        <Search aria-label="round" shape="pill" />
        <Search aria-label="square" />
      </>,
    )
    expect(screen.getByRole('searchbox', { name: 'round' }).className).toContain('rounded-pill')
    expect(screen.getByRole('searchbox', { name: 'square' }).className).not.toContain('rounded-pill')
  })

  it('puts className on the wrapper and forwards ref and other props to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Search className="max-w-none" ref={ref} name="q" />)
    expect(ref.current).toBe(screen.getByRole('searchbox'))
    expect(ref.current?.name).toBe('q')
    const wrapper = screen.getByRole('search')
    expect(wrapper.className).toContain('max-w-none')
    expect(wrapper.className).not.toContain('max-w-[420px]')
  })
})

describe('Search: shortcut', () => {
  it('shows a key hint while empty, and focuses the field from anywhere', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Search shortcut="/" />
        <input aria-label="other" />
      </>,
    )
    expect(document.querySelector('kbd')?.textContent).toBe('/')
    expect(screen.getByRole('searchbox').getAttribute('aria-keyshortcuts')).toBe('/')
    await user.keyboard('/')
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
  })

  it('does not steal the key while typing in another field', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Search shortcut="/" />
        <input aria-label="other" />
      </>,
    )
    await user.click(screen.getByLabelText('other'))
    await user.keyboard('a/b')
    expect(document.activeElement).toBe(screen.getByLabelText('other'))
    expect((screen.getByLabelText('other') as HTMLInputElement).value).toBe('a/b')
  })

  it('leaves the key alone when the field is disabled, and works again once it is enabled', () => {
    const { rerender } = render(<Search disabled shortcut="/" />)
    expect(fireEvent.keyDown(document.body, { key: '/' })).toBe(true) // not default-prevented
    expect(document.activeElement).not.toBe(screen.getByRole('searchbox'))
    rerender(<Search shortcut="/" />)
    expect(fireEvent.keyDown(document.body, { key: '/' })).toBe(false)
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
  })

  it('hides the key hint once there is text', async () => {
    const user = userEvent.setup()
    render(<Search shortcut="/" />)
    await user.type(screen.getByRole('searchbox'), 'a')
    expect(document.querySelector('kbd')).toBeNull()
  })
})

describe('Search: suggestions combobox', () => {
  it('is a collapsed combobox until there is something to show', () => {
    renderLive()
    const box = input()
    expect(box.getAttribute('aria-expanded')).toBe('false')
    expect(box.getAttribute('aria-autocomplete')).toBe('list')
    const listbox = document.getElementById(box.getAttribute('aria-controls') ?? '')
    expect(listbox?.getAttribute('role')).toBe('listbox')
    expect(box.getAttribute('aria-activedescendant')).toBeNull()
    expect(options()).toHaveLength(0)
  })

  it('waits for the debounce, then lists matches, expanded, with the first active', async () => {
    const user = userEvent.setup()
    const { suggestions } = renderLive({ debounce: 150 })
    await user.type(input(), 'pay')
    expect(input().getAttribute('aria-busy')).toBe('true')
    expect(suggestions).not.toHaveBeenCalled()
    await waitFor(() => expect(options().length).toBeGreaterThan(0))
    expect(suggestions).toHaveBeenCalledTimes(1)
    expect(suggestions).toHaveBeenCalledWith('pay')
    expect(input().getAttribute('aria-busy')).toBeNull()
    expect(input().getAttribute('aria-expanded')).toBe('true')
    expect(options()).toHaveLength(4)
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0]?.id)
    expect(options()[0]?.getAttribute('aria-selected')).toBe('true')
    expect(options()[1]?.getAttribute('aria-selected')).toBe('false')
  })

  it('debounces: only the last query runs', async () => {
    const { suggestions } = renderLive({ debounce: 30 })
    act(() => input().focus())
    fireEvent.change(input(), { target: { value: 'p' } })
    fireEvent.change(input(), { target: { value: 'pa' } })
    fireEvent.change(input(), { target: { value: 'pay' } })
    await waitFor(() => expect(suggestions).toHaveBeenCalledTimes(1))
    expect(suggestions).toHaveBeenCalledWith('pay')
  })

  it('highlights the matching text', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'worker')
    await screen.findByRole('option')
    const marks = Array.from(document.querySelectorAll('mark')).map((m) => m.textContent)
    expect(marks).toEqual(['worker'])
  })

  it('announces the number of results politely', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'payments-')
    await screen.findAllByRole('option')
    expect(screen.getByRole('status').textContent).toBe('2 results')
  })

  it('says so when nothing matches', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'zzz')
    expect(await screen.findByText(/No results for/)).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('No results')
    expect(input().getAttribute('aria-expanded')).toBe('false')
    expect(options()).toHaveLength(0)
  })

  it('moves through the list with ArrowDown and ArrowUp, wrapping at the ends', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    const active = () => options().findIndex((o) => o.id === input().getAttribute('aria-activedescendant'))
    expect(active()).toBe(0)
    await user.keyboard('{ArrowDown}')
    expect(active()).toBe(1)
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(active()).toBe(0)
    await user.keyboard('{ArrowUp}')
    expect(active()).toBe(3)
    expect(options()[3]?.getAttribute('aria-selected')).toBe('true')
  })

  it('selects the active item with Enter and closes', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderLive()
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0]?.[0]).toBe(index[1])
    expect(input().value).toBe('payments-worker')
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })

  it('selects an item on click, and the field keeps focus', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderLive()
    await user.type(input(), 'pay')
    await user.click(await screen.findByRole('option', { name: /P\. Shah/ }))
    expect(onSelect.mock.calls[0]?.[0]).toBe(index[2])
    expect(input().value).toBe('P. Shah')
    expect(document.activeElement).toBe(input())
  })

  it('highlights an item as the pointer moves over it', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.hover(options()[2] as HTMLElement)
    expect(options()[2]?.getAttribute('aria-selected')).toBe('true')
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[2]?.id)
  })

  it('Escape clears the text first, then closes the list', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderLive({ recent: [index[0]!] })
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.keyboard('{Escape}')
    expect(input().value).toBe('')
    expect(input().getAttribute('aria-expanded')).toBe('true') // now showing recent
    await user.keyboard('{Escape}')
    expect(input().getAttribute('aria-expanded')).toBe('false')
    expect(input().value).toBe('')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('closes when the field loses focus', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Search suggestions={find} debounce={10} />
        <button>other</button>
      </>,
    )
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.click(screen.getByText('other'))
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the list again with ArrowDown', async () => {
    const user = userEvent.setup()
    renderLive()
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.keyboard('{Escape}') // clears
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    await user.click(document.body)
    expect(input().getAttribute('aria-expanded')).toBe('false')
    act(() => input().focus())
    await user.keyboard('{ArrowDown}')
    expect(input().getAttribute('aria-expanded')).toBe('true')
  })

  it('groups by a field, in order of first appearance, with a name for each group', async () => {
    const user = userEvent.setup()
    renderLive({ groupBy: 'type' })
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    const groups = screen.getAllByRole('group')
    expect(groups.map((g) => g.getAttribute('aria-labelledby')).every(Boolean)).toBe(true)
    expect(screen.getByRole('group', { name: 'Services' }).querySelectorAll('[role=option]')).toHaveLength(2)
    expect(screen.getByRole('group', { name: 'People' }).querySelectorAll('[role=option]')).toHaveLength(1)
    expect(screen.getByRole('group', { name: 'Incidents' })).toBeTruthy()
  })

  it('keeps the keyboard order the same as the grouped order', async () => {
    const user = userEvent.setup()
    // Not contiguous by type on purpose: People sits between two Services.
    const mixed = [
      { label: 'a-one', type: 'Services' },
      { label: 'a-two', type: 'People' },
      { label: 'a-three', type: 'Services' },
    ]
    const onSelect = vi.fn()
    render(<Search suggestions={() => mixed} groupBy="type" debounce={10} onSelect={onSelect} />)
    await user.type(input(), 'a')
    await screen.findAllByRole('option')
    expect(options().map((o) => o.textContent)).toEqual(['a-one', 'a-three', 'a-two'])
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSelect.mock.calls[0]?.[0]).toBe(mixed[1])
  })

  it('does not group recent searches', async () => {
    const user = userEvent.setup()
    renderLive({ groupBy: 'type', recent: [index[0]!, index[2]!] })
    await user.click(input())
    expect(screen.queryAllByRole('group')).toHaveLength(0)
    expect(options()).toHaveLength(2)
  })
})

describe('Search: recent items', () => {
  it('shows recent items when the empty field is focused', async () => {
    const user = userEvent.setup()
    renderLive({ recent: [index[0]!, index[2]!] })
    await user.click(input())
    expect(input().getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('listbox', { name: 'Recent searches' })).toBeTruthy()
    expect(options().map((o) => o.textContent)).toEqual(['payments-apiCaution, score 71', 'P. ShahPayments, on call'])
    expect(screen.getByText('Recent')).toBeTruthy()
  })

  it('selects a recent item', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderLive({ recent: [index[0]!] })
    await user.click(input())
    await user.keyboard('{Enter}')
    expect(onSelect.mock.calls[0]?.[0]).toBe(index[0])
    expect(input().value).toBe('payments-api')
  })

  it('shows a Clear button only when onClearRecent is set', async () => {
    const user = userEvent.setup()
    const onClearRecent = vi.fn()
    const { unmount } = renderLive({ recent: [index[0]!] })
    await user.click(input())
    expect(screen.queryByRole('button', { name: 'Clear recent searches' })).toBeNull()
    unmount()
    renderLive({ recent: [index[0]!], onClearRecent })
    await user.click(input())
    await user.click(screen.getByRole('button', { name: 'Clear recent searches' }))
    expect(onClearRecent).toHaveBeenCalledTimes(1)
  })

  it('keeps the list open while focus is on the Clear button, so the keyboard can use it', async () => {
    const user = userEvent.setup()
    const onClearRecent = vi.fn()
    render(
      <>
        <Search placeholder="Search services" recent={[index[0]!]} onClearRecent={onClearRecent} />
        <button>after</button>
      </>,
    )
    await user.click(input())
    await user.tab()
    const clear = screen.getByRole('button', { name: 'Clear recent searches' })
    expect(document.activeElement).toBe(clear)
    expect(input().getAttribute('aria-expanded')).toBe('true')
    await user.keyboard('{Enter}')
    expect(onClearRecent).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(input()) // focus is not lost when the list empties
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(screen.getByText('after'))
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens with nothing to show when there are no recent items and no query', async () => {
    const user = userEvent.setup()
    renderLive({ recent: [] })
    await user.click(input())
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Search: async suggestions', () => {
  it('shows the busy state while a Promise is pending, then the results', async () => {
    const user = userEvent.setup()
    let resolve: (items: SearchItem[]) => void = () => {}
    const suggestions = vi.fn(() => new Promise<SearchItem[]>((r) => (resolve = r)))
    render(<Search suggestions={suggestions} debounce={5} />)
    await user.type(input(), 'a')
    await waitFor(() => expect(suggestions).toHaveBeenCalled())
    expect(input().getAttribute('aria-busy')).toBe('true')
    resolve([{ label: 'alpha' }])
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['alpha'])
    expect(input().getAttribute('aria-busy')).toBeNull()
  })

  it('ignores a late answer for an older query', async () => {
    const user = userEvent.setup()
    const resolvers: Record<string, (items: SearchItem[]) => void> = {}
    const suggestions = vi.fn((q: string) => new Promise<SearchItem[]>((r) => (resolvers[q] = r)))
    render(<Search suggestions={suggestions} debounce={5} />)
    await user.type(input(), 'a')
    await waitFor(() => expect(resolvers['a']).toBeTruthy())
    await user.type(input(), 'b')
    await waitFor(() => expect(resolvers['ab']).toBeTruthy())
    resolvers['ab']?.([{ label: 'fresh' }])
    await screen.findByRole('option', { name: 'fresh' })
    resolvers['a']?.([{ label: 'stale' }])
    await new Promise((r) => setTimeout(r, 20))
    expect(options().map((o) => o.textContent)).toEqual(['fresh'])
  })

  it('treats a rejected Promise as no results', async () => {
    const user = userEvent.setup()
    render(<Search suggestions={() => Promise.reject(new Error('offline'))} debounce={5} />)
    await user.type(input(), 'a')
    expect(await screen.findByText(/No results for/)).toBeTruthy()
    expect(input().getAttribute('aria-busy')).toBeNull()
  })

  it('returns to the recent list when the query is emptied, without calling suggestions', async () => {
    const user = userEvent.setup()
    const { suggestions } = renderLive({ recent: [index[0]!] })
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    const calls = suggestions.mock.calls.length
    await user.clear(input())
    expect(screen.getByRole('listbox', { name: 'Recent searches' })).toBeTruthy()
    expect(suggestions.mock.calls.length).toBe(calls)
  })
})

describe('Search: scopes', () => {
  it('shows filter chips as toggle buttons, the first selected', () => {
    render(<Search scopes={['All', 'Critical', 'Caution']} />)
    const group = screen.getByRole('group', { name: 'Search scope' })
    expect(group.querySelectorAll('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Critical' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('changes scope on click and reports it', async () => {
    const user = userEvent.setup()
    const onScopeChange = vi.fn()
    render(<Search scopes={['All', 'Critical']} onScopeChange={onScopeChange} />)
    await user.click(screen.getByRole('button', { name: 'Critical' }))
    expect(onScopeChange).toHaveBeenCalledWith('Critical')
    expect(screen.getByRole('button', { name: 'Critical' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('works controlled, and honours defaultScope', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Search scopes={['All', 'Critical']} defaultScope="Critical" />)
    expect(screen.getByRole('button', { name: 'Critical' }).getAttribute('aria-pressed')).toBe('true')
    rerender(<Search scopes={['All', 'Critical']} scope="All" onScopeChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Critical' }))
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('has no scope group without scopes', () => {
    render(<Search />)
    expect(screen.queryByRole('group')).toBeNull()
  })
})

describe('Search: controlled value with suggestions', () => {
  it('lets the parent own the text', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [q, setQ] = useState('')
      return (
        <>
          <Search value={q} onValueChange={setQ} suggestions={find} debounce={10} />
          <p data-testid="mirror">{q}</p>
        </>
      )
    }
    render(<Controlled />)
    await user.type(input(), 'pay')
    await screen.findAllByRole('option')
    expect(screen.getByTestId('mirror').textContent).toBe('pay')
    await user.click(screen.getAllByRole('option')[0] as HTMLElement)
    expect(input().value).toBe('payments-api')
    expect(screen.getByTestId('mirror').textContent).toBe('payments-api')
  })
})

testExamplesAxe(examples)
