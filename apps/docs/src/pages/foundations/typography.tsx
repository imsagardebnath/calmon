import { Code } from '@openvanta/pikore-react/code'
import { A, B, Bullets, C, H2, Lead, Page, Specimen } from './_kit.tsx'
import { useLive } from './_tokens.ts'

interface Step {
  /** Design name, as in the tokens: --fs-3xl. */
  token: string
  px: number
  /** Tailwind class that sets this size. */
  cls: string
  /** Sample copy and the classes that dress it. */
  sample: string
  look: string
}

// Class names are written out in full so Tailwind can see them. sm, md and the numerals have their own
// utilities because they sit between Tailwind's defaults: see "Font sizes" in AGENTS.md.
const SCALE: Step[] = [
  { token: '3xl', px: 60, cls: 'text-6xl', sample: 'Station view', look: 'text-6xl leading-none font-[650] tracking-[-0.035em]' },
  { token: '2xl', px: 36, cls: 'text-4xl', sample: 'Page title', look: 'text-4xl font-[650] tracking-[-0.025em]' },
  { token: 'xl', px: 24, cls: 'text-2xl', sample: 'Section heading', look: 'text-2xl font-[650]' },
  { token: 'lg', px: 18, cls: 'text-lg', sample: 'Lede and descriptions', look: 'text-lg' },
  { token: 'md', px: 15, cls: 'text-ui', sample: 'Body and controls', look: 'text-ui' },
  { token: 'sm', px: 13, cls: 'text-ui-sm', sample: 'Hints, table cells, labels', look: 'text-ui-sm' },
  { token: 'xs', px: 12, cls: 'text-xs', sample: 'Badges, captions', look: 'text-xs' },
]

interface Numeral {
  token: string
  px: number
  cls: string
  use: string
}

const NUMERALS: Numeral[] = [
  { token: 'numeral-xl', px: 88, cls: 'text-numeral-xl', use: 'Station and wall displays' },
  { token: 'numeral-lg', px: 48, cls: 'text-numeral-lg', use: 'VitalTile, comfortable' },
  { token: 'numeral-md', px: 30, cls: 'text-numeral-md', use: 'Station tiles, compact' },
  { token: 'numeral-sm', px: 16, cls: 'text-numeral-sm', use: 'Table cells, inline metrics' },
]

const ROW = 'grid grid-cols-1 items-baseline gap-x-4 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[100px_120px_minmax(0,1fr)]'

function Meta({ token, px, cls }: { token: string; px: number; cls: string }) {
  return (
    <>
      <code className="font-mono text-[11px] text-fg-subtle">
        {token} · {px}px
      </code>
      <code className="font-mono text-[11px] text-accent-fg">{cls}</code>
    </>
  )
}

