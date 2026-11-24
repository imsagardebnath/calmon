import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Pagination } from './pagination.tsx'
import * as examples from './pagination.examples.tsx'

/** The visible page numbers and ellipses, in order. */
const slots = () =>
  screen
    .getAllByRole('listitem', { hidden: true })
    .map((li) => li.textContent?.replace('Page ', ''))
    .slice(1, -1)
const current = () => document.querySelector('[aria-current="page"]')?.textContent?.replace('Page ', '')

describe('Pagination', () => {
  it('is a navigation landmark named Pagination', () => {
    render(<Pagination total={289} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy()
  })

  it('shows the range and total, with the default page size of 25', () => {
    render(<Pagination total={312} />)
    expect(screen.getByText('1–25 of 312')).toBeTruthy()
  })

  it('shows a short last page correctly', () => {
    render(<Pagination total={289} pageSize={25} defaultPage={12} />)
    expect(screen.getByText('276–289 of 289')).toBeTruthy()
  })

  it('shows 0–0 of 0 when there are no rows', () => {
    render(<Pagination total={0} />)
    expect(screen.getByText('0–0 of 0')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('marks the current page with aria-current and labels each page button', () => {
    render(<Pagination total={289} defaultPage={2} />)
    expect(current()).toBe('2')
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Page 3' }).hasAttribute('aria-current')).toBe(false)
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination total={100} page={1} />)
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(false)
    rerender(<Pagination total={100} page={4} />)
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('changes page uncontrolled, and reports it', () => {
    const onPageChange = vi.fn()
    render(<Pagination total={289} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    expect(current()).toBe('2')
    expect(screen.getByText('26–50 of 289')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(current()).toBe('3')
  })

  it('is controlled by page', () => {
    function Host() {
      const [p, setP] = useState(1)
      return (
        <>
          <Pagination page={p} onPageChange={setP} total={100} />
          <output>{p}</output>
        </>
      )
    }
    render(<Host />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(screen.getByRole('status').textContent).toBe('3')
    expect(current()).toBe('3')
  })

  it('does not move when controlled and the parent ignores the change', () => {
    render(<Pagination page={1} onPageChange={() => {}} total={100} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(current()).toBe('1')
  })

  it('shows every page when there are seven or fewer', () => {
    render(<Pagination total={175} />)
    expect(slots()).toEqual(['1', '2', '3', '4', '5', '6', '7'])
  })

  it('collapses long ranges into a stable seven slots', () => {
    const { rerender } = render(<Pagination total={300} pageSize={25} page={1} />)
    expect(slots()).toEqual(['1', '2', '3', '4', '5', '…', '12'])
    rerender(<Pagination total={300} pageSize={25} page={6} />)
    expect(slots()).toEqual(['1', '…', '5', '6', '7', '…', '12'])
    rerender(<Pagination total={300} pageSize={25} page={12} />)
    expect(slots()).toEqual(['1', '…', '8', '9', '10', '11', '12'])
  })

  it('hides ellipses from assistive technology', () => {
    render(<Pagination total={300} />)
    const gaps = screen.getAllByRole('listitem', { hidden: true }).filter((li) => li.textContent === '…')
    expect(gaps).toHaveLength(1)
    expect(gaps[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('clamps a page that is out of range', () => {
    render(<Pagination total={50} page={9} />)
    expect(current()).toBe('2')
  })

  it('keeps keyboard focus when Next disables itself on the last page', () => {
    render(<Pagination total={100} defaultPage={3} />)
    const next = screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement
    next.focus()
    expect(document.activeElement).toBe(next)
    fireEvent.click(next)
    expect(next.disabled).toBe(true)
    const here = screen.getByRole('button', { name: 'Page 4' })
    expect(here.getAttribute('aria-current')).toBe('page')
    expect(document.activeElement).toBe(here)
  })

  it('keeps keyboard focus when Previous disables itself on the first page', () => {
    render(<Pagination total={100} defaultPage={2} />)
    const previous = screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement
    previous.focus()
    fireEvent.click(previous)
    expect(previous.disabled).toBe(true)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Page 1' }))
  })

  it('leaves focus alone when the page does not reach an end', () => {
    render(<Pagination total={100} defaultPage={1} />)
    const next = screen.getByRole('button', { name: 'Next page' })
    next.focus()
    fireEvent.click(next)
    expect(document.activeElement).toBe(next)
  })

  it('does not move focus when a controlled page ignores the change', () => {
    render(<Pagination total={100} page={3} onPageChange={() => {}} />)
    const next = screen.getByRole('button', { name: 'Next page' })
    next.focus()
    fireEvent.click(next)
    expect(current()).toBe('3')
    expect(document.activeElement).toBe(next)
  })

  it('announces the whole range at once, as one piece of text', () => {
    render(<Pagination total={289} />)
    const range = screen.getByText('1–25 of 289')
    expect(range.getAttribute('aria-live')).toBe('polite')
    expect(range.getAttribute('aria-atomic')).toBe('true')
    expect(range.childNodes).toHaveLength(1)
  })

  it('merges className and spreads props on the nav', () => {
    render(<Pagination total={50} className="mt-4" aria-label="Rows" data-testid="pg" />)
    expect(screen.getByTestId('pg').className).toContain('mt-4')
    expect(screen.getByRole('navigation', { name: 'Rows' })).toBeTruthy()
  })
})

testExamplesAxe(examples)
