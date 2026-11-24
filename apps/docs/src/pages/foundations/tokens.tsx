import { useMemo } from 'react'
import { Badge } from '@calmon/react/badge'
import { Card } from '@calmon/react/card'
import {
  A,
  B,
  C,
  CodeFrame,
  H2,
  H3,
  HexButton,
  Lead,
  Page,
  PassBadge,
  Ratio,
  TableWrap,
  Td,
  Th,
} from './_kit.tsx'
import {
  CONTRAST_PAIRS,
  NEUTRALS,
  TOKEN_GROUPS,
  contrast,
  isColour,
  pairRatio,
  showValue,
  useIsDark,
  useLive,
  useThemeTokens,
  type ContrastPair,
  type ThemeTokens,
  type TokenGroup,
  type TokenMap,
} from './_tokens.ts'

/* ------------------------------------------------------------------------------------------------
 * What each token is for
 * ---------------------------------------------------------------------------------------------- */

const USE: Record<string, string> = {
  ...Object.fromEntries(NEUTRALS.map((n) => [`--${n.name}`, n.use])),
  '--radius-control': 'Inputs, buttons, menu items',
  '--radius-card': 'Cards, tables, tiles',
  '--radius-pill': 'Badges, switches',
  '--shadow-1': 'Resting cards',
  '--shadow-2': 'Popovers, menus, tooltips',
  '--shadow-3': 'Dialogs, drawers, toasts, the palette',
  '--font-sans': 'Interface and prose',
  '--font-mono': 'Code and numerals',
  '--fs-xs': 'Badges, captions',
  '--fs-sm': 'Hints, table cells, labels',
  '--fs-md': 'Body and controls',
  '--fs-lg': 'Lede and descriptions',
  '--fs-xl': 'Section headings',
  '--fs-2xl': 'Page titles',
  '--fs-3xl': 'Station view',
  '--leading-ui': 'Line height of UI text',
  '--leading-prose': 'Line height of prose',
  '--numeral-sm': 'Table cells, inline metrics',
  '--numeral-md': 'Station tiles, compact',
  '--numeral-lg': 'VitalTile, comfortable',
  '--numeral-xl': 'Station and wall displays',
  '--numeral-weight': 'Light, so big metrics read calm',
  '--duration-fast': 'Hover and colour changes',
  '--duration-base': 'Switches, tabs, popovers',
  '--duration-slow': 'Dialogs and sheets',
  '--ease-calmon-curve': 'The one easing curve',
  '--ring-width': 'Focus ring thickness',
  '--ring-offset': 'Gap between control and ring',
  '--btn-h': 'Button and IconButton height',
  '--btn-px': 'Button horizontal padding',
  '--btn-fs': 'Button font size',
  '--btn-radius': 'Button corner radius',
  '--control-h': 'Input, Select, NumberInput height',
  '--control-fs': 'Input font size',
  '--control-px': 'Input horizontal padding',
}

const FAMILY_ROLE: Record<string, string> = {
  '': 'Solid fill',
  on: 'Text and icons on the fill',
  soft: 'Tinted background',
  fg: 'Text on surfaces',
  border: 'Border on soft backgrounds',
}

function roleOf(name: string, lightRaw: string | undefined): string {
  const n = name.slice(2)
  const direct = USE[name]
  if (direct) return direct
  const alias = /^(primary|secondary|success|warning|danger)(?:-\w+)?$/.exec(n)
  if (alias) return `Alias of ${lightRaw?.replace(/^var\((--[\w-]+)\)$/, '$1') ?? 'a severity token'}`
  const fam = /^(?:accent|normal|info|advisory|caution|critical)(?:-(on|soft|fg|border))?$/.exec(n)
  if (fam) return FAMILY_ROLE[fam[1] ?? ''] ?? ''
  const space = /^space-(\d+)$/.exec(n)
  if (space) return `${Number(space[1]) * 4}px step`
  return ''
}

/* ------------------------------------------------------------------------------------------------
 * Contrast checks, live
 * ---------------------------------------------------------------------------------------------- */

