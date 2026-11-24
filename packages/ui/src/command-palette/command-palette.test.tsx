import { act, fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { CommandPalette, type CommandGroup, type CommandItem, type CommandPaletteProps } from './command-palette.tsx'
import * as examples from './command-palette.examples.tsx'

const groups: CommandGroup[] = [
  {
    label: 'Go to',
    items: [
      { id: 'station', label: 'Station', description: 'Live overview', icon: <i data-testid="icon" /> },
      { id: 'services', label: 'Services', keywords: ['apis'] },
      { id: 'timeline', label: 'Timeline' },
    ],
  },
  {
    label: 'Actions',
    items: [{ id: 'theme', label: 'Toggle theme', shortcut: 'Ctrl+T', keywords: ['dark'] }],
  },
]

type Props = Partial<CommandPaletteProps>

/** A palette opened from a trigger button, like an app would. */
function Host({ onSelect = () => {}, onOpenChange, ...props }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Trigger</button>
      <CommandPalette
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          onOpenChange?.(o)
        }}
        onSelect={onSelect}
        groups={groups}
        {...props}
      />
    </>
  )
}

const dialog = () => document.querySelector('dialog') as HTMLDialogElement
const input = () => screen.getByRole('combobox') as HTMLInputElement
const options = () => screen.getAllByRole('option')
const opt = (i: number) => options()[i] as HTMLElement
const labels = () => options().map((o) => o.textContent)
const activeOption = () => document.getElementById(input().getAttribute('aria-activedescendant') ?? '')
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const key = (k: string) => fireEvent.keyDown(input(), { key: k })
const openIt = () => fireEvent.click(screen.getByText('Trigger'))

afterEach(() => vi.restoreAllMocks())

