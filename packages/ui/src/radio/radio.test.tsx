import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Radio, RadioGroup } from './index.ts'
import * as examples from './radio.examples.tsx'

const group = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) => (
  <RadioGroup label="Deploy strategy" {...props}>
    <Radio value="rolling">Rolling</Radio>
    <Radio value="blue-green">Blue-green</Radio>
    <Radio value="canary" disabled>
      Canary
    </Radio>
  </RadioGroup>
)

// user-event walks radio groups with CSS.escape, which jsdom does not provide.
beforeAll(() => {
  Object.defineProperty(window, 'CSS', { value: { escape: (s: string) => s }, configurable: true })
})

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

describe('RadioGroup', () => {
  it('is a radiogroup named by its legend', () => {
    render(group())
    expect(screen.getByRole('radiogroup', { name: 'Deploy strategy' })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('shares one name across the native radios, so arrow keys and Tab behave natively', () => {
    render(group())
    const names = screen.getAllByRole('radio').map((r) => (r as HTMLInputElement).name)
    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBeTruthy()
  })

  it('uses the name prop for form submission', () => {
    render(group({ name: 'strategy' }))
    expect(radio('Rolling').name).toBe('strategy')
  })

  it('selects defaultValue and changes on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(group({ defaultValue: 'rolling', onValueChange }))
    expect(radio('Rolling').checked).toBe(true)
    await user.click(radio('Blue-green'))
    expect(radio('Blue-green').checked).toBe(true)
    expect(radio('Rolling').checked).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('blue-green')
  })

  it('moves the selection with the arrow keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(group({ defaultValue: 'rolling', onValueChange }))
    radio('Rolling').focus()
    await user.keyboard('{ArrowDown}')
    expect(radio('Blue-green').checked).toBe(true)
    expect(onValueChange).toHaveBeenLastCalledWith('blue-green')
  })

  it('skips a disabled option with the arrow keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(group({ defaultValue: 'rolling', onValueChange }))
    radio('Rolling').focus()
    await user.keyboard('{ArrowDown}')
    expect(radio('Blue-green').checked).toBe(true)
    await user.keyboard('{ArrowDown}')
    // Canary is disabled, so the selection wraps straight back to Rolling.
    expect(radio('Rolling').checked).toBe(true)
    expect(radio('Canary').checked).toBe(false)
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(['blue-green', 'rolling'])
  })

  it('lets Tab leave the group from the checked option', async () => {
    const user = userEvent.setup()
    render(
      <>
        {group({ defaultValue: 'rolling' })}
        <button>after</button>
      </>,
    )
    radio('Rolling').focus()
    await user.tab()
    expect(document.activeElement).toBe(screen.getByText('after'))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(radio('Rolling'))
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [v, setV] = useState('rolling')
      return (
        <>
          {group({ value: v, onValueChange: setV })}
          <output>{v}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(radio('Blue-green'))
    expect(screen.getByRole('status').textContent).toBe('blue-green')
  })

  it('stays put when a controlled parent ignores the change', async () => {
    const user = userEvent.setup()
    render(group({ value: 'rolling', onValueChange: () => {} }))
    await user.click(radio('Blue-green'))
    expect(radio('Rolling').checked).toBe(true)
    expect(radio('Blue-green').checked).toBe(false)
  })

  it('cannot select a disabled option', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(group({ defaultValue: 'rolling', onValueChange }))
    await user.click(radio('Canary'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(radio('Canary').disabled).toBe(true)
  })

  it('disables every option with disabled', () => {
    render(group({ disabled: true }))
    expect(radio('Rolling').matches(':disabled')).toBe(true)
  })

  it('lays out vertically by default and horizontally on request', () => {
    const { rerender } = render(group())
    const row = () => screen.getByRole('radiogroup').querySelector('div') as HTMLElement
    expect(screen.getByRole('radiogroup').dataset.orientation).toBe('vertical')
    expect(row().className).toContain('flex-col')
    rerender(group({ orientation: 'horizontal' }))
    expect(screen.getByRole('radiogroup').dataset.orientation).toBe('horizontal')
    expect(row().className).toContain('flex-row')
  })

  it('marks the group aria-invalid when invalid', () => {
    render(group({ invalid: true }))
    expect(screen.getByRole('radiogroup').getAttribute('aria-invalid')).toBe('true')
  })

  it('accepts an aria-label instead of a legend', () => {
    render(
      <RadioGroup aria-label="Region">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Region' })).toBeTruthy()
  })
})

describe('Radio', () => {
  it('works on its own as a native radio', () => {
    render(
      <Radio name="solo" value="x" defaultChecked>
        Solo
      </Radio>,
    )
    expect(radio('Solo').checked).toBe(true)
    expect(radio('Solo').name).toBe('solo')
  })

  it('puts className on the label and forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Radio value="x" className="w-full" ref={ref}>
        X
      </Radio>,
    )
    expect(ref.current).toBe(radio('X'))
    expect(ref.current?.closest('label')?.className).toContain('w-full')
  })
})

testExamplesAxe(examples)
