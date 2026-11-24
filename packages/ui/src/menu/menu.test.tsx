import { createRef, useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IconButton } from '../icon-button/index.ts'
import { MoreIcon, TrashIcon } from '../icons/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { Menu, MenuItem, MenuSeparator, type MenuProps } from './menu.tsx'
import * as examples from './menu.examples.tsx'

function Demo({ onOpen, ...props }: Partial<MenuProps> & { onOpen?: () => void }) {
  return (
    <Menu trigger={<button>Actions</button>} {...props}>
      <MenuItem shortcut="T" onClick={onOpen}>
        Open timeline
      </MenuItem>
      <MenuItem>Snooze alerts</MenuItem>
      <MenuItem>Copy ID</MenuItem>
      <MenuItem disabled>Export (no data)</MenuItem>
      <MenuSeparator />
      <MenuItem intent="danger" icon={<TrashIcon />}>
        Delete service…
      </MenuItem>
    </Menu>
  )
}

const names = () => screen.getAllByRole('menuitem').map((el) => el.textContent)
const focused = () => document.activeElement?.textContent

/** Opens the menu with a click and waits until focus has landed on its first item. */
async function openMenu() {
  const trigger = screen.getByRole('button', { name: 'Actions' })
  await userEvent.click(trigger)
  await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'))
  return trigger
}