describe('CommandPalette: opening and closing', () => {
  it('is closed by default and renders no results', () => {
    render(<CommandPalette groups={groups} onSelect={() => {}} />)
    expect(dialog().hasAttribute('open')).toBe(false)
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('opens with defaultOpen and focuses the search box', () => {
    render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen />)
    expect(dialog().hasAttribute('open')).toBe(true)
    expect(document.activeElement).toBe(input())
  })

  it('is a dialog with a default accessible name, and merges className', () => {
    render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen className="mt-4" />)
    expect(screen.getByRole('dialog', { name: 'Command palette' }).className).toContain('mt-4')
  })

  it('forwards a ref to the dialog', () => {
    const ref = createRef<HTMLDialogElement>()
    render(<CommandPalette ref={ref} groups={groups} onSelect={() => {}} />)
    expect(ref.current).toBe(dialog())
  })

  it('toggles with Ctrl+K and reports it', () => {
    const onOpenChange = vi.fn()
    render(<CommandPalette groups={groups} onSelect={() => {}} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(dialog().hasAttribute('open')).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(dialog().hasAttribute('open')).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('prevents the browser default for its shortcut, and ignores other keys', () => {
    render(<CommandPalette groups={groups} onSelect={() => {}} />)
    expect(fireEvent.keyDown(document, { key: 'k', ctrlKey: true })).toBe(false)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(fireEvent.keyDown(document, { key: 'j', ctrlKey: true })).toBe(true)
    expect(fireEvent.keyDown(document, { key: 'k' })).toBe(true)
    expect(fireEvent.keyDown(document, { key: 'k', ctrlKey: true, shiftKey: true })).toBe(true)
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('uses Cmd instead of Ctrl for mod on macOS', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel')
    render(<CommandPalette groups={groups} onSelect={() => {}} />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(dialog().hasAttribute('open')).toBe(false)
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(dialog().hasAttribute('open')).toBe(true)
  })

  it('supports a custom shortcut, and can turn the shortcut off', () => {
    const { rerender } = render(<CommandPalette groups={groups} onSelect={() => {}} shortcut="ctrl+shift+p" />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(dialog().hasAttribute('open')).toBe(false)
    fireEvent.keyDown(document, { key: 'P', ctrlKey: true, shiftKey: true })
    expect(dialog().hasAttribute('open')).toBe(true)
    rerender(<CommandPalette groups={groups} onSelect={() => {}} shortcut="" />)
    fireEvent.keyDown(document, { key: 'P', ctrlKey: true, shiftKey: true })
    expect(dialog().hasAttribute('open')).toBe(true)
  })

  it('removes its keyboard listener on unmount', () => {
    const onOpenChange = vi.fn()
    const { unmount } = render(<CommandPalette groups={groups} onSelect={() => {}} onOpenChange={onOpenChange} />)
    unmount()
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('is controlled by open: it stays shut when the parent ignores the change', () => {
    const onOpenChange = vi.fn()
    render(<CommandPalette groups={groups} onSelect={() => {}} open={false} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('closes on Escape', () => {
    const onOpenChange = vi.fn()
    render(<Host onOpenChange={onOpenChange} />)
    openIt()
    key('Escape')
    expect(dialog().hasAttribute('open')).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('closes on a click on the backdrop, not on a click inside', () => {
    render(<Host />)
    openIt()
    fireEvent.click(input())
    expect(dialog().hasAttribute('open')).toBe(true)
    fireEvent.click(dialog())
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('does not close on Escape while an input method is composing', () => {
    const onOpenChange = vi.fn()
    render(<Host onOpenChange={onOpenChange} />)
    openIt()
    onOpenChange.mockClear()
    fireEvent.keyDown(input(), { key: 'Escape', isComposing: true })
    expect(dialog().hasAttribute('open')).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
    key('Escape')
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('stays open when a press that started in the search box ends on the backdrop', () => {
    render(<Host />)
    openIt()
    // Selecting text and letting go outside the box: the click then targets the dialog itself.
    fireEvent.mouseDown(input())
    fireEvent.click(dialog())
    expect(dialog().hasAttribute('open')).toBe(true)
    // A new press on the backdrop still closes it.
    fireEvent.mouseDown(dialog())
    fireEvent.click(dialog())
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('still runs a consumer onMouseDown', () => {
    const onMouseDown = vi.fn()
    render(<Host onMouseDown={onMouseDown} />)
    openIt()
    fireEvent.mouseDown(input())
    expect(onMouseDown).toHaveBeenCalledOnce()
  })

  it('closes when the browser cancels the dialog (for example the Android back button)', () => {
    render(<Host />)
    openIt()
    fireEvent(dialog(), new Event('cancel', { cancelable: true }))
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('moves focus into the search box, and back to where it was when it closes', () => {
    render(<Host />)
    const trigger = screen.getByText('Trigger')
    trigger.focus()
    openIt()
    expect(document.activeElement).toBe(input())
    key('Escape')
    expect(document.activeElement).toBe(trigger)
  })

  it('does not take focus back if a chosen command moved it elsewhere', () => {
    function Elsewhere() {
      return (
        <>
          <input data-testid="next" />
          <Host onSelect={() => (document.querySelector('[data-testid="next"]') as HTMLElement).focus()} />
        </>
      )
    }
    render(<Elsewhere />)
    screen.getByText('Trigger').focus()
    openIt()
    key('Enter')
    expect(document.activeElement).toBe(screen.getByTestId('next'))
  })

  it('starts with an empty search each time it opens', () => {
    render(<Host />)
    openIt()
    type('stat')
    key('Escape')
    openIt()
    expect(input().value).toBe('')
    expect(options()).toHaveLength(4)
  })

  it('uses the native modal dialog when the browser has one', () => {
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    })
    const close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    })
    Object.assign(HTMLDialogElement.prototype, { showModal, close })
    try {
      render(<Host />)
      openIt()
      expect(showModal).toHaveBeenCalledOnce()
      key('Escape')
      expect(close).toHaveBeenCalledOnce()
    } finally {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
    }
  })
})

describe('CommandPalette: results and combobox wiring', () => {
  const open = () => render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen />)

  it('wires a combobox to a listbox of options with aria-activedescendant', () => {
    open()
    const box = input()
    const list = screen.getByRole('listbox')
    expect(box.getAttribute('aria-expanded')).toBe('true')
    expect(box.getAttribute('aria-controls')).toBe(list.id)
    expect(box.getAttribute('aria-autocomplete')).toBe('list')
    expect(options()).toHaveLength(4)
    expect(activeOption()).toBe(opt(0))
    expect(opt(0).getAttribute('aria-selected')).toBe('true')
    expect(opt(1).getAttribute('aria-selected')).toBe('false')
  })

  it('shows the commands in named groups, with icon, description and shortcut', () => {
    open()
    expect(screen.getByRole('group', { name: 'Go to' }).querySelectorAll('[role="option"]')).toHaveLength(3)
    expect(screen.getByRole('group', { name: 'Actions' }).textContent).toContain('Toggle theme')
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).toBeTruthy()
    expect(screen.getByText('Live overview')).toBeTruthy()
    expect([...document.querySelectorAll('[role="option"] kbd')].map((k) => k.textContent)).toEqual(['Ctrl', 'T'])
  })

  it('shows the keyboard hints in the footer', () => {
    open()
    expect(screen.getByText(/to move/)).toBeTruthy()
    expect(screen.getByText(/to select/)).toBeTruthy()
    expect(screen.getByText(/to close/)).toBeTruthy()
  })

  it('moves the active option with ArrowDown and ArrowUp, wrapping at the ends', () => {
    open()
    key('ArrowDown')
    expect(activeOption()).toBe(opt(1))
    expect(opt(1).getAttribute('aria-selected')).toBe('true')
    expect(opt(0).getAttribute('aria-selected')).toBe('false')
    key('ArrowUp')
    key('ArrowUp')
    expect(activeOption()).toBe(opt(3))
    key('ArrowDown')
    expect(activeOption()).toBe(opt(0))
  })

  it('leaves Home and End to the search box, so they still move the caret', () => {
    open()
    key('ArrowDown')
    expect(fireEvent.keyDown(input(), { key: 'Home' })).toBe(true)
    expect(fireEvent.keyDown(input(), { key: 'End' })).toBe(true)
    expect(activeOption()).toBe(opt(1))
  })

  it('keeps focus in the search box while navigating', () => {
    open()
    key('ArrowDown')
    expect(document.activeElement).toBe(input())
  })

  it('makes the hovered option active', () => {
    open()
    fireEvent.mouseMove(opt(2))
    expect(activeOption()).toBe(opt(2))
  })

  it('filters by substring, drops empty groups and highlights the match', () => {
    open()
    type('serv')
    expect(labels()).toEqual(['Services'])
    expect(screen.queryByRole('group', { name: 'Actions' })).toBeNull()
    expect(document.querySelector('mark')?.textContent).toBe('Serv')
  })

  it('ignores case and surrounding spaces', () => {
    open()
    type('  TIME ')
    expect(labels()).toEqual(['Timeline'])
  })

  it('matches letters in order when there is no substring (fuzzy)', () => {
    open()
    type('stn')
    expect(labels()).toEqual(['StationLive overview'])
    expect([...document.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['St', 'n'])
  })

  it('matches keywords and descriptions, without highlighting the label', () => {
    open()
    type('dark')
    expect(labels()).toEqual(['Toggle themeCtrlT'])
    expect(document.querySelector('mark')).toBeNull()
    type('live')
    expect(labels()).toEqual(['StationLive overview'])
    expect(document.querySelector('mark')?.textContent).toBe('Live')
  })

  it('ranks a label that starts with the search above one that only contains it', () => {
    render(
      <CommandPalette
        defaultOpen
        onSelect={() => {}}
        groups={[{ label: 'All', items: [{ id: 'a', label: 'Restart service' }, { id: 'b', label: 'Services' }] }]}
      />,
    )
    type('serv')
    expect(labels()).toEqual(['Services', 'Restart service'])
  })

  it('resets the active option to the first result when the search changes', () => {
    open()
    key('ArrowUp')
    expect(activeOption()).toBe(opt(3))
    type('e')
    expect(activeOption()).toBe(opt(0))
  })

  it('shows an empty state, without a listbox, when nothing matches', () => {
    const onSelect = vi.fn()
    render(<CommandPalette groups={groups} onSelect={onSelect} defaultOpen />)
    type('zzz')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('status').textContent).toContain('No results for “zzz”')
    expect(input().getAttribute('aria-expanded')).toBe('false')
    expect(input().hasAttribute('aria-controls')).toBe(false)
    expect(input().hasAttribute('aria-activedescendant')).toBe(false)
    key('Enter')
    key('ArrowDown')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders two groups that share a label without a duplicate key warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <CommandPalette
        defaultOpen
        onSelect={() => {}}
        groups={[
          { label: 'Recent', items: [{ id: 'a', label: 'Alpha' }] },
          { label: 'Recent', items: [{ id: 'b', label: 'Beta' }] },
        ]}
      />,
    )
    expect(screen.getAllByRole('group', { name: 'Recent' })).toHaveLength(2)
    expect(labels()).toEqual(['Alpha', 'Beta'])
    expect(error.mock.calls.filter((c) => String(c[0]).includes('same key'))).toEqual([])
  })

  it('shows a custom empty hint', () => {
    render(<CommandPalette groups={[]} onSelect={() => {}} defaultOpen emptyText="Add some commands." />)
    expect(screen.getByRole('status').textContent).toContain('Add some commands.')
  })

  it('uses a custom placeholder', () => {
    render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen placeholder="Find anything" />)
    expect(input().placeholder).toBe('Find anything')
  })
})

describe('CommandPalette: choosing', () => {
  it('runs the active command on Enter and closes first', () => {
    const calls: string[] = []
    const onSelect = vi.fn((item: CommandItem) => calls.push(`select:${item.id}`))
    render(<Host onSelect={onSelect} onOpenChange={(o) => calls.push(`open:${o}`)} />)
    openIt()
    key('ArrowDown')
    key('Enter')
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0]?.[0]).toBe(groups[0]?.items[1])
    expect(calls).toEqual(['open:false', 'select:services'])
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('runs the best match after filtering', () => {
    const onSelect = vi.fn()
    render(<Host onSelect={onSelect} />)
    openIt()
    type('theme')
    key('Enter')
    expect(onSelect.mock.calls[0]?.[0].id).toBe('theme')
  })

  it('runs a command on click', () => {
    const onSelect = vi.fn()
    render(<Host onSelect={onSelect} />)
    openIt()
    fireEvent.click(screen.getByRole('option', { name: /Timeline/ }))
    expect(onSelect.mock.calls[0]?.[0].id).toBe('timeline')
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('does not take focus off the search box when an option is pressed', () => {
    render(<Host />)
    openIt()
    const notPrevented = fireEvent.mouseDown(opt(1))
    expect(notPrevented).toBe(false)
  })

  it('ignores Enter while an input method is composing', () => {
    const onSelect = vi.fn()
    render(<CommandPalette groups={groups} onSelect={onSelect} defaultOpen />)
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('can be reopened and used again after choosing', () => {
    const onSelect = vi.fn()
    render(<Host onSelect={onSelect} />)
    openIt()
    key('Enter')
    openIt()
    key('ArrowUp')
    key('Enter')
    expect(onSelect.mock.calls.map((c) => c[0]?.id)).toEqual(['station', 'theme'])
  })
})

describe('CommandPalette: accessibility of the open palette', () => {
  const run = async (container: HTMLElement) =>
    (await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })).violations.map((v) => `${v.id}: ${v.help}`)

  it('has no axe violations with results', async () => {
    const { container } = render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen />)
    expect(await run(container)).toEqual([])
  })

  it('has no axe violations while filtered', async () => {
    const { container } = render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen />)
    await act(async () => type('s'))
    expect(await run(container)).toEqual([])
  })

  it('has no axe violations in the empty state', async () => {
    const { container } = render(<CommandPalette groups={groups} onSelect={() => {}} defaultOpen />)
    await act(async () => type('zzz'))
    expect(await run(container)).toEqual([])
  })
})

testExamplesAxe(examples)
