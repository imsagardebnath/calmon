import type { ReactNode } from 'react'
import { Badge, type BadgeProps } from '@openvanta/pikore-react/badge'
import { Banner } from '@openvanta/pikore-react/banner'
import { Button, type ButtonProps } from '@openvanta/pikore-react/button'
import { LayersIcon, SeverityIcon, TrashIcon } from '@openvanta/pikore-react/icons'
import { A, C, Chip, DoDont, H2, H3, HexButton, Lead, Page, Ratio, Specimen, Td, TableWrap, Th } from './_kit.tsx'
import { NEUTRALS, contrast, showValue, useLive, useThemeTokens, type Family, type ThemeTokens } from './_tokens.ts'

/* ------------------------------------------------------------------------------------------------
 * Data
 * ---------------------------------------------------------------------------------------------- */

type Severity = NonNullable<ButtonProps['severity']>
const SEVERITIES: Severity[] = ['normal', 'info', 'advisory', 'caution', 'critical']

interface Intent {
  /** Token prefix: --primary, --success, ... */
  alias: string
  name: string
  /** What it maps onto, in words. */
  maps: string
}

const INTENTS: Intent[] = [
  { alias: 'primary', name: 'Primary', maps: 'accent' },
  { alias: 'secondary', name: 'Secondary', maps: 'neutral surfaces' },
  { alias: 'success', name: 'Success', maps: 'normal' },
  { alias: 'info', name: 'Info', maps: 'info' },
  { alias: 'advisory', name: 'Advisory', maps: 'advisory' },
  { alias: 'warning', name: 'Warning', maps: 'caution' },
  { alias: 'danger', name: 'Danger', maps: 'critical' },
]

const FAMILY_ROWS: { key: Family; name: string; alias: string; use: string }[] = [
  { key: 'accent', name: 'Primary', alias: 'primary', use: 'Brand, primary actions, selection, focus' },
  { key: 'normal', name: 'Success', alias: 'success', use: 'Normal status, success, in range' },
  { key: 'info', name: 'Info', alias: 'info', use: 'Neutral notices, links, queued work' },
  { key: 'advisory', name: 'Advisory', alias: 'advisory', use: 'Worth a look, no action yet' },
  { key: 'caution', name: 'Warning', alias: 'warning', use: 'Needs action soon, soft limits' },
  { key: 'critical', name: 'Danger', alias: 'danger', use: 'Act now, destructive actions, hard limits' },
]

const ROLE_ROWS: { suffix: string; name: string; use: string }[] = [
  { suffix: '', name: 'Solid', use: 'Fills: buttons, solid badges' },
  { suffix: '-on', name: 'On solid', use: 'Text and icons on the fill' },
  { suffix: '-soft', name: 'Soft', use: 'Tinted backgrounds' },
  { suffix: '-fg', name: 'Text', use: 'Text and icons on surfaces' },
  { suffix: '-border', name: 'Border', use: 'Borders on soft backgrounds' },
]

const SHAPES: { severity: Severity; label: string; shape: string }[] = [
  { severity: 'normal', label: 'Normal', shape: 'Circle with a check' },
  { severity: 'info', label: 'Info', shape: 'Circle with an i' },
  { severity: 'advisory', label: 'Advisory', shape: 'Diamond' },
  { severity: 'caution', label: 'Caution', shape: 'Triangle' },
  { severity: 'critical', label: 'Critical', shape: 'Octagon' },
]

/* ------------------------------------------------------------------------------------------------
 * Small pieces
 * ---------------------------------------------------------------------------------------------- */

/**
 * The glyph for a colour family. The critical icon draws its "!" in `--critical-on`. On a solid fill the icon itself
 * is drawn in that same colour, so the "!" takes the fill colour instead (as Badge does); `onSolid={false}` keeps
 * the default for the soft background.
 */
