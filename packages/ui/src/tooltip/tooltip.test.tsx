import { createRef } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IconButton } from '../icon-button/index.ts'
import { CopyIcon } from '../icons/index.ts'
import { Popover } from '../popover/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { Tooltip } from './tooltip.tsx'
import * as examples from './tooltip.examples.tsx'

afterEach(() => vi.useRealTimers())

const hover = (el: Element) => fireEvent.pointerEnter(el)

// jsdom's pointer events may drop `pointerType`, so set it on a plain event. React derives enter from pointerover.
const touchHover = (el: Element) => {
  const e = new Event('pointerover', { bubbles: true })
  Object.defineProperty(e, 'pointerType', { value: 'touch' })
  fireEvent(el, e)
}

describe('Tooltip', () => {
  it('renders nothing extra until it is shown, and does not describe the trigger yet', () => {
    render(
      <Tooltip content="Locked until all checks pass">
        <button>Publish</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByRole('button').hasAttribute('aria-describedby')).toBe(false)
  })

  it('shows after 400ms of hover by default', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Locked until all checks pass">
        <button>Publish</button>
      </Tooltip>,
    )
    hover(screen.getByRole('button'))
    await act(() => vi.advanceTimersByTimeAsync(399))
    expect(screen.queryByRole('tooltip')).toBeNull()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(screen.getByRole('tooltip').textContent).toBe('Locked until all checks pass')
  })

  it('uses the delay prop', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Quick" delay={50}>
        <button>Go</button>
      </Tooltip>,
    )
    hover(screen.getByRole('button'))
    await act(() => vi.advanceTimersByTimeAsync(50))
    expect(screen.getByRole('tooltip')).toBeTruthy()
  })

  it('does not show for a pointer that leaves before the delay', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Nope">
        <button>Go</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button')
    hover(button)
    await act(() => vi.advanceTimersByTimeAsync(200))
    fireEvent.pointerLeave(button)
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('ignores touch pointers', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Nope">
        <button>Go</button>
      </Tooltip>,
    )
    touchHover(screen.getByRole('button'))
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('shows at once on keyboard focus and describes the trigger while shown', async () => {
    render(
      <Tooltip content="Copy service ID" delay={5000}>
        <button>Copy</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button')
    act(() => button.focus())
    const tip = await screen.findByRole('tooltip')
    expect(button.getAttribute('aria-describedby')).toBe(tip.id)
    expect(screen.getByRole('button', { description: 'Copy service ID' })).toBe(button)
    act(() => button.blur())
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(button.hasAttribute('aria-describedby')).toBe(false)
  })

  it('keeps the trigger own aria-describedby', async () => {
    render(
      <>
        <span id="hint">Hint</span>
        <Tooltip content="Tip">
          <button aria-describedby="hint">Go</button>
        </Tooltip>
      </>,
    )
    act(() => screen.getByRole('button').focus())
    await screen.findByRole('tooltip')
    expect(screen.getByRole('button').getAttribute('aria-describedby')).toContain('hint')
    expect(screen.getByRole('button', { description: /Hint/ })).toBeTruthy()
  })

  it('hides on pointer leave and on Escape, and Escape does not leak to a dialog', async () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <button>Go</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button')
    act(() => button.focus())
    await screen.findByRole('tooltip')
    expect(fireEvent.keyDown(document.body, { key: 'Escape' })).toBe(false) // default prevented
    expect(screen.queryByRole('tooltip')).toBeNull()
    hover(button)
    await screen.findByRole('tooltip')
    fireEvent.pointerLeave(button)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('renders the tip into <body>, never inside the trigger', async () => {
    render(
      <Tooltip content="Tip">
        <button>Go</button>
      </Tooltip>,
    )
    act(() => screen.getByRole('button').focus())
    const tip = await screen.findByRole('tooltip')
    expect(tip.parentElement).toBe(document.body)
  })

  it('renders inside the <dialog> that holds its trigger, so a modal does not make it inert', async () => {
    render(
      <dialog open>
        <Tooltip content="Tip">
          <button>Go</button>
        </Tooltip>
      </dialog>,
    )
    act(() => screen.getByRole('button', { hidden: true }).focus())
    const tip = await screen.findByRole('tooltip', { hidden: true })
    expect(tip.parentElement?.tagName).toBe('DIALOG')
  })

  it('renders inside the popover that holds its trigger', async () => {
    render(
      <Popover defaultOpen trigger={<button>Open</button>}>
        <Tooltip content="Tip">
          <button>Go</button>
        </Tooltip>
      </Popover>,
    )
    const popover = await screen.findByRole('dialog')
    act(() => screen.getByRole('button', { name: 'Go' }).focus())
    const tip = await screen.findByRole('tooltip')
    expect(tip.parentElement).toBe(popover)
  })

  it('runs the pointer and focus handlers passed to it, and still shows and hides', async () => {
    const handlers = { onPointerEnter: vi.fn(), onPointerLeave: vi.fn(), onFocus: vi.fn(), onBlur: vi.fn() }
    render(
      <Tooltip content="Tip" delay={0} {...handlers}>
        <button>Go</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button')
    act(() => button.focus())
    await screen.findByRole('tooltip')
    expect(handlers.onFocus).toHaveBeenCalledTimes(1)
    act(() => button.blur())
    expect(handlers.onBlur).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('tooltip')).toBeNull()

    hover(button)
    await screen.findByRole('tooltip')
    expect(handlers.onPointerEnter).toHaveBeenCalledTimes(1)
    fireEvent.pointerLeave(button)
    expect(handlers.onPointerLeave).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  describe('side', () => {
    afterEach(() => vi.restoreAllMocks())

    /** jsdom has no layout. Give the trigger's wrapper a 60x20 box at (300, 300) and the tip a 100x40 size, in a 1000x800 window. */
    function mockLayout() {
      const tip = (el: Element) => el.getAttribute('role') === 'tooltip'
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return tip(this) ? 100 : 60
      })
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
        return tip(this) ? 40 : 20
      })
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const [x, y, width, height] = this.hasAttribute('data-host') ? [300, 300, 60, 20] : [0, 0, 0, 0]
        return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON: () => ({}) }
      })
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000)
      vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800)
    }

    // The tip is centred on the trigger's wrapper (300 to 360 across, 300 to 320 down), 8px away. The arrow sits on the edge facing it.
    it.each([
      [undefined, { left: '280px', top: '252px' }, 'bottom'], // `top` is the default
      ['top', { left: '280px', top: '252px' }, 'bottom'],
      ['bottom', { left: '280px', top: '328px' }, 'top'],
      ['start', { left: '192px', top: '290px' }, 'right'],
      ['end', { left: '368px', top: '290px' }, 'left'],
    ] as const)('side %s puts the tip there, with the arrow on the %s-facing edge', async (side, at, edge) => {
      mockLayout()
      render(
        <Tooltip content="Tip" side={side} delay={0} data-host="">
          <button>Go</button>
        </Tooltip>,
      )
      act(() => screen.getByRole('button').focus())
      const tip = await screen.findByRole('tooltip')
      await waitFor(() => expect({ left: tip.style.left, top: tip.style.top }).toEqual(at))
      const arrow = tip.querySelector<HTMLElement>('[aria-hidden="true"]')!
      expect(arrow.style.getPropertyValue(edge)).toBe('-3.5px')
    })
  })

  it('drops the native title of an icon button so there is only one tip', () => {
    render(
      <Tooltip content="Copy service ID">
        <IconButton label="Copy service ID" icon={<CopyIcon />} />
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: 'Copy service ID' })
    expect(button.hasAttribute('title')).toBe(false)
  })

  it('lets a disabled child pass pointer events to the wrapper', () => {
    const { container } = render(
      <Tooltip content="Why" className="extra">
        <button disabled>Publish</button>
      </Tooltip>,
    )
    const host = container.firstElementChild as HTMLElement
    expect(host.className).toContain('[&>:disabled]:pointer-events-none')
    expect(host.className).toContain('extra')
  })

  it('forwards ref and other props to the wrapper', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Tooltip content="Tip" ref={ref} data-x="1">
        <button>Go</button>
      </Tooltip>,
    )
    expect(ref.current).toBe(screen.getByRole('button').parentElement)
    expect(ref.current!.dataset.x).toBe('1')
  })

  it('has no axe violations while shown', async () => {
    const { container } = render(
      <Tooltip content="Locked until all checks pass">
        <button aria-disabled="true">Publish</button>
      </Tooltip>,
    )
    act(() => screen.getByRole('button').focus())
    await screen.findByRole('tooltip')
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    expect(container).toBeTruthy()
  })
})

testExamplesAxe(examples)
