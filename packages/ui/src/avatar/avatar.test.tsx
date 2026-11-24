import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Avatar, AvatarGroup } from './avatar.tsx'
import * as examples from './avatar.examples.tsx'

describe('Avatar', () => {
  it('shows initials and takes its accessible name from the name', () => {
    render(<Avatar name="Priya Shah" />)
    const el = screen.getByRole('img', { name: 'Priya Shah' })
    expect(el.textContent).toBe('PS')
  })

  it('builds initials from the first and last word, or two letters of a single word', () => {
    render(
      <>
        <Avatar name="R. Iyer" />
        <Avatar name="Ana Maria Lopez" />
        <Avatar name="Platform" />
        <Avatar name="kim" />
      </>,
    )
    expect(screen.getByRole('img', { name: 'R. Iyer' }).textContent).toBe('RI')
    expect(screen.getByRole('img', { name: 'Ana Maria Lopez' }).textContent).toBe('AL')
    expect(screen.getByRole('img', { name: 'Platform' }).textContent).toBe('PL')
    expect(screen.getByRole('img', { name: 'kim' }).textContent).toBe('KI')
  })

  it('picks the same tint for the same name, and never an alert colour', () => {
    const tones = new Set<string>()
    const names = ['Priya Shah', 'Lena Torres', 'Maya Rao', 'Jo Okafor', 'Alex Kaur', 'Ravi Iyer', 'Sam Lee', 'Dee Wu']
    for (const name of names) {
      const first = render(<Avatar name={name} />)
      const tone = screen.getByRole('img').dataset.tone
      first.unmount()
      const second = render(<Avatar name={name} />)
      expect(screen.getByRole('img').dataset.tone).toBe(tone)
      second.unmount()
      tones.add(tone ?? '')
    }
    expect(tones.size).toBeGreaterThan(1)
    expect(tones.has('caution')).toBe(false)
    expect(tones.has('critical')).toBe(false)
  })

  it('adds the presence status to the accessible name', () => {
    render(
      <>
        <Avatar name="Alex Kaur" status="online" />
        <Avatar name="Jo Okafor" status="away" />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Alex Kaur, online' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Jo Okafor, away' })).toBeTruthy()
  })

  it('hides the status dot from screen readers', () => {
    render(<Avatar name="Alex Kaur" status="online" />)
    const dot = screen.getByRole('img').querySelector('[aria-hidden="true"]')
    expect(dot).not.toBeNull()
  })

  it('uses sizes sm, md and lg', () => {
    render(
      <>
        <Avatar name="A B" size="sm" />
        <Avatar name="C D" size="md" />
        <Avatar name="E F" size="lg" />
      </>,
    )
    expect(screen.getByRole('img', { name: 'A B' }).className).toContain('size-6')
    expect(screen.getByRole('img', { name: 'C D' }).className).toContain('size-8')
    expect(screen.getByRole('img', { name: 'E F' }).className).toContain('size-11')
  })

  it('shows the image when src is set, and falls back to initials if it fails', () => {
    const { container } = render(<Avatar name="Priya Shah" src="/p.png" />)
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('/p.png')
    expect(img?.getAttribute('alt')).toBe('')
    fireEvent.error(img as HTMLImageElement)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Priya Shah' }).textContent).toBe('PS')
  })

  it('lets className and aria-label override the defaults', () => {
    render(<Avatar name="Priya Shah" className="shadow-none" aria-label="Owner" />)
    const el = screen.getByRole('img', { name: 'Owner' })
    expect(el.className).toContain('shadow-none')
    expect(el.className).not.toContain('inset_0_0_0_1px')
  })
})

describe('AvatarGroup', () => {
  const team = [{ name: 'Ana One' }, { name: 'Ben Two' }, { name: 'Cy Three' }, { name: 'Di Four' }, { name: 'Ed Five' }]

  it('shows max avatars and a +N tail that names the rest', () => {
    render(<AvatarGroup people={team} max={2} />)
    expect(screen.getByRole('img', { name: 'Ana One' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Ben Two' })).toBeTruthy()
    expect(screen.queryByRole('img', { name: 'Cy Three' })).toBeNull()
    const tail = screen.getByRole('img', { name: '3 more: Cy Three, Di Four, Ed Five' })
    expect(tail.textContent).toBe('+3')
  })

  it('has no tail when everyone fits, and defaults max to 4', () => {
    const { rerender } = render(<AvatarGroup people={team.slice(0, 3)} />)
    expect(screen.queryByText(/^\+/)).toBeNull()
    rerender(<AvatarGroup people={team} />)
    expect(screen.getAllByRole('img')).toHaveLength(5)
    expect(screen.getByText('+1')).toBeTruthy()
  })

  it('overlaps the avatars with a surface-coloured ring instead of the inset border', () => {
    render(<AvatarGroup people={team} max={2} size="sm" />)
    const el = screen.getByRole('img', { name: 'Ben Two' })
    expect(el.className).toContain('-ml-2')
    expect(el.className).toContain('0_0_0_2px_var(--surface-raised)')
    expect(el.className).not.toContain('inset_0_0_0_1px')
    expect(el.className).toContain('size-6')
  })

  it('passes only name, status and src to each avatar, so extra fields cannot override it', () => {
    // People often come straight from an API, with more fields than the three that are documented.
    const people = [
      { name: 'Ana One', status: 'online' as const, id: 'u1', email: 'ana@example.com', role: 'presentation', className: 'bg-critical', title: 'Boss' },
      { name: 'Ben Two', 'aria-label': 'Hijacked', 'data-tone': 'critical' },
    ]
    render(<AvatarGroup people={people} />)
    const ana = screen.getByRole('img', { name: 'Ana One, online' })
    expect(ana.getAttribute('role')).toBe('img')
    expect(ana.className).toContain('-ml-2')
    expect(ana.className).not.toContain('bg-critical')
    expect(ana.hasAttribute('id')).toBe(false)
    expect(ana.hasAttribute('title')).toBe(false)
    expect(ana.hasAttribute('email')).toBe(false)
    const ben = screen.getByRole('img', { name: 'Ben Two' })
    expect(ben.dataset.tone).not.toBe('critical')
  })
})

testExamplesAxe(examples)