function Glyph({ family, size = 16, onSolid = true }: { family: Family; size?: number; onSolid?: boolean }) {
  if (family === 'accent') return <LayersIcon width={size} height={size} />
  return (
    <span aria-hidden="true" className={`inline-flex ${family === 'critical' && onSolid ? '[--critical-on:var(--critical)]' : ''}`}>
      <SeverityIcon severity={family} width={size} height={size} />
    </span>
  )
}

/** A swatch card with the same look as the design's `.ic-card` and `.tok-sw`. */
const CARD = 'overflow-hidden rounded-card bg-surface-raised shadow-[0_0_0_1px_var(--border),var(--shadow-1)]'

function IntentCard({ intent, live }: { intent: Intent; live: (n: string) => string }) {
  const neutral = intent.alias === 'secondary'
  // Secondary has no solid fill of its own: the card shows its soft surface with normal text.
  const fill = neutral ? '--secondary-soft' : `--${intent.alias}`
  const on = neutral ? '--fg' : `--${intent.alias}-on`
  return (
    <div className={CARD}>
      <div className="flex h-22 flex-col justify-between p-3" style={{ background: `var(${fill})`, color: `var(${on})` }}>
        <b className="text-ui font-semibold">{intent.name}</b>
        <small className="font-mono text-[11px] opacity-85">
          --{intent.alias} {showValue(live(fill))}
        </small>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-2.5 text-xs text-fg-muted">
        <div className="flex gap-1" aria-hidden="true">
          {['', '-soft', '-fg', '-border'].map((s) => (
            <i
              key={s}
              className="h-[18px] flex-1 rounded shadow-[inset_0_0_0_1px_rgb(0_0_0/.08)]"
              style={{ background: `var(--${intent.alias}${s})` }}
            />
          ))}
        </div>
        <span>
          Maps to <C>{intent.maps}</C>
        </span>
      </div>
    </div>
  )
}

function SeverityCard({ family, tokens, live }: { family: Family; tokens: ThemeTokens | null; live: (n: string) => string }) {
  const label = family === 'accent' ? 'accent' : family
  return (
    <div className={CARD}>
      <div
        className="flex h-[72px] items-end gap-1.5 px-3 py-2.5 text-ui-sm font-semibold"
        style={{ background: `var(--${family})`, color: `var(--${family}-on)` }}
      >
        <Glyph family={family} />
        {label}
      </div>
      <div className="font-mono text-[11px]">
        {['', '-on', '-soft', '-fg', '-border'].map((s) => {
          const name = `--${family}${s}`
          return (
            <div key={s} className="flex items-center gap-2 border-t border-border px-2.5 py-1.5">
              <span className="flex flex-none gap-0.5" aria-hidden="true">
                <Chip value={tokens?.light[name]} />
                <Chip value={tokens?.dark[name]} />
              </span>
              <span className="min-w-0 truncate">
                {family}
                {s}
              </span>
              <span className="ml-auto text-fg-subtle">{showValue(live(name))}</span>
            </div>
          )
        })}
        <div
          className="flex items-center gap-1.5 border-t px-2.5 py-1.5 font-sans font-semibold"
          style={{ background: `var(--${family}-soft)`, color: `var(--${family}-fg)`, borderColor: `var(--${family}-border)` }}
        >
          <Glyph family={family} size={14} onSolid={false} />
          Text on soft
        </div>
      </div>
    </div>
  )
}

