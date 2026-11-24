import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Field } from '../field/index.ts'
import { Checkbox, CheckboxGroup } from './index.ts'
import * as examples from './checkbox.examples.tsx'

describe('Checkbox', () => {
  it('is a native checkbox named by its label', () => {
    render(<Checkbox>Send alerts</Checkbox>)
    const box = screen.getByRole('checkbox', { name: 'Send alerts' }) as HTMLInputElement
    expect(box.tagName).toBe('INPUT')
    expect(box.type).toBe('checkbox')
    expect(box.checked).toBe(false)
  })

  it('toggles uncontrolled, honours defaultChecked, and reports the new state', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Checkbox defaultChecked onCheckedChange={onCheckedChange}>
        Send alerts
      </Checkbox>,
    )
    const box = screen.getByRole('checkbox') as HTMLInputElement
    expect(box.checked).toBe(true)
    await user.click(box)
    expect(box.checked).toBe(false)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    await user.click(screen.getByText('Send alerts'))
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  })

  it('toggles with Space', async () => {
    const user = userEvent.setup()
    render(<Checkbox>Send alerts</Checkbox>)
    await user.tab()
    await user.keyboard(' ')
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <Checkbox checked={on} onCheckedChange={setOn}>
          Send alerts
        </Checkbox>
      )
    }
    render(<Controlled />)
    await user.click(screen.getByRole('checkbox'))
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('stays put when a controlled parent ignores the change', async () => {
    const user = userEvent.setup()
    render(<Checkbox checked={false}>Send alerts</Checkbox>)
    await user.click(screen.getByRole('checkbox'))
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false)
  })

  it('shows the indeterminate state, and the next click checks it', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Checkbox checked="indeterminate" onCheckedChange={onCheckedChange}>
        All regions
      </Checkbox>,
    )
    const box = screen.getByRole('checkbox') as HTMLInputElement
    expect(box.indeterminate).toBe(true)
    expect(box.checked).toBe(false)
    await user.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    // The parent kept it indeterminate, so the dash must come back after the native click cleared it.
    expect(box.indeterminate).toBe(true)
  })

  it('leaves the indeterminate state when the parent changes it', () => {
    const { rerender } = render(<Checkbox checked="indeterminate" onCheckedChange={() => {}} />)
    const box = screen.getByRole('checkbox') as HTMLInputElement
    expect(box.indeterminate).toBe(true)
    rerender(<Checkbox checked onCheckedChange={() => {}} />)
    expect(box.indeterminate).toBe(false)
    expect(box.checked).toBe(true)
  })

  it('sets aria-invalid when invalid', () => {
    render(<Checkbox invalid>Accept</Checkbox>)
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('cannot be changed when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        Locked
      </Checkbox>,
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect((screen.getByRole('checkbox') as HTMLInputElement).disabled).toBe(true)
  })

  it('reads its id, error and required state from a surrounding Field', () => {
    render(
      <Field label="Terms" error="Accept the terms" required>
        <Checkbox />
      </Field>,
    )
    const box = screen.getByRole('checkbox', { name: 'Terms' })
    expect(box.getAttribute('aria-invalid')).toBe('true')
    expect(box.getAttribute('aria-required')).toBe('true')
    const message = screen.getByText('Accept the terms').closest('p')
    expect(message?.id).toBeTruthy()
    expect(box.getAttribute('aria-describedby')).toBe(message?.id)
  })

  it('puts className on the label and forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Checkbox className="w-full" ref={ref} name="agree" value="yes">
        Agree
      </Checkbox>,
    )
    expect(ref.current).toBe(screen.getByRole('checkbox'))
    expect(ref.current?.name).toBe('agree')
    expect(ref.current?.closest('label')?.className).toContain('w-full')
  })

  it('works without text when given an aria-label', () => {
    render(<Checkbox aria-label="Select row 1" />)
    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeTruthy()
  })
})

describe('CheckboxGroup', () => {
  it('is a fieldset named by its legend', () => {
    render(
      <CheckboxGroup label="Notify me about">
        <Checkbox value="critical">Critical</Checkbox>
      </CheckboxGroup>,
    )
    expect(screen.getByRole('group', { name: 'Notify me about' }).tagName).toBe('FIELDSET')
  })

  it('checks the boxes in defaultValue and updates on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup label="Notify" defaultValue={['critical']} onValueChange={onValueChange}>
        <Checkbox value="critical">Critical</Checkbox>
        <Checkbox value="caution">Caution</Checkbox>
      </CheckboxGroup>,
    )
    expect((screen.getByLabelText('Critical') as HTMLInputElement).checked).toBe(true)
    expect((screen.getByLabelText('Caution') as HTMLInputElement).checked).toBe(false)
    await user.click(screen.getByLabelText('Caution'))
    expect(onValueChange).toHaveBeenLastCalledWith(['critical', 'caution'])
    await user.click(screen.getByLabelText('Critical'))
    expect(onValueChange).toHaveBeenLastCalledWith(['caution'])
    expect((screen.getByLabelText('Critical') as HTMLInputElement).checked).toBe(false)
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [v, setV] = useState<string[]>([])
      return (
        <>
          <CheckboxGroup label="Notify" value={v} onValueChange={setV}>
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
          <output>{v.join(',')}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(screen.getByLabelText('B'))
    await user.click(screen.getByLabelText('A'))
    expect(screen.getByRole('status').textContent).toBe('b,a')
  })

  it('disables every box with disabled', () => {
    render(
      <CheckboxGroup label="Notify" disabled>
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>,
    )
    expect((screen.getByLabelText('A') as HTMLInputElement).matches(':disabled')).toBe(true)
  })
})

testExamplesAxe(examples)
