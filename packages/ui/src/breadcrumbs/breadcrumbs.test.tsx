import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Breadcrumbs } from './breadcrumbs.tsx'
import * as examples from './breadcrumbs.examples.tsx'

const three = [{ label: 'Production', href: '/' }, { label: 'eu-west', href: '/eu-west' }, { label: 'payments-api' }]
const six = [
  { label: 'One', href: '/1' },
  { label: 'Two', href: '/2' },
  { label: 'Three', href: '/3' },
  { label: 'Four', href: '/4' },
  { label: 'Five', href: '/5' },
  { label: 'Six' },
]

describe('Breadcrumbs', () => {
  it('is a navigation landmark named Breadcrumb with an ordered list', () => {
    render(<Breadcrumbs items={three} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('links every crumb that has an href', () => {
    render(<Breadcrumbs items={three} />)
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/', '/eu-west'])
  })

  it('marks only the last item as the current page', () => {
    render(<Breadcrumbs items={three} />)
    const current = document.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]?.textContent).toBe('payments-api')
    expect(current[0]?.tagName).toBe('SPAN')
  })

  it('hides the separators from screen readers', () => {
    render(<Breadcrumbs items={three} />)
    const seps = document.querySelectorAll('li > svg')
    expect(seps).toHaveLength(2)
    for (const s of seps) expect(s.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not collapse a path that fits', () => {
    render(<Breadcrumbs items={three} maxItems={3} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('collapses the middle of a long path into an ellipsis, keeping the first and last', () => {
    render(<Breadcrumbs items={six} />)
    // maxItems 4: first, the ellipsis, then the last two.
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['One', '…Show all breadcrumbs', 'Five', 'Six'])
    expect(screen.getByRole('button', { name: 'Show all breadcrumbs' }).getAttribute('title')).toBe('Two / Three / Four')
  })

  it('respects maxItems', () => {
    render(<Breadcrumbs items={six} maxItems={3} />)
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['One', '…Show all breadcrumbs', 'Six'])
  })

  it('shows every crumb when the ellipsis is activated, and moves focus to the first revealed crumb', () => {
    render(<Breadcrumbs items={six} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show all breadcrumbs' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.queryByRole('button')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Two' }))
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('merges className and spreads props on the nav', () => {
    render(<Breadcrumbs items={three} className="mb-4" aria-label="You are here" data-testid="bc" />)
    expect(screen.getByTestId('bc').className).toContain('mb-4')
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeTruthy()
  })
})

testExamplesAxe(examples)