export default function Typography() {
  const live = useLive()
  return (
    <Page>
      <Lead>
        <B>Instrument Sans</B> is a refined grotesque, crisp at 12px and elegant at display sizes with tight tracking.{' '}
        <B>Azeret Mono</B> sets code and every metric; numerals use weight 300 and tabular figures so columns align and big
        values read calm.
      </Lead>

      <h2 id="typefaces" className={H2}>Typefaces</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Specimen title="Instrument Sans">
          <p className="font-sans text-7xl leading-none font-semibold tracking-[-0.035em]" aria-hidden="true">
            Aa
          </p>
          <p className="mt-4 font-sans text-lg leading-snug">Alert acknowledged by R. Iyer at 14:32 UTC.</p>
          <p className="mt-2 font-sans text-ui-sm break-all text-fg-muted">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz</p>
          <dl className="mt-5 space-y-1.5 text-ui-sm">
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Use</dt>
              <dd className="text-fg-muted">Interface and prose</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Weights</dt>
              <dd className="text-fg-muted">400 text, 550 controls, 600 headings, 650 display</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Token</dt>
              <dd className="min-w-0">
                <C>--font-sans</C>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-fg-subtle">Stack</dt>
              <dd className="min-w-0 font-mono text-[11px] break-words text-fg-muted">{live('--font-sans')}</dd>
            </div>
          </dl>
        </Specimen>

        <Specimen title="Azeret Mono">
          <p className="num font-mono text-7xl leading-none" aria-hidden="true">
            Aa
          </p>
          <p className="mt-4 font-mono text-ui leading-snug">orders-eu · 412 ms · 0.42%</p>
          <p className="num mt-2 text-numeral-md">0123456789</p>
          <dl className="mt-5 space-y-1.5 text-ui-sm">
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Use</dt>
              <dd className="text-fg-muted">Code and numerals</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Weights</dt>
              <dd className="text-fg-muted">300 numerals, 400 and 500 code</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 text-fg-subtle">Token</dt>
              <dd className="min-w-0">
                <C>--font-mono</C>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-fg-subtle">Stack</dt>
              <dd className="min-w-0 font-mono text-[11px] break-words text-fg-muted">{live('--font-mono')}</dd>
            </div>
          </dl>
        </Specimen>
      </div>

      <h2 id="type-scale" className={H2}>Type scale</h2>
      <Lead>
        Seven sizes. The design names run from <C>xs</C> to <C>3xl</C>. Most map onto a Tailwind size; the two that sit
        between Tailwind’s defaults, 13px and 15px, are <C>text-ui-sm</C> and <C>text-ui</C>. Body text and controls are
        15px; hints, table cells and labels are 13px.
      </Lead>
      <Specimen title="Instrument Sans, by size">
        {SCALE.map((s) => (
          <div key={s.token} className={ROW}>
            <Meta token={s.token} px={s.px} cls={s.cls} />
            <span className={`min-w-0 break-words ${s.look}`}>{s.sample}</span>
          </div>
        ))}
      </Specimen>

      <h2 id="numerals" className={H2}>Numerals</h2>
      <Lead>
        Azeret Mono Light with tabular figures. Add the <C>num</C> class for the family, weight and tracking, and a{' '}
        <C>text-numeral-*</C> size. Digits keep their width, so a column of values lines up and a changing value does not
        jitter.
      </Lead>
      <Specimen title="Numerals, Azeret Mono Light, tabular">
        {NUMERALS.map((n) => (
          <div key={n.token} className={ROW}>
            <Meta token={n.token} px={n.px} cls={n.cls} />
            <span className="min-w-0">
              <span className={`num ${n.cls} ${n.px >= 80 ? 'leading-none' : ''}`}>
                {n.token === 'numeral-xl' ? '98.6' : n.token === 'numeral-lg' ? '412' : n.token === 'numeral-md' ? '1,284' : '0.42% · 37/min'}
              </span>
              {n.token === 'numeral-lg' ? <span className="ml-1 text-ui text-fg-muted">ms</span> : null}
              <span className="ml-4 text-xs text-fg-subtle">{n.use}</span>
            </span>
          </div>
        ))}
      </Specimen>

      <h2 id="line-height-and-measure" className={H2}>Line height and measure</h2>
      <Lead>
        UI text sits at 1.4 (<C>--leading-ui</C>), prose at 1.65 (<C>--leading-prose</C>), and prose stays under about 68
        characters a line.
      </Lead>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Specimen title="UI, 1.4">
          <p className="text-ui leading-(--leading-ui)">
            Payments are failing in eu-west. The error rate is 4.2% and rising. R. Iyer is on it and will post an update
            every 15 minutes until it is resolved.
          </p>
        </Specimen>
        <Specimen title="Prose, 1.65">
          <p className="text-ui leading-(--leading-prose)">
            Payments are failing in eu-west. The error rate is 4.2% and rising. R. Iyer is on it and will post an update
            every 15 minutes until it is resolved.
          </p>
        </Specimen>
      </div>

      <h2 id="rules" className={H2}>Rules</h2>
      <Bullets>
        <li>Sentence case everywhere, including buttons and headings.</li>
        <li>Prose at 1.65 line height and under 70 characters per line; UI at 1.4.</li>
        <li>Numbers that update use tabular figures and never animate counting.</li>
        <li>
          Set big metrics in Light (300), not Regular. They read calm and precise rather than loud, and the unit next to
          them stays small and muted.
        </li>
        <li>
          Tighten tracking as the size grows: about <C>-0.018em</C> for headings, <C>-0.035em</C> at display sizes.
        </li>
      </Bullets>

      <h2 id="in-code" className={H2}>In code</h2>
      <Lead>
        Use the classes, not pixel values. The tokens behind them are listed on <A href="#/docs/tokens">Design tokens</A>.
      </Lead>
      <Code language="tsx" label="Type classes">{`<h2 className="text-2xl font-semibold tracking-[-0.02em]">Section heading</h2>
<p className="text-ui text-fg-muted">Body and controls</p>
<p className="text-ui-sm text-fg-subtle">Hints, table cells, labels</p>

{/* A metric: mono, tabular, light, with a small muted unit */}
<p>
  <span className="num text-numeral-lg">412</span>
  <span className="text-ui text-fg-muted"> ms</span>
</p>`}</Code>
    </Page>
  )
}
