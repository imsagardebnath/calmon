import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { PausePoint, type PausePointProps } from './pause-point.tsx'
import * as examples from './pause-point.examples.tsx'

const base: PausePointProps = {
  title: 'Before you publish',
  action: 'Publish',
  items: ['Diff reviewed', 'Rollback linked'],
}
const publish = () => screen.getByRole('button', { name: 'Publish' }) as HTMLButtonElement

describe('PausePoint', () => {
  it('is a fieldset group named by its title, with one checkbox per item', () => {
    render(<PausePoint {...base} />)
    const group = screen.getByRole('group', { name: 'Before you publish' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group.querySelector('legend')).toBeTruthy()
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByRole('checkbox', { name: 'Diff reviewed' })).toBeTruthy()
  })

  it('has a default title, and describes the group with the description', () => {
    const { rerender } = render(<PausePoint action="Go" items={['a']} />)
    expect(screen.getByRole('group', { name: 'Before you continue' })).toBeTruthy()
    rerender(<PausePoint {...base} description="Affects 4 services." />)
    expect(screen.getByRole('group', { description: 'Affects 4 services.' })).toBeTruthy()
  })

  it('keeps the action disabled until every item is checked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<PausePoint {...base} onConfirm={onConfirm} />)
    expect(publish().disabled).toBe(true)
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    expect(publish().disabled).toBe(true)
    await user.click(screen.getByRole('checkbox', { name: 'Rollback linked' }))
    expect(publish().disabled).toBe(false)
    await user.click(publish())
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('locks the action again when a box is unchecked', async () => {
    const user = userEvent.setup()
    render(<PausePoint {...base} />)
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    await user.click(screen.getByRole('checkbox', { name: 'Rollback linked' }))
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    expect(publish().disabled).toBe(true)
  })

  it('shows a progress count in a polite status region that follows the boxes', async () => {
    const user = userEvent.setup()
    render(<PausePoint {...base} />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('0 of 2 checked')
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    expect(status.textContent).toBe('1 of 2 checked')
    await user.click(screen.getByRole('checkbox', { name: 'Rollback linked' }))
    expect(status.textContent).toBe('2 of 2 checked')
  })

  it('shows evidence beside each item, as part of what the checkbox is named', () => {
    render(
      <PausePoint
        {...base}
        items={[{ label: 'Diff reviewed', evidence: 'Approved by A. Kaur, 12 min ago' }, 'Rollback linked']}
      />,
    )
    expect(screen.getByText('Approved by A. Kaur, 12 min ago')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Diff reviewed Approved by A. Kaur, 12 min ago' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Rollback linked' })).toBeTruthy()
  })

  it('starts verified items ticked, and does not call onComplete for a start that is already complete', () => {
    const onComplete = vi.fn()
    render(
      <PausePoint
        {...base}
        onComplete={onComplete}
        items={[
          { label: 'Tests passed', evidence: 'CI run #4812', verified: true },
          { label: 'Rollback linked', verified: true },
        ]}
      />,
    )
    expect(screen.getAllByRole('checkbox').every((b) => (b as HTMLInputElement).checked)).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('2 of 2 checked')
    expect(publish().disabled).toBe(false)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete once each time the last item gets checked', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PausePoint {...base} onComplete={onComplete} />)
    const [a, b] = screen.getAllByRole('checkbox') as [HTMLElement, HTMLElement]
    await user.click(a)
    expect(onComplete).not.toHaveBeenCalled()
    await user.click(b)
    expect(onComplete).toHaveBeenCalledTimes(1)
    await user.click(a)
    await user.click(a)
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('works controlled with checked and onCheckedChange', async () => {
    const user = userEvent.setup()
    const seen: boolean[][] = []
    function Controlled() {
      const [checked, setChecked] = useState([false, true])
      return (
        <PausePoint
          {...base}
          checked={checked}
          onCheckedChange={(next) => {
            seen.push(next)
            setChecked(next)
          }}
        />
      )
    }
    render(<Controlled />)
    expect((screen.getByRole('checkbox', { name: 'Rollback linked' }) as HTMLInputElement).checked).toBe(true)
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    expect(seen).toEqual([[true, true]])
    expect(publish().disabled).toBe(false)
  })

  it('does not change by itself when controlled and the parent ignores the change', async () => {
    const user = userEvent.setup()
    render(<PausePoint {...base} checked={[false, false]} onCheckedChange={() => {}} />)
    await user.click(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    expect((screen.getByRole('checkbox', { name: 'Diff reviewed' }) as HTMLInputElement).checked).toBe(false)
  })

  it('is keyboard friendly: Tab to a box, Space toggles it, and the action is reachable once unlocked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<PausePoint {...base} onConfirm={onConfirm} />)
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Diff reviewed' }))
    await user.keyboard(' ')
    await user.tab()
    await user.keyboard(' ')
    await user.tab()
    expect(document.activeElement).toBe(publish())
    await user.keyboard('{Enter}')
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('shows Cancel only when onCancel is set', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const { rerender } = render(<PausePoint {...base} />)
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    rerender(<PausePoint {...base} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows the environment badge in the header', () => {
    render(<PausePoint {...base} env="prod" />)
    const badge = screen.getByText('PROD')
    expect(badge.dataset.tone).toBe('critical')
    expect(screen.getByRole('group').contains(badge)).toBe(true)
  })

  it('makes the action button primary and merges className and props onto the fieldset', () => {
    render(<PausePoint {...base} className="w-96" data-testid="pp" />)
    expect(screen.getByTestId('pp').className).toContain('w-96')
    expect(screen.getByTestId('pp').className).toContain('rounded-card')
    expect(publish().dataset.tone).toBe('accent')
  })

  it('disables the checkboxes with a disabled fieldset', async () => {
    const user = userEvent.setup()
    render(<PausePoint {...base} disabled />)
    const box = screen.getByRole('checkbox', { name: 'Diff reviewed' }) as HTMLInputElement
    expect(box.matches(':disabled')).toBe(true)
    await user.click(box)
    expect(box.checked).toBe(false)
  })

  it('has nothing to unlock when there are no items', () => {
    render(<PausePoint {...base} items={[]} />)
    expect(publish().disabled).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('0 of 0 checked')
  })

  it('warns once in development when more than seven items are passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const seven = Array.from({ length: 7 }, (_, i) => `Check ${i}`)
    const { unmount } = render(<PausePoint {...base} items={seven} />)
    expect(warn).not.toHaveBeenCalled()
    unmount()

    const eight = [...seven, 'Check 7']
    render(<PausePoint {...base} items={eight} />)
    render(<PausePoint {...base} items={eight} />)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('8 items')
    warn.mockRestore()
  })
})

testExamplesAxe(examples)
