import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { VitalTile } from './vital-tile.tsx'
import * as examples from './vital-tile.examples.tsx'

const series = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]

describe('VitalTile', () => {
  it('is a group named by its label', () => {
    render(<VitalTile label="p95 latency" value={412} />)
    expect(screen.getByRole('group', { name: 'p95 latency' })).toBeTruthy()
  })

  it('takes the threshold severity when the value crosses the limit', () => {
    render(<VitalTile label="p95 latency" value={412} unit="ms" threshold={{ value: 400, severity: 'caution' }} />)
    expect(screen.getByRole('group').dataset.tone).toBe('caution')
  })

  it('says the severity as a word with its icon, not by colour alone', () => {
    render(<VitalTile label="p95 latency" value={412} threshold={{ value: 400, severity: 'critical' }} />)
    const badge = screen.getByText('Critical')
    expect(badge.querySelector('svg')).not.toBeNull()
    expect(badge.dataset.tone).toBe('critical')
  })

  it('stays normal with an "In range" badge inside the limit, and at the limit', () => {
    const { rerender } = render(<VitalTile label="Error rate" value={0.42} threshold={{ value: 1, severity: 'critical' }} />)
    expect(screen.getByRole('group').dataset.tone).toBe('normal')
    expect(screen.getByText('In range')).toBeTruthy()
    rerender(<VitalTile label="Error rate" value={1} threshold={{ value: 1, severity: 'critical' }} />)
    expect(screen.getByText('In range')).toBeTruthy()
  })

  it('judges the other side with direction="below"', () => {
    const threshold = { value: 92, severity: 'critical', direction: 'below' } as const
    const { rerender } = render(<VitalTile label="SpO2" value={89} unit="%" threshold={threshold} />)
    expect(screen.getByRole('group').dataset.tone).toBe('critical')
    expect(screen.getByText('min 92%')).toBeTruthy()
    rerender(<VitalTile label="SpO2" value={95} unit="%" threshold={threshold} />)
    expect(screen.getByRole('group').dataset.tone).toBe('normal')
  })

  it('is neutral with no badge without a threshold or severity', () => {
    render(<VitalTile label="Throughput" value={1284} unit="req/s" />)
    expect(screen.getByRole('group').dataset.tone).toBe('neutral')
    expect(screen.queryByText('In range')).toBeNull()
  })

  it('lets severity override the threshold', () => {
    render(<VitalTile label="Disk" value={50} severity="advisory" threshold={{ value: 90, severity: 'critical' }} />)
    expect(screen.getByRole('group').dataset.tone).toBe('advisory')
    expect(screen.getByText('Advisory')).toBeTruthy()
  })

  it('shows the value as a tabular numeral with its unit', () => {
    render(<VitalTile label="Queue depth" value={2310} unit="jobs" />)
    const num = screen.getByText('2,310')
    expect(num.className).toContain('num')
    expect(screen.getByText('jobs')).toBeTruthy()
  })

  it('formats with a custom function', () => {
    render(<VitalTile label="Revenue" value={184210} format={(n) => `$${n / 1000}k`} threshold={{ value: 150000, severity: 'advisory', direction: 'below' }} />)
    expect(screen.getByText('$184.21k')).toBeTruthy()
    expect(screen.getByText('min $150k')).toBeTruthy()
  })

  it('prints the limit in the footer, with the change on the right', () => {
    render(
      <VitalTile
        label="p95 latency"
        value={412}
        unit="ms"
        threshold={{ value: 400, severity: 'caution' }}
        change="+12% 1h"
      />,
    )
    expect(screen.getByText('limit 400 ms')).toBeTruthy()
    expect(screen.getByText('+12% 1h')).toBeTruthy()
  })

  it('replaces the limit text with a footer', () => {
    render(<VitalTile label="Throughput" value={1284} footer="capacity 2,000" />)
    expect(screen.getByText('capacity 2,000')).toBeTruthy()
  })

  it('draws the trend with the threshold, and skips it for fewer than two points', () => {
    const { rerender } = render(
      <VitalTile label="p95 latency" value={412} data={series} threshold={{ value: 400, severity: 'caution' }} />,
    )
    const spark = screen.getByRole('img')
    expect(spark.getAttribute('aria-label')).toContain('above threshold 400')
    expect(spark.getAttribute('class')).toContain('h-(--sp-h)')
    rerender(<VitalTile label="p95 latency" value={412} data={[412]} />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('words the trend as below or above the minimum with direction="below"', () => {
    const threshold = { value: 92, severity: 'critical', direction: 'below' } as const
    const { rerender } = render(
      <VitalTile label="SpO2" value={89} unit="%" data={[97, 95, 93, 89]} threshold={threshold} />,
    )
    const label = screen.getByRole('img').getAttribute('aria-label') ?? ''
    expect(label).toContain('below minimum 92')
    expect(label).toContain('latest 89')
    expect(label).not.toContain('within threshold')
    rerender(<VitalTile label="SpO2" value={96} unit="%" data={[89, 93, 95, 96]} threshold={threshold} />)
    const ok = screen.getByRole('img').getAttribute('aria-label') ?? ''
    expect(ok).toContain('at or above minimum 92')
    expect(ok).not.toContain('within threshold')
  })

  it('adds a top rule when outside range, and none when normal', () => {
    const { rerender } = render(<VitalTile label="A" value={5} threshold={{ value: 1, severity: 'caution' }} />)
    expect(screen.getByRole('group').className).toContain('before:bg-tone')
    rerender(<VitalTile label="A" value={0} threshold={{ value: 1, severity: 'caution' }} />)
    expect(screen.getByRole('group').className).not.toContain('before:bg-tone')
  })

  it('sets data-density and the density variables directly from the density prop', () => {
    const { rerender } = render(<VitalTile label="A" value={1} density="station" />)
    const tile = screen.getByRole('group')
    expect(tile.dataset.density).toBe('station')
    expect(tile.className).toContain('[--n:var(--numeral-xl)]')
    expect(tile.className).toContain('[--pad:28px]')
    expect(tile.className).toContain('[--sp-h:76px]')
    expect(tile.className).not.toContain('[--n:var(--numeral-lg)]')
    expect(tile.className).not.toContain('[data-density')
    rerender(<VitalTile label="A" value={1} density="compact" />)
    expect(screen.getByRole('group').className).toContain('[--n:var(--numeral-md)]')
    expect(screen.getByRole('group').className).toContain('[--pad:12px]')
    rerender(<VitalTile label="A" value={1} density="comfortable" />)
    expect(screen.getByRole('group').className).toContain('[--pad:18px]')
  })

  it('follows a data-density ancestor when density is not set', () => {
    render(<VitalTile label="A" value={1} />)
    const tile = screen.getByRole('group')
    expect(tile.hasAttribute('data-density')).toBe(false)
    expect(tile.className).toContain('[[data-density=compact]_&]:[--pad:12px]')
    expect(tile.className).toContain('[[data-density=station]_&]:[--n:var(--numeral-xl)]')
    expect(tile.className).toContain('[[data-density=station]_&]:[--sp-h:76px]')
    expect(tile.className).toContain('[--pad:18px]')
  })

  it('lets className override defaults and passes props to the root', () => {
    render(<VitalTile label="A" value={1} className="p-6" data-x="1" />)
    const tile = screen.getByRole('group')
    expect(tile.className).toContain('p-6')
    expect(tile.className).not.toContain('p-(--pad)')
    expect(tile.dataset.x).toBe('1')
  })
})

testExamplesAxe(examples)
