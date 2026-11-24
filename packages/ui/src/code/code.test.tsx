import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Code, CodeBlock } from './code.tsx'
import * as examples from './code.examples.tsx'

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return writeText
}

/** Types of the highlighted tokens, as [type, text] pairs. */
function tokens(container: HTMLElement) {
  return Array.from(container.querySelectorAll('pre [data-t]')).map((s) => [(s as HTMLElement).dataset.t, s.textContent])
}

describe('Code block', () => {
  beforeEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('renders the code in a pre, with the language as the header label by default', () => {
    const { container } = render(<Code>{'const a = 1'}</Code>)
    expect(container.querySelector('pre code')?.textContent).toBe('const a = 1')
    expect(screen.getByText('tsx')).toBeTruthy()
    expect(container.querySelector('pre')?.className).toContain('overflow-x-auto')
  })

  it('shows a custom label instead of the language', () => {
    render(<Code label="Terminal">{'ls'}</Code>)
    expect(screen.getByText('Terminal')).toBeTruthy()
    expect(screen.queryByText('tsx')).toBeNull()
  })

  it('lets keyboard users focus the scrollable code', () => {
    const { container } = render(<Code>{'x'}</Code>)
    expect(container.querySelector('pre')?.getAttribute('tabindex')).toBe('0')
  })

  it('copies the code, announces "Copied", and resets after a moment', async () => {
    vi.useFakeTimers()
    const writeText = mockClipboard()
    render(<Code language="bash">{'npm install @calmon/react\n'}</Code>)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(writeText).toHaveBeenCalledWith('npm install @calmon/react')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Copied')
    expect(status.getAttribute('aria-live')).toBe('polite')
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('leaves a leading shell prompt out of the copied text, but keeps it on screen', async () => {
    const writeText = mockClipboard()
    const { container, unmount } = render(<Code language="bash">{'$ npm install @calmon/react\n$ npm run dev\nready on :5173'}</Code>)
    expect(container.querySelector('pre')?.textContent).toBe('$ npm install @calmon/react\n$ npm run dev\nready on :5173')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(writeText).toHaveBeenLastCalledWith('npm install @calmon/react\nnpm run dev\nready on :5173')
    unmount()
    // Other languages are copied as written, and a "$" that is not a prompt stays.
    render(<Code language="tsx">{'$ x = 1'}</Code>)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(writeText).toHaveBeenLastCalledWith('$ x = 1')
  })

  it('swaps the copy icon for a check icon after copying', async () => {
    mockClipboard()
    const { container } = render(<Code language="bash">{'ls'}</Code>)
    const button = screen.getByRole('button', { name: 'Copy' })
    const before = button.querySelector('svg')?.innerHTML
    expect(before).toContain('<rect')
    await act(async () => {
      fireEvent.click(button)
    })
    const after = screen.getByRole('button', { name: 'Copied' }).querySelector('svg')
    expect(after?.getAttribute('aria-hidden')).toBe('true')
    expect(after?.innerHTML).not.toContain('<rect')
    expect(container.querySelectorAll('button svg')).toHaveLength(1)
  })

  it('does not say "Copied" when the clipboard is unavailable or refuses', async () => {
    render(<Code>{'x'}</Code>)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy()
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('has no copy button when copyable is false, and no header without a label', () => {
    const { container } = render(<Code copyable={false}>{'x'}</Code>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.firstElementChild?.children).toHaveLength(1)
  })

  it('keeps the header when copyable is false but a label is set', () => {
    render(
      <Code copyable={false} label="app.css">
        {'x'}
      </Code>,
    )
    expect(screen.getByText('app.css')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('merges className and passes props to the root', () => {
    const { container } = render(
      <Code className="w-64" id="c">
        {'x'}
      </Code>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('w-64')
    expect(root.className).toContain('bg-surface-sunken')
    expect(root.id).toBe('c')
  })

  it('CodeBlock is a block with the same props', () => {
    const { container } = render(<CodeBlock language="bash">{'ls'}</CodeBlock>)
    expect(container.querySelector('pre')).not.toBeNull()
  })
})

describe('Code inline', () => {
  it('renders a small code element with no header, button or highlighting', () => {
    const { container } = render(<Code inline>{'severity="critical"'}</Code>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('CODE')
    expect(el.textContent).toBe('severity="critical"')
    expect(el.querySelector('[data-t]')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(el.className).toContain('font-mono')
  })
})

describe('syntax highlighting', () => {
  it('colours keywords, strings and comments in tsx, and keeps the text intact', () => {
    const src = "import { Button } from '@calmon/react' // ui\nconst n = 1"
    const { container } = render(<Code>{src}</Code>)
    expect(container.querySelector('pre')?.textContent).toBe(src)
    expect(tokens(container)).toEqual([
      ['k', 'import'],
      ['k', 'from'],
      ['s', "'@calmon/react'"],
      ['c', '// ui'],
      ['k', 'const'],
    ])
  })

  it('colours JSX tags, attributes and the end of the tag', () => {
    const { container } = render(<Code>{'<Button variant="primary" loading>Save</Button>'}</Code>)
    expect(tokens(container)).toEqual([
      ['t', '<Button'],
      ['a', 'variant'],
      ['s', '"primary"'],
      ['t', '>'],
      ['t', '</Button'],
      ['t', '>'],
    ])
  })

  it('handles self-closing and nested tags, and does not treat arrows or generics as tags', () => {
    const { container } = render(
      <Code>{'<Icon a={<Dot />} onClick={() => go()} />\nconst [x] = useState<string>("")'}</Code>,
    )
    expect(tokens(container)).toEqual([
      ['t', '<Icon'],
      ['a', 'a'],
      ['t', '<Dot'],
      ['t', '/>'],
      ['a', 'onClick'],
      ['t', '/>'],
      ['k', 'const'],
      ['k', 'string'],
      ['s', '""'],
    ])
  })

  it('does not colour comparison operators as tags', () => {
    const { container } = render(<Code>{'if (a < b && c > d) {}'}</Code>)
    expect(tokens(container)).toEqual([['k', 'if']])
  })

  it('highlights json keys, strings and literals', () => {
    const { container } = render(<Code language="json">{'{ "ok": true, "name": "x", "n": null }'}</Code>)
    expect(tokens(container)).toEqual([
      ['a', '"ok"'],
      ['k', 'true'],
      ['a', '"name"'],
      ['s', '"x"'],
      ['a', '"n"'],
      ['k', 'null'],
    ])
  })

  it('highlights css at-rules, properties, selectors, colours and comments', () => {
    const src = '@media print { .card:hover { color: #0F766E; /* teal */ } }'
    const { container } = render(<Code language="css">{src}</Code>)
    expect(tokens(container)).toEqual([
      ['k', '@media'],
      ['t', '.card'],
      ['a', 'color'],
      ['s', '#0F766E'],
      ['c', '/* teal */'],
    ])
  })

  it('highlights bash prompts, flags, variables, strings and comments', () => {
    const { container } = render(<Code language="bash">{'$ npm i -D pkg --save "$HOME" # note'}</Code>)
    expect(tokens(container)).toEqual([
      ['c', '$'],
      ['a', '-D'],
      ['a', '--save'],
      ['s', '"$HOME"'],
      ['c', '# note'],
    ])
  })

  it('does not treat // in a bash URL as a comment', () => {
    const { container } = render(<Code language="bash">{'curl https://example.com/a'}</Code>)
    expect(tokens(container)).toEqual([])
  })

  it('leaves unknown languages as plain text', () => {
    const { container } = render(<Code language="text">{'const a = "b"'}</Code>)
    expect(tokens(container)).toEqual([])
    expect(container.querySelector('pre')?.textContent).toBe('const a = "b"')
  })

  it('maps the token types to token colours on the root', () => {
    const { container } = render(<Code>{'x'}</Code>)
    const cls = (container.firstElementChild as HTMLElement).className
    for (const c of ['text-info-fg', 'text-normal-fg', 'text-fg-subtle', 'text-accent-fg', 'text-advisory-fg']) {
      expect(cls).toContain(c)
    }
  })
})

testExamplesAxe(examples)
