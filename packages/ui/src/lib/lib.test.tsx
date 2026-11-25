import { createRef } from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  INTENTS,
  SEVERITIES,
  SEVERITY_LABEL,
  Slot,
  bySeverityDesc,
  cn,
  severityRank,
  toneOf,
  useControllable,
  type Severity,
} from './index.ts'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, null, ['c', { d: true, e: false }])).toBe('a c d')
  })

  it('keeps text-ui (a size) together with text-fg (a colour)', () => {
    expect(cn('text-ui text-fg')).toBe('text-ui text-fg')
    expect(cn('text-ui-sm text-fg-muted')).toBe('text-ui-sm text-fg-muted')
  })

  it('lets a size utility replace the density variable form', () => {
    expect(cn('px-(--btn-px)', 'px-8')).toBe('px-8')
    expect(cn('h-(--btn-h) px-(--btn-px)', 'h-12')).toBe('px-(--btn-px) h-12')
  })

  it('lets text-lg replace text-ui, and a colour replace a tone colour', () => {
    expect(cn('text-ui', 'text-lg')).toBe('text-lg')
    expect(cn('bg-tone', 'bg-accent')).toBe('bg-accent')
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted')
  })

  it('lets a radius, shadow, animation or easing override replace the default', () => {
    expect(cn('rounded-control', 'rounded-card')).toBe('rounded-card')
    expect(cn('shadow-low', 'shadow-high')).toBe('shadow-high')
    expect(cn('animate-pikore-spin', 'animate-pikore-pop')).toBe('animate-pikore-pop')
    expect(cn('animate-pikore-toast-out', 'animate-none')).toBe('animate-none')
    expect(cn('ease-pikore', 'ease-in')).toBe('ease-in')
    expect(cn('ease-in', 'ease-pikore')).toBe('ease-pikore')
  })
})

describe('toneOf', () => {
  it('prefers severity over intent over the fallback', () => {
    expect(toneOf('critical', 'success', 'accent')).toBe('critical')
    expect(toneOf(undefined, 'danger', 'accent')).toBe('critical')
    expect(toneOf(null, null, 'accent')).toBe('accent')
  })

  it('maps every intent onto a tone', () => {
    expect(INTENTS.map((i) => toneOf(undefined, i))).toEqual(['accent', 'neutral', 'normal', 'caution', 'critical'])
  })

  it('falls back to neutral, or to null when asked', () => {
    expect(toneOf()).toBe('neutral')
    expect(toneOf(undefined, undefined, null)).toBeNull()
    expect(toneOf(null, null, null)).toBeNull()
    expect(toneOf(null, 'primary', null)).toBe('accent')
  })
})

describe('severity order', () => {
  it('sorts most urgent first', () => {
    const shuffled: Severity[] = ['normal', 'critical', 'info', 'caution', 'advisory']
    expect([...shuffled].sort(bySeverityDesc)).toEqual(['critical', 'caution', 'advisory', 'info', 'normal'])
  })

  it('ranks normal 0 to critical 4 and labels each level', () => {
    expect(SEVERITIES.map(severityRank)).toEqual([0, 1, 2, 3, 4])
    expect(SEVERITIES.map((s) => SEVERITY_LABEL[s])).toEqual(['Normal', 'Info', 'Advisory', 'Caution', 'Critical'])
  })
})

describe('useControllable', () => {
  it('owns the state when uncontrolled and starts at the default', () => {
    const { result } = renderHook(() => useControllable({ value: undefined, defaultValue: 1 }))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1](2))
    expect(result.current[0]).toBe(2)
  })

  it('ignores its own state when controlled and follows the value', () => {
    const { result, rerender } = renderHook(({ value }) => useControllable({ value, defaultValue: 0 }), {
      initialProps: { value: 5 as number | undefined },
    })
    expect(result.current[0]).toBe(5)
    act(() => result.current[1](9))
    expect(result.current[0]).toBe(5)
    rerender({ value: 9 })
    expect(result.current[0]).toBe(9)
  })

  it('calls onChange in both modes', () => {
    const onChange = vi.fn()
    const uncontrolled = renderHook(() => useControllable({ value: undefined, defaultValue: 'a', onChange }))
    act(() => uncontrolled.result.current[1]('b'))
    expect(onChange).toHaveBeenLastCalledWith('b')

    const controlled = renderHook(() => useControllable({ value: 'a', defaultValue: 'a', onChange }))
    act(() => controlled.result.current[1]('c'))
    expect(onChange).toHaveBeenLastCalledWith('c')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('keeps the setter identity stable but always calls the latest onChange', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(({ onChange }) => useControllable({ value: undefined, defaultValue: 0, onChange }), {
      initialProps: { onChange: first },
    })
    const setter = result.current[1]
    rerender({ onChange: second })
    expect(result.current[1]).toBe(setter)
    act(() => result.current[1](3))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(3)
  })

  it('treats an explicit undefined as uncontrolled, and allows undefined as a value type', () => {
    const { result } = renderHook(() => useControllable<string | undefined>({ value: undefined, defaultValue: undefined }))
    expect(result.current[0]).toBeUndefined()
    act(() => result.current[1]('x'))
    expect(result.current[0]).toBe('x')
  })
})

