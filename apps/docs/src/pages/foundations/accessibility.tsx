import type { ReactNode } from 'react'
import { Badge } from '@openvanta/calmon-react/badge'
import { Kbd } from '@openvanta/calmon-react/kbd'
import { InfoIcon, PauseIcon } from '@openvanta/calmon-react/icons'
import { A, B, Bullets, C, Callout, ComponentLinks, H2, Lead, Page, PassBadge, TableWrap, Td, Th } from './_kit.tsx'
import {
  CONTRAST_PAIRS,
  pairRatio,
  useDensityValues,
  useReducedMotion,
  useThemeTokens,
  type ThemeTokens,
} from './_tokens.ts'

const SEVERITIES = ['normal', 'info', 'advisory', 'caution', 'critical'] as const

/** Lowest ratio across every promised pair, and how many pairs pass, for one theme. Computed from the stylesheet. */
function summarise(map: ThemeTokens['light'] | undefined) {
  if (!map) return null
  let lowest: { ratio: number; label: string; min: number } | null = null
  let pass = 0
  let total = 0
  for (const p of CONTRAST_PAIRS) {
    const r = pairRatio(p, map)
    if (r === null) continue
    total++
    if (r >= p.min) pass++
    if (!lowest || r / p.min < lowest.ratio / lowest.min) lowest = { ratio: r, label: p.label, min: p.min }
  }
  return lowest ? { pass, total, lowest } : null
}

