import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Chart } from './chart.tsx'
import * as examples from './chart.examples.tsx'

const data = [
  { time: '10:00', p95: 310, p50: 140 },
  { time: '11:00', p95: 380, p50: 150 },
  { time: '12:00', p95: 450, p50: 160 },
  { time: '13:00', p95: 420, p50: 170 },
]
const series = [
  { key: 'p95', label: 'p95 latency' },
  { key: 'p50', label: 'p50 latency' },
] as const

const chart = () => screen.getByRole('img')

/** The five y axis tick labels, bottom to top (they are the first five text elements). */
const tickTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('svg text')).slice(0, 5).map((t) => t.textContent)

afterEach(() => vi.unstubAllGlobals())

describe('Chart', () => {
  it('is an image with a generated summary of the data and the threshold', () => {
    render(
      <Chart
        label="Latency, last 4 hours"
        data={data}
        x="time"
        unit="ms"
        series={[...series]}
        threshold={{ value: 400, label: 'limit 400 ms' }}
      />,
    )
    const summary = chart().getAttribute('aria-label') ?? ''
    expect(summary).toContain('Latency, last 4 hours')
    expect(summary).toContain('Line chart, 4 points from 10:00 to 13:00')
    expect(summary).toContain('p95 latency: latest 420 ms, low 310 ms, high 450 ms')
    expect(summary).toContain('limit 400 ms at 400 ms: 2 readings beyond it')
  })

  it('has a visually hidden data table with every value', () => {
    render(<Chart data={data} x="time" unit="ms" series={[...series]} />)
    const table = screen.getByRole('table', { name: 'Chart data' })
    // The wrapper carries sr-only: a table ignores width and overflow, so it must not be the hidden element itself.
    expect(table.parentElement?.className).toContain('sr-only')
    expect(table.className).not.toContain('sr-only')
    expect(within(table).getAllByRole('row')).toHaveLength(5)
    expect(within(table).getByRole('rowheader', { name: '12:00' })).toBeTruthy()
    expect(within(table).getByRole('cell', { name: '450 ms' })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: 'p50 latency' })).toBeTruthy()
  })

  it('draws a line per series, with a trace animation and the reduced-motion fallback', () => {
    const { container } = render(<Chart data={data} x="time" series={[...series]} />)
    const lines = container.querySelectorAll('svg path')
    expect(lines).toHaveLength(2)
    expect(lines[0]?.getAttribute('class')).toContain('pikore-trace')
    expect(lines[0]?.getAttribute('class')).toContain('motion-reduce:animate-none')
  })

  it('draws a filled path for area charts and rectangles for bar charts', () => {
    const { container, rerender } = render(<Chart type="area" data={data} x="time" series={[...series]} />)
    expect(container.querySelectorAll('svg path')).toHaveLength(4)
    rerender(<Chart type="bar" data={data} x="time" series={[...series]} />)
    expect(container.querySelectorAll('svg path')).toHaveLength(0)
    expect(container.querySelectorAll('svg rect[rx="3"]')).toHaveLength(8)
  })

  it('names the threshold in text', () => {
    render(<Chart data={data} x="time" series={[...series]} threshold={{ value: 400, label: 'limit 400 ms', severity: 'critical' }} />)
    const label = screen.getByText('limit 400 ms', { selector: 'text' })
    expect(label.closest('g')?.getAttribute('data-tone')).toBe('critical')
  })

  it('defaults the threshold to caution', () => {
    render(<Chart data={data} x="time" series={[...series]} threshold={{ value: 400, label: 'limit' }} />)
    expect(screen.getByText('limit', { selector: 'text' }).closest('g')?.getAttribute('data-tone')).toBe('caution')
  })

  it('colours series from tone tokens, never raw colours', () => {
    const { container } = render(
      <Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }, { key: 'p50', label: 'p50', color: 'critical' }]} />,
    )
    const tones = [...container.querySelectorAll('svg g[data-tone]')].map((g) => g.getAttribute('data-tone'))
    expect(tones).toEqual(['accent', 'critical'])
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,6}|rgb\(/i)
  })

  it('shows a legend, and can hide it', () => {
    const { rerender } = render(<Chart data={data} x="time" series={[...series]} />)
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['p95 latency', 'p50 latency'])
    rerender(<Chart data={data} x="time" series={[...series]} legend={false} />)
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('plots at most 6 series', () => {
    const wide = [{ t: 'a', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }]
    render(
      <Chart
        data={wide}
        x="t"
        series={(['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).map((key) => ({ key, label: key }))}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('leaves a gap for missing values', () => {
    const gappy = [
      { t: '1', v: 1 },
      { t: '2', v: 2 },
      { t: '3', v: null },
      { t: '4', v: 4 },
      { t: '5', v: 5 },
    ]
    const { container } = render(<Chart data={gappy} x="t" series={[{ key: 'v', label: 'v' }]} />)
    expect(container.querySelector('svg path')?.getAttribute('d')?.match(/M/g)).toHaveLength(2)
  })

  it('fits the y axis to small values instead of a span of at least 1', () => {
    const ratios = [
      { t: 'a', v: 0.004 },
      { t: 'b', v: 0.012 },
      { t: 'c', v: 0.008 },
    ]
    const { container } = render(<Chart data={ratios} x="t" series={[{ key: 'v', label: 'Error ratio' }]} />)
    const ticks = tickTexts(container)
    expect(ticks).toEqual(['0', '0.004', '0.008', '0.012', '0.016'])
    const top = Number(ticks[4])
    expect(top).toBeGreaterThanOrEqual(0.012)
    expect(top).toBeLessThan(0.02)
    // The highest point sits near the top of the plot, not on the baseline.
    const peak = (container.querySelector('svg path')?.getAttribute('d') ?? '').match(/,([\d.]+)/g)?.map((s) => Number(s.slice(1))) ?? []
    expect(Math.min(...peak)).toBeLessThan(60)
  })

  it('keeps the usual axis for larger values, and a visible axis when every value is 0', () => {
    const { container, rerender } = render(<Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }]} />)
    expect(tickTexts(container)).toEqual(['0', '150', '300', '450', '600'])
    rerender(<Chart data={[{ t: 'a', v: 0 }, { t: 'b', v: 0 }]} x="t" series={[{ key: 'v', label: 'v' }]} />)
    expect(tickTexts(container)).toEqual(['0', '0.3', '0.6', '0.9', '1.2'])
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('sets the first and last tick with min and max', () => {
    const { container } = render(<Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }]} min={100} max={500} />)
    const ticks = tickTexts(container)
    expect(ticks[0]).toBe('100')
    expect(ticks[4]).toBe('500')
    expect(ticks).toEqual(['100', '200', '300', '400', '500'])
  })

  describe('threshold direction', () => {
    const band = (c: HTMLElement) => {
      const g = c.querySelector('svg g[data-tone]') as Element
      const rect = g.querySelector('rect') as Element
      const line = g.querySelector('line') as Element
      const n = (el: Element, a: string) => Number(el.getAttribute(a))
      return { y: n(rect, 'y'), height: n(rect, 'height'), lineY: n(line, 'y1') }
    }

    it('shades above the line and counts readings above it by default', () => {
      const { container } = render(
        <Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }]} threshold={{ value: 400, label: 'limit' }} />,
      )
      const { y, height, lineY } = band(container)
      expect(y).toBe(14)
      expect(y + height).toBeCloseTo(lineY, 5)
      expect(chart().getAttribute('aria-label')).toContain('limit at 400: 2 readings beyond it') // 450 and 420
    })

    it('shades under the line and counts readings under it with direction "below"', () => {
      const { container } = render(
        <Chart
          data={data}
          x="time"
          series={[{ key: 'p95', label: 'p95' }]}
          threshold={{ value: 440, label: 'limit', direction: 'below' }}
        />,
      )
      const { y, height, lineY } = band(container)
      expect(y).toBeCloseTo(lineY, 5)
      expect(height).toBeGreaterThan(0)
      expect(chart().getAttribute('aria-label')).toContain('limit at 440: 3 readings beyond it') // 310, 380 and 420
    })
  })

  it('draws a dashed series without the trace animation', () => {
    const { container } = render(
      <Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }, { key: 'p50', label: 'p50', dashed: true }]} />,
    )
    const [solid, dashed] = Array.from(container.querySelectorAll('svg path'))
    expect(solid?.getAttribute('class')).toContain('pikore-trace')
    expect(solid?.getAttribute('pathLength')).toBe('1')
    expect(dashed?.getAttribute('class')).toContain('stroke-dasharray:4_4')
    expect(dashed?.getAttribute('class')).not.toContain('pikore-trace')
    expect(dashed?.hasAttribute('pathLength')).toBe(false)
  })

  it('puts a % or / unit straight after the value, and other units after a space', () => {
    const spo2 = [{ t: '1', v: 96 }, { t: '2', v: 97 }]
    const { rerender } = render(<Chart data={spo2} x="t" unit="%" series={[{ key: 'v', label: 'SpO2' }]} />)
    expect(chart().getAttribute('aria-label')).toContain('latest 97%')
    expect(chart().getAttribute('aria-label')).not.toContain('97 %')
    expect(within(screen.getByRole('table', { name: 'Chart data' })).getByRole('cell', { name: '97%' })).toBeTruthy()
    rerender(<Chart data={spo2} x="t" unit="/min" series={[{ key: 'v', label: 'SpO2' }]} />)
    expect(chart().getAttribute('aria-label')).toContain('latest 97/min')
    rerender(<Chart data={spo2} x="t" unit="bpm" series={[{ key: 'v', label: 'SpO2' }]} />)
    expect(chart().getAttribute('aria-label')).toContain('latest 97 bpm')
  })

  it('formats values with format and unit', () => {
    render(<Chart data={data} x="time" series={[{ key: 'p95', label: 'p95' }]} format={(v) => `$${v}k`} unit="/min" />)
    expect(chart().getAttribute('aria-label')).toContain('latest $420k/min')
  })

  it('shows a readout with every series on hover', () => {
    const { container } = render(<Chart data={data} x="time" unit="ms" series={[...series]} />)
    expect(container.querySelector('[aria-hidden="true"].absolute')).toBeNull()
    // jsdom has no PointerEvent, so send a mouse event with the pointer event's name
    fireEvent(container.querySelector('svg rect.fill-transparent') as Element, new MouseEvent('pointermove', { bubbles: true, clientX: 0 }))
    const tip = container.querySelector('div.absolute') as HTMLElement
    expect(tip.textContent).toContain('10:00')
    expect(tip.textContent).toContain('p95 latency: 310 ms')
    expect(tip.textContent).toContain('p50 latency: 140 ms')
    expect(container.querySelectorAll('svg circle')).toHaveLength(2)
    fireEvent.pointerLeave(container.querySelector('svg rect.fill-transparent') as Element)
    expect(container.querySelector('div.absolute')).toBeNull()
  })

  describe('keyboard', () => {
    it('is focusable and shows the latest reading on focus', () => {
      render(<Chart data={data} x="time" series={[...series]} unit="ms" />)
      expect(chart().getAttribute('tabindex')).toBe('0')
      fireEvent.focus(chart())
      expect(screen.getByRole('status').textContent).toBe('13:00: p95 latency 420 ms, p50 latency 170 ms')
    })

    it('moves the readout with the arrow keys, Home and End', () => {
      render(<Chart data={data} x="time" series={[...series]} unit="ms" />)
      const status = () => screen.getByRole('status').textContent
      fireEvent.keyDown(chart(), { key: 'ArrowRight' })
      expect(status()).toContain('10:00')
      fireEvent.keyDown(chart(), { key: 'ArrowRight' })
      expect(status()).toContain('11:00')
      fireEvent.keyDown(chart(), { key: 'ArrowLeft' })
      fireEvent.keyDown(chart(), { key: 'ArrowLeft' })
      fireEvent.keyDown(chart(), { key: 'ArrowLeft' })
      expect(status()).toContain('10:00') // stops at the first point
      fireEvent.keyDown(chart(), { key: 'End' })
      expect(status()).toContain('13:00')
      fireEvent.keyDown(chart(), { key: 'ArrowRight' })
      expect(status()).toContain('13:00') // stops at the last point
      fireEvent.keyDown(chart(), { key: 'Home' })
      expect(status()).toContain('10:00')
    })

    it('starts from the last point with ArrowLeft, and clears on Escape and blur', () => {
      const { container } = render(<Chart data={data} x="time" series={[...series]} />)
      fireEvent.keyDown(chart(), { key: 'ArrowLeft' })
      expect(screen.getByRole('status').textContent).toContain('13:00')
      fireEvent.keyDown(chart(), { key: 'ArrowLeft' })
      expect(screen.getByRole('status').textContent).toContain('12:00')
      fireEvent.keyDown(chart(), { key: 'Escape' })
      expect(container.querySelector('div.absolute')).toBeNull()
      fireEvent.keyDown(chart(), { key: 'End' })
      expect(container.querySelector('div.absolute')).not.toBeNull()
      fireEvent.blur(chart())
      expect(container.querySelector('div.absolute')).toBeNull()
    })

    it('leaves other keys alone', () => {
      render(<Chart data={data} x="time" series={[...series]} />)
      expect(fireEvent.keyDown(chart(), { key: 'a' })).toBe(true)
      expect(screen.getByRole('status').textContent).toBe('')
    })
  })

  it('follows the width of its container', () => {
    let notify: () => void = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          notify = cb
        }
        observe() {}
        disconnect() {}
      },
    )
    const spy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(480)
    render(<Chart data={data} x="time" series={[...series]} />)
    expect(chart().getAttribute('viewBox')).toBe('0 0 480 200')
    spy.mockReturnValue(320)
    act(() => notify())
    expect(chart().getAttribute('viewBox')).toBe('0 0 320 200')
  })

  it('uses height, and merges className and other props on the root', () => {
    const { container } = render(<Chart className="mt-4" data-testid="c" height={120} data={data} x="time" series={[...series]} />)
    expect(chart().getAttribute('viewBox')).toMatch(/ 120$/)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('mt-4')
    expect(root.dataset.testid).toBe('c')
  })

  it('copes with no data', () => {
    render(<Chart data={[] as typeof data} x="time" series={[...series]} />)
    expect(chart().getAttribute('aria-label')).toContain('no data')
    expect(chart().getAttribute('tabindex')).toBeNull()
    expect(screen.getByText('No data', { selector: 'text' })).toBeTruthy()
  })

  it('copes with a single point', () => {
    const { container } = render(<Chart data={data.slice(0, 1)} x="time" series={[...series]} />)
    expect(container.querySelector('svg')).toBeTruthy()
    fireEvent.keyDown(chart(), { key: 'End' })
    expect(screen.getByRole('status').textContent).toContain('10:00')
  })
})

testExamplesAxe(examples)
