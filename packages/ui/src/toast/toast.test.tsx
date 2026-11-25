import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Toast, ToastProvider, useToast, type ToastApi } from './toast.tsx'
import * as examples from './toast.examples.tsx'

/** Renders a provider and hands back the toast API. */
function setup(props: { limit?: number; label?: string } = {}) {
  const ref: { api?: ToastApi } = {}
  function Grab() {
    ref.api = useToast()
    return null
  }
  render(
    <ToastProvider {...props}>
      <Grab />
    </ToastProvider>,
  )
  return () => ref.api as ToastApi
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Toast', () => {
  it('uses role="status" by default and role="alert" for critical and caution', () => {
    render(
      <>
        <Toast severity="normal" title="A" />
        <Toast severity="caution" title="B" />
        <Toast severity="critical" title="C" />
      </>,
    )
    expect(screen.getAllByRole('status').map((e) => e.textContent)).toEqual(['A'])
    expect(screen.getAllByRole('alert').map((e) => e.textContent)).toEqual(['B', 'C'])
  })

  it('defaults to the normal tone, and severity wins over intent', () => {
    render(
      <>
        <Toast title="A" />
        <Toast severity="info" intent="danger" title="B" />
        <Toast intent="danger" title="C" />
      </>,
    )
    expect(screen.getByText('A').closest('[data-tone]')?.getAttribute('data-tone')).toBe('normal')
    expect(screen.getByText('B').closest('[data-tone]')?.getAttribute('data-tone')).toBe('info')
    expect(screen.getByText('C').closest('[data-tone]')?.getAttribute('data-tone')).toBe('critical')
  })

  it('shows the description, the severity icon, a count badge and the action', () => {
    const onClick = vi.fn()
    render(<Toast severity="info" title="Queued" description="Starts soon." count={3} action={{ label: 'Undo', onClick }} />)
    expect(screen.getByText('Starts soon.')).toBeTruthy()
    expect(screen.getByRole('status').querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByText('×3')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows the close button only with onDismiss', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Toast title="x" />)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<Toast title="x" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('shows a progress bar and a spinner instead of the icon while loading', () => {
    render(<Toast title="Deploying" loading progress={40} />)
    expect(screen.getByRole('progressbar', { name: 'Deploying' }).getAttribute('aria-valuenow')).toBe('40')
    const toast = screen.getByRole('status')
    expect(toast.querySelector('svg')).toBeNull()
    const ring = toast.querySelector('[aria-hidden="true"].animate-pikore-spin') as HTMLElement
    expect(ring.className).toContain('border-t-accent')
  })

  it('has an inverted look with solid, and the normal raised look without it', () => {
    render(
      <>
        <Toast solid title="Copied" />
        <Toast severity="info" title="Queued" />
      </>,
    )
    const solid = screen.getAllByRole('status')[0]?.className.split(' ') ?? []
    expect(solid).toContain('bg-fg')
    expect(solid).toContain('text-surface')
    expect(solid).not.toContain('bg-surface-raised')
    const normal = screen.getAllByRole('status')[1]?.className.split(' ') ?? []
    expect(normal).toContain('bg-surface-raised')
    expect(normal).not.toContain('bg-fg')
  })

  it('keeps the provider-only duration and dedupeKey props off the DOM element', () => {
    render(<Toast title="x" duration={3000} dedupeKey="k" />)
    const toast = screen.getByRole('status')
    expect(toast.hasAttribute('duration')).toBe(false)
    expect(toast.hasAttribute('dedupekey')).toBe(false)
  })

  it('draws the timer bar only when asked, with the given duration', () => {
    const { container, rerender } = render(<Toast title="x" />)
    expect(container.querySelector('[style*="animation-duration"]')).toBeNull()
    rerender(<Toast title="x" timer={5000} />)
    expect((container.querySelector('[style*="animation-duration"]') as HTMLElement).style.animationDuration).toBe('5000ms')
  })
})