describe('Menu', () => {
  it('is closed at first and the trigger says it opens a menu', () => {
    render(<Demo />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens on click, lists menu items, and focuses the first', async () => {
    render(<Demo />)
    const trigger = await openMenu()
    const menu = screen.getByRole('menu', { name: 'Actions' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
    expect(names()).toEqual(['Open timelineT', 'Snooze alerts', 'Copy ID', 'Export (no data)', 'Delete service…'])
    expect(focused()).toBe('Open timelineT')
    expect(screen.getByRole('separator')).toBeTruthy()
  })

  it('opens with ArrowDown on the trigger (first item) and ArrowUp (last item)', async () => {
    const { unmount } = render(<Demo />)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(focused()).toBe('Open timelineT'))
    unmount()

    render(<Demo />)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(focused()).toBe('Delete service…'))
  })

  it('opens with Enter and Space on the trigger', async () => {
    render(<Demo />)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Enter}')
    await screen.findByRole('menu')
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard(' ')
    expect(await screen.findByRole('menu')).toBeTruthy()
  })

  it('moves with ArrowDown, ArrowUp, Home and End, and wraps', async () => {
    render(<Demo />)
    await openMenu()
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('Snooze alerts')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}') // Copy, Export (disabled but focusable), Delete
    expect(focused()).toBe('Delete service…')
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('Open timelineT') // wrapped to the start
    await userEvent.keyboard('{ArrowUp}')
    expect(focused()).toBe('Delete service…') // wrapped to the end
    await userEvent.keyboard('{Home}')
    expect(focused()).toBe('Open timelineT')
    await userEvent.keyboard('{End}')
    expect(focused()).toBe('Delete service…')
  })

  it('jumps to an item by typing its first letters, and extends the search while typing quickly', async () => {
    let now = 1000
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => now)
    const type = async (keys: string, pause = true) => {
      if (pause) now += 600 // a pause starts a new search
      await userEvent.keyboard(keys)
    }
    render(<Demo />)
    await openMenu()
    await type('c')
    expect(focused()).toBe('Copy ID')
    await type('d')
    expect(focused()).toBe('Delete service…')
    await type('s')
    expect(focused()).toBe('Snooze alerts')
    await type('e')
    expect(focused()).toBe('Export (no data)')
    await type('{Home}')
    await type('s')
    await type('n', false) // quick second letter: "sn"
    expect(focused()).toBe('Snooze alerts')
    spy.mockRestore()
  })

  it('Enter and Space pick the focused item, close the menu, and return focus to the trigger', async () => {
    const onOpen = vi.fn()
    render(<Demo onOpen={onOpen} />)
    const trigger = await openMenu()
    await userEvent.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)

    await openMenu()
    await userEvent.keyboard(' ')
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('picks an item with a click', async () => {
    const onOpen = vi.fn()
    render(<Demo onOpen={onOpen} />)
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /Open timeline/ }))
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Demo />)
    const trigger = await openMenu()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Tab and puts focus on the trigger so Tab carries on from there', async () => {
    render(<Demo />)
    const trigger = await openMenu()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on a pointer-down outside', async () => {
    render(
      <>
        <Demo />
        <p>Elsewhere</p>
      </>,
    )
    await openMenu()
    fireEvent.pointerDown(screen.getByText('Elsewhere'))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('keeps a disabled item focusable, marked aria-disabled, and unpickable', async () => {
    const onClick = vi.fn()
    render(
      <Menu trigger={<button>Actions</button>}>
        <MenuItem disabled onClick={onClick}>
          Export (no data)
        </MenuItem>
      </Menu>,
    )
    await openMenu()
    const item = screen.getByRole('menuitem')
    expect(item.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(item)
    await userEvent.click(item)
    await userEvent.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeNull()
  })

  it('marks destructive items with the critical tone, and shows shortcuts and icons', async () => {
    render(<Demo />)
    await openMenu()
    const danger = screen.getByRole('menuitem', { name: /Delete service/ })
    expect(danger.dataset.tone).toBe('critical')
    expect(danger.querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /Snooze/ }).dataset.tone).toBe('neutral')
    expect(screen.getByText('T').className).toContain('font-mono')
  })

  it('focuses an item the pointer enters', async () => {
    render(<Demo />)
    await openMenu()
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Copy ID' }))
    expect(focused()).toBe('Copy ID')
  })

  it('runs the onPointerEnter passed to an item, and still focuses it', async () => {
    const onPointerEnter = vi.fn()
    render(
      <Menu trigger={<button>Actions</button>}>
        <MenuItem>First</MenuItem>
        <MenuItem onPointerEnter={onPointerEnter}>Second</MenuItem>
      </Menu>,
    )
    await openMenu()
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Second' }))
    expect(onPointerEnter).toHaveBeenCalledTimes(1)
    expect(focused()).toBe('Second')
  })

  it('keeps the id it is given, and names the menu with aria-labelledby or aria-label when passed', async () => {
    const { unmount } = render(<Demo id="mine" />)
    const trigger = await openMenu()
    const menu = screen.getByRole('menu', { name: 'Actions' }) // still named by the trigger
    expect(menu.id).toBe('mine')
    expect(trigger.getAttribute('aria-controls')).toBe('mine')
    unmount()

    const second = render(
      <>
        <span id="heading">Row actions</span>
        <Demo aria-labelledby="heading" />
      </>,
    )
    await openMenu()
    expect(screen.getByRole('menu', { name: 'Row actions' })).toBeTruthy()
    second.unmount()

    render(<Demo aria-label="Service actions" />)
    await openMenu()
    expect(screen.getByRole('menu', { name: 'Service actions' })).toBeTruthy()
  })

  describe('align', () => {
    afterEach(() => vi.restoreAllMocks())

    /** jsdom has no layout. Give the trigger a 60x20 box at (300, 300) and the menu a 100x40 size, in a 1000x800 window. */
    function mockLayout() {
      const menu = (el: Element) => el.getAttribute('role') === 'menu'
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return menu(this) ? 100 : 60
      })
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
        return menu(this) ? 40 : 20
      })
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const [x, y, width, height] = this.tagName === 'BUTTON' ? [300, 300, 60, 20] : [0, 0, 0, 0]
        return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON: () => ({}) }
      })
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000)
      vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800)
    }

    // The trigger is 60 wide at x=300 to 360, the menu is 100 wide and sits 8px below it.
    it.each([
      [undefined, '300px'], // `start` is the default: the left edges line up
      ['start', '300px'],
      ['end', '260px'], // the right edges line up
    ] as const)('lines the menu up with the %s edge of the trigger', async (align, left) => {
      mockLayout()
      render(<Demo defaultOpen align={align} />)
      const menu = await screen.findByRole('menu')
      await waitFor(() => expect({ left: menu.style.left, top: menu.style.top }).toEqual({ left, top: '328px' }))
    })
  })

  it('can be controlled with open and onOpenChange', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return <Demo open={open} onOpenChange={setOpen} />
    }
    const onOpenChange = vi.fn()
    const { unmount } = render(<Demo open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('menu')).toBeNull()
    unmount()

    render(<Controlled />)
    await openMenu()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('keeps the trigger own props and works with IconButton', async () => {
    const onClick = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    render(
      <Menu trigger={<IconButton label="Row actions" icon={<MoreIcon />} onClick={onClick} ref={ref} />}>
        <MenuItem>One</MenuItem>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Row actions' }))
    expect(await screen.findByRole('menu', { name: 'Row actions' })).toBeTruthy()
  })

  it('renders into <body> and merges className and ref onto the menu', async () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Demo ref={ref} className="extra" />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(container.contains(menu)).toBe(false)
    expect(menu.parentElement).toBe(document.body)
    expect(menu.className).toContain('extra')
    expect(ref.current).toBe(menu)
  })

  it('renders inside the <dialog> that holds its trigger, so a modal does not make it inert', async () => {
    render(
      <dialog open>
        <Demo />
      </dialog>,
    )
    await userEvent.click(screen.getByRole('button'))
    const menu = await screen.findByRole('menu', { hidden: true })
    expect(menu.parentElement?.tagName).toBe('DIALOG')
  })

  it('has no axe violations when open', async () => {
    render(<Demo />)
    await openMenu()
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})

testExamplesAxe(examples)
