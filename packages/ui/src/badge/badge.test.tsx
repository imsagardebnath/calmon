import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Badge } from './badge.tsx'
import * as examples from './badge.examples.tsx'

describe('Badge', () => {
  it('sets the tone from severity, and severity wins over intent', () => {
    render(
      <Badge severity="caution" intent="danger">
        Slow
      </Badge>,
    )
    expect(screen.getByText('Slow').dataset.tone).toBe('caution')
  })

  it('maps intent to a tone and defaults to neutral', () => {
    render(
      <>
        <Badge intent="danger">Down</Badge>
        <Badge>Draft</Badge>
      </>,
    )
    expect(screen.getByText('Down').dataset.tone).toBe('critical')
    expect(screen.getByText('Draft').dataset.tone).toBe('neutral')
  })

  it('shows the severity icon next to the text, hidden from screen readers', () => {
    render(<Badge severity="critical">Critical</Badge>)
    const badge = screen.getByText('Critical')
    const icon = badge.querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(badge.textContent).toBe('Critical')
  })

  it('gives each severity a different icon shape', () => {
    const severities = ['normal', 'info', 'advisory', 'caution', 'critical'] as const
    render(
      <>
        {severities.map((s) => (
          <Badge key={s} severity={s}>
            {s}
          </Badge>
        ))}
      </>,
    )
    const shapes = severities.map((s) => screen.getByText(s).querySelector('svg')?.innerHTML)
    expect(new Set(shapes).size).toBe(5)
  })

  it('hides the icon with icon={false} and replaces it with a node', () => {
    render(
      <>
        <Badge severity="info" icon={false}>
          A
        </Badge>
        <Badge severity="info" icon={<i data-testid="custom" />}>
          B
        </Badge>
      </>,
    )
    expect(screen.getByText('A').querySelector('svg')).toBeNull()
    expect(screen.getByText('B').querySelector('svg')).toBeNull()
    expect(screen.getByTestId('custom')).toBeTruthy()
  })

  it('shows a dot instead of an icon in the dot variant', () => {
    render(
      <Badge severity="caution" variant="dot">
        Slow
      </Badge>,
    )
    const badge = screen.getByText('Slow')
    expect(badge.querySelector('svg')).toBeNull()
    expect(badge.className).toContain('before:bg-tone')
  })

  it('has no icon for neutral and primary badges', () => {
    render(
      <>
        <Badge>Draft</Badge>
        <Badge intent="primary">New</Badge>
      </>,
    )
    expect(screen.getByText('Draft').querySelector('svg')).toBeNull()
    expect(screen.getByText('New').querySelector('svg')).toBeNull()
  })

  it('uses the solid fill for the solid variant, and the soft fill otherwise', () => {
    render(
      <>
        <Badge severity="critical" variant="solid">
          Down
        </Badge>
        <Badge severity="critical">Soft</Badge>
      </>,
    )
    const solid = screen.getByText('Down').className.split(' ')
    expect(solid).toContain('bg-tone')
    expect(solid).toContain('text-tone-on')
    expect(solid).not.toContain('bg-tone-soft')
    const soft = screen.getByText('Soft').className.split(' ')
    expect(soft).toContain('bg-tone-soft')
    expect(soft).not.toContain('bg-tone')
  })

  it('lets className override defaults and passes props to the span', () => {
    render(
      <Badge className="px-4" data-x="1">
        Wide
      </Badge>,
    )
    const badge = screen.getByText('Wide')
    expect(badge.className).toContain('px-4')
    expect(badge.className).not.toContain('pr-2')
    expect(badge.dataset.x).toBe('1')
  })
})

testExamplesAxe(examples)
