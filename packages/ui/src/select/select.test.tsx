import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Select } from './select.tsx'
import * as examples from './select.examples.tsx'

const options = [
  { label: 'eu-west-1', value: 'eu-west-1' },
  { label: 'us-east-1', value: 'us-east-1' },
  { label: 'ap-south-1', value: 'ap-south-1', disabled: true },
]

describe('Select', () => {
  it('renders a native select with an option per entry', () => {
    render(<Select aria-label="Region" options={options} />)
    const select = screen.getByRole('combobox', { name: 'Region' })
    expect(select.tagName).toBe('SELECT')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['eu-west-1', 'us-east-1', 'ap-south-1'])
    expect((screen.getByRole('option', { name: 'ap-south-1' }) as HTMLOptionElement).disabled).toBe(true)
  })

  it('selects defaultValue when uncontrolled and reports changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select aria-label="Region" options={options} defaultValue="us-east-1" onChange={onChange} />)
    const select = screen.getByLabelText('Region') as HTMLSelectElement
    expect(select.value).toBe('us-east-1')
    await user.selectOptions(select, 'eu-west-1')
    expect(select.value).toBe('eu-west-1')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [v, setV] = useState('eu-west-1')
      return <Select aria-label="Region" options={options} value={v} onChange={(e) => setV(e.target.value)} />
    }
    render(<Controlled />)
    await user.selectOptions(screen.getByLabelText('Region'), 'us-east-1')
    expect((screen.getByLabelText('Region') as HTMLSelectElement).value).toBe('us-east-1')
  })

  it('shows a placeholder while empty, greyed and not pickable', async () => {
    const user = userEvent.setup()
    render(<Select aria-label="Env" options={options} placeholder="Choose a region" />)
    const select = screen.getByLabelText('Env') as HTMLSelectElement
    const placeholder = screen.getByText('Choose a region') as HTMLOptionElement
    expect(placeholder.disabled).toBe(true)
    expect(select.value).toBe('')
    expect(select.classList.contains('text-fg-subtle')).toBe(true)
    await user.selectOptions(select, 'eu-west-1')
    expect(select.classList.contains('text-fg-subtle')).toBe(false)
    expect(select.classList.contains('text-fg')).toBe(true)
  })

  it('does not show the placeholder style when a defaultValue is set', () => {
    render(<Select aria-label="Env" options={options} placeholder="Choose" defaultValue="eu-west-1" />)
    expect((screen.getByLabelText('Env') as HTMLSelectElement).value).toBe('eu-west-1')
    expect(screen.getByLabelText('Env').classList.contains('text-fg-subtle')).toBe(false)
  })

  it('draws a decorative chevron', () => {
    const { container } = render(<Select aria-label="Region" options={options} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('follows density by default and uses 30, 38 and 44px for explicit sizes', () => {
    render(
      <>
        <Select aria-label="auto" options={options} />
        <Select aria-label="sm" size="sm" options={options} />
        <Select aria-label="lg" size="lg" options={options} />
      </>,
    )
    expect(screen.getByLabelText('auto').className).toContain('h-(--control-h)')
    expect(screen.getByLabelText('sm').className).toContain('h-[30px]')
    expect(screen.getByLabelText('lg').className).toContain('h-11')
  })

  it('sets aria-invalid, the warning tone, and disabled', () => {
    render(
      <>
        <Select aria-label="bad" options={options} invalid />
        <Select aria-label="warn" options={options} warning />
        <Select aria-label="off" options={options} disabled />
      </>,
    )
    expect(screen.getByLabelText('bad').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('warn').dataset.tone).toBe('caution')
    expect((screen.getByLabelText('off') as HTMLSelectElement).disabled).toBe(true)
  })

  it('keeps a focus ring in the error and warning states', () => {
    render(
      <>
        <Select aria-label="bad" options={options} invalid />
        <Select aria-label="warn" options={options} warning />
      </>,
    )
    expect(screen.getByLabelText('bad').className).toContain(
      'enabled:aria-invalid:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--critical),transparent_65%)]',
    )
    expect(screen.getByLabelText('warn').className).toContain(
      'enabled:data-[tone=caution]:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--caution),transparent_65%)]',
    )
  })

  it('merges className onto the select and forwards ref', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select aria-label="Region" options={options} className="pr-2" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Region'))
    expect(ref.current?.className).toContain('pr-2')
    expect(ref.current?.className).not.toContain('pr-[34px]')
  })
})

testExamplesAxe(examples)
