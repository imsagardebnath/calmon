import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Input } from './input.tsx'
import * as examples from './input.examples.tsx'

describe('Input', () => {
  it('renders a native text box that follows the page density by default', () => {
    render(<Input aria-label="Name" />)
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input.tagName).toBe('INPUT')
    expect(input.className).toContain('h-(--control-h)')
    expect(input.className).toContain('px-(--control-px)')
    expect(input.className).toContain('text-(length:--control-fs)')
  })

  it('uses 30, 38 and 44px for explicit sizes', () => {
    render(
      <>
        <Input size="sm" aria-label="s" />
        <Input size="md" aria-label="m" />
        <Input size="lg" aria-label="l" />
      </>,
    )
    expect(screen.getByLabelText('s').className).toContain('h-[30px]')
    expect(screen.getByLabelText('m').className).toContain('h-[38px]')
    expect(screen.getByLabelText('l').className).toContain('h-11')
    expect(screen.getByLabelText('s').className).not.toContain('h-(--control-h)')
  })

  it('works uncontrolled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input aria-label="Name" onChange={onChange} />)
    await user.type(screen.getByLabelText('Name'), 'abc')
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('abc')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    render(<Input aria-label="Name" value="fixed" onChange={() => {}} />)
    await user.type(screen.getByLabelText('Name'), 'x')
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('fixed')
  })

  it('sets aria-invalid and the critical tone when invalid', () => {
    render(<Input aria-label="Email" invalid />)
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.dataset.tone).toBe('critical')
  })

  it('uses the caution tone for warning, and neutral otherwise', () => {
    render(
      <>
        <Input aria-label="warn" warning />
        <Input aria-label="plain" />
      </>,
    )
    expect(screen.getByLabelText('warn').dataset.tone).toBe('caution')
    expect(screen.getByLabelText('warn').getAttribute('aria-invalid')).toBeNull()
    expect(screen.getByLabelText('plain').dataset.tone).toBe('neutral')
  })

  it('keeps a focus ring in the error and warning states', () => {
    render(
      <>
        <Input aria-label="plain" />
        <Input aria-label="bad" invalid />
        <Input aria-label="warn" warning />
      </>,
    )
    // The error and warning rules out-rank the plain focus rule, so each needs its own focus-visible ring.
    expect(screen.getByLabelText('plain').className).toContain('focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--ring),transparent_82%)]')
    for (const name of ['bad', 'warn']) {
      expect(screen.getByLabelText(name).className).toContain('focus-visible:outline-none')
    }
    expect(screen.getByLabelText('bad').className).toContain(
      'enabled:aria-invalid:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--critical),transparent_65%)]',
    )
    expect(screen.getByLabelText('warn').className).toContain(
      'enabled:data-[tone=caution]:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--caution),transparent_65%)]',
    )
  })

  it('puts an icon inside the start of the field, hidden from screen readers', () => {
    render(<Input aria-label="Search" iconStart={<svg data-testid="icon" />} />)
    const input = screen.getByLabelText('Search')
    expect(input.className).toContain('pl-[34px]')
    const wrap = screen.getByTestId('icon').parentElement
    expect(wrap?.getAttribute('aria-hidden')).toBe('true')
    expect(wrap?.parentElement).toBe(input.parentElement)
  })

  it('lets className override defaults and goes on the input', () => {
    render(<Input aria-label="Wide" className="px-8" />)
    const cls = screen.getByLabelText('Wide').className
    expect(cls).toContain('px-8')
    expect(cls).not.toContain('px-(--control-px)')
  })

  it('passes disabled and other native props through', () => {
    render(<Input aria-label="Locked" disabled placeholder="payments-api" name="svc" />)
    const input = screen.getByLabelText('Locked') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(input.placeholder).toBe('payments-api')
    expect(input.name).toBe('svc')
  })

  it('forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input aria-label="Name" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Name'))
  })
})

testExamplesAxe(examples)
