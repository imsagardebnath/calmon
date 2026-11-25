import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { HealthScore, scoreSeverity, type HealthFactor } from './health-score.tsx'
import * as examples from './health-score.examples.tsx'

const factors: HealthFactor[] = [
  { label: 'Error rate', weight: 30, impact: -4, severity: 'normal' },
  { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
  { label: 'Open alerts', weight: 15, impact: -4, severity: 'advisory' },
  { label: 'Saturation', weight: 20, impact: -9, severity: 'advisory' },
]

describe('scoreSeverity', () => {
  it('uses the default bands: 85, 70 and 50', () => {
    expect(scoreSeverity(100)).toBe('normal')
    expect(scoreSeverity(85)).toBe('normal')
    expect(scoreSeverity(84)).toBe('advisory')
    expect(scoreSeverity(70)).toBe('advisory')
    expect(scoreSeverity(69)).toBe('caution')
    expect(scoreSeverity(50)).toBe('caution')
    expect(scoreSeverity(49)).toBe('critical')
    expect(scoreSeverity(0)).toBe('critical')
  })

  it('takes custom bands, and bands you leave out keep their default', () => {
    expect(scoreSeverity(92, { advisory: 97, caution: 90, critical: 80 })).toBe('advisory')
    expect(scoreSeverity(60, { caution: 60 })).toBe('advisory')
    expect(scoreSeverity(59, { caution: 60 })).toBe('caution')
  })

  it('never gives a lower score a less severe band when bands are only partly overridden', () => {
    // advisory: 60 sits below the default caution (70): the lower score must not read as advisory.
    expect(scoreSeverity(75, { advisory: 60 })).toBe('normal')
    expect(scoreSeverity(65, { advisory: 60 })).toBe('caution')
    expect(scoreSeverity(55, { advisory: 60 })).toBe('caution')
    expect(scoreSeverity(49, { advisory: 60 })).toBe('critical')
    // caution: 90 sits above the default advisory (85).
    expect(scoreSeverity(95, { caution: 90 })).toBe('normal')
    expect(scoreSeverity(86, { caution: 90 })).toBe('caution')
    expect(scoreSeverity(60, { caution: 90 })).toBe('caution')
    expect(scoreSeverity(40, { caution: 90 })).toBe('critical')
    for (let v = 100; v > 0; v--) {
      const rank = (n: number) => ['normal', 'advisory', 'caution', 'critical'].indexOf(scoreSeverity(n, { advisory: 60 }))
      expect(rank(v - 1)).toBeGreaterThanOrEqual(rank(v))
    }
  })
})

describe('HealthScore', () => {
  it('is a meter with a text equivalent: score, scale and band', () => {
    render(<HealthScore value={62} factors={factors} />)
    const meter = screen.getByRole('meter', { name: 'Health score' })
    expect(meter.getAttribute('aria-valuenow')).toBe('62')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuetext')).toBe('62 of 100, caution')
  })

  it('shows the big number and the band as a word with its icon', () => {
    render(<HealthScore value={62} factors={factors} />)
    expect(screen.getByText('62')).toBeTruthy()
    const badge = screen.getByText('Caution')
    expect(badge.querySelector('svg')).not.toBeNull()
    expect(badge.dataset.tone).toBe('caution')
  })

  it('takes the ring colour from the band through data-tone', () => {
    const { container, rerender } = render(<HealthScore value={62} factors={factors} />)
    expect((container.firstChild as HTMLElement).dataset.tone).toBe('caution')
    rerender(<HealthScore value={91} factors={factors} />)
    expect((container.firstChild as HTMLElement).dataset.tone).toBe('normal')
    rerender(<HealthScore value={12} factors={factors} />)
    expect((container.firstChild as HTMLElement).dataset.tone).toBe('critical')
  })

  it('draws the arc in proportion to the score', () => {
    render(<HealthScore value={50} factors={factors} />)
    const arc = screen.getByRole('meter').querySelectorAll('circle')[1]
    const circumference = 2 * Math.PI * 56
    expect(Number(arc?.getAttribute('stroke-dasharray')?.split(' ')[0])).toBeCloseTo(circumference / 2, 3)
  })

  it('clamps the value to 0 to 100 and skips the arc at zero', () => {
    const { rerender } = render(<HealthScore value={140} factors={factors} />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
    rerender(<HealthScore value={-5} factors={factors} />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByRole('meter').querySelectorAll('circle')).toHaveLength(1)
  })

  it('follows custom bands', () => {
    render(<HealthScore value={62} factors={factors} bands={{ advisory: 50, caution: 40, critical: 30 }} />)
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('62 of 100, normal')
  })

  it('names the biggest factor next to the score', () => {
    render(<HealthScore value={62} factors={factors} />)
    expect(screen.getByText(/Biggest factor:/).textContent).toContain('Latency p95')
    expect(screen.getByText(/Biggest factor:/).textContent).toContain('−21')
  })

  it('lists the factors biggest cost first, each with a severity word, weight and impact', () => {
    render(<HealthScore value={62} factors={factors} />)
    const items = screen.getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual([
      'Caution: Latency p95w35, weight 35−21 points',
      'Advisory: Saturationw20, weight 20−9 points',
      'Advisory: Open alertsw15, weight 15−4 points',
      'Normal: Error ratew30, weight 30−4 points',
    ])
    expect(items[0]?.dataset.tone).toBe('caution')
    expect(items[0]?.querySelector('svg')).not.toBeNull()
  })

  it('sizes each bar by how much of its weight is left', () => {
    render(<HealthScore value={62} factors={factors} />)
    const bar = screen.getAllByRole('listitem')[0]?.querySelector<HTMLElement>('span.bg-tone')
    expect(bar?.style.width).toBe('40%')
  })

  it('gives every severity its own icon shape in the breakdown', () => {
    render(
      <HealthScore
        value={30}
        factors={[
          { label: 'A', weight: 10, impact: -1, severity: 'normal' },
          { label: 'B', weight: 10, impact: -2, severity: 'info' },
          { label: 'C', weight: 10, impact: -3, severity: 'advisory' },
          { label: 'D', weight: 10, impact: -4, severity: 'caution' },
          { label: 'E', weight: 10, impact: -5, severity: 'critical' },
        ]}
      />,
    )
    const shapes = screen.getAllByRole('listitem').map((li) => li.querySelector('svg')?.innerHTML)
    expect(new Set(shapes).size).toBe(5)
  })

  it('collapses and expands the breakdown with aria-expanded and aria-controls', () => {
    render(<HealthScore value={62} factors={factors} />)
    const toggle = screen.getByRole('button', { name: 'Factors (4)' })
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const region = document.getElementById(toggle.getAttribute('aria-controls') ?? '')
    expect(region).not.toBeNull()
    expect(region?.hidden).toBe(false)
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(region?.hidden).toBe(true)
    // The biggest factor stays in view while the breakdown is closed.
    expect(screen.getByText(/Biggest factor:/)).toBeTruthy()
  })

  it('can start closed', () => {
    render(<HealthScore value={62} factors={factors} defaultOpen={false} />)
    expect(screen.getByRole('button', { name: 'Factors (4)' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('is controlled with open and onOpenChange', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(<HealthScore value={62} factors={factors} open={false} onOpenChange={onOpenChange} />)
    const toggle = screen.getByRole('button', { name: 'Factors (4)' })
    fireEvent.click(toggle)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    rerender(<HealthScore value={62} factors={factors} open onOpenChange={onOpenChange} />)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('uses the label as the heading text and the meter name, and shows meta', () => {
    render(<HealthScore value={62} factors={factors} label="checkout-web" meta="Updated 14:32 UTC" />)
    expect(screen.getByText('checkout-web')).toBeTruthy()
    expect(screen.getByRole('meter', { name: 'checkout-web' })).toBeTruthy()
    expect(screen.getByText('Updated 14:32 UTC')).toBeTruthy()
  })

  it('shows no toggle, biggest factor, list or caption without factors', () => {
    render(<HealthScore value={95} factors={[]} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText(/Biggest factor/)).toBeNull()
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.queryByText(/Score starts at 100/)).toBeNull()
  })

  it('lists two factors that share a label without a duplicate key warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(
        <HealthScore
          value={70}
          factors={[
            { label: 'Latency p95', weight: 20, impact: -10, severity: 'advisory' },
            { label: 'Latency p95', weight: 20, impact: -20, severity: 'caution' },
          ]}
        />,
      )
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(error).not.toHaveBeenCalled()
    } finally {
      error.mockRestore()
    }
  })

  it('lets className override defaults and passes props to the root', () => {
    const { container } = render(<HealthScore value={62} factors={factors} className="max-w-md" data-x="1" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('max-w-md')
    expect(root.dataset.x).toBe('1')
  })
})

describe('HealthScore on a narrow screen', () => {
  it('lets the factors wrap below the ring instead of squeezing them', () => {
    render(<HealthScore value={62} factors={factors} />)
    const meter = screen.getByRole('meter')
    expect(meter.parentElement?.className).toContain('flex-wrap')
    expect(meter.nextElementSibling?.className).toContain('min-w-40')
  })
})

testExamplesAxe(examples)
