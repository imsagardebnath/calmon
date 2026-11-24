import { useState, type CSSProperties } from 'react'
import { Badge } from '@openvanta/calmon-react/badge'
import { Button } from '@openvanta/calmon-react/button'
import { Code } from '@openvanta/calmon-react/code'
import { Input } from '@openvanta/calmon-react/input'
import { useCalmon, type Density, type Theme } from '@openvanta/calmon-react/provider'
import { Tab, Tabs, TabsList } from '@openvanta/calmon-react/tabs'
import { Callout, ExampleBox, Lead } from '../../site/doc.tsx'
import { DENSITIES, useDensityChoice } from '../../site/Header.tsx'
import { docsHref } from '../../site/router.ts'

interface Accent {
  accent: string
  on: string
  soft: string
  fg: string
  border: string
}
interface Preset {
  name: string
  light: Accent
  dark: Accent
}

const PRESETS: Preset[] = [
  {
    name: 'Teal',
    light: { accent: '#0F766E', on: '#FFFFFF', soft: '#E7F4F2', fg: '#0D6961', border: '#B3DDD6' },
    dark: { accent: '#2CC5B3', on: '#04201C', soft: '#0B2422', fg: '#5FE0CE', border: '#1A4D47' },
  },
  {
    name: 'Indigo',
    light: { accent: '#4F46E5', on: '#FFFFFF', soft: '#EEF0FD', fg: '#3F37C9', border: '#C7CBF7' },
    dark: { accent: '#8B93FF', on: '#0B0E2A', soft: '#171A3A', fg: '#A9AFFF', border: '#343A7A' },
  },
  {
    name: 'Violet',
    light: { accent: '#7C3AED', on: '#FFFFFF', soft: '#F3EEFE', fg: '#6D28D9', border: '#D8C8F8' },
    dark: { accent: '#A78BFA', on: '#170B33', soft: '#1D1535', fg: '#C4B0FD', border: '#4A3A85' },
  },
]

const vars = (a: Accent): CSSProperties =>
  ({
    '--accent': a.accent,
    '--accent-on': a.on,
    '--accent-soft': a.soft,
    '--accent-fg': a.fg,
    '--accent-border': a.border,
    '--ring': a.accent,
  }) as CSSProperties

const block = (selector: string, a: Accent) =>
  `${selector} {\n  --accent: ${a.accent}; --accent-on: ${a.on};\n  --accent-soft: ${a.soft}; --accent-fg: ${a.fg}; --accent-border: ${a.border};\n}`

const TAILWIND = `@import "tailwindcss";
@import "@openvanta/calmon-react/styles.css";

/* styles.css already maps every token to Tailwind. To expose your own, do the same: */
@custom-variant dark (&:where(.dark, .dark *));
@theme inline {
  --color-brand: var(--brand);
  --color-brand-soft: var(--brand-soft);
  --radius-card: var(--radius-card);
}`

const RADIUS = `:root {
  --radius-control: 6px;  /* buttons, inputs, menus (default 8px) */
  --radius-card: 10px;    /* cards, dialogs, popovers (default 14px) */
}`

const DENSITY_CODE = `<CalmonProvider density="compact">…</CalmonProvider>

{/* or on any container */}
<div data-density="station">…</div>`

export default function Theming() {
  const { theme, setTheme, resolvedTheme } = useCalmon()
  const [density, setDensity] = useDensityChoice()
  const [preset, setPreset] = useState('Teal')
  const chosen = PRESETS.find((p) => p.name === preset) ?? PRESETS[0]!
  const active = resolvedTheme === 'dark' ? chosen.dark : chosen.light

  return (
    <>
      <h2>Light and dark</h2>
      <Lead>
        Both themes are designed together and pass the same contrast checks. <code>theme=&quot;system&quot;</code> follows the
        device; people can switch with the toggle in the header. Severity colours shift lightness between themes so they stay
        distinguishable on both.
      </Lead>
      <Tabs variant="segmented" value={theme} onValueChange={(v) => setTheme(v as Theme)}>
        <TabsList aria-label="Theme">
          <Tab value="light">Light</Tab>
          <Tab value="dark">Dark</Tab>
          <Tab value="system">System</Tab>
        </TabsList>
      </Tabs>

      <h2>Change the accent</h2>
      <Lead>
        Override the accent tokens for both themes. Keep <code>--accent-on</code> at 4.5:1 against the fill. Try a preset: the
        preview below is scoped to the box, so the rest of the site keeps its colour.
      </Lead>
      <Tabs variant="segmented" value={preset} onValueChange={setPreset}>
        <TabsList aria-label="Accent preset">
          {PRESETS.map((p) => (
            <Tab key={p.name} value={p.name}>
              {p.name}
            </Tab>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-3" style={vars(active)}>
        <ExampleBox
          label="theme.css"
          language="css"
          code={`${block(':root', chosen.light)}\n${block('.dark', chosen.dark)}`}
        >
          <Button variant="primary">Save changes</Button>
          <Button>Cancel</Button>
          <Badge intent="primary">Accent</Badge>
          <a className="textlink text-ui-sm" href={docsHref('colour')}>
            A link
          </a>
          <Input aria-label="Sample field" defaultValue="Focus me" className="w-40" />
        </ExampleBox>
      </div>

      <h2>Tailwind v4 mapping</h2>
      <Lead>
        Tokens are plain CSS variables, and <code>styles.css</code> maps them into Tailwind&rsquo;s theme, so classes such as{' '}
        <code>bg-surface</code>, <code>text-fg-muted</code> and <code>bg-critical-soft</code> just work.
      </Lead>
      <Code language="css" label="app.css">
        {TAILWIND}
      </Code>

      <h2>Radius</h2>
      <Lead>
        Two radii and a pill. Change the two tokens and every component follows.
      </Lead>
      <Code language="css" label="theme.css">
        {RADIUS}
      </Code>

      <h2>Density</h2>
      <Lead>
        Set density on the provider or on any subtree: <code>comfortable</code>, <code>compact</code> or <code>station</code>.
        Controls read the density variables, so a compact toolbar and a station wall display need no extra props. See{' '}
        <a href={docsHref('station-display')}>Readable across the room</a>.
      </Lead>
      <Tabs variant="segmented" value={density} onValueChange={(v) => setDensity(v as Density)}>
        <TabsList aria-label="Density">
          {DENSITIES.map((d) => (
            <Tab key={d.id} value={d.id}>
              {d.label}
            </Tab>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-3">
        <ExampleBox code={DENSITY_CODE}>
          <Button variant="primary">Acknowledge</Button>
          <Button>Snooze</Button>
          <Input aria-label="Sample field" placeholder="Search services" className="w-48" />
        </ExampleBox>
      </div>
      <Callout>
        Density changes the whole site while you try it, and your choice is remembered. The header menu has the same switch.
      </Callout>
    </>
  )
}
