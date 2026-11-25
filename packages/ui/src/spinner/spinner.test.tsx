import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Spinner } from './spinner.tsx'
import * as examples from './spinner.examples.tsx'

describe('Spinner', () => {
  it('is a status with the default label "Loading"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').textContent).toBe('Loading')
  })

  it('uses a custom label, visually hidden', () => {
    render(<Spinner label="Loading services" />)
    const label = screen.getByText('Loading services')
    expect(label.className).toContain('sr-only')
    expect(screen.getByRole('status').textContent).toBe('Loading services')
  })

  it('spins, and sizes follow the size prop', () => {
    render(
      <>
        <Spinner label="sm" size="sm" />
        <Spinner label="md" />
        <Spinner label="lg" size="lg" />
      </>,
    )
    const cls = (n: string) => screen.getByText(n).parentElement?.className ?? ''
    expect(cls('sm')).toContain('size-4')
    expect(cls('md')).toContain('size-5')
    expect(cls('lg')).toContain('size-8')
    expect(cls('md')).toContain('animate-pikore-spin')
  })

  it('lets className override defaults and passes props through', () => {
    render(<Spinner className="size-6" data-x="1" />)
    const el = screen.getByRole('status')
    expect(el.className).toContain('size-6')
    expect(el.className).not.toContain('size-5')
    expect(el.dataset.x).toBe('1')
  })
})

describe('Delayed example', () => {
  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  it('shows the spinner only after 300ms of waiting, and hides it when the wait ends', () => {
    render(<examples.Delayed />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    act(() => void vi.advanceTimersByTime(250))
    expect(screen.queryByRole('status')).toBeNull()
    act(() => void vi.advanceTimersByTime(100))
    expect(screen.getByRole('status').textContent).toBe('Refreshing services')
    fireEvent.click(screen.getByRole('button', { name: 'Finish refresh' }))
    expect(screen.queryByRole('status')).toBeNull()
  })
})

testExamplesAxe(examples)