describe('Slot', () => {
  it('renders its child instead of a wrapper and merges class names', () => {
    const { container } = render(
      <Slot className="slot-class px-4" data-tone="accent">
        <a href="/x" className="child-class px-8">
          Go
        </a>
      </Slot>,
    )
    const link = screen.getByRole('link', { name: 'Go' })
    expect(container.firstElementChild).toBe(link)
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/x')
    expect(link.getAttribute('data-tone')).toBe('accent')
    expect(link.className).toBe('slot-class child-class px-8')
  })

  it('lets child props win over the Slot props', () => {
    render(
      <Slot title="slot" aria-label="slot label" id="slot-id">
        <a href="/x" title="child" id="child-id" />
      </Slot>,
    )
    const link = screen.getByLabelText('slot label')
    expect(link.getAttribute('title')).toBe('child')
    expect(link.getAttribute('id')).toBe('child-id')
  })

  it('runs both click handlers, the child first', () => {
    const calls: string[] = []
    render(
      <Slot onClick={() => calls.push('slot')}>
        <button type="button" onClick={() => calls.push('child')}>
          Go
        </button>
      </Slot>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(calls).toEqual(['child', 'slot'])
  })

  it('skips the Slot handler when the child handler prevented the default action', () => {
    const slot = vi.fn()
    render(
      <Slot onClick={slot}>
        <a href="#x" onClick={(e) => e.preventDefault()}>
          Go
        </a>
      </Slot>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(slot).not.toHaveBeenCalled()
  })

  it('keeps a handler that only one side has', () => {
    const slot = vi.fn()
    const child = vi.fn()
    render(
      <>
        <Slot onClick={slot}>
          <button type="button">One</button>
        </Slot>
        <Slot>
          <button type="button" onClick={child}>
            Two
          </button>
        </Slot>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'One' }))
    fireEvent.click(screen.getByRole('button', { name: 'Two' }))
    expect(slot).toHaveBeenCalledTimes(1)
    expect(child).toHaveBeenCalledTimes(1)
  })

  it('merges style objects, with the child winning on conflicts', () => {
    render(
      <Slot style={{ color: 'red', margin: '1px' }}>
        <a href="/x" style={{ color: 'blue', padding: '2px' }}>
          Go
        </a>
      </Slot>,
    )
    const style = screen.getByRole('link').style
    expect(style.color).toBe('blue')
    expect(style.margin).toBe('1px')
    expect(style.padding).toBe('2px')
  })

  it('sets every ref: the Slot ref and the child ref', () => {
    const slotRef = createRef<HTMLElement>()
    const childRef = createRef<HTMLAnchorElement>()
    let callbackNode: HTMLElement | null = null
    const { unmount } = render(
      <Slot ref={slotRef}>
        <a href="/x" ref={childRef}>
          Go
        </a>
      </Slot>,
    )
    const link = screen.getByRole('link')
    expect(slotRef.current).toBe(link)
    expect(childRef.current).toBe(link)
    unmount()
    expect(slotRef.current).toBeNull()
    expect(childRef.current).toBeNull()

    render(
      <Slot
        ref={(node) => {
          callbackNode = node
        }}
      >
        <a href="/y">Go</a>
      </Slot>,
    )
    expect(callbackNode).toBe(screen.getByRole('link'))
  })

  describe('without a single element child', () => {
    afterEach(() => vi.restoreAllMocks())

    it('renders nothing and warns instead of failing silently', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = render(<Slot>just text</Slot>)
      expect(container.innerHTML).toBe('')
      expect(warn).toHaveBeenCalled()
      expect(String(warn.mock.calls[0]?.[0])).toMatch(/single React element/i)
    })
  })
})
