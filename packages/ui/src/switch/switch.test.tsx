import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Field } from '../field/index.ts'
import { Switch } from './switch.tsx'
import * as examples from './switch.examples.tsx'

const toggle = () => screen.getByRole('switch') as HTMLInputElement

describe('Switch', () => {
  it('is a native checkbox with role="switch", named by its label', () => {
    render(<Switch>Group repeat alerts</Switch>)
    const input = screen.getByRole('switch', { name: 'Group repeat alerts' }) as HTMLInputElement
    expect(input.tagName).toBe('INPUT')
    expect(input.type).toBe('checkbox')
    expect(input.checked).toBe(false)
  })

  it('toggles uncontrolled, honours defaultChecked, and fires onCheckedChange at once', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Switch defaultChecked onCheckedChange={onCheckedChange}>
        Alerts
      </Switch>,
    )
    expect(toggle().checked).toBe(true)
    await user.click(toggle())
    expect(toggle().checked).toBe(false)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    await user.click(screen.getByText('Alerts'))
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  })

  it('toggles with Space', async () => {
    const user = userEvent.setup()
    render(<Switch>Alerts</Switch>)
    await user.tab()
    expect(document.activeElement).toBe(toggle())
    await user.keyboard(' ')
    expect(toggle().checked).toBe(true)
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <>
          <Switch checked={on} onCheckedChange={setOn}>
            Alerts
          </Switch>
          <output>{on ? 'on' : 'off'}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(toggle())
    expect(screen.getByRole('status').textContent).toBe('on')
    expect(toggle().checked).toBe(true)
  })

  it('stays put when a controlled parent ignores the change', async () => {
    const user = userEvent.setup()
    render(<Switch checked={false}>Alerts</Switch>)
    await user.click(toggle())
    expect(toggle().checked).toBe(false)
  })

  it('cannot be changed when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Switch disabled onCheckedChange={onCheckedChange}>
        Maintenance mode
      </Switch>,
    )
    await user.click(toggle())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(toggle().disabled).toBe(true)
  })

  it('still calls a native onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch onChange={onChange}>Alerts</Switch>)
    await user.click(toggle())
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('works without text when given an aria-label', () => {
    render(<Switch aria-label="Dark mode" />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeTruthy()
  })

  it('reads its id and description from a surrounding Field', () => {
    render(
      <Field label="Mute" hint="Critical alerts still page.">
        <Switch />
      </Field>,
    )
    const input = screen.getByRole('switch', { name: 'Mute' })
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('Critical alerts still page.').id)
  })

  it('puts className on the label and forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Switch className="w-full" ref={ref} name="mute">
        Mute
      </Switch>,
    )
    expect(ref.current).toBe(toggle())
    expect(ref.current?.name).toBe('mute')
    expect(ref.current?.closest('label')?.className).toContain('w-full')
  })
})

testExamplesAxe(examples)
