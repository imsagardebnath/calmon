import { act, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Timeline, type TimelineEvent } from './timeline.tsx'
import * as examples from './timeline.examples.tsx'

const NOW = '2026-03-12T14:30:00Z'

const events: TimelineEvent[] = [
  { id: 'e1', time: '2026-03-12T14:21:00Z', severity: 'critical', title: 'Error rate above 4%', description: '23 alerts grouped into one.', type: 'alert' },
  { id: 'e2', time: '2026-03-12T14:24:00Z', severity: 'info', title: 'R. Iyer acknowledged', actor: 'R. Iyer' },
  { id: 'e3', time: new Date('2026-03-11T17:40:00Z'), severity: 'normal', title: 'Config v42 published' },
  { id: 'e4', time: '2026-03-10T11:10:00Z', title: 'Note added' },
]

const render1 = (props: Partial<React.ComponentProps<typeof Timeline>> = {}) =>
  render(<Timeline events={events} timeZone="UTC" now={NOW} {...props} />)

describe('Timeline', () => {
  it('is an ordered list with one item per event, in the order given', () => {
    render1({ groupBy: 'none' })
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items.map((li) => li.textContent?.includes('acknowledged'))).toEqual([false, true, false, false])
  })

  it('groups by day by default under headings: Today, Yesterday, then the date', () => {
    render1()
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Today', 'Yesterday', 'Tue, Mar 10'])
    expect(screen.getAllByRole('heading')[0]?.tagName).toBe('H3')
  })

  it('nests one list of events per day, so the order stays flat for readers', () => {
    render1()
    const groups = screen.getAllByRole('list')
    expect(groups).toHaveLength(4)
    expect(within(groups[1] as HTMLElement).getAllByRole('listitem')).toHaveLength(2)
  })

  it('makes the day headings sticky', () => {
    render1()
    expect(screen.getAllByRole('heading')[0]?.className).toContain('sticky')
  })

  it('can change the heading level with headingLevel', () => {
    render1({ headingLevel: 4 })
    expect(screen.getAllByRole('heading').map((h) => h.tagName)).toEqual(['H4', 'H4', 'H4'])
  })

  it('still takes the older as prop, and headingLevel wins when both are set', () => {
    const { unmount } = render1({ as: 'h5' })
    expect(screen.getAllByRole('heading')[0]?.tagName).toBe('H5')
    unmount()
    render1({ as: 'h5', headingLevel: 2 })
    expect(screen.getAllByRole('heading')[0]?.tagName).toBe('H2')
  })

  it('does not group with groupBy="none"', () => {
    render1({ groupBy: 'none' })
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getAllByRole('list')).toHaveLength(1)
  })

  it('only groups events that sit next to each other and keeps the given order', () => {
    render(
      <Timeline
        timeZone="UTC"
        now={NOW}
        events={[
          { id: 'a', time: '2026-03-12T10:00:00Z', title: 'A' },
          { id: 'b', time: '2026-03-11T10:00:00Z', title: 'B' },
          { id: 'c', time: '2026-03-12T09:00:00Z', title: 'C' },
        ]}
      />,
    )
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Today', 'Yesterday', 'Today'])
  })

  it('shows each time in a time element with a machine-readable dateTime and the full date as its title', () => {
    const { container } = render1()
    const time = container.querySelector('time') as HTMLTimeElement
    expect(time.getAttribute('datetime')).toBe('2026-03-12T14:21:00.000Z')
    expect(time.textContent).toContain('14:21')
    expect(time.title).toContain('2026')
    expect(container.querySelectorAll('time')).toHaveLength(4)
  })

  it('shows the relative time next to the clock time', () => {
    const { container } = render1()
    const first = container.querySelector('time') as HTMLTimeElement
    expect(first.textContent).toMatch(/14:21.*ago/)
  })

  it('shows relative times after mount when no now is given', () => {
    const recent = new Date(Date.now() - 5 * 60_000)
    const { container } = render(<Timeline events={[{ id: 'a', time: recent, title: 'A' }]} />)
    expect(container.querySelector('time')?.textContent).toMatch(/ago/)
    expect(screen.getByRole('heading').textContent).toBe('Today')
  })

  it('refreshes the relative times every minute, and stops the timer on unmount', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-03-12T14:30:00Z'))
      const { container, unmount } = render(
        <Timeline timeZone="UTC" events={[{ id: 'a', time: '2026-03-12T14:25:00Z', title: 'A' }]} />,
      )
      const label = () => container.querySelector('time')?.textContent ?? ''
      expect(label()).toMatch(/5 min/)
      act(() => {
        vi.advanceTimersByTime(60_000)
      })
      expect(label()).toMatch(/6 min/)
      act(() => {
        vi.advanceTimersByTime(60_000)
      })
      expect(label()).toMatch(/7 min/)
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('starts no timer when now is given, and restarts it when now is removed', () => {
    vi.useFakeTimers()
    try {
      const events = [{ id: 'a', time: '2026-03-12T14:25:00Z', title: 'A' }]
      const { rerender } = render(<Timeline timeZone="UTC" now={NOW} events={events} />)
      expect(vi.getTimerCount()).toBe(0)
      rerender(<Timeline timeZone="UTC" events={events} />)
      expect(vi.getTimerCount()).toBe(1)
      rerender(<Timeline timeZone="UTC" now={NOW} events={events} />)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('leaves relative times off for events older than a week', () => {
    const { container } = render(
      <Timeline timeZone="UTC" now={NOW} events={[{ id: 'a', time: '2026-02-01T10:00:00Z', title: 'Old' }]} />,
    )
    expect(container.querySelector('time')?.textContent).toBe('10:00')
  })

  it('adds the date to the time when not grouped', () => {
    const { container } = render1({ groupBy: 'none' })
    expect(container.querySelector('time')?.textContent).toContain('Mar 12')
  })

  it('reads times in the given time zone', () => {
    const { container } = render1({ timeZone: 'Asia/Tokyo' })
    expect(container.querySelector('time')?.textContent).toContain('23:21')
  })

  it('shows a different icon shape per severity in the node', () => {
    const { container } = render1({ groupBy: 'none' })
    const nodes = Array.from(container.querySelectorAll('li > span[aria-hidden="true"]'))
    const shapes = nodes.map((n) => n.querySelector('svg')?.innerHTML ?? 'dot')
    expect(shapes).toHaveLength(4)
    expect(new Set(shapes).size).toBe(4)
  })

  it('hides the node from screen readers and says the severity as a word instead', () => {
    render1({ groupBy: 'none' })
    const first = screen.getAllByRole('listitem')[0] as HTMLElement
    expect(first.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(first.textContent).toContain('Critical: Error rate above 4%')
    expect((screen.getAllByRole('listitem')[3] as HTMLElement).textContent).not.toMatch(/Critical|Normal|Info/)
  })

  it('sets the node tone from the severity, and neutral without one', () => {
    render1({ groupBy: 'none' })
    expect(screen.getAllByRole('listitem').map((li) => li.dataset.tone)).toEqual(['critical', 'info', 'normal', 'neutral'])
  })

  it('shows the description, actor and type', () => {
    render1({ groupBy: 'none' })
    expect(screen.getByText('23 alerts grouped into one.')).toBeTruthy()
    expect(screen.getByText('alert')).toBeTruthy()
    expect(screen.getAllByText('R. Iyer').length).toBeGreaterThan(0)
  })

  it('joins the actor and the type with a dot', () => {
    render(
      <Timeline
        timeZone="UTC"
        now={NOW}
        events={[{ id: 'a', time: NOW, title: 'Deploy', actor: 'deploy-bot', type: 'deploy' }]}
      />,
    )
    expect(screen.getByText('deploy-bot · deploy')).toBeTruthy()
  })

  it('replaces the node icon with a custom one', () => {
    render(
      <Timeline
        timeZone="UTC"
        now={NOW}
        groupBy="none"
        events={[{ id: 'a', time: NOW, severity: 'info', title: 'A', icon: <i data-testid="custom" /> }]}
      />,
    )
    const item = screen.getByRole('listitem')
    expect(within(item).getByTestId('custom')).toBeTruthy()
    expect(item.querySelector('svg')).toBeNull()
  })

  it('shows an unparseable time as the text it was given', () => {
    const { container } = render(<Timeline events={[{ id: 'a', time: 'last Tuesday', title: 'A' }]} now={NOW} groupBy="none" />)
    expect(container.querySelector('time')).toBeNull()
    expect(screen.getByText('last Tuesday')).toBeTruthy()
  })

  it('renders an empty list for no events', () => {
    render(<Timeline events={[]} />)
    expect(screen.getByRole('list').children).toHaveLength(0)
  })

  it('lets className override defaults and passes props to the list', () => {
    render1({ className: 'max-w-sm', 'aria-label': 'History', groupBy: 'none' })
    const list = screen.getByRole('list', { name: 'History' })
    expect(list.className).toContain('max-w-sm')
  })
})

describe('Timeline on the server', () => {
  const late: TimelineEvent[] = [
    { id: 'a', time: '2026-03-12T23:30:00Z', title: 'Late' },
    { id: 'b', time: '2026-03-12T10:00:00Z', title: 'Early' },
  ]
  const at = '2026-03-12T23:45:00Z'

  it('formats in UTC and English until hydrated, so server and client markup do not depend on the zone', () => {
    vi.stubEnv('TZ', 'Asia/Tokyo')
    try {
      const html = renderToString(<Timeline events={late} now={at} />)
      // One day in UTC, whatever zone the server runs in.
      expect(html.match(/<h3/g)).toHaveLength(1)
      expect(html).toContain('23:30')
      expect(html).toContain('10:00')
      expect(html).toContain('Today')
      // Once on the client the viewer's own zone is used: 08:30 on the 13th, so two days.
      const { container } = render(<Timeline events={late} now={at} />)
      expect(container.textContent).toContain('08:30')
      expect(screen.getAllByRole('heading')).toHaveLength(2)
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('keeps an explicit timeZone before and after hydration', () => {
    const html = renderToString(<Timeline events={late} now={at} timeZone="Asia/Tokyo" />)
    expect(html.match(/<h3/g)).toHaveLength(2)
    expect(html).toContain('08:30')
  })
})

testExamplesAxe(examples)
