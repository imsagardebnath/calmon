import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { testExamplesAxe } from '../testing.tsx'
import { Tab, Tabs, TabsList, TabsPanel } from './tabs.tsx'
import * as examples from './tabs.examples.tsx'

function Basic(props: { onValueChange?: (v: string) => void; defaultValue?: string; value?: string }) {
  return (
    <Tabs defaultValue="a" aria-label="Sections" {...props}>
      <Tab value="a">Alpha</Tab>
      <Tab value="b">Beta</Tab>
      <Tab value="c" disabled>
        Gamma
      </Tab>
      <Tab value="d">Delta</Tab>
    </Tabs>
  )
}

const selected = () => screen.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')

describe('Tabs', () => {
  it('renders a named tablist of tabs with the default one selected', () => {
    render(<Basic />)
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeTruthy()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('selects a tab on click and reports it', () => {
    const onValueChange = vi.fn()
    render(<Basic onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(selected().map((t) => t.textContent)).toEqual(['Beta'])
  })

  it('does not select a disabled tab', () => {
    render(<Basic />)
    fireEvent.click(screen.getByRole('tab', { name: 'Gamma' }))
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('uses a roving tabindex: only the selected tab is tabbable', () => {
    render(<Basic />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1, -1])
    fireEvent.click(tabs[1]!)
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1, -1])
  })

  it('moves with the arrow keys, skipping disabled tabs and wrapping', () => {
    render(<Basic />)
    const tab = (name: string) => screen.getByRole('tab', { name })
    tab('Alpha').focus()
    fireEvent.keyDown(tab('Alpha'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab('Beta'))
    expect(selected().map((t) => t.textContent)).toEqual(['Beta'])
    fireEvent.keyDown(tab('Beta'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab('Delta'))
    fireEvent.keyDown(tab('Delta'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab('Alpha'))
    fireEvent.keyDown(tab('Alpha'), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tab('Delta'))
  })

  it('jumps to the first and last tab with Home and End', () => {
    render(<Basic defaultValue="b" />)
    const tab = (name: string) => screen.getByRole('tab', { name })
    tab('Beta').focus()
    fireEvent.keyDown(tab('Beta'), { key: 'End' })
    expect(document.activeElement).toBe(tab('Delta'))
    fireEvent.keyDown(tab('Delta'), { key: 'Home' })
    expect(document.activeElement).toBe(tab('Alpha'))
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('is controlled by value', () => {
    function Host() {
      const [v, setV] = useState('a')
      return (
        <>
          <Basic value={v} onValueChange={setV} />
          <output>{v}</output>
        </>
      )
    }
    render(<Host />)
    fireEvent.click(screen.getByRole('tab', { name: 'Delta' }))
    expect(screen.getByRole('status').textContent).toBe('d')
    expect(selected().map((t) => t.textContent)).toEqual(['Delta'])
  })

  it('stays put when controlled and the parent ignores the change', () => {
    render(<Basic value="a" onValueChange={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('links each tab to its panel with aria-controls and aria-labelledby', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <Tab value="a">Alpha</Tab>
          <Tab value="b">Beta</Tab>
        </TabsList>
        <TabsPanel value="a">Alpha content</TabsPanel>
        <TabsPanel value="b">Beta content</TabsPanel>
      </Tabs>,
    )
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    const panel = screen.getByRole('tabpanel', { name: 'Alpha' })
    expect(alpha.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(alpha.id)
    expect(panel.textContent).toBe('Alpha content')
    expect(screen.queryByText('Beta content')).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(screen.getByRole('tabpanel', { name: 'Beta' }).textContent).toBe('Beta content')
    expect(screen.queryByText('Alpha content')).toBeNull()
  })

  it('omits aria-controls when there is no panel', () => {
    render(<Basic />)
    for (const tab of screen.getAllByRole('tab')) expect(tab.hasAttribute('aria-controls')).toBe(false)
  })

  it('styles the segmented variant differently', () => {
    render(
      <Tabs variant="segmented" defaultValue="a">
        <Tab value="a">1h</Tab>
      </Tabs>,
    )
    expect(screen.getByRole('tablist').className).toContain('rounded-[9px]')
  })

  it('shows a count with the severity name for screen readers', () => {
    render(
      <Tabs defaultValue="a">
        <Tab value="a" count={3} severity="critical">
          Alerts
        </Tab>
      </Tabs>,
    )
    const tab = screen.getByRole('tab')
    expect(tab.textContent).toBe('Alerts3 Critical')
    expect(tab.querySelector('[data-tone="critical"]')).toBeTruthy()
  })

  it('shows a dot, still named, when severity has no count', () => {
    render(
      <Tabs defaultValue="a">
        <Tab value="a" severity="advisory">
          Notes
        </Tab>
      </Tabs>,
    )
    expect(screen.getByRole('tab').textContent).toBe('Notes Advisory')
    expect(screen.getByRole('tab').querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('merges className and spreads props on the tab list', () => {
    render(
      <Tabs defaultValue="a" className="mt-4" data-testid="short">
        <Tab value="a">A</Tab>
      </Tabs>,
    )
    expect(screen.getByTestId('short').className).toContain('mt-4')
    expect(screen.getByTestId('short').className).toContain('border-b')
  })

  it('lets a Tab onClick that calls preventDefault veto the selection', () => {
    const onValueChange = vi.fn()
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <Tab value="a">Alpha</Tab>
        <Tab value="b" onClick={(e) => e.preventDefault()}>
          Beta
        </Tab>
      </Tabs>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('lets a TabsList onKeyDown that calls preventDefault veto arrow navigation', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections" onKeyDown={(e) => e.preventDefault()}>
          <Tab value="a">Alpha</Tab>
          <Tab value="b">Beta</Tab>
        </TabsList>
      </Tabs>,
    )
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(alpha)
    expect(selected().map((t) => t.textContent)).toEqual(['Alpha'])
  })

  it('leaves every tab in the tab order while nothing is selected', () => {
    render(
      <Tabs aria-label="Sections">
        <Tab value="a">Alpha</Tab>
        <Tab value="b">Beta</Tab>
        <Tab value="c">Gamma</Tab>
      </Tabs>,
    )
    expect(selected()).toHaveLength(0)
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, 0, 0])
  })

  it('keeps the tabs reachable with the keyboard when the value matches no tab', () => {
    render(
      <Tabs value="unknown" onValueChange={() => {}} aria-label="Sections">
        <Tab value="a">Alpha</Tab>
        <Tab value="b">Beta</Tab>
        <Tab value="c" disabled>
          Gamma
        </Tab>
      </Tabs>,
    )
    expect(selected()).toHaveLength(0)
    const [alpha, beta] = screen.getAllByRole('tab')
    expect(alpha?.tabIndex).toBe(0)
    expect(beta?.tabIndex).toBe(0)
  })

  it('keeps the tabs reachable when the value is a disabled tab', () => {
    render(
      <Tabs value="c" onValueChange={() => {}} aria-label="Sections">
        <Tab value="a">Alpha</Tab>
        <Tab value="b">Beta</Tab>
        <Tab value="c" disabled>
          Gamma
        </Tab>
      </Tabs>,
    )
    const [alpha, beta] = screen.getAllByRole('tab')
    expect(alpha?.tabIndex).toBe(0)
    expect(beta?.tabIndex).toBe(0)
  })

  it('goes back to a single tab stop once the value matches a tab', () => {
    function Host() {
      const [v, setV] = useState('unknown')
      return (
        <Tabs value={v} onValueChange={setV} aria-label="Sections">
          <Tab value="a">Alpha</Tab>
          <Tab value="b">Beta</Tab>
        </Tabs>
      )
    }
    render(<Host />)
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, 0])
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([-1, 0])
  })

  it('throws a clear error when a Tab is used outside Tabs', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Tab value="a">A</Tab>)).toThrow(/inside <Tabs>/)
    quiet.mockRestore()
  })
})

testExamplesAxe(examples)
