import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Card, CardBody, CardFooter, CardHeader } from './card.tsx'
import * as examples from './card.examples.tsx'

describe('Card', () => {
  it('renders the title as an h4 heading by default', () => {
    render(<Card title="On call">Body</Card>)
    expect(screen.getByRole('heading', { level: 4, name: 'On call' })).toBeTruthy()
  })

  it('sets the heading level with `as`', () => {
    render(
      <Card as="h2" title="Deploys">
        Body
      </Card>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Deploys' })).toBeTruthy()
  })

  it('shows the action in the header and the footer after the body', () => {
    const { container } = render(
      <Card title="T" action={<button>Act</button>} footer={<button>Done</button>}>
        <p>Body text</p>
      </Card>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.children).toHaveLength(3)
    const [header, body, footer] = Array.from(root.children)
    expect(header?.textContent).toBe('TAct')
    expect(body?.textContent).toBe('Body text')
    expect(footer?.textContent).toBe('Done')
    expect(screen.getByRole('button', { name: 'Act' }).parentElement?.className).toContain('ml-auto')
  })

  it('has no header or footer when title, action and footer are not set', () => {
    const { container } = render(<Card>Only body</Card>)
    const root = container.firstElementChild as HTMLElement
    expect(root.querySelector('h4')).toBeNull()
    expect(root.children).toHaveLength(1)
    expect(root.textContent).toBe('Only body')
  })

  it('treats an empty title as no title, so there is never an empty heading', () => {
    render(<Card title="">Body</Card>)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('shows the header for an action without a title', () => {
    render(<Card action={<button>Menu</button>}>Body</Card>)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeTruthy()
  })

  it('does not add a second body wrapper around composed parts', () => {
    const { container } = render(
      <Card>
        <CardHeader>Head</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Foot</CardFooter>
      </Card>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(Array.from(root.children).map((c) => c.textContent)).toEqual(['Head', 'Body', 'Foot'])
  })

  it('merges className and passes other props to the root', () => {
    const { container } = render(
      <Card className="w-96" id="c1">
        x
      </Card>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('w-96')
    expect(root.className).toContain('bg-surface-raised')
    expect(root.id).toBe('c1')
  })
})

testExamplesAxe(examples)
