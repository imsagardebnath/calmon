import { useMemo, useState, type ComponentType } from 'react'
import { Code } from '@openvanta/calmon-react/code'
import * as icons from '@openvanta/calmon-react/icons'
import { Input } from '@openvanta/calmon-react/input'
import { SeverityIcon, SearchIcon, type IconProps } from '@openvanta/calmon-react/icons'
import { B, Bullets, C, H2, H3, Lead, Page, Specimen, announce, useCopy } from './_kit.tsx'

type IconComponent = ComponentType<IconProps>

// Every export named ...Icon except SeverityIcon, which needs a `severity` prop. Module exports list alphabetically.
const ICONS = (Object.entries(icons) as [string, unknown][])
  .filter(([name, value]) => name.endsWith('Icon') && name !== 'SeverityIcon' && typeof value === 'function')
  .map(([name, value]) => ({ name, Icon: value as IconComponent }))

const SHAPES = [
  { severity: 'normal', shape: 'Circle with a check', word: 'Normal' },
  { severity: 'info', shape: 'Circle with an i', word: 'Info' },
  { severity: 'advisory', shape: 'Diamond', word: 'Advisory' },
  { severity: 'caution', shape: 'Triangle', word: 'Caution' },
  { severity: 'critical', shape: 'Octagon', word: 'Critical' },
] as const

function IconCell({ name, Icon }: { name: string; Icon: IconComponent }) {
  const [copied, copy] = useCopy()
  return (
    <button
      type="button"
      onClick={() => copy(`<${name} />`, `Copied <${name} />`)}
      title={`Copy <${name} />`}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl bg-surface-raised px-2 py-4 font-mono text-[11px] text-fg-muted shadow-[0_0_0_1px_var(--border)] transition-[box-shadow,color] duration-(--duration-fast) hover:text-fg hover:shadow-[0_0_0_1px_var(--border-strong)]"
    >
      <Icon width={22} height={22} className="text-fg" />
      <span className="max-w-full break-words">{copied ? 'Copied' : name}</span>
    </button>
  )
}

function IconSet() {
  const [query, setQuery] = useState('')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? ICONS.filter((i) => i.name.toLowerCase().includes(q)) : ICONS
  }, [query])
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-64 max-w-full">
          <Input
            iconStart={<SearchIcon />}
            placeholder="Filter icons"
            aria-label="Filter icons"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              const n = ICONS.filter((i) => i.name.toLowerCase().includes(e.target.value.trim().toLowerCase())).length
              announce(`${n} icons`)
            }}
          />
        </div>
        <span className="text-ui-sm text-fg-muted" aria-hidden="true">
          {query ? `${shown.length} of ${ICONS.length}` : `${ICONS.length} icons`}
        </span>
      </div>
      {shown.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
          {shown.map(({ name, Icon }) => (
            <IconCell key={name} name={name} Icon={Icon} />
          ))}
        </div>
      ) : (
        <p className="rounded-card bg-surface-sunken px-6 py-10 text-center text-ui-sm text-fg-muted">No icon matches “{query}”.</p>
      )}
    </>
  )
}

export default function Iconography() {
  return (
    <Page>
      <Lead>
        A 24px grid, 2px stroke and round joins. Severity icons have distinct shapes so they read without colour. Each icon
        is a small React component with no dependencies.
      </Lead>

      <h2 id="severity-shapes" className={H2}>Severity shapes</h2>
      <Lead>
        Five levels, five silhouettes: circle with a check, circle with an i, diamond, triangle and octagon. They are the
        reason a status is never colour alone, and the octagon is the only filled one, so it stands out even in greyscale.
        Use <C>SeverityIcon</C> to get the right one for a severity.
      </Lead>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        {SHAPES.map(({ severity, shape, word }) => (
          <div
            key={severity}
            data-tone={severity}
            className="flex flex-col items-start gap-1.5 rounded-xl border border-tone-border bg-tone-soft px-4 py-4"
          >
            <span className="mb-1 text-tone-fg">
              <SeverityIcon severity={severity} width={32} height={32} />
            </span>
            <b className="font-semibold text-tone-fg">{word}</b>
            <span className="text-xs text-fg-muted">{shape}</span>
            <C>{`severity="${severity}"`}</C>
          </div>
        ))}
      </div>

      <h2 id="icon-set" className={H2}>Icon set</h2>
      <Lead>
        {ICONS.length} icons. Click one to copy its JSX. Import each by name from <C>@openvanta/calmon-react/icons</C>.
      </Lead>
      <IconSet />

      <h2 id="usage" className={H2}>Usage</h2>
      <Code language="tsx" label="Icons">{`import { CopyIcon, SeverityIcon } from '@openvanta/calmon-react/icons'

// Decorative by default: hidden from screen readers
<CopyIcon />

// Size and colour come from CSS. Icons draw with currentColor
<CopyIcon className="size-5 text-fg-muted" />

// Meaningful on its own: give it a role and a name
<CopyIcon role="img" aria-label="Copy" />

// The shape for a severity. Pair it with a label
<SeverityIcon severity="caution" /> Caution`}</Code>

      <H3>Sizes</H3>
      <Specimen>
        <div className="flex flex-wrap items-end gap-8">
          {[16, 20, 24, 32].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <icons.GaugeIcon width={s} height={s} />
              <span className="font-mono text-[11px] text-fg-subtle">{s}px</span>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-[60ch] text-ui-sm leading-[1.6] text-fg-muted">
          Icons default to 16px, which sits beside 15px text. Set <C>width</C> and <C>height</C> (or a <C>size-*</C> class) to
          scale one; the stroke scales with it.
        </p>
      </Specimen>

      <H3>Rules</H3>
      <Bullets>
        <li>
          <B>Decorative unless named.</B> An icon next to a label adds nothing for a screen reader, so it is hidden by
          default. An icon that stands alone needs <C>aria-label</C>, or live inside an <C>IconButton</C> with a label.
        </li>
        <li>
          <B>One severity, one shape.</B> Do not use the caution triangle for a decorative warning or the critical octagon
          for an error that is not critical.
        </li>
        <li>
          <B>Do not rely on the icon alone</B> for a status. Show a word beside it.
        </li>
      </Bullets>
    </Page>
  )
}
