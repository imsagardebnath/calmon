import { createRef, useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Menu, MenuItem } from '../menu/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { Popover } from './popover.tsx'
import { placementOf } from './popup.tsx'
import * as examples from './popover.examples.tsx'

const trigger = <button>Why 62?</button>

/** jsdom has no layout. Give the trigger a 60x20 box at (300, 300) and the popup a 100x40 size, in a 1000x800 window. */
function mockLayout() {
  const popup = (el: Element) => el.getAttribute('role') === 'dialog'
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return popup(this) ? 100 : 60
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return popup(this) ? 40 : 20
  })
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const [x, y, width, height] = this.tagName === 'BUTTON' ? [300, 300, 60, 20] : [0, 0, 0, 0]
    return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON: () => ({}) }
  })
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000)
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800)
}

describe('Popover', () => {
  it('is closed at first and the trigger says it opens a dialog', () => {
    render(<Popover trigger={trigger}>Because latency</Popover>)
    const button = screen.getByRole('button', { name: 'Why 62?' })
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.hasAttribute('aria-controls')).toBe(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens on click, wires aria-controls, and is named by the trigger', async () => {
    render(<Popover trigger={trigger}>Because latency</Popover>)
    const button = screen.getByRole('button', { name: 'Why 62?' })
    await userEvent.click(button)
    const popover = await screen.findByRole('dialog', { name: 'Why 62?' })
    expect(popover.textContent).toBe('Because latency')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.getAttribute('aria-controls')).toBe(popover.id)
  })

  it('uses label as its accessible name when given', async () => {
    render(
      <Popover trigger={trigger} label="Score explanation">
        Body
      </Popover>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByRole('dialog', { name: 'Score explanation' })).toBeTruthy()
  })

  it('toggles closed when the trigger is clicked again', async () => {
    render(<Popover trigger={trigger}>Body</Popover>)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    await screen.findByRole('dialog')
    await userEvent.click(button)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('moves focus into the popover, and Escape closes it and returns focus to the trigger', async () => {
    render(<Popover trigger={trigger}>Body</Popover>)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    const popover = await screen.findByRole('dialog')
    await waitFor(() => expect(document.activeElement).toBe(popover))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('closes on a pointer-down outside, but not inside or on the trigger', async () => {
    render(
      <>
        <Popover trigger={trigger}>
          <a href="#x">Link</a>
        </Popover>
        <p>Elsewhere</p>
      </>,
    )
    await userEvent.click(screen.getByRole('button'))
    await screen.findByRole('dialog')
    fireEvent.pointerDown(screen.getByText('Link'))
    expect(screen.queryByRole('dialog')).not.toBeNull()
    fireEvent.pointerDown(screen.getByText('Elsewhere'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes when focus moves out of it, but not into it or onto the trigger', async () => {
    render(
      <>
        <Popover trigger={trigger}>
          <a href="#x">Link</a>
        </Popover>
        <button>Other</button>
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Why 62?' }))
    const popover = await screen.findByRole('dialog')
    fireEvent.blur(popover, { relatedTarget: screen.getByText('Link') })
    fireEvent.blur(popover, { relatedTarget: screen.getByRole('button', { name: 'Why 62?' }) })
    expect(screen.queryByRole('dialog')).not.toBeNull()
    fireEvent.blur(popover, { relatedTarget: screen.getByRole('button', { name: 'Other' }) })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('can be controlled with open and onOpenChange', async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Popover open={false} onOpenChange={onOpenChange} trigger={trigger}>
        Body
      </Popover>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).toBeNull() // the parent has not said yes
    rerender(
      <Popover open onOpenChange={onOpenChange} trigger={trigger}>
        Body
      </Popover>,
    )
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog')).not.toBeNull()
  })

  it('can be closed from inside when controlled', async () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      return (
        <Popover open={open} onOpenChange={setOpen} trigger={trigger}>
          <button onClick={() => setOpen(false)}>Done</button>
        </Popover>
      )
    }
    render(<Demo />)
    await userEvent.click(screen.getByText('Why 62?'))
    await userEvent.click(await screen.findByText('Done'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('supports defaultOpen', async () => {
    render(
      <Popover defaultOpen trigger={trigger}>
        Body
      </Popover>,
    )
    expect(await screen.findByRole('dialog')).toBeTruthy()
  })

  it('keeps the trigger own handlers, id and ref', async () => {
    const onClick = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    render(
      <Popover trigger={<button id="mine" ref={ref} onClick={onClick}>Open</button>}>Body</Popover>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(ref.current).toBe(screen.getByRole('button'))
    expect((await screen.findByRole('dialog')).getAttribute('aria-labelledby')).toBe('mine')
  })

  it('renders into <body>, merges className and forwards ref', async () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <Popover ref={ref} className="extra" defaultOpen trigger={trigger}>
        Body
      </Popover>,
    )
    const popover = await screen.findByRole('dialog')
    expect(container.contains(popover)).toBe(false)
    expect(popover.parentElement).toBe(document.body)
    expect(popover.className).toContain('extra')
    expect(ref.current).toBe(popover)
  })

  it('renders inside the <dialog> that holds its trigger, so a modal does not make it inert', async () => {
    render(
      <dialog open>
        <Popover trigger={trigger}>Body</Popover>
      </dialog>,
    )
    await userEvent.click(screen.getByRole('button'))
    const popover = await screen.findByRole('dialog', { name: 'Why 62?', hidden: true })
    expect(popover.parentElement?.tagName).toBe('DIALOG')
  })

  it('does not close an enclosing dialog on Escape', async () => {
    render(<Popover defaultOpen trigger={trigger}>Body</Popover>)
    await screen.findByRole('dialog')
    const notPrevented = fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(notPrevented).toBe(false)
  })

  it('returns focus to the trigger when closed from a button inside it', async () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      return (
        <Popover open={open} onOpenChange={setOpen} trigger={trigger}>
          <button onClick={() => setOpen(false)}>Not now</button>
        </Popover>
      )
    }
    render(<Demo />)
    const button = screen.getByText('Why 62?')
    await userEvent.click(button)
    await userEvent.click(await screen.findByText('Not now'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('does not take focus back when it closes after focus moved elsewhere', async () => {
    render(
      <>
        <Popover trigger={trigger}>Body</Popover>
        <button>Other</button>
      </>,
    )
    await userEvent.click(screen.getByText('Why 62?'))
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByText('Other'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByText('Other'))
  })

  describe('Tab', () => {
    const open = async () => {
      render(
        <>
          <button>Before</button>
          <Popover trigger={trigger}>
            <a href="#a">First</a>
            <a href="#b">Last</a>
          </Popover>
          <button>After</button>
        </>,
      )
      const button = screen.getByText('Why 62?')
      await userEvent.click(button)
      return { button, popover: await screen.findByRole('dialog') }
    }

    it('moves between the controls inside without closing', async () => {
      const { popover } = await open()
      expect(fireEvent.keyDown(screen.getByText('First'), { key: 'Tab' })).toBe(true)
      expect(fireEvent.keyDown(popover, { key: 'Tab' })).toBe(true)
      expect(fireEvent.keyDown(screen.getByText('Last'), { key: 'Tab', shiftKey: true })).toBe(true)
      expect(screen.queryByRole('dialog')).not.toBeNull()
    })

    it('closes from the last control and puts focus on the trigger, so Tab carries on from there', async () => {
      const { button } = await open()
      const notPrevented = fireEvent.keyDown(screen.getByText('Last'), { key: 'Tab' })
      expect(notPrevented).toBe(true) // the browser then moves on from the trigger
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.activeElement).toBe(button)
    })

    it('closes on Shift+Tab from the first control or from the popover itself, and stays on the trigger', async () => {
      const { button, popover } = await open()
      expect(fireEvent.keyDown(screen.getByText('First'), { key: 'Tab', shiftKey: true })).toBe(false)
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.activeElement).toBe(button)

      await userEvent.click(button)
      const again = await screen.findByRole('dialog')
      expect(again).not.toBe(popover)
      expect(fireEvent.keyDown(again, { key: 'Tab', shiftKey: true })).toBe(false)
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.activeElement).toBe(button)
    })

    it('closes on Tab when there is nothing to tab to inside', async () => {
      render(
        <Popover defaultOpen trigger={trigger}>
          Just text
        </Popover>,
      )
      const popover = await screen.findByRole('dialog')
      fireEvent.keyDown(popover, { key: 'Tab' })
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.activeElement).toBe(screen.getByText('Why 62?'))
    })

    it('runs the onKeyDown passed to it, which can keep it open', async () => {
      const onKeyDown = vi.fn((e: { preventDefault: () => void }) => e.preventDefault())
      render(
        <Popover defaultOpen trigger={trigger} onKeyDown={onKeyDown}>
          Just text
        </Popover>,
      )
      fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Tab' })
      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('dialog')).not.toBeNull()
    })
  })

  describe('with a Menu or Popover inside', () => {
    const outer = (
      <Popover trigger={trigger}>
        <Menu trigger={<button>More</button>}>
          <MenuItem>Copy ID</MenuItem>
          <MenuItem>Snooze</MenuItem>
        </Menu>
        <Popover trigger={<button>Details</button>}>
          <a href="#x">Nested link</a>
        </Popover>
      </Popover>
    )

    it('renders a Menu inside the popover, and using it does not close the popover', async () => {
      render(outer)
      await userEvent.click(screen.getByText('Why 62?'))
      const popover = await screen.findByRole('dialog', { name: 'Why 62?' })
      await userEvent.click(screen.getByText('More'))
      const menu = await screen.findByRole('menu')
      expect(menu.parentElement).toBe(popover)
      await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem')) // focus left the popover for the menu
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      fireEvent.pointerDown(screen.getByText('Snooze'))
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      await userEvent.click(screen.getByText('Snooze'))
      expect(screen.queryByRole('menu')).toBeNull()
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      expect(document.activeElement).toBe(screen.getByText('More'))
    })

    it('renders a Popover inside the popover, and clicking in it does not close either', async () => {
      render(outer)
      await userEvent.click(screen.getByText('Why 62?'))
      const popover = await screen.findByRole('dialog', { name: 'Why 62?' })
      await userEvent.click(screen.getByText('Details'))
      const nested = await screen.findByRole('dialog', { name: 'Details' })
      expect(nested.parentElement).toBe(popover)
      await waitFor(() => expect(document.activeElement).toBe(nested))
      await userEvent.click(screen.getByText('Nested link'))
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      expect(screen.queryByRole('dialog', { name: 'Details' })).not.toBeNull()
      // A click in the outer popover, but outside the nested one, closes only the nested one.
      await userEvent.click(popover)
      expect(screen.queryByRole('dialog', { name: 'Details' })).toBeNull()
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
    })

    it('closes only the innermost one on Escape, then the next', async () => {
      render(outer)
      await userEvent.click(screen.getByText('Why 62?'))
      await screen.findByRole('dialog', { name: 'Why 62?' })
      await userEvent.click(screen.getByText('More'))
      await screen.findByRole('menu')
      await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'))
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('menu')).toBeNull()
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      expect(document.activeElement).toBe(screen.getByText('More'))
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.activeElement).toBe(screen.getByText('Why 62?'))
    })

    it('leaves Tab inside the Menu to the Menu', async () => {
      render(outer)
      await userEvent.click(screen.getByText('Why 62?'))
      await screen.findByRole('dialog', { name: 'Why 62?' })
      await userEvent.click(screen.getByText('More'))
      await screen.findByRole('menu')
      fireEvent.keyDown(screen.getByText('Copy ID'), { key: 'Tab' })
      expect(screen.queryByRole('menu')).toBeNull() // the Menu closed itself and refocused its trigger
      expect(screen.queryByRole('dialog', { name: 'Why 62?' })).not.toBeNull()
      expect(document.activeElement).toBe(screen.getByText('More'))
    })
  })

  it('keeps the id, aria-label, aria-labelledby and tabIndex it is given', async () => {
    const { rerender } = render(
      <Popover defaultOpen trigger={trigger} id="mine" aria-label="Mine" tabIndex={0}>
        Body
      </Popover>,
    )
    const popover = await screen.findByRole('dialog', { name: 'Mine' })
    expect(popover.id).toBe('mine')
    expect(popover.getAttribute('tabindex')).toBe('0')
    expect(popover.hasAttribute('aria-labelledby')).toBe(false)
    expect(screen.getByRole('button', { name: 'Why 62?' }).getAttribute('aria-controls')).toBe('mine')

    rerender(
      <>
        <span id="heading">Heading</span>
        <Popover defaultOpen trigger={trigger} aria-labelledby="heading">
          Body
        </Popover>
      </>,
    )
    expect(await screen.findByRole('dialog', { name: 'Heading' })).toBeTruthy()
  })

  it('lets label win over aria-label', async () => {
    render(
      <Popover defaultOpen trigger={trigger} label="From label" aria-label="From aria">
        Body
      </Popover>,
    )
    expect(await screen.findByRole('dialog', { name: 'From label' })).toBeTruthy()
  })

  it('runs the onFocus passed to it', async () => {
    const onFocus = vi.fn()
    render(
      <Popover defaultOpen trigger={trigger} onFocus={onFocus}>
        <a href="#x">Link</a>
      </Popover>,
    )
    await screen.findByRole('dialog')
    await waitFor(() => expect(onFocus).toHaveBeenCalled()) // focus moves into the popover on open
  })

  describe('placement', () => {
    afterEach(() => vi.restoreAllMocks())

    it('maps side to a Floating UI placement: start is left and end is right, and align is added', () => {
      expect(placementOf('top')).toBe('top')
      expect(placementOf('bottom')).toBe('bottom')
      expect(placementOf('start')).toBe('left')
      expect(placementOf('end')).toBe('right')
      expect(placementOf('start', 'end')).toBe('left-end')
      expect(placementOf('bottom', 'start')).toBe('bottom-start')
      expect(placementOf('bottom', 'end')).toBe('bottom-end')
    })

    // The trigger is a 60x20 box at (300, 300); the popover is 100x40; the gap is 8px.
    it.each([
      ['bottom', { left: '300px', top: '328px' }],
      ['top', { left: '300px', top: '252px' }],
      ['start', { left: '192px', top: '300px' }],
      ['end', { left: '368px', top: '300px' }],
    ] as const)('puts the popover on the %s side of the trigger', async (side, at) => {
      mockLayout()
      render(
        <Popover defaultOpen side={side} trigger={trigger}>
          Body
        </Popover>,
      )
      const popover = await screen.findByRole('dialog')
      await waitFor(() => expect({ left: popover.style.left, top: popover.style.top }).toEqual(at))
    })
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <Popover defaultOpen trigger={trigger} label="Score explanation">
        <b>Why 62?</b>
        <a href="#x">See all factors</a>
      </Popover>,
    )
    await screen.findByRole('dialog')
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    expect(container).toBeTruthy()
  })
})

testExamplesAxe(examples)
