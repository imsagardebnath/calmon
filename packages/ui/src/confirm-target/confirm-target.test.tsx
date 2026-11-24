import { createRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Button } from '../button/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { ConfirmTarget, type ConfirmTargetProps } from './confirm-target.tsx'
import { EnvironmentBadge } from './environment-badge.tsx'
import * as examples from './confirm-target.examples.tsx'

// jsdom has no showModal()/close(). This stand-in sets `open`, moves focus to the first focusable
// descendant and fires `close`, like a browser.
const FOCUSABLE = 'input, textarea, select, a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])'
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
    this.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

const NAME = 'orders-prod-eu'
const cancelEvent = (el: Element) => fireEvent(el, new Event('cancel', { cancelable: true }))
const clickBackdrop = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.click(el)
}
const field = () => screen.getByLabelText(`Type ${NAME} to confirm`) as HTMLInputElement
const confirmButton = (name = 'Delete database') => screen.getByRole('button', { name }) as HTMLButtonElement

function Open(props: Partial<ConfirmTargetProps>) {
  return (
    <ConfirmTarget name={NAME} env="prod" action="Delete database" {...props}>
      <Button severity="critical">Open</Button>
    </ConfirmTarget>
  )
}
async function open(props: Partial<ConfirmTargetProps> = {}) {
  const user = userEvent.setup()
  render(<Open {...props} />)
  await user.click(screen.getByRole('button', { name: 'Open' }))
  return user
}