function ContrastChecks({ tokens }: { tokens: ThemeTokens | null }) {
  const live = useLive()
  const dark = useIsDark()

  // Recomputed from what the browser resolves right now, whenever the theme changes (live changes identity with it).
  const now = useMemo(
    () => CONTRAST_PAIRS.map((p) => contrast(live(p.fg), live(p.bg))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live],
  )
  const checked = now.filter((r) => r !== null).length
  const failing = CONTRAST_PAIRS.filter((p, i) => {
    const r = now[i]
    return r !== null && r !== undefined && r < p.min
  })

  let lastGroup = ''
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3" role="status">
        <Badge variant="outline" icon={false}>
          {dark ? 'Dark theme' : 'Light theme'}
        </Badge>
        {failing.length === 0 ? (
          <Badge severity="normal">All {checked} checks pass</Badge>
        ) : (
          <Badge severity="critical">
            {failing.length} of {checked} checks fail
          </Badge>
        )}
        <span className="text-ui-sm text-fg-muted">
          Computed from the colours the browser resolves now. Switch theme and they are recomputed.
        </span>
      </div>
      <TableWrap>
        <thead>
          <tr>
            <Th>Pair</Th>
            <Th>Sample</Th>
            <Th>Needs</Th>
            <Th>
              Now <span className="font-normal">({dark ? 'dark' : 'light'})</span>
            </Th>
            <Th>Light</Th>
            <Th>Dark</Th>
          </tr>
        </thead>
        <tbody>
          {CONTRAST_PAIRS.map((p, i) => {
            const header = p.group !== lastGroup
            lastGroup = p.group
            return (
              <ContrastRow key={p.id} pair={p} header={header} now={now[i] ?? null} tokens={tokens} />
            )
          })}
        </tbody>
      </TableWrap>
    </>
  )
}

