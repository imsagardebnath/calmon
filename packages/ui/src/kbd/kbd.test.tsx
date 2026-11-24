import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Kbd } from './kbd.tsx'
import * as examples from './kbd.examples.tsx'

afterEach(() => vi.restoreAllMocks())

describe('Kbd', () => {
  it('renders a native kbd element with the key name', () => {
    const { container } = render(<Kbd>Esc</Kbd>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('KBD')
    expect(el.textContent).toBe('Esc')
    expect(el.className).toContain('font-mono')
  })

  it('splits a plus-separated string into separate caps', () => {
    const { container } = render(<Kbd>Ctrl+Shift+K</Kbd>)
    expect(Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)).toEqual(['Ctrl', 'Shift', 'K'])
  })

  it('accepts spaces around the plus', () => {
    const { container } = render(<Kbd>Ctrl + K</Kbd>)
    expect(Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)).toEqual(['Ctrl', 'K'])
  })

  it('keeps a lone plus key, and a trailing plus key', () => {
    const { container } = render(
      <>
        <Kbd>+</Kbd>
        <Kbd>Ctrl++</Kbd>
      </>,
    )
    const inner = Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)
    expect(inner).toEqual(['Ctrl', '+'])
    expect(container.firstElementChild?.textContent).toBe('+')
  })

  it('renders several children as separate caps', () => {
    const { container } = render(
      <Kbd>
        {'Shift'}
        {'P'}
      </Kbd>,
    )
    expect(Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)).toEqual(['Shift', 'P'])
  })

  it('announces the join between caps for screen readers', () => {
    const { container } = render(<Kbd>Ctrl+K</Kbd>)
    expect(container.firstElementChild?.textContent).toBe('Ctrl+K')
    expect(container.querySelector('.sr-only')?.textContent).toBe('+')
  })

  it('shows Ctrl for mod on non-Apple platforms', () => {
    const { container } = render(<Kbd>mod+K</Kbd>)
    expect(Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)).toEqual(['Ctrl', 'K'])
  })

  it('shows the Command symbol for mod on Apple platforms, after the effect runs', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel')
    const { container } = render(<Kbd>mod+K</Kbd>)
    expect(Array.from(container.querySelectorAll('kbd kbd')).map((k) => k.textContent)).toEqual(['⌘', 'K'])
  })

  it('renders Ctrl on the server and never reads the platform during render', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel')
    expect(renderToString(<Kbd>mod+K</Kbd>)).toContain('Ctrl')
  })

  it('does not change other text on Apple platforms', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel')
    render(<Kbd>Ctrl</Kbd>)
    expect(screen.getByText('Ctrl').tagName).toBe('KBD')
  })

  it('merges className and passes props to the root', () => {
    const { container } = render(
      <Kbd className="text-fg" title="Search">
        K
      </Kbd>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('text-fg')
    expect(el.className).not.toContain('text-fg-muted')
    expect(el.title).toBe('Search')
  })
})

testExamplesAxe(examples)
