import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentPropsWithRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { GridIcon, PulseIcon } from '../icons/index.ts'
import { testExamplesAxe } from '../testing.tsx'
import { SideNav, SideNavGroup, SideNavItem } from './side-nav.tsx'
import * as examples from './side-nav.examples.tsx'

function App(props: { collapsed?: boolean }) {
  return (
    <SideNav {...props}>
      <SideNavGroup label="Monitor">
        <SideNavItem icon={<GridIcon data-testid="grid" />} href="/station" badge={{ severity: 'critical', count: 3 }} active>
          Station
        </SideNavItem>
        <SideNavItem icon={<PulseIcon />} href="/services">
          Services
        </SideNavItem>
      </SideNavGroup>
    </SideNav>
  )
}

/** Stand-in for a router link: it forwards the props it is given to its anchor. */
const Link = ({ to, ...rest }: ComponentPropsWithRef<'a'> & { to: string }) => <a href={to} {...rest} />

describe('SideNav', () => {
  it('is a navigation landmark with a default name that you can change', () => {
    const { rerender } = render(<App />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy()
    rerender(
      <SideNav aria-label="Docs">
        <SideNavGroup label="G" />
      </SideNav>,
    )
    expect(screen.getByRole('navigation', { name: 'Docs' })).toBeTruthy()
  })

  it('names each group by its heading', () => {
    render(<App />)
    const group = screen.getByRole('group', { name: 'Monitor' })
    expect(group.textContent).toContain('Station')
    expect(group.textContent).toContain('Services')
  })

  it('renders items as links and marks only the active one as the current page', () => {
    render(<App />)
    const station = screen.getByRole('link', { name: /Station/ })
    expect(station.getAttribute('href')).toBe('/station')
    expect(station.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Services' }).hasAttribute('aria-current')).toBe(false)
  })

  it('hides item icons from assistive technology', () => {
    render(<App />)
    expect(screen.getByTestId('grid').closest('[aria-hidden="true"]')).toBeTruthy()
  })

  it('shows the alert count as a number and reads the severity out', () => {
    render(<App />)
    const station = screen.getByRole('link', { name: /Station/ })
    expect(station.textContent).toBe('Station3 Critical')
    const badge = station.querySelector('[data-tone="critical"]') as HTMLElement
    expect(badge.firstChild?.textContent).toBe('3')
    expect(badge.className).toContain('bg-tone')
  })

  it('does not add a badge or a current page to a plain item', () => {
    render(<App />)
    const services = screen.getByRole('link', { name: 'Services' })
    expect(services.querySelector('[data-tone]')).toBeNull()
  })

  it('collapses to an icon rail: labels move to tooltips and stay in the accessible name', () => {
    render(<App collapsed />)
    const station = screen.getByRole('link', { name: /Station/ })
    expect(station.getAttribute('title')).toBe('Station')
    expect(station.className).toContain('size-9')
    const label = [...station.querySelectorAll('span')].find((s) => s.textContent === 'Station')
    expect(label?.className).toContain('sr-only')
    // The badge still shows its number.
    expect(station.querySelector('[data-tone="critical"]')?.textContent).toContain('3')
    expect(screen.getByRole('navigation').getAttribute('data-collapsed')).toBe('true')
  })

  it('shows the label as a tooltip on keyboard focus in a collapsed rail, without doubling the name', () => {
    render(<App collapsed />)
    const station = screen.getByRole('link', { name: /Station/ })
    const tip = [...station.querySelectorAll('span')].find((s) => s.getAttribute('aria-hidden') === 'true' && s.textContent === 'Station')
    expect(tip).toBeTruthy()
    expect(tip?.className).toContain('group-focus-visible/item:opacity-100')
    expect(tip?.className).toContain('opacity-0')
    expect(screen.queryByRole('link', { name: /Station.*Station/ })).toBeNull()
  })

  it('sets the tooltip from the text of a label that is not a plain string', () => {
    render(
      <SideNav collapsed>
        <SideNavItem icon={<GridIcon />} href="/a">
          Services {'beta'}
        </SideNavItem>
        <SideNavItem icon={<PulseIcon />} href="/b">
          <>
            Station <b>2</b>
          </>
        </SideNavItem>
      </SideNav>,
    )
    expect(screen.getAllByRole('link').map((l) => l.getAttribute('title'))).toEqual(['Services beta', 'Station 2'])
  })

  it('does not add tooltips when expanded', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Services' }).hasAttribute('title')).toBe(false)
  })

  it('hides the heading of a group in a collapsed rail, but keeps it as the group name', () => {
    render(<App collapsed />)
    expect(screen.getByRole('group', { name: 'Monitor' })).toBeTruthy()
    expect(screen.getByText('Monitor').className).toContain('sr-only')
  })

  it('indents the items of a nested group and gives it a smaller heading', () => {
    render(
      <SideNav>
        <SideNavGroup label="Components">
          <SideNavGroup label="Actions">
            <SideNavItem href="/button">Button</SideNavItem>
          </SideNavGroup>
        </SideNavGroup>
      </SideNav>,
    )
    const inner = screen.getByRole('group', { name: 'Actions' })
    expect(inner.className).toContain('pl-6')
    expect(screen.getByText('Actions').className).toContain('text-[11.5px]')
    expect(screen.getByText('Components').className).toContain('text-xs')
  })

  it('renders a button when there is no href, and runs its action', () => {
    const onClick = vi.fn()
    render(
      <SideNav>
        <SideNavItem icon={<GridIcon />} onClick={onClick}>
          Preferences
        </SideNavItem>
      </SideNav>,
    )
    const button = screen.getByRole('button', { name: 'Preferences' })
    expect(button).toHaveProperty('type', 'button')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders the child link with asChild, moving the icon, label and count inside it', () => {
    render(
      <SideNav>
        <SideNavItem asChild icon={<GridIcon />} badge={{ severity: 'advisory', count: 4 }} active className="custom">
          <a href="/router" data-testid="link">
            Services
          </a>
        </SideNavItem>
      </SideNav>,
    )
    const link = screen.getByTestId('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/router')
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(link.className).toContain('custom')
    expect(link.className).toContain('flex')
    expect(link.querySelector('svg')).toBeTruthy()
    expect(link.textContent).toBe('Services4 Advisory')
  })

  it('keeps aria-current and the item classes on a router link that forwards its props', () => {
    render(
      <SideNav>
        <SideNavItem asChild icon={<GridIcon />} active>
          <Link to="/station">Station</Link>
        </SideNavItem>
        <SideNavItem asChild icon={<PulseIcon />}>
          <Link to="/services">Services</Link>
        </SideNavItem>
      </SideNav>,
    )
    const station = screen.getByRole('link', { name: 'Station' })
    expect(station.getAttribute('href')).toBe('/station')
    expect(station.getAttribute('aria-current')).toBe('page')
    expect(station.className).toContain('flex')
    expect(station.querySelector('svg')).toBeTruthy()
    const services = screen.getByRole('link', { name: 'Services' })
    expect(services.hasAttribute('aria-current')).toBe(false)
    expect(services.className).toContain('flex')
  })

  it('marks the current page in the RouterLinks example', () => {
    render(<examples.RouterLinks />)
    const station = screen.getByRole('link', { name: /Station/ })
    expect(station.getAttribute('aria-current')).toBe('page')
    expect(station.className).toContain('flex')
    expect(screen.getByRole('link', { name: /Services/ }).hasAttribute('aria-current')).toBe(false)
  })

  it('renders a normal item when asChild has no element to render', () => {
    render(
      <SideNav>
        <SideNavItem asChild href="/plain">
          Plain
        </SideNavItem>
      </SideNav>,
    )
    const link = screen.getByRole('link', { name: 'Plain' })
    expect(link.getAttribute('href')).toBe('/plain')
    expect(link.className).toContain('flex')
  })

  it('lets an explicit aria-current win over active', () => {
    render(
      <SideNav>
        <SideNavItem href="/x" aria-current="location" active>
          X
        </SideNavItem>
      </SideNav>,
    )
    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('location')
  })

  it('merges className on the nav', () => {
    render(<SideNav className="w-60" data-testid="nav" />)
    expect(screen.getByTestId('nav').className).toContain('w-60')
  })
})

testExamplesAxe(examples)
