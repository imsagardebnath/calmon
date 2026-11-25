import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Skeleton } from './skeleton.tsx'
import * as examples from './skeleton.examples.tsx'

describe('Skeleton', () => {
  it('is hidden from screen readers', () => {
    const { container } = render(<Skeleton />)
    expect((container.firstElementChild as HTMLElement).getAttribute('aria-hidden')).toBe('true')
  })

  it('shimmers', () => {
    const { container } = render(<Skeleton />)
    expect((container.firstElementChild as HTMLElement).className).toContain('animate-pikore-shim')
  })

  it('renders one bar by default and the given number of lines', () => {
    const one = render(<Skeleton />)
    expect(one.container.firstElementChild?.children.length).toBe(0)
    one.unmount()
    const four = render(<Skeleton lines={4} />)
    expect(four.container.firstElementChild?.children.length).toBe(4)
  })

  it('shortens the last two lines', () => {
    const { container } = render(<Skeleton lines={3} />)
    const widths = [...(container.firstElementChild?.children ?? [])].map((c) => c.className)
    expect(widths[0]).toContain('w-full')
    expect(widths[1]).toContain('w-[70%]')
    expect(widths[2]).toContain('w-[45%]')
  })

  it('makes a circle with the given size, default 36px', () => {
    const { container, rerender } = render(<Skeleton circle />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('rounded-full')
    expect(el.style.width).toBe('36px')
    rerender(<Skeleton circle size={48} />)
    expect((container.firstElementChild as HTMLElement).style.height).toBe('48px')
  })

  it('uses size as the bar height and lets className override the width', () => {
    const { container } = render(<Skeleton size={20} className="w-1/3" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.height).toBe('20px')
    expect(el.className).toContain('w-1/3')
    expect(el.className).not.toContain('w-full')
  })
})

testExamplesAxe(examples)