function ContrastSummary() {
  const tokens = useThemeTokens()
  const rows = [
    { theme: 'Light', s: summarise(tokens?.light) },
    { theme: 'Dark', s: summarise(tokens?.dark) },
  ]
  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Theme</Th>
          <Th>Pairs that pass</Th>
          <Th>Tightest pair</Th>
          <Th>Its ratio</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ theme, s }) => (
          <tr key={theme}>
            <Td className="font-[550]">{theme}</Td>
            <Td className="font-mono text-xs">{s ? `${s.pass} of ${s.total}` : '…'}</Td>
            <Td>{s ? <C>{s.lowest.label}</C> : '…'}</Td>
            <Td>{s ? <PassBadge ratio={s.lowest.ratio} min={s.lowest.min} /> : '…'}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

const KEYS: { where: string; keys: ReactNode; does: string }[] = [
  { where: 'Anywhere', keys: <><Kbd>Tab</Kbd> <Kbd>Shift+Tab</Kbd></>, does: 'Move focus forwards and back. Focus is always visible.' },
  { where: 'Button, link', keys: <><Kbd>Enter</Kbd> <Kbd>Space</Kbd></>, does: 'Activate. A link activates on Enter only.' },
  { where: 'Checkbox, switch', keys: <Kbd>Space</Kbd>, does: 'Toggle. A switch takes effect at once.' },
  { where: 'Tabs', keys: <><Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>Home</Kbd> <Kbd>End</Kbd></>, does: 'Move between tabs.' },
  { where: 'Number input', keys: <><Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>PgUp</Kbd> <Kbd>PgDn</Kbd></>, does: 'Step by one, or by ten.' },
  { where: 'Dialog, popover', keys: <Kbd>Esc</Kbd>, does: 'Close, and return focus to what opened it. A modal dialog traps focus while it is open.' },
  { where: 'This site', keys: <Kbd>mod+K</Kbd>, does: 'Open search from anywhere.' },
]

const DENSITY_ROWS = [
  { id: 'comfortable', title: 'Comfortable', use: 'Forms, detail pages, anything touched' },
  { id: 'compact', title: 'Compact', use: 'Dense tables with a mouse and keyboard' },
  { id: 'station', title: 'Station', use: 'Touch screens and wall displays' },
] as const

function DensityTargets() {
  const values = useDensityValues(['--btn-h', '--control-h'])
  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Density</Th>
          <Th>Button height</Th>
          <Th>Input height</Th>
          <Th>Good for</Th>
        </tr>
      </thead>
      <tbody>
        {DENSITY_ROWS.map((d) => (
          <tr key={d.id}>
            <Td className="font-[550]">{d.title}</Td>
            <Td className="font-mono text-xs">{values[d.id]?.['--btn-h'] ?? '…'}</Td>
            <Td className="font-mono text-xs">{values[d.id]?.['--control-h'] ?? '…'}</Td>
            <Td className="text-fg-muted">{d.use}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

export default function Accessibility() {
  const reduced = useReducedMotion()
  return (
    <Page>
      <Lead>
        Accessibility is a safety property: a person who can’t perceive an alarm can’t act on it. These are the promises
        every component keeps, and every component example runs through an automated axe check.
      </Lead>

      <h2 id="contrast" className={H2}>Contrast</h2>
      <Lead>
        All text tokens meet 4.5:1 (WCAG AA) in both themes, and the focus ring meets 3:1. The table below is computed from
        the stylesheet as this page loads, so it can’t drift. The{' '}
        <A href="#/docs/tokens">design tokens page</A> lists every pair, and checks them again whenever you switch theme.
      </Lead>
      <ContrastSummary />
      <p className="mt-3 max-w-[68ch] text-ui-sm leading-[1.6] text-fg-muted">
        Solid severity fills are never the only signal. The icon shape and the word carry the meaning, so a bright fill
        such as advisory yellow does not have to hold 3:1 on a pale page by itself.
      </p>

      <h2 id="not-colour-alone" className={H2}>Not colour alone</h2>
      <Lead>
        Each severity has a shape (circle with a check, circle with an i, diamond, triangle, octagon) and a word. Charts use
        dashed thresholds and labels, not colour bands alone. See <A href="#/docs/colour">Colour</A> and{' '}
        <A href="#/docs/iconography">Iconography</A>.
      </Lead>
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface-raised p-5">
        {SEVERITIES.map((s) => (
          <Badge key={s} severity={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>

      <h2 id="keyboard" className={H2}>Keyboard</h2>
      <Lead>
        Everything is reachable with Tab, in a sensible order, and the focus ring is always visible. Native elements come
        first (<C>button</C>, <C>input</C>, <C>select</C>, <C>dialog</C>), so the platform’s own keyboard support comes with
        them.
      </Lead>
      <TableWrap>
        <thead>
          <tr>
            <Th>Where</Th>
            <Th>Keys</Th>
            <Th>What happens</Th>
          </tr>
        </thead>
        <tbody>
          {KEYS.map((k) => (
            <tr key={k.where}>
              <Td className="font-[550] whitespace-nowrap">{k.where}</Td>
              <Td>
                <span className="inline-flex flex-wrap items-center gap-1">{k.keys}</span>
              </Td>
              <Td className="text-fg-muted">{k.does}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <h2 id="screen-readers" className={H2}>Screen readers</h2>
      <Bullets>
        <li>
          Critical and caution toasts and banners are <B>assertive</B> (<C>role="alert"</C>); everything else is polite.
        </li>
        <li>Station grids keep DOM order equal to visual order, worst first, so the worst is read first.</li>
        <li>Charts include a hidden data table and a text summary.</li>
        <li>
          Icons are decorative unless you name them. An icon-only button always needs a label: use{' '}
          <C>IconButton</C>.
        </li>
        <li>
          A field has a visible label, hint and error, wired with <C>aria-describedby</C> and <C>aria-invalid</C> by{' '}
          <C>Field</C>.
        </li>
      </Bullets>

      <h2 id="reduced-motion" className={H2}>Reduced motion</h2>
      <Lead>
        When a visitor asks for reduced motion, every duration token becomes 0ms and anything that loops stops.
        Colour and layout changes still happen; they just don’t animate. Never animate numbers counting up.
      </Lead>
      {reduced ? (
        <Callout icon={<PauseIcon width={18} height={18} />}>
          <B>Reduced motion is on for you right now.</B> Try the <A href="#/docs/elevation">motion demo</A> to see durations
          read 0ms.
        </Callout>
      ) : (
        <Callout icon={<InfoIcon width={18} height={18} />}>
          Reduced motion is off for you. Turn on “reduce motion” in your operating system, then try the{' '}
          <A href="#/docs/elevation">motion demo</A>.
        </Callout>
      )}

      <h2 id="touch-and-wall-displays" className={H2}>Touch and wall displays</h2>
      <Lead>
        Density changes the size of every control together. All three keep targets above the WCAG 2.2 AA minimum of 24 by
        24 CSS pixels. Use comfortable or larger for anything touched, and station for screens read from across a room.
      </Lead>
      <DensityTargets />
      <p className="mt-3 text-ui-sm text-fg-muted">
        See <A href="#/docs/layout">Spacing and layout</A> for live specimens and{' '}
        <A href="#/docs/station-display">Readable across the room</A> for the pattern.
      </p>

      <h2 id="components-that-help" className={H2}>Components that help</h2>
      <Lead>These do most of the work for you.</Lead>
      <ComponentLinks names={['Field', 'IconButton', 'Tabs', 'Dialog', 'Banner', 'Toast', 'Chart']} />
    </Page>
  )
}
