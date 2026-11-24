import type { ComponentType } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as icons from './index.ts'
import { CopyIcon, SearchIcon, SeverityIcon, type IconProps } from './index.ts'
import { SEVERITIES } from '../lib/tone.ts'

const svgOf = (container: HTMLElement) => container.querySelector('svg')!

describe('icons', () => {
  it('are decorative by default: hidden from assistive technology and not focusable', () => {
    const { container } = render(<CopyIcon />)
    const svg = svgOf(container)
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('role')).toBeNull()
    expect(svg.getAttribute('focusable')).toBe('false')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('become an image with a name when given aria-label', () => {
    render(<CopyIcon aria-label="Copy" />)
    const image = screen.getByRole('img', { name: 'Copy' })
    expect(image.getAttribute('aria-hidden')).toBeNull()
  })

  it('become an image when named by aria-labelledby', () => {
    render(
      <>
        <span id="label">Search</span>
        <SearchIcon aria-labelledby="label" />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Search' })).toBeTruthy()
  })

  it('let an explicit role or aria-hidden from the caller win', () => {
    const { container } = render(<CopyIcon aria-label="Copy" role="presentation" aria-hidden />)
    const svg = svgOf(container)
    expect(svg.getAttribute('role')).toBe('presentation')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
  })

  it('are 16px with the 24px drawing grid, and size can be overridden', () => {
    const { container, rerender } = render(<CopyIcon />)
    expect(svgOf(container).getAttribute('width')).toBe('16')
    expect(svgOf(container).getAttribute('height')).toBe('16')
    expect(svgOf(container).getAttribute('viewBox')).toBe('0 0 24 24')
    rerender(<CopyIcon width={32} height={32} />)
    expect(svgOf(container).getAttribute('width')).toBe('32')
  })

  it('merge className through cn(): an override replaces the conflicting default', () => {
    const { container, rerender } = render(<CopyIcon />)
    expect(svgOf(container).getAttribute('class')).toBe('inline-block shrink-0 align-[-3px]')

    rerender(<CopyIcon className="block align-middle text-fg-muted" />)
    const classes = svgOf(container).getAttribute('class')!.split(' ')
    expect(classes).toContain('block')
    expect(classes).toContain('align-middle')
    expect(classes).toContain('text-fg-muted')
    expect(classes).toContain('shrink-0')
    expect(classes).not.toContain('inline-block')
    expect(classes).not.toContain('align-[-3px]')
  })

  it('every export renders an svg', () => {
    const entries = Object.entries(icons).filter(([name]) => name.endsWith('Icon') && name !== 'SeverityIcon') as [string, ComponentType<IconProps>][]
    expect(entries.length).toBeGreaterThan(30)
    for (const [name, Icon] of entries) {
      const { container, unmount } = render(<Icon />)
      expect(svgOf(container), name).not.toBeNull()
      expect(svgOf(container).innerHTML, name).not.toBe('')
      unmount()
    }
  })
})

describe('SeverityIcon', () => {
  it('draws five distinct shapes, so status is never colour alone', () => {
    const shapes = SEVERITIES.map((severity) => {
      const { container, unmount } = render(<SeverityIcon severity={severity} />)
      const inner = svgOf(container).innerHTML
      unmount()
      return inner
    })
    expect(shapes.every((s) => s.length > 0)).toBe(true)
    expect(new Set(shapes).size).toBe(5)
  })

  it('is decorative by default and passes props through', () => {
    const { container, rerender } = render(<SeverityIcon severity="critical" />)
    expect(svgOf(container).getAttribute('aria-hidden')).toBe('true')

    rerender(<SeverityIcon severity="critical" aria-label="Critical" className="size-5" />)
    const image = screen.getByRole('img', { name: 'Critical' })
    expect(image.getAttribute('class')).toContain('size-5')
  })
})
