import { createRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Drawer } from './drawer.tsx'
import * as examples from './drawer.examples.tsx'

// jsdom has no showModal()/close(). This stand-in sets `open` and fires `close`, like a browser.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

const cancel = (el: Element) => fireEvent(el, new Event('cancel', { cancelable: true }))

describe('Drawer', () => {
  it('is a modal dialog named by its title, and renders nothing until opened', () => {
    const { rerender } = render(<Drawer title="payments-api" />)
    expect(screen.queryByText('payments-api')).toBeNull()
    rerender(<Drawer open title="payments-api" />)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'payments-api' })).toBeTruthy()
  })

  it('describes the drawer with its description', () => {
    render(<Drawer open title="Title" description="Critical for 12 minutes" />)
    expect(screen.getByRole('dialog', { description: 'Critical for 12 minutes' })).toBeTruthy()
  })

  it('slides from the end by default at 420px, and takes a side and a size', () => {
    const { rerender } = render(<Drawer open title="A" />)
    const dialog = () => screen.getByRole('dialog') as HTMLDialogElement
    expect(dialog().style.width).toBe('420px')
    expect(dialog().className).toContain('ml-auto')
    expect(dialog().className).toContain('open:animate-calmon-slide')
    rerender(<Drawer open side="start" size={300} title="A" />)
    expect(dialog().style.width).toBe('300px')
    expect(dialog().className).toContain('mr-auto')
    expect(dialog().className).not.toContain('ml-auto')
  })

  it('plays the slide from the left for a start drawer, and uses the CSS animation for an end drawer', () => {
    const animate = vi.fn()
    HTMLDialogElement.prototype.animate = animate
    const { unmount } = render(<Drawer open title="End" />)
    expect(animate).not.toHaveBeenCalled()
    unmount()
    render(<Drawer open side="start" title="Start" />)
    expect(animate).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(animate.mock.calls[0]?.[0])).toContain('translateX(-30px)')
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'animate')
  })

  it('closes with the close button, Escape and the backdrop through onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(<Drawer open onOpenChange={onOpenChange} title="Close me" />)
    const dialog = screen.getByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(cancel(dialog)).toBe(false)
    expect(onOpenChange).toHaveBeenCalledTimes(2)
    fireEvent.pointerDown(dialog)
    fireEvent.click(dialog)
    expect(onOpenChange).toHaveBeenCalledTimes(3)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('does not close on Escape or the backdrop when dismissible is false', () => {
    const onOpenChange = vi.fn()
    render(<Drawer open dismissible={false} onOpenChange={onOpenChange} title="Locked" />)
    const dialog = screen.getByRole('dialog')
    expect(cancel(dialog)).toBe(false)
    fireEvent.pointerDown(dialog)
    fireEvent.click(dialog)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('works uncontrolled and returns focus to the trigger', async () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open sheet</button>
          <Drawer open={open} onOpenChange={setOpen} title="Sheet" footer={<button>Acknowledge</button>}>
            <p>Body</p>
          </Drawer>
        </>
      )
    }
    render(<Demo />)
    const trigger = screen.getByText('Open sheet')
    await userEvent.click(trigger)
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('opens from defaultOpen', () => {
    render(<Drawer defaultOpen title="Default open" />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('merges className and style, and forwards ref', () => {
    const ref = createRef<HTMLDialogElement>()
    render(<Drawer open ref={ref} className="extra" style={{ color: 'red' }} title="Props" />)
    expect(ref.current).toBe(screen.getByRole('dialog'))
    expect(ref.current!.className).toContain('extra')
    expect(ref.current!.style.color).toBe('red')
    expect(ref.current!.style.width).toBe('420px')
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <Drawer open title="payments-api" description="Critical" footer={<button>Acknowledge</button>}>
        <p>Body</p>
      </Drawer>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})

testExamplesAxe(examples)
