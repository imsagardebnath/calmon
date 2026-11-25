import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Field } from '../field/index.ts'
import { NumberInput } from './number-input.tsx'
import * as examples from './number-input.examples.tsx'

const box = () => screen.getByRole('spinbutton') as HTMLInputElement

describe('NumberInput', () => {
  it('is a spinbutton with min, max, now and a value text that includes the unit', () => {
    render(<NumberInput aria-label="Timeout" defaultValue={30} min={1} max={300} unit="sec" />)
    const input = screen.getByRole('spinbutton', { name: 'Timeout' })
    expect(input.getAttribute('aria-valuenow')).toBe('30')
    expect(input.getAttribute('aria-valuemin')).toBe('1')
    expect(input.getAttribute('aria-valuemax')).toBe('300')
    expect(input.getAttribute('aria-valuetext')).toBe('30 sec')
    expect(screen.getByText('sec')).toBeTruthy()
  })

  it('uses tabular numerals and follows density', () => {
    render(<NumberInput aria-label="n" />)
    expect(box().className).toContain('tabular-nums')
    expect(box().className).toContain('font-mono')
    expect(box().className).toContain('h-(--control-h)')
  })

  it('steps with ArrowUp and ArrowDown', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="n" defaultValue={5} step={2} onValueChange={onValueChange} />)
    await user.click(box())
    await user.keyboard('{ArrowUp}')
    expect(box().value).toBe('7')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(box().value).toBe('3')
    expect(onValueChange).toHaveBeenLastCalledWith(3)
  })

  it('steps by ten with PageUp, PageDown and Shift+Arrow', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" defaultValue={50} />)
    await user.click(box())
    await user.keyboard('{PageUp}')
    expect(box().value).toBe('60')
    await user.keyboard('{PageDown}{PageDown}')
    expect(box().value).toBe('40')
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(box().value).toBe('50')
  })

  it('stops at min and max, and Home and End jump to them', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" defaultValue={98} min={0} max={100} />)
    await user.click(box())
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}')
    expect(box().value).toBe('100')
    await user.keyboard('{Home}')
    expect(box().value).toBe('0')
    await user.keyboard('{End}')
    expect(box().value).toBe('100')
    await user.keyboard('{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}')
    expect(box().value).toBe('0')
  })

  it('steps decimals without floating-point noise', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" defaultValue={0.1} step={0.1} />)
    await user.click(box())
    await user.keyboard('{ArrowUp}')
    expect(box().value).toBe('0.2')
    await user.keyboard('{ArrowUp}')
    expect(box().value).toBe('0.3')
  })

  it('starts from zero when empty', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" />)
    await user.click(box())
    await user.keyboard('{ArrowUp}')
    expect(box().value).toBe('1')
  })

  it('emits numbers while typing, and null when cleared', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="n" onValueChange={onValueChange} />)
    await user.type(box(), '42')
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([4, 42])
    await user.clear(box())
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('ignores characters that are not part of a number', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" />)
    await user.type(box(), '1a2b.5')
    expect(box().value).toBe('12.5')
  })

  it('never sends an out-of-range number: it clamps on blur', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <>
        <NumberInput aria-label="n" min={10} max={300} onValueChange={onValueChange} />
        <button>other</button>
      </>,
    )
    await user.type(box(), '500')
    // 5 is below min and 500 is above max, so only 50 is ever sent.
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([50])
    await user.click(screen.getByText('other'))
    expect(box().value).toBe('300')
    expect(onValueChange).toHaveBeenLastCalledWith(300)
  })

  it('clamps up to min on blur', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <>
        <NumberInput aria-label="n" min={10} onValueChange={onValueChange} />
        <button>other</button>
      </>,
    )
    await user.type(box(), '3')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByText('other'))
    expect(box().value).toBe('10')
    expect(onValueChange).toHaveBeenCalledWith(10)
  })

  it('clamps on Enter too', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" max={20} />)
    await user.type(box(), '99{Enter}')
    expect(box().value).toBe('20')
  })

  it('does not read a comma as a decimal point, so pasting "1,000" can never become 1', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="n" onValueChange={onValueChange} />)
    await user.click(box())
    await user.paste('1,000')
    expect(box().value).toBe('')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.paste('1.5')
    expect(box().value).toBe('1.5')
    expect(onValueChange).toHaveBeenLastCalledWith(1.5)
  })

  it('steps from the text on screen, not from the last number that was sent', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="n" defaultValue={15} min={0} max={100} onValueChange={onValueChange} />)
    await user.type(box(), '0') // 150 is above max, so it stays a draft and is not sent
    expect(box().value).toBe('150')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('{ArrowDown}')
    expect(box().value).toBe('100')
    expect(onValueChange).toHaveBeenLastCalledWith(100)
  })

  it('steps from the committed number while the text is not a number yet', () => {
    render(<NumberInput aria-label="n" defaultValue={5} />)
    fireEvent.change(box(), { target: { value: '-' } })
    expect(box().value).toBe('-')
    fireEvent.keyDown(box(), { key: 'ArrowUp' })
    expect(box().value).toBe('6')
  })

  it('disables a stepper from the text on screen too', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" defaultValue={15} min={0} max={100} />)
    await user.type(box(), '0')
    expect((screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement).disabled).toBe(true)
    const down = screen.getByRole('button', { name: 'Decrease' }) as HTMLButtonElement
    expect(down.disabled).toBe(false)
    fireEvent.click(down)
    expect(box().value).toBe('100')
  })

  it('rejects a minus sign when min is not negative', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" min={0} />)
    await user.type(box(), '-5')
    expect(box().value).toBe('5')
  })

  it('works controlled with number | null', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [v, setV] = useState<number | null>(3)
      return (
        <>
          <NumberInput aria-label="n" value={v} onValueChange={setV} />
          <output>{v === null ? 'null' : v}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(box())
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('status').textContent).toBe('4')
    await user.clear(box())
    expect(screen.getByRole('status').textContent).toBe('null')
  })

  it('shows what the parent sets in a controlled field', () => {
    const { rerender } = render(<NumberInput aria-label="n" value={1} onValueChange={() => {}} />)
    expect(box().value).toBe('1')
    rerender(<NumberInput aria-label="n" value={9} onValueChange={() => {}} />)
    expect(box().value).toBe('9')
    rerender(<NumberInput aria-label="n" value={null} onValueChange={() => {}} />)
    expect(box().value).toBe('')
  })

  it('has steppers that change the value, and disables them at the bounds', () => {
    render(<NumberInput aria-label="n" defaultValue={9} max={10} />)
    const up = screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement
    const down = screen.getByRole('button', { name: 'Decrease' }) as HTMLButtonElement
    expect(up.tabIndex).toBe(-1)
    fireEvent.click(up)
    expect(box().value).toBe('10')
    expect(up.disabled).toBe(true)
    fireEvent.click(down)
    expect(box().value).toBe('9')
  })

  it('hides the steppers with steppers={false}', () => {
    render(<NumberInput aria-label="n" steppers={false} unit="%" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('%').className).toContain('rounded-r-control')
  })

  it('does not step when disabled or read only', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="n" defaultValue={5} readOnly />)
    await user.click(box())
    await user.keyboard('{ArrowUp}')
    expect(box().value).toBe('5')
    expect((screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('sets invalid and warning state on the input', () => {
    render(
      <>
        <NumberInput aria-label="bad" invalid />
        <NumberInput aria-label="warn" warning />
      </>,
    )
    expect(screen.getByLabelText('bad').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('warn').dataset.tone).toBe('caution')
  })

  it('reads its id, error and required state from a surrounding Field', () => {
    render(
      <Field label="Timeout" error="Enter a number of seconds." required>
        <NumberInput />
      </Field>,
    )
    const input = screen.getByRole('spinbutton', { name: 'Timeout' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
    const message = screen.getByText('Enter a number of seconds.').closest('p')
    expect(message?.id).toBeTruthy()
    expect(input.getAttribute('aria-describedby')).toBe(message?.id)
  })

  it('puts className on the wrapper and forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<NumberInput aria-label="n" className="w-40" ref={ref} />)
    expect(ref.current).toBe(box())
    expect(box().parentElement?.className).toContain('w-40')
  })
})

describe('narrow containers', () => {
  it('keeps the stepper column and the unit label from shrinking below their content', () => {
    render(<NumberInput aria-label="n" unit="ms" />)
    expect(screen.getByRole('button', { name: 'Increase' }).parentElement?.className).toContain('shrink-0')
    expect(screen.getByText('ms').className).toContain('shrink-0')
  })
})

testExamplesAxe(examples)
