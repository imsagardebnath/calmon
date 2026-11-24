import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Banner } from './banner.tsx'
import * as examples from './banner.examples.tsx'

describe('Banner', () => {
  it('defaults to the info tone with role="status"', () => {
    render(<Banner title="Heads up" />)
    const banner = screen.getByRole('status')
    expect(banner.dataset.tone).toBe('info')
    expect(banner.textContent).toContain('Heads up')
  })

  it('uses role="alert" for critical only, and role="status" otherwise', () => {
    render(
      <>
        <Banner severity="critical" title="A" />
        <Banner severity="caution" title="B" />
        <Banner severity="advisory" title="C" />
        <Banner severity="normal" title="D" />
      </>,
    )
    expect(screen.getAllByRole('alert').map((e) => e.textContent)).toEqual(['A'])
    expect(screen.getAllByRole('status').map((e) => e.textContent)).toEqual(['B', 'C', 'D'])
  })

  it('sets the tone from severity, and severity wins over intent', () => {
    render(<Banner severity="advisory" intent="danger" title="x" />)
    expect(screen.getByRole('status').dataset.tone).toBe('advisory')
  })

  it('maps intent to a tone and role', () => {
    render(<Banner intent="danger" title="x" />)
    expect(screen.getByRole('alert').dataset.tone).toBe('critical')
  })

  it('shows the severity icon, hidden from screen readers, unless icon={false}', () => {
    const { rerender } = render(<Banner severity="caution" title="x" />)
    expect(screen.getByRole('status').querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    rerender(<Banner severity="caution" title="x" icon={false} />)
    expect(screen.getByRole('status').querySelector('svg')).toBeNull()
  })

  it('replaces the severity icon with a custom node', () => {
    render(<Banner severity="caution" title="x" icon={<i data-testid="custom" />} />)
    const banner = screen.getByRole('status')
    expect(banner.querySelector('svg')).toBeNull()
    expect(screen.getByTestId('custom')).toBeTruthy()
    expect(screen.getByTestId('custom').parentElement?.getAttribute('aria-hidden')).toBe('true')
  })

  it('fills the whole banner with the solid variant, and only that variant', () => {
    render(
      <>
        <Banner severity="critical" variant="solid" title="Solid" />
        <Banner severity="info" title="Soft" />
      </>,
    )
    const solid = screen.getByRole('alert').className.split(' ')
    expect(solid).toContain('bg-tone')
    expect(solid).toContain('text-tone-on')
    expect(solid).not.toContain('bg-tone-soft')
    const soft = screen.getByRole('status').className.split(' ')
    expect(soft).toContain('bg-tone-soft')
    expect(soft).not.toContain('bg-tone')
  })

  it('is a compact one-line banner with only a title, and a taller layout with a body', () => {
    const { rerender } = render(<Banner title="Only a title" />)
    const compact = screen.getByRole('status')
    expect(compact.className.split(' ')).toContain('items-center')
    expect(compact.querySelector('.text-ui-sm')).toBeNull()
    rerender(<Banner title="With body">Some detail.</Banner>)
    const roomy = screen.getByRole('status')
    expect(roomy.className.split(' ')).toContain('items-start')
    expect(roomy.className.split(' ')).not.toContain('items-center')
    expect(screen.getByText('Some detail.')).toBeTruthy()
  })

  it('renders the body and the action', () => {
    render(
      <Banner title="Disk" action={<button type="button">View hosts</button>}>
        Free space soon.
      </Banner>,
    )
    expect(screen.getByText('Free space soon.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'View hosts' })).toBeTruthy()
  })

  it('shows a close button only when onDismiss is set, and calls it', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Banner title="x" />)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<Banner title="x" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('lets the close button label be changed', () => {
    render(<Banner title="x" onDismiss={() => {}} dismissLabel="Close" />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('lets className and role be overridden', () => {
    render(<Banner title="x" severity="critical" role="status" className="w-full" />)
    const banner = screen.getByRole('status')
    expect(banner.className).toContain('w-full')
  })
})

testExamplesAxe(examples)
