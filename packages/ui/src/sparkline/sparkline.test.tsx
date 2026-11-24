import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Sparkline } from './sparkline.tsx'
import * as examples from './sparkline.examples.tsx'

const rising = [30, 32, 31, 35, 38, 42, 41, 46, 49, 52, 55, 58]

describe('Sparkline', () => {
  it('is an image with a generated label: trend, range and latest value', () => {
    render(<Sparkline data={rising} />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('aria-label')).toBe('Trend rising, 30 to 58. Min 30, max 58, latest 58.')
  })

  it('describes falling and steady series', () => {
    const { rerender } = render(<Sparkline data={[9, 7, 4]} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Trend falling, 9 to 4.')
    rerender(<Sparkline data={[20, 22, 21, 24, 22, 23, 25, 22, 21, 23, 24, 20]} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Trend steady')
  })

  it('says whether the latest value is above the threshold', () => {
    const { rerender } = render(<Sparkline data={rising} threshold={45} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('latest 58, above threshold 45.')
    rerender(<Sparkline data={[50, 40]} threshold={45} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('within threshold 45.')
  })

  it('lets aria-label override the generated one', () => {
    render(<Sparkline data={rising} aria-label="p95 latency, rising" />)
    expect(screen.getByRole('img', { name: 'p95 latency, rising' })).toBeTruthy()
  })

  it('says there is no data for an empty series', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(screen.getByRole('img', { name: 'No data' })).toBeTruthy()
    expect(container.querySelector('polyline')).toBeNull()
  })

  it('stretches to its container: viewBox, preserveAspectRatio none, full width, height prop', () => {
    render(<Sparkline data={rising} height={44} />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('viewBox')).toBe('0 0 100 30')
    expect(el.getAttribute('preserveAspectRatio')).toBe('none')
    expect(el.getAttribute('height')).toBe('44')
    expect(el.getAttribute('class')).toContain('w-full')
    expect(el.getAttribute('class')).toContain('overflow-visible')
  })

  it('defaults the height to 32', () => {
    render(<Sparkline data={rising} />)
    expect(screen.getByRole('img').getAttribute('height')).toBe('32')
  })

  it('scales the points into the 100 x 30 box', () => {
    const { container } = render(<Sparkline data={[0, 10]} />)
    expect(container.querySelector('polyline')?.getAttribute('points')).toBe('0.00,27.10 100.00,2.90')
  })

  it('marks the latest point with a dot at the end of the line', () => {
    const { container } = render(<Sparkline data={[0, 10]} />)
    const dot = container.querySelector('line[stroke-linecap="round"]')
    expect(dot?.getAttribute('x1')).toBe('100')
    expect(dot?.getAttribute('x2')).toBe('100')
    expect(Number(dot?.getAttribute('y1'))).toBeCloseTo(2.9, 1)
    expect(dot?.getAttribute('y1')).toBe(dot?.getAttribute('y2'))
  })

  it('uses the accent colour by default and the severity colour for the whole line without a threshold', () => {
    const { container, rerender } = render(<Sparkline data={rising} />)
    expect(screen.getByRole('img').dataset.tone).toBe('accent')
    expect(container.querySelector('polyline')?.getAttribute('class')).toBe('stroke-tone')
    rerender(<Sparkline data={rising} severity="critical" />)
    expect(screen.getByRole('img').dataset.tone).toBe('critical')
    rerender(<Sparkline data={rising} intent="danger" />)
    expect(screen.getByRole('img').dataset.tone).toBe('critical')
  })

  it('draws a dashed threshold line and colours the part above it', () => {
    const { container } = render(<Sparkline data={rising} threshold={45} severity="critical" />)
    expect(screen.getByRole('img').dataset.tone).toBe('critical')
    const dashed = container.querySelector('line[stroke-dasharray]')
    expect(dashed).not.toBeNull()
    expect(dashed?.getAttribute('x1')).toBe('0')
    expect(dashed?.getAttribute('x2')).toBe('100')
    const lines = container.querySelectorAll('polyline')
    expect(lines).toHaveLength(2)
    expect(lines[0]?.getAttribute('class')).toBe('stroke-accent')
    expect(lines[1]?.getAttribute('class')).toBe('stroke-tone')
    const clip = lines[1]?.getAttribute('clip-path') ?? ''
    expect(container.querySelector(clip.replace(/^url\((.*)\)$/, '$1'))).not.toBeNull()
  })

  it('defaults the colour above a threshold to caution', () => {
    render(<Sparkline data={rising} threshold={45} />)
    expect(screen.getByRole('img').dataset.tone).toBe('caution')
  })

  it('draws no coloured overlay when the series never crosses the threshold', () => {
    const { container } = render(<Sparkline data={[10, 12, 11]} threshold={45} />)
    expect(container.querySelectorAll('polyline')).toHaveLength(1)
    expect(container.querySelector('clipPath')).toBeNull()
  })

  it('colours the latest point only when it is above the threshold', () => {
    const over = render(<Sparkline data={[10, 60]} threshold={45} />)
    expect(over.container.querySelector('line[stroke-linecap="round"]')?.getAttribute('class')).toBe('stroke-tone')
    over.unmount()
    const under = render(<Sparkline data={[60, 10]} threshold={45} />)
    expect(under.container.querySelector('line[stroke-linecap="round"]')?.getAttribute('class')).toBe('stroke-accent')
  })

  it('fills under the line with a gradient only when area is set', () => {
    const { container, rerender } = render(<Sparkline data={rising} />)
    expect(container.querySelector('linearGradient')).toBeNull()
    rerender(<Sparkline data={rising} area />)
    const gradient = container.querySelector('linearGradient')
    expect(gradient?.querySelectorAll('stop')).toHaveLength(2)
    expect(container.querySelector('path')?.getAttribute('fill')).toBe(`url(#${gradient?.id})`)
  })

  it('handles a single value, a flat series and non-finite values without NaN', () => {
    const one = render(<Sparkline data={[5]} area />)
    expect(one.container.innerHTML).not.toContain('NaN')
    one.unmount()
    const flat = render(<Sparkline data={[3, 3, 3]} threshold={3} />)
    expect(flat.container.innerHTML).not.toContain('NaN')
    flat.unmount()
    const messy = render(<Sparkline data={[1, Number.NaN, 3, Infinity]} />)
    expect(messy.container.innerHTML).not.toContain('NaN')
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Min 1, max 3')
  })

  it('does not animate', () => {
    const { container } = render(<Sparkline data={rising} threshold={45} area />)
    expect(container.innerHTML).not.toMatch(/animate/)
  })

  it('merges className and passes other props to the svg', () => {
    render(<Sparkline data={rising} className="h-6 text-fg" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.getAttribute('class')).toContain('w-full')
    expect(el.getAttribute('class')).toContain('h-6')
  })
})

testExamplesAxe(examples)