function ContrastRow({
  pair,
  header,
  now,
  tokens,
}: {
  pair: ContrastPair
  header: boolean
  now: number | null
  tokens: ThemeTokens | null
}) {
  return (
    <>
      {header ? (
        <tr>
          <td colSpan={6} className="border-b border-border bg-surface-sunken px-3.5 py-1.5 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
            {pair.group}
          </td>
        </tr>
      ) : null}
      <tr>
        <Td className="whitespace-nowrap">
          <C>{pair.label}</C>
        </Td>
        <Td>
          {pair.id === 'ring' ? (
            <span aria-hidden="true" className="inline-block size-5 rounded-md bg-surface outline-2 outline-offset-2 outline-ring" />
          ) : (
            <span
              aria-hidden="true"
              className="inline-block rounded-md px-2.5 py-0.5 text-ui-sm font-semibold shadow-[inset_0_0_0_1px_var(--border)]"
              style={{ color: `var(${pair.fg})`, background: `var(${pair.bg})` }}
            >
              Aa
            </span>
          )}
        </Td>
        <Td className="font-mono text-xs whitespace-nowrap text-fg-muted">{pair.min}:1</Td>
        <Td>
          <PassBadge ratio={now} min={pair.min} />
        </Td>
        <Td>
          <Ratio ratio={pairRatio(pair, tokens?.light)} min={pair.min} />
        </Td>
        <Td>
          <Ratio ratio={pairRatio(pair, tokens?.dark)} min={pair.min} />
        </Td>
      </tr>
    </>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Token tables
 * ---------------------------------------------------------------------------------------------- */

function ValueCell({ value, raw, label }: { value: string | undefined; raw: string | undefined; label: string }) {
  if (value === undefined) return <span className="text-fg-subtle">…</span>
  if (isColour(value)) {
    return (
      <div>
        <HexButton value={value} label={label} />
        {raw?.startsWith('var(') ? <div className="pl-1 font-mono text-[11px] text-fg-subtle">{raw}</div> : null}
      </div>
    )
  }
  return <code className="font-mono text-[11px] leading-[1.5] break-words text-fg">{showValue(value)}</code>
}

function GroupTable({
  group,
  names,
  tokens,
  dark,
  heading = true,
}: {
  group: Pick<TokenGroup, 'id' | 'title' | 'blurb'>
  names: string[]
  tokens: ThemeTokens | null
  dark: boolean
  /** Show the group title as an h3. Off when the section heading above already says it. */
  heading?: boolean
}) {
  const now = (
    <span className="ml-1.5 rounded-pill bg-accent-soft px-1.5 py-px text-[10px] font-semibold text-accent-fg">now</span>
  )
  return (
    <>
      {heading ? <H3 id={`token-${group.id}`}>{group.title}</H3> : null}
      <p className="mb-3 max-w-[68ch] text-ui-sm text-fg-muted">{group.blurb}</p>
      <TableWrap>
        <thead>
          <tr>
            <Th>Token</Th>
            <Th>
              Light{!dark ? now : null}
            </Th>
            <Th>
              Dark{dark ? now : null}
            </Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => {
            const L = tokens?.light[name]
            const D = tokens?.dark[name]
            const same = L !== undefined && L === D
            return (
              <tr key={name}>
                <Td className="whitespace-nowrap">
                  <C>{name}</C>
                </Td>
                <Td className={`max-w-[320px] ${!dark ? 'bg-accent-soft/40' : ''}`}>
                  <ValueCell value={L} raw={tokens?.lightRaw[name]} label={`${name} light`} />
                </Td>
                <Td className={`max-w-[320px] ${dark ? 'bg-accent-soft/40' : ''}`}>
                  {same ? (
                    <span className="text-fg-subtle">same</span>
                  ) : (
                    <ValueCell value={D} raw={tokens?.darkRaw[name] ?? tokens?.lightRaw[name]} label={`${name} dark`} />
                  )}
                </Td>
                <Td className="text-fg-muted">{roleOf(name, tokens?.lightRaw[name])}</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Copyable CSS
 * ---------------------------------------------------------------------------------------------- */

function buildCss(tokens: ThemeTokens, selector: ':root' | '.dark'): string {
  const raw: TokenMap = selector === ':root' ? tokens.lightRaw : tokens.darkRaw
  const groups: Pick<TokenGroup, 'comment' | 'names'>[] = [...TOKEN_GROUPS]
  if (tokens.unlisted.length > 0) groups.push({ comment: 'Other tokens', names: tokens.unlisted })
  const parts: string[] = []
  for (const g of groups) {
    const lines = g.names.filter((n) => raw[n] !== undefined).map((n) => `  ${n}: ${raw[n]};`)
    if (lines.length > 0) parts.push(`  /* ${g.comment} */\n${lines.join('\n')}`)
  }
  return `${selector} {\n${parts.join('\n\n')}\n}\n`
}

const ACCENT_OVERRIDE = `/* Your accent, in both themes. The focus ring is its own token, so move it too. */
:root {
  --accent: #4F46E5; --accent-on: #FFFFFF;
  --accent-soft: #EEF0FD; --accent-fg: #3F37C9; --accent-border: #C7CBF7;
  --ring: #4F46E5;
}
.dark {
  --accent: #8B93FF; --accent-on: #0B0E2A;
  --accent-soft: #171A3A; --accent-fg: #A9AFFF; --accent-border: #343A7A;
  --ring: #8B93FF;
}`

/** The example override checked with the same maths as the live table, so the advice is not just a claim. */
function OverrideChecks() {
  const rows = [
    { label: 'accent-on on accent', light: contrast('#FFFFFF', '#4F46E5'), dark: contrast('#0B0E2A', '#8B93FF') },
    { label: 'accent-fg on accent-soft', light: contrast('#3F37C9', '#EEF0FD'), dark: contrast('#A9AFFF', '#171A3A') },
  ]
  return (
    <TableWrap className="mt-4">
      <thead>
        <tr>
          <Th>This example</Th>
          <Th>Light</Th>
          <Th>Dark</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <Td>
              <C>{r.label}</C>
            </Td>
            <Td>
              <Ratio ratio={r.light} min={4.5} />
            </Td>
            <Td>
              <Ratio ratio={r.dark} min={4.5} />
            </Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Notes for the developer
 * ---------------------------------------------------------------------------------------------- */

function Notes({ tokens }: { tokens: ThemeTokens | null }) {
  const L = tokens?.light
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24].map((n) => parseInt(L?.[`--space-${n}`] ?? '', 10)).filter((n) => !Number.isNaN(n))
  const fast = L?.['--duration-fast'] ?? '…'
  const base = L?.['--duration-base'] ?? '…'
  const slow = L?.['--duration-slow'] ?? '…'
  const body = 'text-ui-sm leading-[1.65] text-fg-muted'
  return (
    <div data-no-prose className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="Spacing" as="h3">
        <p className={body}>
          A 4px base with steps at {steps.length ? steps.join(', ') : '…'}. Controls use 12px horizontal padding and 8px gaps.
          Cards pad 16px. Page sections separate by 64px. Prefer the step below when unsure; density is calm because of
          alignment, not air.
        </p>
      </Card>
      <Card title="Radius" as="h3">
        <p className={body}>
          <B>control</B> {L?.['--radius-control'] ?? '…'} for inputs, buttons and menu items. <B>card</B>{' '}
          {L?.['--radius-card'] ?? '…'} for cards, tables and tiles. Dialogs and the command palette use 16px. Badges and
          switches are pills.
        </p>
      </Card>
      <Card title="Shadows" as="h3">
        <p className={body}>
          Light mode leans on soft, layered shadows plus a hairline ring; dark mode leans on borders. <B>shadow-1</B> for
          resting cards, <B>shadow-2</B> for popovers, menus and tooltips, <B>shadow-3</B> for dialogs, drawers, toasts and
          the palette. Dark mode uses deeper, blacker shadows because grey ones vanish on navy.
        </p>
      </Card>
      <Card title="Motion" as="h3">
        <p className={body}>
          Durations {fast} (hover, colour), {base} (switches, tabs, popovers) and {slow} (dialogs, drawers), all on{' '}
          <C>--ease-calmon-curve</C>. Motion only answers an action, with two exceptions: the live dot and critical station tiles
          pulse slowly. <B>prefers-reduced-motion</B> sets every duration to 0 and stops both. Never animate numerals
          counting up.
        </p>
      </Card>
      <Card title="Focus ring" as="h3">
        <p className={body}>
          2px solid <C>--ring</C> with a 2px offset, using <C>:focus-visible</C> only. Text inputs use an inset version:
          the border turns ring colour plus a 4px soft halo, so the ring doesn’t collide with neighbouring fields. The ring
          is teal in both themes and passes 3:1 against every surface.
        </p>
      </Card>
      <Card title="Severity rules" as="h3">
        <ul className={`${body} list-disc pl-[18px]`}>
          <li>Every severity indicator shows an icon or text label. Shapes: circle-check, circle-i, diamond, triangle, octagon.</li>
          <li>
            Use <C>-soft</C> + <C>-fg</C> + <C>-border</C> for most surfaces; reserve solid fills for badges that must be
            seen from across a room and for destructive buttons.
          </li>
          <li>Info is never used for a score. Accent is never used to mean status.</li>
        </ul>
      </Card>
      <Card title="Typography" as="h3">
        <p className={body}>
          <B>Instrument Sans</B> for UI and prose. <B>Azeret Mono</B> for code and numerals: big metrics are set at weight
          300 so they read calm and precise rather than loud, and stay tabular. Prose uses {L?.['--leading-prose'] ?? '…'}{' '}
          line height and a 68ch measure; UI uses {L?.['--leading-ui'] ?? '…'}.
        </p>
      </Card>
      <Card title="Intent aliases" as="h3">
        <p className={body}>
          <B>primary</B> = accent, <B>secondary</B> = neutral surfaces, <B>success</B> = normal, <B>warning</B> = caution,{' '}
          <B>danger</B> = critical. Info and advisory keep their names. Components accept <C>intent</C> or{' '}
          <C>severity</C>; both resolve to the same five tokens, so themes only define each colour once.
        </p>
      </Card>
      <Card title="Tailwind v4 mapping" as="h3" className="md:col-span-2">
        <p className={body}>
          Tokens are exposed in <C>@theme inline</C>, for example <C>--color-critical: var(--critical)</C>,{' '}
          <C>--color-critical-soft: var(--critical-soft)</C> and <C>--radius-card: var(--radius-card)</C>, so{' '}
          <C>bg-critical-soft</C>, <C>text-fg-muted</C> and <C>rounded-card</C> just work. Dark mode uses{' '}
          <C>@custom-variant dark</C>. Components read only these names, never raw hex.
        </p>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------------------------------- */

const byId = (id: string) => {
  const g = TOKEN_GROUPS.find((x) => x.id === id)
  if (!g) throw new Error(`Unknown token group: ${id}`)
  return g
}

export default function Tokens() {
  const tokens = useThemeTokens()
  const dark = useIsDark()

  const table = (id: string) => {
    const g = byId(id)
    return <GroupTable key={id} group={g} names={g.names} tokens={tokens} dark={dark} />
  }

  return (
    <Page>
      <Lead>
        Every token is a CSS variable: light values on <C>:root</C>, dark values on <C>.dark</C>. This page reads them from
        the stylesheet as it loads, so what you see is what ships. Components read only these names, never raw hex.
      </Lead>

      <h2 id="contrast-checks" className={H2}>Contrast checks</h2>
      <Lead>
        Text needs 4.5:1 against what it sits on (WCAG AA); the focus ring needs 3:1. Each pair below is measured live in
        the theme you are viewing, and in both themes from the stylesheet. A fill and the text on it (<C>-on</C>), and
        soft-background text (<C>-fg</C> on <C>-soft</C>), are the pairs components rely on.
      </Lead>
      <ContrastChecks tokens={tokens} />

      <h2 id="colour-tokens" className={H2}>Colour tokens</h2>
      <Lead>
        Each family has a solid fill, the text on it, a soft background, text for surfaces and a border. Click a swatch to
        copy its code. The column for the theme you are in is marked <B>now</B>.
      </Lead>
      {['neutrals', 'accent', 'normal', 'info', 'advisory', 'caution', 'critical', 'intent-aliases'].map(table)}

      <h2 id="radius-and-shadows" className={H2}>Radius and shadows</h2>
      {['radius', 'shadows'].map(table)}

      <h2 id="type-and-spacing" className={H2}>Type and spacing</h2>
      {['type', 'spacing'].map(table)}

      <h2 id="motion-and-focus" className={H2}>Motion and focus</h2>
      {['motion', 'focus'].map(table)}

      <h2 id="density" className={H2}>Density</h2>
      <GroupTable group={byId('density')} names={byId('density').names} tokens={tokens} dark={dark} heading={false} />
      {tokens && tokens.unlisted.length > 0 ? (
        <>
          <h2 id="other-tokens" className={H2}>Other tokens</h2>
          <GroupTable
            group={{ id: 'other', title: 'Other tokens', blurb: 'Declared in the stylesheet, not yet grouped on this page.' }}
            names={tokens.unlisted}
            tokens={tokens}
            dark={dark}
            heading={false}
          />
        </>
      ) : null}

      <h2 id="css-variables" className={H2}>CSS variables</h2>
      <Lead>
        The complete blocks, generated from the stylesheet. Light values go on <C>:root</C>, dark values on <C>.dark</C>{' '}
        (or <C>data-theme="dark"</C>). Copy a block to start your own theme file.
      </Lead>
      {tokens ? (
        <div className="flex flex-col gap-4">
          <CodeFrame title="calmon-tokens.css: :root" text={buildCss(tokens, ':root')} copyLabel="Copy :root" />
          <CodeFrame title="calmon-tokens.css: .dark" text={buildCss(tokens, '.dark')} copyLabel="Copy .dark" />
        </div>
      ) : (
        <p className="text-ui-sm text-fg-muted">Reading the stylesheet…</p>
      )}

      <h2 id="change-the-accent" className={H2}>Change the accent</h2>
      <Lead>
        Override the accent tokens for both themes, after the Calmon stylesheet. Keep <C>-on</C> at 4.5:1 against the fill,
        and <C>-fg</C> at 4.5:1 against both the page and the soft background. See <A href="#/docs/theming">Theming</A>.
      </Lead>
      <CodeFrame title="theme.css" text={ACCENT_OVERRIDE} copyLabel="Copy override" maxHeight={360} />
      <OverrideChecks />

      <h2 id="notes-for-the-developer" className={H2}>Notes for the developer</h2>
      <Notes tokens={tokens} />
    </Page>
  )
}
