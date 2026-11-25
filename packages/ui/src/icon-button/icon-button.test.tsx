import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsIcon } from '../icons/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { IconButton } from './icon-button.tsx'
import * as examples from './icon-button.examples.tsx'

describe('IconButton', () => {
  it('uses label as the accessible name and tooltip', () => {
    render(<IconButton label="Settings" icon={<SettingsIcon />} />)
    const button = screen.getByRole('button', { name: 'Settings' })
    expect(button.getAttribute('title')).toBe('Settings')
  })

  it('is square at the chosen size', () => {
    render(<IconButton label="Settings" size="sm" icon={<SettingsIcon />} />)
    const cls = screen.getByRole('button').className
    expect(cls).toContain('w-[30px]')
    expect(cls).toContain('h-[30px]')
  })

  it('hides the icon from screen readers', () => {
    render(<IconButton label="Settings" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon').parentElement?.getAttribute('aria-hidden')).toBe('true')
  })

  it('maps intent to a tone', () => {
    render(<IconButton label="Delete" intent="danger" icon={<SettingsIcon />} />)
    expect(screen.getByRole('button', { name: 'Delete' }).dataset.tone).toBe('critical')
  })

  it('shows the spinner instead of the icon while loading, and keeps the name', () => {
    const onClick = vi.fn()
    render(<IconButton label="Save" loading icon={<svg data-testid="icon" />} onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(screen.queryByTestId('icon')).toBeNull()
    expect(button.querySelector('.animate-pikore-spin')).not.toBeNull()
    expect(button.getAttribute('aria-busy')).toBe('true')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows the icon again once loading stops', () => {
    const { rerender } = render(<IconButton label="Save" loading icon={<svg data-testid="icon" />} />)
    rerender(<IconButton label="Save" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save' }).querySelector('.animate-pikore-spin')).toBeNull()
  })

  it('is natively disabled with disabled', () => {
    render(<IconButton label="Settings" disabled icon={<SettingsIcon />} />)
    expect((screen.getByRole('button', { name: 'Settings' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

testExamplesAxe(examples)