function FamilyTable({ row, tokens }: { row: (typeof FAMILY_ROWS)[number]; tokens: ThemeTokens | null }) {
  const { key, name, alias, use } = row
  const L = tokens?.light
  const D = tokens?.dark
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface-raised">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <span
          className="grid size-9 flex-none place-items-center rounded-[10px]"
          style={{ background: `var(--${key})`, color: `var(--${key}-on)` }}
        >
          <Glyph family={key} size={18} />
        </span>
        <div className="min-w-0 text-ui-sm text-fg-muted">
          <b className="text-ui font-semibold text-fg">{name}</b> <C>{`--${alias}`}</C>
          {alias !== key ? (
            <>
              {' '}
              alias of <C>{`--${key}`}</C>
            </>
          ) : null}
          <br />
          {use}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-ui-sm [&_tbody_tr:last-child_td]:border-b-0">
          <thead>
            <tr>
              <Th>Role</Th>
              <Th>Token</Th>
              <Th>Light</Th>
              <Th>Dark</Th>
              <Th className="text-right">Contrast L / D</Th>
            </tr>
          </thead>
          <tbody>
            {ROLE_ROWS.map(({ suffix, name: role, use: roleUse }) => {
              const token = `--${key}${suffix}`
              // -on is checked against the solid fill; -fg against the page surface (the -soft pair is on the tokens page).
              const against = suffix === '-on' ? `--${key}` : suffix === '-fg' ? '--surface' : null
              const light = against ? contrast(L?.[token], L?.[against]) : null
              const dark = against ? contrast(D?.[token], D?.[against]) : null
              return (
                <tr key={suffix}>
                  <Td>
                    <b className="font-[550]">{role}</b>
                    <div className="text-xs text-fg-subtle">{roleUse}</div>
                  </Td>
                  <Td>
                    <C>{token}</C>
                  </Td>
                  <Td>
                    <HexButton value={L?.[token]} label={`${token} light`} />
                  </Td>
                  <Td>
                    <HexButton value={D?.[token]} label={`${token} dark`} />
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {against ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Ratio ratio={light} min={4.5} />
                        <span className="text-fg-subtle">/</span>
                        <Ratio ratio={dark} min={4.5} />
                      </span>
                    ) : null}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** One row of a matrix: a label cell and the specimens. */
function MatrixRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <td className="w-[120px] border-t border-border px-2.5 py-2 text-ui-sm font-[550] whitespace-nowrap first-of-type:border-t">{label}</td>
      {children}
    </tr>
  )
}

const Cell = ({ children }: { children: ReactNode }) => <td className="border-t border-border px-2.5 py-2">{children}</td>
const HeadCell = ({ children }: { children?: ReactNode }) => (
  <th className="px-2.5 pb-3 text-left text-xs font-[550] text-fg-subtle">{children}</th>
)

/* Each row is a colour name plus the props that select it. info and advisory have no intent alias, so they use severity. */
type Tone = Pick<ButtonProps, 'severity' | 'intent'>
const TONES: { name: string; label: string; tone: Tone | null }[] = [
  { name: 'Primary', label: 'Save changes', tone: { intent: 'primary' } },
  { name: 'Secondary', label: 'Cancel', tone: null },
  { name: 'Success', label: 'Approve', tone: { intent: 'success' } },
  { name: 'Info', label: 'Learn more', tone: { severity: 'info' } },
  { name: 'Advisory', label: 'Review', tone: { severity: 'advisory' } },
  { name: 'Warning', label: 'Restart', tone: { intent: 'warning' } },
  { name: 'Danger', label: 'Delete', tone: { intent: 'danger' } },
]

function ButtonMatrix() {
  return (
    <Specimen className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <HeadCell>Intent</HeadCell>
            <HeadCell>Primary</HeadCell>
            <HeadCell>Secondary</HeadCell>
            <HeadCell>Ghost</HeadCell>
            <HeadCell>Disabled</HeadCell>
          </tr>
        </thead>
        <tbody>
          {TONES.map(({ name, label, tone }) => (
            <MatrixRow key={name} label={name}>
              <Cell>
                {tone ? (
                  <Button variant="primary" {...tone} iconStart={tone.intent === 'danger' ? <TrashIcon /> : undefined}>
                    {label}
                  </Button>
                ) : (
                  <span className="text-fg-subtle" aria-label="Not used">
                    –
                  </span>
                )}
              </Cell>
              <Cell>
                <Button variant="secondary" {...tone}>
                  {label}
                </Button>
              </Cell>
              <Cell>
                <Button variant="ghost" {...tone}>
                  {label}
                </Button>
              </Cell>
              <Cell>
                <Button variant={tone ? 'primary' : 'secondary'} {...tone} disabled>
                  {label}
                </Button>
              </Cell>
            </MatrixRow>
          ))}
        </tbody>
      </table>
    </Specimen>
  )
}

function BadgeMatrix() {
  const variants: NonNullable<BadgeProps['variant']>[] = ['soft', 'solid', 'outline', 'dot']
  return (
    <Specimen className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <HeadCell>Intent</HeadCell>
            {variants.map((v) => (
              <HeadCell key={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</HeadCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {TONES.map(({ name, tone }) => (
            <MatrixRow key={name} label={name}>
              {variants.map((v) => (
                <Cell key={v}>
                  <Badge {...(tone ?? { intent: 'secondary' })} variant={v}>
                    {name}
                  </Badge>
                </Cell>
              ))}
            </MatrixRow>
          ))}
        </tbody>
      </table>
    </Specimen>
  )
}

const ALERTS: { name: string; tone: Tone; title: string; body: string; action: string; icon?: ReactNode }[] = [
  { name: 'Primary', tone: { intent: 'primary' }, title: 'New in v1.4', body: 'LimitedNumberInput now supports units and step sizes.', action: 'Read changelog', icon: <LayersIcon width={18} height={18} /> },
  { name: 'Success', tone: { intent: 'success' }, title: 'All checks passed', body: 'Config v42 is safe to publish.', action: 'Publish now' },
  { name: 'Info', tone: { severity: 'info' }, title: 'Maintenance tonight', body: 'Failover test from 02:00 to 02:30 UTC. Alerts from db-* are grouped.', action: 'View schedule' },
  { name: 'Advisory', tone: { severity: 'advisory' }, title: 'Certificate expires in 21 days', body: 'Renew before 14 Dec to avoid a forced rotation.', action: 'Renew' },
  { name: 'Warning', tone: { intent: 'warning' }, title: 'Disk above 85% on 3 hosts', body: 'Free space or extend volumes before 90%, when writes slow down.', action: 'View hosts' },
  { name: 'Danger', tone: { intent: 'danger' }, title: 'Payments failing in eu-west', body: 'Error rate is 4.2%. R. Iyer is on it. Updates every 15 minutes.', action: 'Open incident' },
]

/* ------------------------------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------------------------------- */

export default function Colour() {
  const tokens = useThemeTokens()
  const live = useLive()

  return (
    <Page>
      <Lead>
        Colour carries meaning, so it’s rationed. Teal is the brand accent for actions and selection. The five severity
        levels are for status only. Neutrals do everything else. Click any code to copy it.
      </Lead>

      <h2 id="intents" className={H2}>Intents</h2>
      <Lead>
        Seven intents for everyday UI. Success, Warning and Danger are aliases of the severity scale (normal, caution,
        critical), so <C>intent="danger"</C> and <C>severity="critical"</C> render the same thing. Info and Advisory keep
        their names.
      </Lead>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {INTENTS.map((i) => (
          <IntentCard key={i.alias} intent={i} live={live} />
        ))}
      </div>

      <h2 id="severity-scale" className={H2}>Severity scale</h2>
      <Lead>
        Least to most urgent. Hue, lightness and icon shape all change between levels, so the scale holds up for
        colour-blind people and in greyscale. Each row shows the light and dark swatch, then the value in the theme you
        are viewing now.
      </Lead>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] gap-3">
        {(['accent', 'normal', 'info', 'advisory', 'caution', 'critical'] as const).map((f) => (
          <SeverityCard key={f} family={f} tokens={tokens} live={live} />
        ))}
      </div>

      <h2 id="colour-codes" className={H2}>Colour codes</h2>
      <Lead>
        Every family has five roles: solid fill, text on the fill, soft background, text on surfaces, and border. Intent
        names are aliases. Values are read from the stylesheet, and contrast is computed from them for both themes.
      </Lead>
      <div className="flex flex-col gap-4">
        {FAMILY_ROWS.map((row) => (
          <FamilyTable key={row.key} row={row} tokens={tokens} />
        ))}
      </div>

      <h2 id="neutrals" className={H2}>Neutrals</h2>
      <Lead>Surfaces, borders and text. Nothing here ever means a status.</Lead>
      <TableWrap>
        <thead>
          <tr>
            <Th>Token</Th>
            <Th>Use</Th>
            <Th>Light</Th>
            <Th>Dark</Th>
          </tr>
        </thead>
        <tbody>
          {NEUTRALS.map(({ name, use }) => (
            <tr key={name}>
              <Td>
                <C>{`--${name}`}</C>
              </Td>
              <Td className="text-fg-muted">{use}</Td>
              <Td>
                <HexButton value={tokens?.light[`--${name}`]} label={`--${name} light`} />
              </Td>
              <Td>
                <HexButton value={tokens?.dark[`--${name}`]} label={`--${name} dark`} />
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <h2 id="never-colour-alone" className={H2}>Never colour alone</h2>
      <Lead>
        Each severity has its own shape and a word. Someone who can’t tell red from orange, or who reads a wall display in
        greyscale from across the room, still knows how serious it is. Components add the icon for you; if you build your
        own status, pair the colour with the same shape or a label.
      </Lead>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        {SHAPES.map(({ severity, label, shape }) => (
          <div
            key={severity}
            data-tone={severity}
            className="flex flex-col items-start gap-2 rounded-xl bg-surface-raised px-4 py-4 shadow-[0_0_0_1px_var(--border)]"
          >
            <span className="text-tone-fg">
              <SeverityIcon severity={severity} width={28} height={28} />
            </span>
            <b className="font-semibold">{label}</b>
            <span className="text-xs text-fg-muted">{shape}</span>
          </div>
        ))}
      </div>

      <H3>The same badges in greyscale</H3>
      <Lead className="!mb-3">
        The shapes keep the five levels apart when the colour is gone.
      </Lead>
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface-raised p-5 grayscale">
        {SEVERITIES.map((s) => (
          <Badge key={s} severity={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>

      <DoDont
        doPreview={<Badge severity="caution">Caution</Badge>}
        dontPreview={<span aria-hidden="true" className="size-3 rounded-full bg-caution" />}
        doText="Pair every severity colour with its icon or a word."
        dontText="Use a coloured dot alone to mean a status."
      />

      <h2 id="buttons-by-intent" className={H2}>Buttons by intent</h2>
      <Lead>
        Primary for the main action, secondary for alternatives, ghost for quiet actions in toolbars. Use a tone only
        when the action carries it, and let a critical button open a confirmation. Info and Advisory are set with{' '}
        <C>severity</C>; the other tones also have an <C>intent</C> name.
      </Lead>
      <ButtonMatrix />

      <h2 id="badges-by-intent" className={H2}>Badges by intent</h2>
      <Lead>
        Soft is the default. Solid is loud: keep it for problems. Every toned badge carries its severity icon or a dot,
        so it never relies on colour.
      </Lead>
      <BadgeMatrix />

      <h2 id="alerts-by-intent" className={H2}>Alerts by intent</h2>
      <Lead>
        A banner is soft by default; solid is for wall displays where it has to be seen from across the room. See{' '}
        <A href="#/docs/banner">Banner</A> for the full API.
      </Lead>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {ALERTS.map(({ name, tone, title, body, action, icon }) => (
          <Banner
            key={name}
            {...tone}
            title={title}
            icon={icon}
            // Static specimens: do not announce six alerts when the page opens.
            role="note"
            action={
              <Button size="sm" variant="secondary" {...tone}>
                {action}
              </Button>
            }
          >
            {body}
          </Banner>
        ))}
        <Banner severity="critical" variant="solid" title="Solid, for wall displays only" role="note">
          Use when the alert must be seen from across the room.
        </Banner>
        <Banner severity="info" title="Compact, single line" role="note" />
      </div>
      <p className="mt-6 text-ui-sm text-fg-muted">
        Next: <A href="#/docs/tokens">every token with live contrast checks</A> and <A href="#/docs/accessibility">accessibility</A>.
      </p>
    </Page>
  )
}
