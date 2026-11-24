import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { EmptyState } from './empty-state.tsx'
import * as examples from './empty-state.examples.tsx'

describe('EmptyState', () => {
  it('renders the title as an h3 heading by default, with the description', () => {
    render(<EmptyState title="No alerts">Everything is in range.</EmptyState>)
    expect(screen.getByRole('heading', { level: 3, name: 'No alerts' })).toBeTruthy()
    expect(screen.getByText('Everything is in range.')).toBeTruthy()
  })

  it('lets the heading level fit the page', () => {
    render(<EmptyState title="No alerts" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy()
  })

  it('renders the action', () => {
    render(<EmptyState title="Nothing here" action={<button type="button">Add one</button>} />)
    expect(screen.getByRole('button', { name: 'Add one' })).toBeTruthy()
  })

  it('renders the icon slot, hidden from screen readers', () => {
    render(<EmptyState title="Nothing" icon={<i data-testid="icon" />} />)
    expect(screen.getByTestId('icon').parentElement?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders no description or icon wrappers when they are not given', () => {
    const { container } = render(<EmptyState title="Nothing" />)
    expect(container.firstElementChild?.children.length).toBe(1)
  })

  it('lets className override defaults and passes props to the root', () => {
    const { container } = render(<EmptyState title="Nothing" className="py-4" data-x="1" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('py-4')
    expect(root.className).not.toContain('py-10')
    expect(root.dataset.x).toBe('1')
  })
})

testExamplesAxe(examples)