describe('ConfirmTarget', () => {
  it('renders only its trigger until opened, and the trigger says it opens a dialog', async () => {
    render(<Open />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Open' }).getAttribute('aria-haspopup')).toBe('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('keeps the trigger’s own onClick, and does not open if it prevents default', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    render(
      <ConfirmTarget name={NAME} env="prod">
        <Button onClick={onClick}>Open</Button>
      </ConfirmTarget>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('names the dialog with the action, the name and the environment', async () => {
    await open()
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(screen.getByRole('dialog', { name: `Delete database “${NAME}”? PROD` })).toBeTruthy()
  })

  it('uses a custom title and description, and Delete as the default action', async () => {
    await open({ action: undefined, title: 'Remove the database', description: 'Nothing reads it any more.' })
    expect(screen.getByRole('dialog', { name: 'Remove the database PROD', description: 'Nothing reads it any more.' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy()
  })

  describe('the environment', () => {
    it('shows an uppercase critical PROD badge in the header and beside the name', async () => {
      await open()
      const badges = screen.getAllByText('PROD')
      expect(badges).toHaveLength(2)
      expect(badges.every((b) => b.dataset.tone === 'critical')).toBe(true)
      expect(screen.getByRole('heading', { level: 2 }).contains(badges[0]!)).toBe(true)
      expect(badges[1]!.previousElementSibling?.textContent).toBe(NAME)
    })

    it('shows STAGING and DEV for the other environments', () => {
      render(
        <>
          <EnvironmentBadge env="staging" />
          <EnvironmentBadge env="dev" />
        </>,
      )
      expect(screen.getByText('STAGING').dataset.tone).toBe('advisory')
      expect(screen.getByText('DEV').dataset.tone).toBe('info')
    })

    it('lets the badge take a className and extra props', () => {
      render(<EnvironmentBadge env="prod" className="ml-auto" data-testid="b" />)
      expect(screen.getByTestId('b').className).toContain('ml-auto')
      expect(screen.getByTestId('b').className).toContain('font-mono')
    })
  })

  describe('focus on open', () => {
    it('puts focus in the field, never on the destructive button', async () => {
      await open()
      expect(document.activeElement).toBe(field())
      expect(document.activeElement).not.toBe(confirmButton())
    })

    it('puts focus on Cancel when requireTyping is off, never on the destructive button', async () => {
      await open({ requireTyping: false })
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }))
      expect(document.activeElement).not.toBe(confirmButton())
    })
  })

  describe('typing the name', () => {
    it('labels the field and keeps the confirm button disabled until the exact name is typed', async () => {
      const user = await open()
      expect(field()).toBeTruthy()
      expect(confirmButton().disabled).toBe(true)
      await user.type(field(), 'orders-prod-e')
      expect(confirmButton().disabled).toBe(true)
      await user.type(field(), 'u')
      expect(confirmButton().disabled).toBe(false)
    })

    it('is case-sensitive and exact', async () => {
      const user = await open()
      await user.type(field(), 'Orders-prod-eu')
      expect(confirmButton().disabled).toBe(true)
      await user.clear(field())
      await user.type(field(), 'orders-prod-eu ')
      expect(confirmButton().disabled).toBe(true)
      await user.clear(field())
      await user.type(field(), 'orders-prod-us')
      expect(confirmButton().disabled).toBe(true)
    })

    it('allows paste', async () => {
      const user = await open()
      await user.click(field())
      await user.paste(NAME)
      expect(field().value).toBe(NAME)
      expect(confirmButton().disabled).toBe(false)
    })

    it('confirms with Enter only when the name matches', async () => {
      const onConfirm = vi.fn()
      const user = await open({ onConfirm })
      await user.type(field(), 'orders-prod{Enter}')
      expect(onConfirm).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeTruthy()
      await user.type(field(), '-eu{Enter}')
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('talks the person through it: hint, keep typing, mismatch, match', async () => {
      const user = await open()
      expect(screen.getByText('Names are case-sensitive.')).toBeTruthy()
      expect(field().getAttribute('aria-invalid')).toBeNull()
      await user.type(field(), 'orders')
      expect(screen.getByText('Keep typing…')).toBeTruthy()
      await user.type(field(), 'x')
      expect(screen.getByText(`Doesn’t match ${NAME}.`)).toBeTruthy()
      expect(field().getAttribute('aria-invalid')).toBe('true')
      await user.clear(field())
      await user.type(field(), NAME)
      expect(screen.getByText('Name matches.')).toBeTruthy()
      expect(field().getAttribute('aria-invalid')).toBeNull()
    })

    it('announces the message politely and ties it to the field', async () => {
      await open()
      const live = screen.getByText('Names are case-sensitive.').closest('[aria-live]') as HTMLElement
      expect(live.getAttribute('aria-live')).toBe('polite')
      expect(field().getAttribute('aria-describedby')).toBe(live.id)
    })

    it('turns off browser help in the field', async () => {
      await open()
      expect(field().getAttribute('autocomplete')).toBe('off')
      expect(field().getAttribute('spellcheck')).toBe('false')
      expect(field().className).toContain('font-mono')
    })

    it('starts empty every time it opens', async () => {
      const user = await open()
      await user.type(field(), 'orders')
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(field().value).toBe('')
    })
  })

  describe('requireTyping={false}', () => {
    it('shows no field and enables the confirm button at once', async () => {
      const onConfirm = vi.fn()
      const user = await open({ requireTyping: false, onConfirm })
      expect(screen.queryByRole('textbox')).toBeNull()
      expect(confirmButton().disabled).toBe(false)
      await user.click(confirmButton())
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('confirming', () => {
    it('has a critical confirm button, then calls onConfirm and closes', async () => {
      const onConfirm = vi.fn()
      const onOpenChange = vi.fn()
      const user = await open({ onConfirm, onOpenChange })
      expect(confirmButton().dataset.tone).toBe('critical')
      await user.type(field(), NAME)
      await user.click(confirmButton())
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('never confirms from a disabled button', async () => {
      const onConfirm = vi.fn()
      await open({ onConfirm })
      fireEvent.click(confirmButton())
      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('names the action on the button', async () => {
      await open({ action: 'Delete queue', title: 'Delete the queue' })
      expect(confirmButton('Delete queue')).toBeTruthy()
    })
  })

  describe('closing', () => {
    it('closes with the Cancel button', async () => {
      const onOpenChange = vi.fn()
      const user = await open({ onOpenChange })
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('closes with Escape, even with a name half typed', async () => {
      const user = await open()
      await user.type(field(), 'orders')
      const dialog = screen.getByRole('dialog')
      expect(cancelEvent(dialog)).toBe(false)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('does not close on a backdrop click, so a stray click cannot lose the typing', async () => {
      const onOpenChange = vi.fn()
      const user = await open({ onOpenChange })
      await user.type(field(), 'orders')
      clickBackdrop(screen.getByRole('dialog'))
      expect(screen.getByRole('dialog')).toBeTruthy()
      expect(onOpenChange).toHaveBeenCalledTimes(1) // only the trigger's open
      expect(field().value).toBe('orders')
    })

    it('still calls a consumer’s onClickCapture, inside the panel and on the backdrop', async () => {
      const onClickCapture = vi.fn()
      const user = await open({ onClickCapture })
      await user.click(field())
      expect(onClickCapture).toHaveBeenCalledTimes(1)
      clickBackdrop(screen.getByRole('dialog'))
      expect(onClickCapture).toHaveBeenCalledTimes(2)
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('still handles clicks inside the panel', async () => {
      const user = await open()
      await user.click(field())
      await user.type(field(), 'o')
      expect(field().value).toBe('o')
    })

    it('has no header close button: Cancel is the way out', async () => {
      await open()
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    })
  })

  describe('open state', () => {
    it('opens with defaultOpen', () => {
      render(<ConfirmTarget name={NAME} env="prod" defaultOpen />)
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('works controlled, with no trigger', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [isOpen, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(true)}>Elsewhere</button>
            <ConfirmTarget name={NAME} env="dev" open={isOpen} onOpenChange={setOpen} />
          </>
        )
      }
      render(<Controlled />)
      expect(screen.queryByRole('dialog')).toBeNull()
      await user.click(screen.getByRole('button', { name: 'Elsewhere' }))
      expect(screen.getByRole('dialog')).toBeTruthy()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('stays open when controlled and the parent ignores the change', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(<ConfirmTarget name={NAME} env="prod" open onOpenChange={onOpenChange} />)
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(screen.getByRole('dialog')).toBeTruthy()
    })
  })

  describe('content', () => {
    it('shows consequences in a critical notice', async () => {
      await open({ consequences: ['All tables are removed.', 'Replicas shut down.'] })
      const notice = screen.getByRole('alert')
      expect(notice.dataset.tone).toBe('critical')
      expect(notice.textContent).toContain('This can’t be undone')
      const items = Array.from(notice.querySelectorAll('li')).map((li) => li.textContent)
      expect(items).toEqual(['All tables are removed.', 'Replicas shut down.'])
    })

    it('lists two identical consequence lines without a duplicate key warning', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        await open({ consequences: ['Backups are removed.', 'Backups are removed.'] })
        expect(screen.getByRole('alert').querySelectorAll('li')).toHaveLength(2)
        expect(error).not.toHaveBeenCalled()
      } finally {
        error.mockRestore()
      }
    })

    it('shows no notice without consequences', async () => {
      await open()
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('shows detail beside the name, in mono type', async () => {
      await open({ detail: '284 GB · 3 replicas' })
      expect(screen.getByText('284 GB · 3 replicas')).toBeTruthy()
      expect(screen.getAllByText(NAME)[0]!.className).toContain('font-mono')
    })

    it('uses the critical severity icon on the dialog', async () => {
      await open()
      expect(screen.getByRole('dialog').dataset.tone).toBe('critical')
    })

    it('passes size, className and ref to the dialog', async () => {
      const ref = createRef<HTMLDialogElement>()
      await open({ size: 'lg', className: 'my-dialog', ref })
      expect(ref.current).toBe(screen.getByRole('dialog'))
      expect(ref.current?.className).toContain('my-dialog')
      expect(ref.current?.className).toContain('w-[720px]')
    })
  })

  it('has no axe violations while open', async () => {
    await open({ detail: '284 GB', description: 'Services will fail.', consequences: ['Backups are removed.'] })
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})

testExamplesAxe(examples)
