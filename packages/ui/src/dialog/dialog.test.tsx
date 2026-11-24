import { createRef, useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Dialog, type DialogProps } from './dialog.tsx'
import * as examples from './dialog.examples.tsx'

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
const clickBackdrop = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.click(el)
}

function Controlled(props: Partial<DialogProps> & { onChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const { onChange, ...rest } = props
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onChange?.(next)
          setOpen(next)
        }}
        title="Delete checkout-web?"
        footer={<button onClick={() => setOpen(false)}>Cancel</button>}
        {...rest}
      />
    </>
  )
}

describe('Dialog', () => {
  it('is closed and renders no content until opened', () => {
    const { container } = render(<Dialog title="Hidden" />)
    const dialog = container.querySelector('dialog')!
    expect(dialog.open).toBe(false)
    expect(screen.queryByText('Hidden')).toBeNull()
  })

  it('opens as a modal when open, and is named by its title', () => {
    render(<Dialog open title="Delete checkout-web?" />)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    const dialog = screen.getByRole('dialog', { name: 'Delete checkout-web?' })
    expect((dialog as HTMLDialogElement).open).toBe(true)
  })

  it('describes the dialog with its description', () => {
    render(<Dialog open title="Title" description="This can’t be undone." />)
    expect(screen.getByRole('dialog', { description: 'This can’t be undone.' })).toBeTruthy()
  })

  it('supports defaultOpen and closes itself with the close button when uncontrolled', async () => {
    const onOpenChange = vi.fn()
    render(<Dialog defaultOpen onOpenChange={onOpenChange} title="Uncontrolled" />)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on Escape through onOpenChange, and does not close by itself when controlled', () => {
    const onOpenChange = vi.fn()
    render(<Dialog open onOpenChange={onOpenChange} title="Controlled" />)
    const dialog = screen.getByRole('dialog')
    const notCancelled = cancel(dialog)
    expect(notCancelled).toBe(false) // default prevented: React state decides
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect((dialog as HTMLDialogElement).open).toBe(true)
  })

  it('closes on a backdrop click but not on a click inside', () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    fireEvent.click(screen.getByText('Open'))
    const dialog = screen.getByRole('dialog')
    clickBackdrop(screen.getByRole('heading'))
    expect(onChange).not.toHaveBeenCalled()
    clickBackdrop(dialog)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('ignores a click that started inside the dialog and ended on the backdrop', () => {
    const onOpenChange = vi.fn()
    render(<Dialog open onOpenChange={onOpenChange} title="Drag" />)
    fireEvent.pointerDown(screen.getByRole('heading'))
    fireEvent.click(screen.getByRole('dialog'))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('does not close on Escape or backdrop clicks when dismissible is false, and hides the close button', () => {
    const onOpenChange = vi.fn()
    render(<Dialog open dismissible={false} onOpenChange={onOpenChange} title="Mid-action" />)
    const dialog = screen.getByRole('dialog')
    expect(cancel(dialog)).toBe(false)
    expect(fireEvent.keyDown(dialog, { key: 'Escape' })).toBe(false)
    clickBackdrop(dialog)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('keeps state in step when the dialog closes natively', () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    fireEvent.click(screen.getByText('Open'))
    // e.g. a <form method="dialog"> submit
    act(() => (screen.getByRole('dialog') as HTMLDialogElement).close())
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('reports a close once when the parent closes it', () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    fireEvent.click(screen.getByText('Open'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onChange).not.toHaveBeenCalled() // closed by the parent's own state, not by the dialog
  })

  it('returns focus to the trigger when it closes', async () => {
    render(<Controlled />)
    const trigger = screen.getByText('Open')
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeTruthy()
    await userEvent.click(screen.getByText('Cancel'))
    expect(document.activeElement).toBe(trigger)
  })

  it('shows the severity icon and tone for an intent, and drops the close button', () => {
    const { rerender } = render(<Dialog open intent="danger" title="Delete?" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.dataset.tone).toBe('critical')
    expect(dialog.querySelector('h2')!.parentElement!.previousElementSibling!.querySelector('svg')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    rerender(<Dialog open intent="danger" severity="caution" title="Delete?" />)
    expect(screen.getByRole('dialog').dataset.tone).toBe('caution') // severity wins
  })

  it('has a neutral tone, no icon and a close button without an intent', () => {
    render(<Dialog open title="Plain" />)
    expect(screen.getByRole('dialog').dataset.tone).toBe('neutral')
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('does not tint the primary intent', () => {
    render(<Dialog open intent="primary" title="Brand" />)
    expect(screen.getByRole('dialog').dataset.tone).toBe('accent')
    expect(screen.getByRole('dialog').querySelectorAll('svg')).toHaveLength(1) // only the close button's X
  })

  it('sets the width from size', () => {
    const { rerender } = render(<Dialog open size="sm" title="S" />)
    expect(screen.getByRole('dialog').className).toContain('w-[360px]')
    rerender(<Dialog open size="lg" title="L" />)
    expect(screen.getByRole('dialog').className).toContain('w-[720px]')
    rerender(<Dialog open title="M" />)
    expect(screen.getByRole('dialog').className).toContain('w-[480px]')
  })

  it('renders body and footer, and lets className and ref through', () => {
    const ref = createRef<HTMLDialogElement>()
    render(
      <Dialog open ref={ref} className="extra" id="d1" title="Parts" footer={<button>Save</button>}>
        <p>Body</p>
      </Dialog>,
    )
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    expect(ref.current).toBe(screen.getByRole('dialog'))
    expect(ref.current!.className).toContain('extra')
    expect(ref.current!.id).toBe('d1')
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <Dialog
        open
        intent="danger"
        title="Delete checkout-web?"
        description="This can’t be undone."
        footer={<button>Delete service</button>}
      >
        <p>Body</p>
      </Dialog>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})

testExamplesAxe(examples)
