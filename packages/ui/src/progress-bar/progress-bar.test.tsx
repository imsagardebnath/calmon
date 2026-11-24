import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { ProgressBar } from './progress-bar.tsx'
import * as examples from './progress-bar.examples.tsx'

describe('ProgressBar', () => {
  it('is a progressbar with aria-valuenow, min and max', () => {
    render(<ProgressBar value={40} aria-label="Upload" />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('40%')
  })

  it('clamps the value between 0 and 100', () => {
    const { rerender } = render(<ProgressBar value={140} aria-label="x" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    rerender(<ProgressBar value={-5} aria-label="x" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })

  it('is indeterminate without a value: no aria-valuenow, and it animates', () => {
    render(<ProgressBar aria-label="Loading" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect((bar.firstElementChild as HTMLElement).className).toContain('animate-calmon-indet')
  })

  it('shows the label and the number, and uses the label as the name', () => {
    render(<ProgressBar value={87} label="Disk" />)
    expect(screen.getByRole('progressbar', { name: 'Disk' })).toBeTruthy()
    expect(screen.getByText('87%')).toBeTruthy()
  })

  it('can hide the number, and show it without a label', () => {
    const { rerender } = render(<ProgressBar value={87} label="Disk" showValue={false} />)
    expect(screen.queryByText('87%')).toBeNull()
    rerender(<ProgressBar value={87} showValue aria-label="Disk" />)
    expect(screen.getByText('87%')).toBeTruthy()
  })

  it('uses the accent tone by default and severity or intent when set', () => {
    const { container, rerender } = render(<ProgressBar value={10} aria-label="x" />)
    const tone = () => (container.firstElementChild as HTMLElement).dataset.tone
    expect(tone()).toBe('accent')
    rerender(<ProgressBar value={10} aria-label="x" severity="normal" />)
    expect(tone()).toBe('normal')
    rerender(<ProgressBar value={10} aria-label="x" intent="danger" />)
    expect(tone()).toBe('critical')
  })

  it('applies the thresholds and reads the severity out in aria-valuetext', () => {
    const thresholds = { caution: 85, critical: 95 }
    const { container, rerender } = render(<ProgressBar value={50} label="Disk" thresholds={thresholds} />)
    const tone = () => (container.firstElementChild as HTMLElement).dataset.tone
    const text = () => screen.getByRole('progressbar').getAttribute('aria-valuetext')
    expect(tone()).toBe('accent')
    expect(text()).toBe('50%')
    rerender(<ProgressBar value={85} label="Disk" thresholds={thresholds} />)
    expect(tone()).toBe('caution')
    expect(text()).toBe('85%, caution')
    rerender(<ProgressBar value={97} label="Disk" thresholds={thresholds} />)
    expect(tone()).toBe('critical')
    expect(text()).toBe('97%, critical')
  })

  it('puts aria-labelledby, aria-describedby and aria-valuetext on the progressbar, not the wrapper', () => {
    const { container } = render(
      <>
        <span id="t">Disk space</span>
        <span id="d">Includes snapshots</span>
        <ProgressBar value={87} aria-labelledby="t" aria-describedby="d" aria-valuetext="87 percent full" data-x="1" />
      </>,
    )
    const bar = screen.getByRole('progressbar', { name: 'Disk space', description: 'Includes snapshots' })
    expect(bar.getAttribute('aria-valuetext')).toBe('87 percent full')
    expect(bar.hasAttribute('aria-label')).toBe(false)
    const wrapper = container.querySelector('[data-x]') as HTMLElement
    expect(wrapper.hasAttribute('aria-labelledby')).toBe(false)
    expect(wrapper.hasAttribute('aria-describedby')).toBe(false)
    expect(wrapper.hasAttribute('aria-valuetext')).toBe(false)
  })

  it('lets className override defaults', () => {
    const { container } = render(<ProgressBar value={1} aria-label="x" className="w-40" />)
    const cls = (container.firstElementChild as HTMLElement).className
    expect(cls).toContain('w-40')
    expect(cls).not.toContain('w-full')
  })
})

testExamplesAxe(examples)
