import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Textarea } from './textarea.tsx'
import * as examples from './textarea.examples.tsx'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Textarea', () => {
  it('renders a native textarea that grows by default', () => {
    render(<Textarea aria-label="Notes" />)
    const box = screen.getByRole('textbox', { name: 'Notes' })
    expect(box.tagName).toBe('TEXTAREA')
    expect(box.className).toContain('resize-none')
  })

  it('allows manual resizing when autoGrow is off', () => {
    render(<Textarea aria-label="Notes" autoGrow={false} />)
    expect(screen.getByLabelText('Notes').className).toContain('resize-y')
  })

  it('sizes to its content but never past maxRows', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(300)
    render(<Textarea aria-label="Notes" maxRows={5} style={{ lineHeight: '20px', padding: 0, border: 0 }} />)
    const box = screen.getByLabelText('Notes') as HTMLTextAreaElement
    expect(box.style.height).toBe('100px')
    expect(box.style.overflowY).toBe('auto')
  })

  it('does not set a height when autoGrow is off', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(300)
    render(<Textarea aria-label="Notes" autoGrow={false} />)
    expect((screen.getByLabelText('Notes') as HTMLTextAreaElement).style.height).toBe('')
  })

  it('has no counter without maxLength', () => {
    render(<Textarea aria-label="Notes" />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows a live counter with maxLength', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" maxLength={100} />)
    expect(screen.getByText('0 / 100')).toBeTruthy()
    await user.type(screen.getByLabelText('Notes'), 'hello')
    expect(screen.getByText('5 / 100')).toBeTruthy()
  })

  it('counts a controlled value and an initial defaultValue', () => {
    const { rerender } = render(<Textarea aria-label="Notes" maxLength={50} defaultValue="abc" />)
    expect(screen.getByText('3 / 50')).toBeTruthy()
    rerender(<Textarea aria-label="Notes" maxLength={50} value="abcdefg" onChange={() => {}} />)
    expect(screen.getByText('7 / 50')).toBeTruthy()
  })

  it('announces the characters left only within 20 of the limit', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" maxLength={30} />)
    const live = screen.getByRole('status')
    await user.type(screen.getByLabelText('Notes'), 'a'.repeat(5))
    expect(live.textContent).toBe('')
    await user.type(screen.getByLabelText('Notes'), 'a'.repeat(6))
    expect(live.textContent).toBe('19 characters left')
    await user.type(screen.getByLabelText('Notes'), 'a'.repeat(18))
    expect(live.textContent).toBe('1 character left')
  })

  it('turns the counter to caution near the limit and critical at it', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" maxLength={25} />)
    const counter = () => screen.getByText(/\/ 25$/)
    expect(counter().className).toContain('text-fg-subtle')
    await user.type(screen.getByLabelText('Notes'), 'a'.repeat(10))
    expect(counter().className).toContain('text-caution-fg')
    await user.type(screen.getByLabelText('Notes'), 'a'.repeat(15))
    expect(counter().className).toContain('text-critical-fg')
  })

  it('stops input at maxLength', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" maxLength={4} />)
    await user.type(screen.getByLabelText('Notes'), 'abcdef')
    expect((screen.getByLabelText('Notes') as HTMLTextAreaElement).value).toBe('abcd')
  })

  it('sets aria-invalid when invalid and the caution tone for warning', () => {
    render(
      <>
        <Textarea aria-label="bad" invalid />
        <Textarea aria-label="warn" warning />
      </>,
    )
    expect(screen.getByLabelText('bad').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('warn').dataset.tone).toBe('caution')
  })

  it('keeps a focus ring in the error and warning states', () => {
    render(
      <>
        <Textarea aria-label="bad" invalid />
        <Textarea aria-label="warn" warning />
      </>,
    )
    expect(screen.getByLabelText('bad').className).toContain(
      'enabled:aria-invalid:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--critical),transparent_65%)]',
    )
    expect(screen.getByLabelText('warn').className).toContain(
      'enabled:data-[tone=caution]:focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--caution),transparent_65%)]',
    )
  })

  describe('refs', () => {
    it('calls a callback ref once, not with null and the element on every render', () => {
      const ref = vi.fn()
      const { rerender, unmount } = render(<Textarea aria-label="Notes" ref={ref} />)
      expect(ref).toHaveBeenCalledTimes(1)
      expect(ref).toHaveBeenLastCalledWith(screen.getByLabelText('Notes'))
      rerender(<Textarea aria-label="Notes" ref={ref} defaultValue="more" />)
      rerender(<Textarea aria-label="Notes" ref={ref} />)
      expect(ref).toHaveBeenCalledTimes(1)
      unmount()
      expect(ref).toHaveBeenLastCalledWith(null)
    })

    it('runs the cleanup a callback ref returns', () => {
      const cleanup = vi.fn()
      const { unmount } = render(<Textarea aria-label="Notes" ref={() => cleanup} />)
      expect(cleanup).not.toHaveBeenCalled()
      unmount()
      expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('points an object ref at the new element when the counter mounts a new wrapper', () => {
      const ref = createRef<HTMLTextAreaElement>()
      const { rerender } = render(<Textarea aria-label="Notes" ref={ref} />)
      rerender(<Textarea aria-label="Notes" ref={ref} maxLength={50} />)
      expect(ref.current).toBe(screen.getByLabelText('Notes'))
      expect(ref.current?.isConnected).toBe(true)
    })
  })

  describe('refitting on resize', () => {
    let notify = () => {}
    const observe = vi.fn()
    const disconnect = vi.fn()

    function stubLayout(initialWidth: number, initialScroll: number) {
      const layout = { width: initialWidth, scroll: initialScroll }
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => layout.width)
      vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => layout.scroll)
      class FakeResizeObserver {
        constructor(callback: () => void) {
          notify = callback
        }
        observe = observe
        disconnect = disconnect
      }
      vi.stubGlobal('ResizeObserver', FakeResizeObserver)
      vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
        callback()
        return 1
      })
      vi.stubGlobal('cancelAnimationFrame', () => {})
      return layout
    }
    const style = { lineHeight: '20px', padding: 0, border: 0 }

    it('refits when the width changes and the text re-wraps', () => {
      const layout = stubLayout(300, 40)
      render(<Textarea aria-label="Notes" style={style} />)
      const box = screen.getByLabelText('Notes') as HTMLTextAreaElement
      expect(observe).toHaveBeenCalledWith(box)
      expect(box.style.height).toBe('40px')
      layout.width = 150
      layout.scroll = 80
      notify()
      expect(box.style.height).toBe('80px')
    })

    it('does not refit when only the height changed', () => {
      const layout = stubLayout(300, 40)
      render(<Textarea aria-label="Notes" style={style} />)
      const box = screen.getByLabelText('Notes') as HTMLTextAreaElement
      layout.scroll = 80
      notify()
      expect(box.style.height).toBe('40px')
    })

    it('fits once a hidden field gets a size', () => {
      const layout = stubLayout(0, 0)
      render(<Textarea aria-label="Notes" style={style} />)
      const box = screen.getByLabelText('Notes') as HTMLTextAreaElement
      expect(box.style.height).toBe('auto')
      layout.width = 300
      layout.scroll = 60
      notify()
      expect(box.style.height).toBe('60px')
    })

    it('does not observe without autoGrow, and disconnects on unmount', () => {
      stubLayout(300, 40)
      observe.mockClear()
      disconnect.mockClear()
      const { rerender, unmount } = render(<Textarea aria-label="Notes" autoGrow={false} />)
      expect(observe).not.toHaveBeenCalled()
      rerender(<Textarea aria-label="Notes" />)
      expect(observe).toHaveBeenCalledTimes(1)
      unmount()
      expect(disconnect).toHaveBeenCalledTimes(1)
    })
  })

  it('merges className onto the textarea and forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea aria-label="Notes" className="min-h-40" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Notes'))
    expect(ref.current?.className).toContain('min-h-40')
    expect(ref.current?.className).not.toContain('min-h-[88px]')
  })
})

testExamplesAxe(examples)
