import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { LimitedNumberInput, type LimitState } from './limited-number-input.tsx'
import * as examples from './limited-number-input.examples.tsx'

const box = () => screen.getByRole('spinbutton') as HTMLInputElement
const reasonBox = () => screen.getByRole('textbox', { name: 'Justification' }) as HTMLTextAreaElement

const canary = (props: Partial<React.ComponentProps<typeof LimitedNumberInput>> = {}) => (
  <LimitedNumberInput label="Shift traffic" unit="%" softMax={25} hardMax={60} {...props} />
)

describe('LimitedNumberInput', () => {
  it('is a labelled spinbutton whose aria range is the hard limits', () => {
    render(canary({ defaultValue: 10, hardMin: 0 }))
    const input = screen.getByRole('spinbutton', { name: 'Shift traffic' })
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('60')
    expect(input.getAttribute('aria-valuetext')).toBe('10 %')
  })

  describe('inside the usual range', () => {
    it('shows the usual range as the hint and nothing else', () => {
      render(canary({ defaultValue: 20 }))
      expect(screen.getByText('Usual range up to 25%.')).toBeTruthy()
      expect(box().getAttribute('aria-invalid')).toBeNull()
      expect(box().dataset.tone).toBe('neutral')
      expect(screen.queryByRole('textbox')).toBeNull()
      expect(box().validity.valid).toBe(true)
    })

    it('words the usual range for either side, and lets hint replace or hide it', () => {
      const { rerender } = render(canary({ softMin: 5 }))
      expect(screen.getByText('Usual range 5–25%.')).toBeTruthy()
      rerender(canary({ softMax: undefined, softMin: 5, unit: 'pods' }))
      expect(screen.getByText('Usual range from 5 pods.')).toBeTruthy()
      rerender(canary({ hint: 'Most teams use 10.' }))
      expect(screen.getByText('Most teams use 10.')).toBeTruthy()
      rerender(canary({ hint: false }))
      expect(screen.queryByText(/Usual range/)).toBeNull()
    })
  })

  describe('past a soft limit', () => {
    it('turns caution, says why, and asks for a justification', () => {
      render(canary({ defaultValue: 40 }))
      expect(screen.getByText('Higher than usual (usual range up to 25%). Add a justification to continue.')).toBeTruthy()
      expect(box().dataset.tone).toBe('caution')
      expect(box().getAttribute('aria-invalid')).toBeNull()
      expect(reasonBox().required).toBe(true)
      expect(reasonBox().getAttribute('placeholder')).toBe('Why is this value safe this time?')
    })

    it('puts the usual range in the message, so the soft limit is in text and not only in the scale', () => {
      const { unmount } = render(canary({ defaultValue: 40, showScale: false }))
      expect(screen.getByText('Higher than usual (usual range up to 25%). Add a justification to continue.')).toBeTruthy()
      unmount()
      render(canary({ softMax: undefined, softMin: 5, unit: 'pods', defaultValue: 2, showScale: false }))
      expect(screen.getByText('Lower than usual (usual range from 5 pods). Add a justification to continue.')).toBeTruthy()
    })

    it('has a message icon so the state is not colour alone', () => {
      const { container } = render(canary({ defaultValue: 40 }))
      expect(container.querySelector('[aria-live] svg')).toBeTruthy()
    })

    it('says lower than usual below a soft minimum', () => {
      render(canary({ softMin: 5, defaultValue: 2 }))
      expect(screen.getByText('Lower than usual (usual range 5–25%). Add a justification to continue.')).toBeTruthy()
    })

    it('shows the reason field only while past the limit, and keeps what was typed', async () => {
      const user = userEvent.setup()
      render(canary({ defaultValue: 40 }))
      await user.type(reasonBox(), 'Planned launch')
      await user.clear(box())
      await user.type(box(), '10')
      expect(screen.queryByRole('textbox')).toBeNull()
      await user.clear(box())
      await user.type(box(), '30')
      expect(reasonBox().value).toBe('Planned launch')
    })

    it('reports the reason as it is typed, and works controlled', async () => {
      const user = userEvent.setup()
      const onJustificationChange = vi.fn()
      render(canary({ defaultValue: 40, onJustificationChange }))
      await user.type(reasonBox(), 'Hi')
      expect(onJustificationChange.mock.calls.map((c) => c[0])).toEqual(['H', 'Hi'])

      function Controlled() {
        const [why, setWhy] = useState('Because')
        return canary({ defaultValue: 40, justification: why, onJustificationChange: setWhy })
      }
      render(<Controlled />)
      expect(screen.getAllByRole('textbox', { name: 'Justification' })[1]).toHaveProperty('value', 'Because')
    })

    it('uses custom reason label, placeholder and name', () => {
      render(canary({ defaultValue: 40, justificationLabel: 'Reason', justificationPlaceholder: 'Say why', justificationName: 'why' }))
      const box = screen.getByRole('textbox', { name: 'Reason' }) as HTMLTextAreaElement
      expect(box.placeholder).toBe('Say why')
      expect(box.name).toBe('why')
    })

    it('blocks submit until the reason is filled, then lets it through', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          {canary({ defaultValue: 40 })}
          <button type="submit">Apply</button>
        </form>,
      )
      expect(reasonBox().validity.customError).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).not.toHaveBeenCalled()
      await user.type(reasonBox(), '   ')
      expect(reasonBox().validity.valid).toBe(false)
      await user.type(reasonBox(), 'Planned launch')
      expect(reasonBox().validity.valid).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('only warns, with no reason field, when requireJustification is false', () => {
      render(canary({ defaultValue: 40, requireJustification: false }))
      expect(screen.getByText('Higher than usual (usual range up to 25%).')).toBeTruthy()
      expect(screen.queryByText(/justification to continue/)).toBeNull()
      expect(screen.queryByRole('textbox')).toBeNull()
      expect(box().dataset.tone).toBe('caution')
    })
  })

  describe('disabled and read-only', () => {
    const form = (props: Partial<React.ComponentProps<typeof LimitedNumberInput>>, onSubmit: (e: React.FormEvent) => void) => (
      <form onSubmit={onSubmit}>
        {canary({ defaultValue: 40, ...props })}
        <button type="submit">Apply</button>
      </form>
    )

    it('disables the reason field with the number, and does not hold up a form submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
      const { rerender } = render(form({ disabled: true }, onSubmit))
      expect(box().disabled).toBe(true)
      expect(reasonBox().disabled).toBe(true)
      expect(reasonBox().required).toBe(false)
      expect(reasonBox().validity.customError).toBe(false)
      expect(screen.queryByText('*')).toBeNull()
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
      // Enabled again, the reason is required and blocks submit once more.
      rerender(form({ disabled: false }, onSubmit))
      expect(reasonBox().disabled).toBe(false)
      expect(reasonBox().required).toBe(true)
      expect(reasonBox().validity.customError).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('makes the reason field read-only with the number, and does not hold up a form submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
      render(form({ readOnly: true }, onSubmit))
      expect(box().readOnly).toBe(true)
      expect(reasonBox().readOnly).toBe(true)
      expect(reasonBox().required).toBe(false)
      expect(reasonBox().validity.customError).toBe(false)
      await user.type(reasonBox(), 'nope')
      expect(reasonBox().value).toBe('')
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('keeps a typed reason visible while disabled', () => {
      render(canary({ defaultValue: 40, defaultJustification: 'Planned launch', disabled: true }))
      expect(reasonBox().value).toBe('Planned launch')
      expect(reasonBox().disabled).toBe(true)
    })
  })

  describe('past a hard limit', () => {
    it('turns critical, says the maximum, and marks the field invalid', () => {
      render(canary({ defaultValue: 75 }))
      expect(screen.getByText('Maximum allowed is 60%.')).toBeTruthy()
      expect(box().getAttribute('aria-invalid')).toBe('true')
      expect(box().dataset.tone).toBe('critical')
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('words the unit with a space unless it is a percent, and says the minimum below hardMin', () => {
      const { unmount } = render(canary({ unit: 'sec', defaultValue: 75 }))
      expect(screen.getByText('Maximum allowed is 60 sec.')).toBeTruthy()
      unmount()
      render(canary({ unit: 'sec', hardMin: 5, defaultValue: 2 }))
      expect(screen.getByText('Minimum allowed is 5 sec.')).toBeTruthy()
    })

    it('never changes what was typed, not even on blur', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <>
          {canary({ onValueChange })}
          <button>other</button>
        </>,
      )
      await user.type(box(), '75')
      await user.click(screen.getByText('other'))
      expect(box().value).toBe('75')
      expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([7, 75])
    })

    it('sets a custom validity message so a native form cannot be submitted', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          {canary({ defaultValue: 75 })}
          <button type="submit">Apply</button>
        </form>,
      )
      expect(box().validity.customError).toBe(true)
      expect(box().validationMessage).toBe('Maximum allowed is 60%.')
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).not.toHaveBeenCalled()
      // Back inside the limit: the block is lifted.
      await user.clear(box())
      await user.type(box(), '20')
      expect(box().validity.valid).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('treats a hard limit as stronger than the soft one when both are crossed', () => {
      render(canary({ defaultValue: 99 }))
      expect(screen.queryByText(/Higher than usual/)).toBeNull()
      expect(screen.getByText('Maximum allowed is 60%.')).toBeTruthy()
    })
  })

  describe('state', () => {
    it('reports ok, soft and hard through onStateChange, starting with the initial state', async () => {
      const user = userEvent.setup()
      const states: LimitState[] = []
      render(canary({ defaultValue: 10, onStateChange: (s) => states.push(s) }))
      expect(states).toEqual(['ok'])
      await user.clear(box())
      await user.type(box(), '40')
      await user.clear(box())
      await user.type(box(), '90')
      expect(states).toEqual(['ok', 'soft', 'ok', 'hard'])
      expect(box().closest('[data-state]')?.getAttribute('data-state')).toBe('hard')
    })

    it('reports a soft start state on mount', () => {
      const onStateChange = vi.fn()
      render(canary({ defaultValue: 40, onStateChange }))
      expect(onStateChange).toHaveBeenCalledTimes(1)
      expect(onStateChange).toHaveBeenCalledWith('soft')
    })

    it('sets the tone on the wrapper, and the message follows it', () => {
      const { container, rerender } = render(canary({ value: 10, onValueChange: () => {} }))
      const root = () => container.querySelector('[data-state]') as HTMLElement
      const message = () => container.querySelector('[aria-live] p') as HTMLElement | null
      expect(root().dataset.tone).toBe('neutral')
      expect(message()?.className).toContain('text-fg-muted')
      rerender(canary({ value: 40, onValueChange: () => {} }))
      expect(root().dataset.tone).toBe('caution')
      expect(message()?.className).toContain('text-tone-fg')
      rerender(canary({ value: 75, onValueChange: () => {} }))
      expect(root().dataset.tone).toBe('critical')
      expect(message()?.className).toContain('text-tone-fg')
    })

    it('treats an empty field as ok', () => {
      render(canary({ onStateChange: () => {} }))
      expect(box().value).toBe('')
      expect(box().dataset.tone).toBe('neutral')
    })

    it('steps with the keyboard past the limits and reflects each state', async () => {
      const user = userEvent.setup()
      render(canary({ defaultValue: 20 }))
      await user.click(box())
      await user.keyboard('{PageUp}')
      expect(box().value).toBe('30')
      expect(box().dataset.tone).toBe('caution')
      await user.keyboard('{PageUp}{PageUp}{PageUp}')
      expect(box().value).toBe('60')
      expect(box().dataset.tone).toBe('caution')
      await user.keyboard('{ArrowUp}')
      expect(box().value).toBe('61')
      expect(box().getAttribute('aria-invalid')).toBe('true')
    })
  })

  describe('controlled and uncontrolled', () => {
    it('shows and reports a controlled value', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [v, setV] = useState<number | null>(70)
        return (
          <>
            {canary({ value: v, onValueChange: setV })}
            <output>{v === null ? 'null' : v}</output>
          </>
        )
      }
      render(<Controlled />)
      expect(box().value).toBe('70')
      expect(box().getAttribute('aria-invalid')).toBe('true')
      await user.clear(box())
      expect(screen.getByRole('status').textContent).toBe('null')
      await user.type(box(), '15')
      expect(screen.getByRole('status').textContent).toBe('15')
      expect(box().getAttribute('aria-invalid')).toBeNull()
    })

    it('stays where the parent keeps it when controlled', () => {
      const { rerender } = render(canary({ value: 10, onValueChange: () => {} }))
      expect(box().dataset.tone).toBe('neutral')
      rerender(canary({ value: 30, onValueChange: () => {} }))
      expect(box().value).toBe('30')
      expect(box().dataset.tone).toBe('caution')
    })
  })

  describe('announcements', () => {
    it('has one polite live region wired to the input, which changes only when the state does', async () => {
      const user = userEvent.setup()
      const { container } = render(canary({ defaultValue: 26 }))
      const live = container.querySelector('[aria-live]') as HTMLElement
      expect(live.getAttribute('aria-live')).toBe('polite')
      expect(box().getAttribute('aria-describedby')).toContain(live.id)

      const records: MutationRecord[] = []
      const watch = new MutationObserver((r) => records.push(...r))
      watch.observe(live, { childList: true, subtree: true, characterData: true })
      await user.click(box())
      await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}')
      expect(box().value).toBe('29')
      expect(records).toHaveLength(0)

      await user.keyboard('{PageUp}{PageUp}{PageUp}')
      expect(box().value).toBe('59')
      expect(records).toHaveLength(0)
      await user.keyboard('{PageUp}')
      expect(live.textContent).toBe('Maximum allowed is 60%.')
      expect(records.length).toBeGreaterThan(0)
      watch.disconnect()
    })
  })

  describe('the limit scale', () => {
    it('is decorative and shows the zones with their limits', () => {
      const { container } = render(canary({ defaultValue: 10 }))
      const scale = container.querySelector('[aria-hidden="true"].flex-col') as HTMLElement
      expect(scale).toBeTruthy()
      expect(scale.textContent).toContain('0')
      expect(scale.textContent).toContain('soft 25')
      expect(scale.textContent).toContain('hard 60')
    })

    it('puts the soft tick and the knob where the numbers say', () => {
      const { container } = render(canary({ defaultValue: 30 }))
      const track = container.querySelector('[aria-hidden="true"] > .relative') as HTMLElement
      // 25 of 60.
      expect(track.style.background).toContain('41.666')
      const [tick, knob] = Array.from(track.children) as HTMLElement[]
      expect(parseFloat(tick!.style.left)).toBeCloseTo(41.667, 2)
      expect(parseFloat(knob!.style.left)).toBeCloseTo(50, 2)
    })

    it('pins the knob to the end past the hard limit, and hides it when empty', () => {
      const { container, rerender } = render(canary({ value: 90, onValueChange: () => {} }))
      const knob = () => container.querySelector('.rounded-full') as HTMLElement | null
      expect(knob()?.style.left).toBe('100%')
      rerender(canary({ value: null, onValueChange: () => {} }))
      expect(knob()).toBeNull()
    })

    it('can be turned off, and needs an upper limit', () => {
      const { container, rerender } = render(canary({ showScale: false }))
      expect(container.querySelector('[aria-hidden="true"].flex-col')).toBeNull()
      rerender(<LimitedNumberInput label="L" softMin={5} hardMin={0} defaultValue={3} />)
      expect(container.querySelector('[aria-hidden="true"].flex-col')).toBeNull()
    })
  })

  describe('with a Field', () => {
    it('takes the label and id from the Field and does not add its own label', () => {
      render(
        <Field label="Rollout speed" hint="Percent of traffic.">
          <LimitedNumberInput unit="%" softMax={25} hardMax={60} defaultValue={40} />
        </Field>,
      )
      const input = screen.getByRole('spinbutton', { name: 'Rollout speed' })
      expect(document.querySelectorAll('label')).toHaveLength(2) // the Field's and the reason field's
      expect(input.getAttribute('aria-describedby')).toContain('-hint')
      expect(input.getAttribute('aria-describedby')).toContain('-limit')
    })

    it('marks the control required from the Field', () => {
      render(
        <Field label="Rollout speed" required>
          <LimitedNumberInput unit="%" softMax={25} hardMax={60} />
        </Field>,
      )
      expect(screen.getByRole('spinbutton').getAttribute('aria-required')).toBe('true')
    })

    it('keeps a Field error showing when the limits are fine', () => {
      render(
        <Field label="Rollout speed" error="Already running.">
          <LimitedNumberInput unit="%" softMax={25} hardMax={60} defaultValue={5} />
        </Field>,
      )
      expect(screen.getByRole('spinbutton').getAttribute('aria-invalid')).toBe('true')
    })
  })

  describe('props', () => {
    it('passes name, step and the ref to the input, and puts className on the wrapper', async () => {
      const ref = createRef<HTMLInputElement>()
      const user = userEvent.setup()
      const { container } = render(canary({ name: 'canary', step: 5, ref, className: 'w-64', defaultValue: 10 }))
      expect(ref.current).toBe(box())
      expect(box().name).toBe('canary')
      expect((container.firstElementChild as HTMLElement).className).toContain('w-64')
      await user.click(box())
      await user.keyboard('{ArrowUp}')
      expect(box().value).toBe('15')
    })

    it('uses the id it is given for the label and the input', () => {
      render(canary({ id: 'speed' }))
      expect(box().id).toBe('speed')
      expect(screen.getByText('Shift traffic').getAttribute('for')).toBe('speed')
    })

    it('marks the label and the input required', () => {
      render(canary({ required: true }))
      expect(box().required).toBe(true)
      expect(screen.getByText('*')).toBeTruthy()
    })

    it('works with aria-label and no visible label', () => {
      render(<LimitedNumberInput aria-label="Canary share" softMax={25} hardMax={60} />)
      expect(screen.getByRole('spinbutton', { name: 'Canary share' })).toBeTruthy()
      expect(document.querySelector('label')).toBeNull()
    })

    it('does not touch the typed text on a blur inside the soft range', () => {
      render(canary({ defaultValue: 12 }))
      fireEvent.blur(box())
      expect(box().value).toBe('12')
    })
  })
})

testExamplesAxe(examples)
