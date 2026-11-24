import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Checkbox } from '../checkbox/index.ts'
import { Input } from '../input/index.ts'
import { Select } from '../select/index.ts'
import { Switch } from '../switch/index.ts'
import { Textarea } from '../textarea/index.ts'
import { Field, useFieldContext } from './index.ts'
import * as examples from './field.examples.tsx'

describe('Field', () => {
  it('links the label to the control with htmlFor', () => {
    render(
      <Field label="Service name">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Service name')
    expect(input.tagName).toBe('INPUT')
    expect(screen.getByText('Service name').getAttribute('for')).toBe(input.id)
  })

  it('uses the id prop for the control', () => {
    render(
      <Field label="Name" id="svc-name">
        <Input id="ignored" />
      </Field>,
    )
    expect(screen.getByLabelText('Name').id).toBe('svc-name')
  })

  it('points aria-describedby at the hint', () => {
    render(
      <Field label="Name" hint="Lowercase only.">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Name')
    const hint = screen.getByText('Lowercase only.')
    expect(input.getAttribute('aria-describedby')).toBe(hint.id)
    expect(input.getAttribute('aria-invalid')).toBeNull()
  })

  it('sets aria-invalid and describes the control with the error', () => {
    render(
      <Field label="Email" hint="We email alerts." error="Enter a full email address.">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.dataset.tone).toBe('critical')
    const ids = input.getAttribute('aria-describedby')?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(ids).toContain(screen.getByText('Enter a full email address.').closest('p')?.id)
    expect(ids).toContain(screen.getByText('We email alerts.').id)
  })

  it('shows a warning in the caution tone without marking the control invalid', () => {
    render(
      <Field label="Traffic" warning="Higher than usual.">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Traffic')
    expect(input.dataset.tone).toBe('caution')
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('Higher than usual.').closest('p')?.id)
  })

  it('announces an error that appears after the field is on screen', () => {
    const { rerender } = render(
      <Field label="Email" hint="We email alerts.">
        <Input />
      </Field>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    rerender(
      <Field label="Email" hint="We email alerts." error="Enter a full email address.">
        <Input />
      </Field>,
    )
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toBe('Enter a full email address.')
    expect(alert.id).toBe(screen.getByLabelText('Email').getAttribute('aria-describedby')?.split(' ')[1])
  })

  it('puts a warning in a polite live region and leaves the hint static', () => {
    render(
      <Field label="Traffic" hint="Percent of traffic." warning="Higher than usual.">
        <Input />
      </Field>,
    )
    expect(screen.getByRole('status').textContent).toBe('Higher than usual.')
    expect(screen.getByText('Percent of traffic.').getAttribute('role')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('draws a different decorative icon for a warning and an error', () => {
    render(
      <Field label="Traffic" warning="Higher than usual." error="Maximum is 60%.">
        <Input />
      </Field>,
    )
    const warn = screen.getByRole('status').querySelector('svg')
    const err = screen.getByRole('alert').querySelector('svg')
    expect(warn?.getAttribute('aria-hidden')).toBe('true')
    expect(err?.getAttribute('aria-hidden')).toBe('true')
    expect(warn?.innerHTML).not.toBe(err?.innerHTML)
  })

  it('lets an error outrank a warning on the control', () => {
    render(
      <Field label="Traffic" warning="Higher than usual." error="Maximum is 60%.">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Traffic').dataset.tone).toBe('critical')
  })

  it('marks required fields: a hidden asterisk and aria-required', () => {
    render(
      <Field label="Reason" required>
        <Textarea />
      </Field>,
    )
    const box = screen.getByLabelText(/Reason/)
    expect(box.getAttribute('aria-required')).toBe('true')
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true')
  })

  it('wires Select, Textarea, Checkbox and Switch the same way', () => {
    render(
      <>
        <Field label="Region" hint="Hint A">
          <Select options={[{ label: 'eu', value: 'eu' }]} />
        </Field>
        <Field label="Notes" hint="Hint B">
          <Textarea />
        </Field>
        <Field label="Terms" error="Accept the terms.">
          <Checkbox>I accept</Checkbox>
        </Field>
        <Field label="Mute" hint="Hint D">
          <Switch />
        </Field>
      </>,
    )
    expect(screen.getByRole('combobox', { name: 'Region' }).getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Notes' }).getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: /Terms/ }).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('switch', { name: 'Mute' }).getAttribute('aria-describedby')).toBeTruthy()
  })

  it('keeps a control own aria-describedby alongside the Field ids', () => {
    render(
      <Field label="Name" hint="Hint">
        <Input aria-describedby="extra" />
      </Field>,
    )
    const ids = screen.getByLabelText('Name').getAttribute('aria-describedby')?.split(' ')
    expect(ids?.[0]).toBe('extra')
    expect(ids).toHaveLength(2)
  })

  it('lets a control override the Field state with its own invalid prop', () => {
    render(
      <Field label="Name" error="Bad">
        <Input invalid={false} />
      </Field>,
    )
    expect(screen.getByLabelText('Name').getAttribute('aria-invalid')).toBeNull()
  })

  it('merges className and passes other props to the wrapper', () => {
    render(
      <Field label="Name" className="w-40" data-testid="field">
        <Input />
      </Field>,
    )
    expect(screen.getByTestId('field').className).toContain('w-40')
  })

  it('useFieldContext is null outside a Field, so controls work standalone', () => {
    function Probe() {
      return <output>{useFieldContext() === null ? 'standalone' : 'in-field'}</output>
    }
    render(<Probe />)
    expect(screen.getByRole('status').textContent).toBe('standalone')
    render(
      <Field label="x">
        <Probe />
      </Field>,
    )
    expect(screen.getAllByRole('status')[1]?.textContent).toBe('in-field')
  })
})

testExamplesAxe(examples)
