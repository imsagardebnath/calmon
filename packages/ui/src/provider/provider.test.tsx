import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CalmonProvider, useCalmon, type CalmonContextValue, type CalmonProviderProps } from './index.ts'

const html = document.documentElement

/** A controllable stand-in for `matchMedia('(prefers-color-scheme: dark)')`. jsdom has none. */
function stubMatchMedia(dark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  const mq = {
    matches: dark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_type: string, fn: (e: MediaQueryListEvent) => void) => void listeners.add(fn)),
    removeEventListener: vi.fn((_type: string, fn: (e: MediaQueryListEvent) => void) => void listeners.delete(fn)),
  }
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: vi.fn(() => mq) })
  return {
    mq,
    listeners,
    change(next: boolean) {
      mq.matches = next
      act(() => listeners.forEach((fn) => fn({ matches: next } as MediaQueryListEvent)))
    },
  }
}

/** Renders the context into the page and keeps the latest value for the tests to call. */
function setup(props: CalmonProviderProps = {}) {
  const renders: CalmonContextValue[] = []
  function Probe() {
    const calmon = useCalmon()
    renders.push(calmon)
    return (
      <p data-testid="probe">
        {calmon.theme}|{calmon.resolvedTheme}|{calmon.density}
      </p>
    )
  }
  const view = render(
    <CalmonProvider {...props}>
      <Probe />
    </CalmonProvider>,
  )
  return {
    ...view,
    renders,
    api: () => renders[renders.length - 1]!,
    text: () => screen.getByTestId('probe').textContent,
    rerenderWith: (next: CalmonProviderProps) =>
      view.rerender(
        <CalmonProvider {...next}>
          <Probe />
        </CalmonProvider>,
      ),
  }
}

/** Records every change to the class of <html>, so a class that is removed and added back shows up. */
function watchHtmlClass() {
  const observer = new MutationObserver(() => {})
  observer.observe(html, { attributes: true, attributeFilter: ['class'], attributeOldValue: true })
  return { take: () => observer.takeRecords(), stop: () => observer.disconnect() }
}

beforeEach(() => {
  localStorage.clear()
  html.className = ''
  html.removeAttribute('data-density')
})

afterEach(() => {
  vi.restoreAllMocks()
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('useCalmon', () => {
  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Outside() {
      useCalmon()
      return null
    }
    expect(() => render(<Outside />)).toThrow(/CalmonProvider/)
  })
})

describe('theme', () => {
  it('sets the dark class from an explicit theme', () => {
    stubMatchMedia(false)
    const view = setup({ theme: 'dark' })
    expect(html.classList.contains('dark')).toBe(true)
    expect(view.text()).toBe('dark|dark|comfortable')
    view.unmount()
    const light = setup({ theme: 'light' })
    expect(html.classList.contains('dark')).toBe(false)
    expect(light.text()).toBe('light|light|comfortable')
  })

  it('follows the operating system for "system", including changes while mounted', () => {
    const media = stubMatchMedia(true)
    const view = setup()
    expect(view.text()).toBe('system|dark|comfortable')
    expect(html.classList.contains('dark')).toBe(true)

    media.change(false)
    expect(view.text()).toBe('system|light|comfortable')
    expect(html.classList.contains('dark')).toBe(false)

    media.change(true)
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('stops listening to the operating system on unmount', () => {
    const media = stubMatchMedia(false)
    const view = setup()
    expect(media.listeners.size).toBe(1)
    view.unmount()
    expect(media.mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(media.listeners.size).toBe(0)
  })

  it('works where matchMedia does not exist, and treats the system as light', () => {
    expect(typeof window.matchMedia).toBe('undefined')
    const view = setup()
    expect(view.text()).toBe('system|light|comfortable')
    expect(html.classList.contains('dark')).toBe(false)
  })

  it('does not strip a dark class that was set before hydration while it works out the system theme', () => {
    stubMatchMedia(true)
    localStorage.setItem('calmon-theme', 'system')
    html.classList.add('dark')
    const watch = watchHtmlClass()
    setup()
    expect(watch.take()).toEqual([])
    watch.stop()
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('does not apply the theme prop first when a different choice was remembered', () => {
    stubMatchMedia(false)
    localStorage.setItem('calmon-theme', 'light')
    const watch = watchHtmlClass()
    const view = setup({ theme: 'dark' })
    expect(watch.take()).toEqual([])
    watch.stop()
    expect(html.classList.contains('dark')).toBe(false)
    expect(view.text()).toBe('light|light|comfortable')
  })
})

describe('persistence', () => {
  it('renders the theme prop first, then switches to the remembered choice after mount', () => {
    stubMatchMedia(false)
    localStorage.setItem('calmon-theme', 'dark')
    const view = setup({ theme: 'light' })
    // The first render must match what a server (which has no localStorage) renders.
    expect(view.renders[0]!.theme).toBe('light')
    expect(view.text()).toBe('dark|dark|comfortable')
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('remembers setTheme under the storage key and applies it', () => {
    stubMatchMedia(false)
    const view = setup({ theme: 'light', storageKey: 'my-theme' })
    act(() => view.api().setTheme('dark'))
    expect(localStorage.getItem('my-theme')).toBe('dark')
    expect(localStorage.getItem('calmon-theme')).toBeNull()
    expect(view.text()).toBe('dark|dark|comfortable')
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('does not read or write storage when storageKey is false', () => {
    stubMatchMedia(false)
    localStorage.setItem('calmon-theme', 'dark')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const view = setup({ theme: 'light', storageKey: false })
    expect(view.text()).toBe('light|light|comfortable')
    act(() => view.api().setTheme('dark'))
    expect(setItem).not.toHaveBeenCalled()
    expect(view.text()).toBe('dark|dark|comfortable')
  })

  it('ignores a remembered value that is not a theme', () => {
    stubMatchMedia(false)
    localStorage.setItem('calmon-theme', 'purple')
    const view = setup({ theme: 'light' })
    expect(view.text()).toBe('light|light|comfortable')
  })

  it('keeps working when storage throws', () => {
    stubMatchMedia(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const view = setup({ theme: 'light' })
    expect(view.text()).toBe('light|light|comfortable')
    act(() => view.api().setTheme('dark'))
    expect(view.text()).toBe('dark|dark|comfortable')
    expect(html.classList.contains('dark')).toBe(true)
  })
})

describe('density', () => {
  it('sets data-density on <html> and follows the prop and setDensity', () => {
    stubMatchMedia(false)
    const view = setup({ density: 'compact' })
    expect(html.dataset.density).toBe('compact')
    expect(view.text()).toBe('system|light|compact')

    act(() => view.api().setDensity('station'))
    expect(html.dataset.density).toBe('station')

    view.rerenderWith({ density: 'comfortable' })
    expect(html.dataset.density).toBe('comfortable')
  })

  it('defaults to comfortable', () => {
    stubMatchMedia(false)
    setup()
    expect(html.dataset.density).toBe('comfortable')
  })
})
