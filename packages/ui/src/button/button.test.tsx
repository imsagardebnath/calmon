import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, type FormEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Button } from './button.tsx'
import * as examples from './button.examples.tsx'

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('type', 'button')
  })

  it('sets the tone from severity, and severity wins over intent', () => {
    render(
      <Button variant="primary" severity="caution" intent="danger">
        Go
      </Button>,
    )
    expect(screen.getByRole('button').dataset.tone).toBe('caution')
  })

  it('maps intent to a tone', () => {
    render(
      <Button variant="primary" intent="danger">
        Delete
      </Button>,
    )
    expect(screen.getByRole('button').dataset.tone).toBe('critical')
  })

  it('uses the accent tone for primary and neutral otherwise', () => {
    render(
      <>
        <Button variant="primary">A</Button>
        <Button>B</Button>
      </>,
    )
    expect(screen.getByText('A').dataset.tone).toBe('accent')
    expect(screen.getByText('B').dataset.tone).toBe('neutral')
  })

  it('blocks clicks and sets aria-busy while loading', () => {
    const onClick = vi.fn()
    const onParentClick = vi.fn()
    render(
      <div onClick={onParentClick}>
        <Button loading onClick={onClick}>
          Saving
        </Button>
      </div>,
    )
    const button = screen.getByRole('button', { name: 'Saving' })
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(onParentClick).not.toHaveBeenCalled()
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.getAttribute('aria-disabled')).toBe('true')
  })

  it('stays focusable while loading, so keyboard focus is not lost', () => {
    const { rerender } = render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement
    button.focus()
    rerender(<Button loading>Save</Button>)
    expect(document.activeElement).toBe(button)
    expect(button.disabled).toBe(false)
    expect(button.dataset.loading).toBeDefined()
  })

  it('does not activate or submit from the keyboard while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading onClick={onClick}>
          Saving
        </Button>
      </form>,
    )
    screen.getByRole('button', { name: 'Saving' }).focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onClick again once loading stops', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )
    rerender(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.hasAttribute('aria-disabled')).toBe(false)
    expect(button.hasAttribute('aria-busy')).toBe(false)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled, and sets the native disabled attribute', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Publish
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Publish' }) as HTMLButtonElement
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(button.disabled).toBe(true)
    expect(button.hasAttribute('aria-disabled')).toBe(false)
  })

  it('hides iconStart and iconEnd from screen readers', () => {
    render(<Button iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>Next</Button>)
    expect(screen.getByTestId('start').parentElement?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByTestId('end').parentElement?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy()
  })

  it('swaps iconStart for the spinner and hides iconEnd while loading', () => {
    render(
      <Button loading iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Next
      </Button>,
    )
    expect(screen.queryByTestId('start')).toBeNull()
    expect(screen.queryByTestId('end')).toBeNull()
    expect(screen.getByRole('button', { name: 'Next' }).querySelector('.animate-calmon-spin')).not.toBeNull()
  })

  it('lets type="submit" override the default and submits the form', () => {
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    )
    const button = screen.getByRole('button', { name: 'Send' })
    expect(button).toHaveProperty('type', 'submit')
    fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('forwards ref to the button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }))
  })

  it('renders intent="secondary" the same as the default button', () => {
    render(
      <>
        <Button intent="secondary">A</Button>
        <Button>B</Button>
        <Button variant="ghost" intent="secondary">
          C
        </Button>
        <Button variant="ghost">D</Button>
      </>,
    )
    expect(screen.getByText('A').className).toBe(screen.getByText('B').className)
    expect(screen.getByText('C').className).toBe(screen.getByText('D').className)
    expect(screen.getByText('A').className).not.toContain('text-tone-fg')
  })

  it('still applies the toned styles for a real tone', () => {
    render(<Button severity="critical">Revoke</Button>)
    expect(screen.getByRole('button').className).toContain('text-tone-fg')
  })

  it('lets className override defaults', () => {
    render(<Button className="px-8">Wide</Button>)
    const cls = screen.getByRole('button').className
    expect(cls).toContain('px-8')
    expect(cls).not.toContain('px-(--btn-px)')
  })

  it('renders the child element with asChild', () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.className).toContain('inline-flex')
    expect(link.dataset.tone).toBe('neutral')
    expect(link.hasAttribute('aria-disabled')).toBe(false)
    expect(link.hasAttribute('tabindex')).toBe(false)
  })

  it('disables the asChild link: aria-disabled, out of the tab order, click blocked', () => {
    const onClick = vi.fn()
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/docs">Docs</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.getAttribute('aria-disabled')).toBe('true')
    expect(link.getAttribute('tabindex')).toBe('-1')
    expect(fireEvent.click(link)).toBe(false) // default prevented, so the link does not navigate
    expect(onClick).not.toHaveBeenCalled()
  })
})

testExamplesAxe(examples)