describe('ToastProvider', () => {
  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  it('renders a polite live region for notifications', () => {
    setup()
    const region = screen.getByRole('region', { name: 'Notifications' })
    expect(region.getAttribute('aria-live')).toBe('polite')
  })

  it('names the notification area with the label prop', () => {
    setup({ label: 'Alerts' })
    expect(screen.getByRole('region', { name: 'Alerts' }).getAttribute('aria-live')).toBe('polite')
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull()
  })

  it('throws a helpful error when useToast is used without a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Bad() {
      useToast()
      return null
    }
    expect(() => render(<Bad />)).toThrow(/ToastProvider/)
    spy.mockRestore()
  })

  it('shows a toast and returns its id', () => {
    const api = setup()
    let id = ''
    act(() => {
      id = api().toast({ severity: 'normal', title: 'Published', description: 'Config v43 is live.' })
    })
    expect(id).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Published')
    expect(screen.getByText('Config v43 is live.')).toBeTruthy()
  })

  it('removes a toast after 5000ms by default, after its exit animation', () => {
    const api = setup()
    act(() => void api().toast({ title: 'Saved' }))
    advance(4900)
    expect(screen.queryByText('Saved')).not.toBeNull()
    advance(200)
    expect(screen.getByRole('status').className).toContain('animate-pikore-toast-out')
    advance(250)
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('honours a custom duration, and keeps a toast open with duration 0', () => {
    const api = setup()
    act(() => {
      api().toast({ title: 'Quick', duration: 1000 })
      api().toast({ title: 'Sticky', duration: 0 })
    })
    advance(1500)
    expect(screen.queryByText('Quick')).toBeNull()
    advance(60000)
    expect(screen.queryByText('Sticky')).not.toBeNull()
  })

  it('keeps critical toasts until dismissed', () => {
    const api = setup()
    act(() => void api().toast({ severity: 'critical', title: 'Failed' }))
    advance(60000)
    expect(screen.getByRole('alert').textContent).toContain('Failed')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    advance(300)
    expect(screen.queryByText('Failed')).toBeNull()
  })

  it('treats intent="danger" like critical', () => {
    const api = setup()
    act(() => void api().toast({ intent: 'danger', title: 'Failed' }))
    advance(60000)
    expect(screen.queryByText('Failed')).not.toBeNull()
  })

  it('pauses the timer on hover and resumes on leave', () => {
    const api = setup()
    act(() => void api().toast({ title: 'Hover me' }))
    const toast = screen.getByRole('status')
    advance(2000)
    fireEvent.mouseEnter(toast)
    advance(20000)
    expect(screen.queryByText('Hover me')).not.toBeNull()
    fireEvent.mouseLeave(toast)
    advance(3500)
    expect(screen.queryByText('Hover me')).toBeNull()
  })

  it('pauses the timer while focus is inside the toast', () => {
    const api = setup()
    act(() => void api().toast({ title: 'Focus me', action: { label: 'Undo' } }))
    const button = screen.getByRole('button', { name: 'Undo' })
    act(() => button.focus())
    advance(20000)
    expect(screen.queryByText('Focus me')).not.toBeNull()
    act(() => button.blur())
    advance(5500)
    expect(screen.queryByText('Focus me')).toBeNull()
  })

  it('merges repeats with the same dedupeKey into one toast with a count', () => {
    const api = setup()
    let a = '', b = ''
    act(() => {
      a = api().toast({ severity: 'caution', title: 'Disk above 85%', dedupeKey: 'disk' })
      b = api().toast({ severity: 'caution', title: 'Disk above 85%', dedupeKey: 'disk' })
      api().toast({ severity: 'caution', title: 'Disk above 85%', dedupeKey: 'disk' })
    })
    expect(a).toBe(b)
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByText('×3')).toBeTruthy()
  })

  it('restarts the timer and brings a merged toast to the front', () => {
    const api = setup()
    act(() => {
      api().toast({ title: 'Queued', dedupeKey: 'q' })
      api().toast({ title: 'Other' })
    })
    advance(4000)
    act(() => void api().toast({ title: 'Queued', dedupeKey: 'q' }))
    // The newest toast is first in the DOM (it sits at the bottom of the pile).
    expect(screen.getAllByRole('status')[0]?.textContent).toContain('Queued')
    advance(2000)
    expect(screen.queryByText('Other')).toBeNull()
    expect(screen.queryByText('Queued')).not.toBeNull()
    advance(3500)
    expect(screen.queryByText('Queued')).toBeNull()
  })

  it('updates a toast in place when the id matches', () => {
    const api = setup()
    let id = ''
    act(() => {
      id = api().toast({ severity: 'info', title: 'Deploying', progress: 10, duration: 0 })
    })
    act(() => void api().toast({ id, title: 'Deploying', progress: 80 }))
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('80')
    expect(screen.queryByText('×2')).toBeNull()
  })

  it('runs the action and dismisses the toast', () => {
    const api = setup()
    const onClick = vi.fn()
    act(() => void api().toast({ title: 'Archived', action: { label: 'Undo', onClick } }))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    advance(300)
    expect(screen.queryByText('Archived')).toBeNull()
  })

  it('dismisses one toast by id and all toasts', () => {
    const api = setup()
    let id = ''
    act(() => {
      id = api().toast({ title: 'One', duration: 0 })
      api().toast({ title: 'Two', duration: 0 })
      api().toast({ title: 'Three', duration: 0 })
    })
    act(() => api().dismiss(id))
    advance(300)
    expect(screen.queryByText('One')).toBeNull()
    expect(screen.queryByText('Two')).not.toBeNull()
    act(() => api().dismissAll())
    advance(300)
    expect(screen.queryByText('Two')).toBeNull()
    expect(screen.queryByText('Three')).toBeNull()
  })

  it('shows at most `limit` toasts at once and tucks older ones behind the newest', () => {
    const api = setup({ limit: 2 })
    act(() => {
      api().toast({ title: 'First', duration: 0 })
      api().toast({ title: 'Second', duration: 0 })
      api().toast({ title: 'Third', duration: 0 })
    })
    const cls = (t: string) => (screen.getByText(t, { selector: 'strong' }).closest('[data-tone]')?.className ?? '').split(' ')
    expect(cls('Third')).not.toContain('hidden')
    expect(cls('Third')).not.toContain('scale-95')
    expect(cls('Second')).toContain('scale-95')
    expect(cls('First')).toContain('hidden')
  })

  it('tucks every toast behind the third when `limit` is above 3, instead of leaving them full size', () => {
    const api = setup({ limit: 5 })
    act(() => {
      for (const t of ['First', 'Second', 'Third', 'Fourth', 'Fifth']) api().toast({ title: t, duration: 0 })
    })
    const cls = (t: string) => (screen.getByText(t, { selector: 'strong' }).closest('[data-tone]')?.className ?? '').split(' ')
    // Newest first: Fifth is in front, Third sits third in the pile, First and Second are deeper than that.
    expect(cls('Fifth')).toContain('z-30')
    expect(cls('Third')).toContain('opacity-55')
    for (const deep of ['Second', 'First']) {
      expect(cls(deep)).not.toContain('hidden')
      expect(cls(deep)).toContain('z-0')
      expect(cls(deep)).toContain('scale-90')
      expect(cls(deep)).toContain('opacity-0')
      expect(cls(deep)).toContain('self-start')
    }
  })

  it('spreads the pile out while the area is hovered or focused', () => {
    const api = setup()
    act(() => {
      api().toast({ title: 'First', duration: 0 })
      api().toast({ title: 'Second', duration: 0 })
    })
    const region = screen.getByRole('region', { name: 'Notifications' })
    const tucked = () => (screen.getByText('First', { selector: 'strong' }).closest('[data-tone]')?.className ?? '').split(' ')
    expect(tucked()).toContain('scale-95')
    expect(region.className).toContain('grid')
    fireEvent.mouseEnter(region)
    expect(tucked()).not.toContain('scale-95')
    expect(region.className).toContain('flex-col-reverse')
    fireEvent.mouseLeave(region)
    expect(tucked()).toContain('scale-95')
  })

  it('starts the timer only when a hidden toast becomes visible', () => {
    const api = setup({ limit: 1 })
    let newest = ''
    act(() => {
      api().toast({ title: 'Old', duration: 3000 })
      newest = api().toast({ title: 'New', duration: 0 })
    })
    advance(10000)
    expect(screen.queryByText('Old')).not.toBeNull()
    act(() => api().dismiss(newest))
    advance(300)
    expect(screen.queryByText('New')).toBeNull()
    advance(2500)
    expect(screen.queryByText('Old')).not.toBeNull()
    advance(1000)
    expect(screen.queryByText('Old')).toBeNull()
  })

  it('shows one toast, with no duplicate key, when an id is reused during its exit animation', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const api = setup()
    act(() => void api().toast({ id: 'deploy', title: 'Deploying', duration: 0 }))
    act(() => api().dismiss('deploy'))
    advance(100)
    act(() => void api().toast({ id: 'deploy', title: 'Deploying again', duration: 0 }))
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status').className).not.toContain('animate-pikore-toast-out')
    // The first dismissal's removal timer fires later and must not take the new toast with it.
    advance(500)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.queryByText('Deploying again')).not.toBeNull()
    expect(spy.mock.calls.map((c) => String(c[0])).filter((m) => /same key|unique "key"/i.test(m))).toEqual([])
    spy.mockRestore()
  })

  describe('focus', () => {
    /** A provider next to a button that has focus first, as when a keyboard user tabs into the toasts. */
    function setupWithOutside() {
      const ref: { api?: ToastApi } = {}
      function Grab() {
        ref.api = useToast()
        return null
      }
      render(
        <>
          <button type="button">Outside</button>
          <ToastProvider>
            <Grab />
          </ToastProvider>
        </>,
      )
      const outside = screen.getByRole('button', { name: 'Outside' })
      act(() => outside.focus())
      return { api: () => ref.api as ToastApi, outside }
    }

    it('returns focus to where it was when the focused toast is removed by its action', () => {
      const { api, outside } = setupWithOutside()
      act(() => void api().toast({ title: 'Archived', action: { label: 'Undo' }, duration: 0 }))
      const undo = screen.getByRole('button', { name: 'Undo' })
      act(() => undo.focus())
      expect(document.activeElement).toBe(undo)
      fireEvent.click(undo)
      advance(300)
      expect(screen.queryByText('Archived')).toBeNull()
      expect(document.activeElement).toBe(outside)
    })

    it('moves focus to the next toast when the focused one is dismissed', () => {
      const { api } = setupWithOutside()
      act(() => {
        api().toast({ title: 'Older', duration: 0 })
        api().toast({ title: 'Newer', duration: 0 })
      })
      const dismissNewer = screen.getAllByRole('button', { name: 'Dismiss' })[0] as HTMLElement
      expect(dismissNewer.closest('[role="status"]')?.textContent).toContain('Newer')
      act(() => dismissNewer.focus())
      fireEvent.click(dismissNewer)
      advance(300)
      expect(screen.queryByText('Newer')).toBeNull()
      const remaining = screen.getByRole('button', { name: 'Dismiss' })
      expect(remaining.closest('[role="status"]')?.textContent).toContain('Older')
      expect(document.activeElement).toBe(remaining)
    })

    it('does not move focus after a mouse click, which shows no focus ring', () => {
      const { api } = setupWithOutside()
      act(() => void api().toast({ title: 'Archived', action: { label: 'Undo' }, duration: 0 }))
      const undo = screen.getByRole('button', { name: 'Undo' })
      act(() => undo.focus())
      const matches = Element.prototype.matches
      const spy = vi
        .spyOn(Element.prototype, 'matches')
        .mockImplementation(function (this: Element, selector: string) {
          return selector === ':focus-visible' ? false : matches.call(this, selector)
        })
      fireEvent.click(undo)
      advance(300)
      spy.mockRestore()
      expect(screen.queryByText('Archived')).toBeNull()
      expect(document.activeElement).toBe(document.body)
    })

    it('leaves focus alone when it is not inside the notification area', () => {
      const { api, outside } = setupWithOutside()
      act(() => void api().toast({ title: 'Quick', duration: 1000 }))
      advance(1500)
      expect(screen.queryByText('Quick')).toBeNull()
      expect(document.activeElement).toBe(outside)
    })
  })

  it('stops its timers when it unmounts', () => {
    const ref: { api?: ToastApi } = {}
    function Grab() {
      ref.api = useToast()
      return null
    }
    const { unmount } = render(
      <ToastProvider>
        <Grab />
      </ToastProvider>,
    )
    act(() => ref.api?.dismissAll())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

testExamplesAxe(examples)
