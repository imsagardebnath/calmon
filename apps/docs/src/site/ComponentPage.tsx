import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import type { Token, Tokens } from 'marked'
import { Badge } from '@calmon/react/badge'
import { Button } from '@calmon/react/button'
import { Code } from '@calmon/react/code'
import { Tab, Tabs, TabsList, TabsPanel } from '@calmon/react/tabs'
import { CheckIcon, CopyIcon, FileIcon, GithubIcon, GridIcon, InfoIcon, XIcon } from '@calmon/react/icons'
import type { DocEntry, DocExample } from '../registry.ts'
import { BASE, REPO_URL, VERSION } from './config.ts'
import { useCopy, useProps, type PropDoc } from './hooks.ts'
import { inline, isMarker, listItems, MarkdownBlocks, splitSections, type Section } from './markdown.tsx'
import { docsHref } from './router.ts'
import { pages, type DocPage } from './pages.ts'
import { humanize, slugify, typo } from './slug.ts'

/* ------------------------------------------------------------------ small pieces */

function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id}>{children}</h2>
}

const STATUS = {
  stable: { severity: 'normal', label: 'Stable' },
  beta: { severity: 'info', label: 'Beta' },
  experimental: { severity: 'advisory', label: 'Experimental' },
  deprecated: { severity: 'caution', label: 'Deprecated' },
} as const

/** Badges under the title: status, signature, version, and links to the .md and the source. */
export function ComponentMeta({ page }: { page: DocPage }) {
  const entry = page.entry
  if (!entry) return null
  const status = STATUS[entry.status as keyof typeof STATUS]
  return (
    <>
      {status ? <Badge severity={status.severity}>{status.label}</Badge> : <Badge>{typo(entry.status)}</Badge>}
      {page.signature ? <Badge intent="primary">Signature</Badge> : null}
      <Badge>v{VERSION}</Badge>
      <a href={`${BASE}components/${entry.slug}.md`} aria-label={`Markdown doc for agents: ${entry.slug}.md`}>
        <Badge icon={<FileIcon className="size-[13px]" />}>{entry.slug}.md</Badge>
      </a>
      <a
        href={`${REPO_URL}/blob/main/packages/ui/src/${entry.slug}/${entry.slug}.tsx`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Source of ${entry.name} on GitHub (opens in a new tab)`}
      >
        <Badge icon={<GithubIcon className="size-[13px]" />}>Source</Badge>
      </a>
    </>
  )
}

/** Keeps one broken example from taking the whole page down. */
class ExampleBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Docs example failed to render', error, info.componentStack)
  }
  override render() {
    return this.state.failed ? (
      <p className="text-ui-sm text-critical-fg" role="alert">
        This example failed to render. See the console.
      </p>
    ) : (
      this.props.children
    )
  }
}

function ExampleCard({ ex }: { ex: DocExample }) {
  const [tab, setTab] = useState('preview')
  const { copied, copy } = useCopy()
  const title = humanize(ex.name)
  const id = `example-${slugify(ex.name)}`
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="ex-title" data-toc>
        {title}
      </h3>
      <p className="ex-desc">{ex.description}</p>
      <div className="example" data-example>
        <Tabs value={tab} onValueChange={setTab}>
          <div className="example-h">
            <TabsList aria-label={`${title}: preview or code`}>
              <Tab value="preview">Preview</Tab>
              <Tab value="code">Code</Tab>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              className="copy"
              iconStart={copied ? <CheckIcon /> : <CopyIcon />}
              onClick={() => copy(ex.fullCode)}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <span role="status" aria-live="polite" className="sr-only">
              {copied ? 'Copied to clipboard' : ''}
            </span>
          </div>
          <TabsPanel value="preview" className="ex-p">
            <div className="ex-in">
              <ExampleBoundary>
                <ex.Component />
              </ExampleBoundary>
            </div>
          </TabsPanel>
          <TabsPanel value="code" className="ex-c">
            <Code copyable={false} language="tsx" className="rounded-none border-0">
              {ex.fullCode}
            </Code>
          </TabsPanel>
        </Tabs>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ props */

/** `"a" | "b" | "c"` as separate chips, so long unions stay readable. */
function unionParts(type: string): string[] | null {
  const parts = type.split(' | ')
  return parts.length > 1 && parts.every((p) => /^("[^"]*"|'[^']*'|[\w.]+)$/.test(p)) ? parts : null
}

function PropsTable({ props }: { props: PropDoc[] | null | undefined }) {
  if (props === undefined) return <p className="lead">Loading props…</p>
  if (props === null) {
    return (
      <div className="callout">
        <InfoIcon className="size-4" />
        <span>
          The props table is generated from the component source. Run <code>npm run agent-docs</code> to create{' '}
          <code>components.json</code>, then reload.
        </span>
      </div>
    )
  }
  if (!props.length) {
    return <p className="lead">This component has no props of its own: it takes the standard HTML props of its element.</p>
  }
  return (
    <>
      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => {
              const union = unionParts(p.type)
              return (
                <tr key={p.name}>
                  <td className="prop-name">
                    <code className="inline">{p.name}</code>
                    {p.required ? (
                      <>
                        <span aria-hidden="true" className="ml-0.5 text-critical-fg">
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </>
                    ) : null}
                  </td>
                  <td className="prop-type">
                    {union ? (
                      union.map((part) => (
                        <span key={part} className="tchip">
                          {part}
                        </span>
                      ))
                    ) : (
                      <span className="tcode">{p.type}</span>
                    )}
                  </td>
                  <td>{p.default ? <span className="tchip">{p.default}</span> : <span className="text-fg-subtle">—</span>}</td>
                  <td className="prop-desc" dangerouslySetInnerHTML={{ __html: inline(p.description) }} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-ui-sm text-fg-subtle">All other props are passed to the underlying HTML element.</p>
    </>
  )
}

/* ------------------------------------------------------------------ sections from the .md */

/** Use when / Don't use when: a card with a tick or cross per line. */
function Ticks({ section, tone }: { section: Section; tone: 'normal' | 'critical' }) {
  const items = listItems(section.tokens)
  if (!items) return <MarkdownBlocks tokens={section.tokens} />
  const Mark = tone === 'normal' ? CheckIcon : XIcon
  return (
    <div className="dd-card" data-tone={tone}>
      <ul className="ticks">
        {items.map((html, i) => (
          <li key={i}>
            <Mark className="size-4" />
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const A11Y_GROUPS: [string, RegExp][] = [
  [
    'Semantics',
    /^(renders?|built on|uses?|is a|a native|native)\b|native `<|\brole\b|\broles\b|aria-(sort|current|selected|controls|expanded|haspopup)/i,
  ],
  ['Keyboard', /keyboard|arrow|\benter\b|\bspace\b|escape|\besc\b|\bhome\b|\bend\b|tab order|tab key|shortcut|typing|key press/i],
  ['Focus', /\bfocus/i],
  ['Screen readers', /screen reader|announce|aria-live|live region|assertive|polite|read out|reads? /i],
  ['Labels', /label|accessible name|aria-describedby/i],
  ['Colour', /colou?r|contrast|greyscale|never the only|icon shape/i],
  ['Motion', /motion|animation|reduced/i],
]

/** Accessibility bullets grouped under short keys, as the design's two-column list. */
function A11y({ section }: { section: Section }) {
  const items = listItems(section.tokens)
  if (!items) return <MarkdownBlocks tokens={section.tokens} />
  const groups = new Map<string, string[]>()
  for (const html of items) {
    const text = html.replace(/<[^>]+>/g, '')
    const key = A11Y_GROUPS.find(([, re]) => re.test(text))?.[0] ?? 'Details'
    groups.set(key, [...(groups.get(key) ?? []), html])
  }
  const order = [...A11Y_GROUPS.map(([k]) => k), 'Details'].filter((k) => groups.has(k))
  return (
    <div className="a11y">
      {order.map((key) => (
        <div key={key}>
          <span className="k">{key}</span>
          <div className="v">
            {groups.get(key)!.map((html, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface Side {
  kind: 'wrong' | 'right'
  text: string
  code: Tokens.Code[]
}

const SIDE = /^(wrong|bad|don'?t|right|good|do)\s*:\s*/i
const WRONG = /^(wrong|bad|don'?t)/i

/** Pair up "Wrong: ... / Right: ..." paragraphs with their snippets. Null when the section has another shape. */
function pairs(tokens: Token[]): Side[][] | null {
  const sides: Side[] = []
  for (const t of tokens) {
    if (t.type === 'space' || isMarker(t)) continue
    if (t.type === 'paragraph') {
      const text = (t as Tokens.Paragraph).text
      const m = SIDE.exec(text)
      if (!m) return null
      sides.push({ kind: WRONG.test(m[1]!) ? 'wrong' : 'right', text: text.slice(m[0].length), code: [] })
    } else if (t.type === 'code' && sides.length) sides.at(-1)!.code.push(t as Tokens.Code)
    else return null
  }
  const out: Side[][] = []
  for (const side of sides) {
    const last = out.at(-1)
    if (side.kind === 'right' && last && last.length === 1 && last[0]!.kind === 'wrong') last.push(side)
    else out.push([side])
  }
  return out.length ? out : null
}

const sentence = (text: string) => {
  const t = text.trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}

function MistakeCard({ side }: { side: Side }) {
  const wrong = side.kind === 'wrong'
  return (
    <div className="dd-card" data-tone={wrong ? 'critical' : 'normal'}>
      <div className="dd-t">
        <b className="lbl">
          {wrong ? <XIcon className="size-4" /> : <CheckIcon className="size-4" />}
          {wrong ? 'Don’t' : 'Do'}
        </b>
        <span dangerouslySetInnerHTML={{ __html: inline(sentence(side.text)) }} />
      </div>
      {side.code.map((c, i) => (
        <Code
          key={i}
          copyable={false}
          language={(c.lang ?? '').split(/\s/)[0] || 'tsx'}
          className="rounded-none border-0 border-t border-border [&_pre]:break-words [&_pre]:whitespace-pre-wrap"
        >
          {c.text}
        </Code>
      ))}
    </div>
  )
}

function Mistakes({ section }: { section: Section }) {
  const groups = pairs(section.tokens)
  if (!groups) return <MarkdownBlocks tokens={section.tokens} />
  return (
    <>
      {groups.map((group, i) => (
        <div key={i} className="dd">
          {group.map((side, j) => (
            <MistakeCard key={j} side={side} />
          ))}
        </div>
      ))}
    </>
  )
}

function Related({ entry }: { entry: DocEntry }) {
  const found = entry.related.map((name) => pages.find((p) => p.entry?.name === name)).filter((p): p is DocPage => !!p)
  if (!found.length) return null
  return (
    <>
      <H2 id="related">Related</H2>
      <div className="linkcards">
        {found.map((p) => (
          <a key={p.id} className="linkcard" href={docsHref(p.id)}>
            <span className="lc-ic">
              <GridIcon className="size-4" />
            </span>
            <b>{p.title}</b>
            <span>{p.description}</span>
          </a>
        ))}
      </div>
    </>
  )
}

/** The component first, then its parts and hooks. One line when it fits, otherwise one name per line. */
function importSnippet(entry: DocEntry): string {
  const names = entry.exports.length
    ? [...entry.exports.filter((n) => n === entry.name), ...entry.exports.filter((n) => n !== entry.name)]
    : [entry.name]
  const line = `import { ${names.join(', ')} } from '${entry.importPath}'`
  return line.length <= 64 ? line : `import {\n  ${names.join(',\n  ')},\n} from '${entry.importPath}'`
}

const norm = (s: string) => s.trim().toLowerCase()
const KNOWN = new Set(['use when', "don't use when", 'setup', 'props', 'examples', 'accessibility', 'common mistakes'])

/** The body of a component page. The title, description and badges come from the layout. */
export function ComponentPage({ entry }: { entry: DocEntry }) {
  const props = useProps(entry.slug)
  const { sections } = splitSections(entry.body)
  const named = (name: string) => sections.find((s) => norm(s.title) === name)
  const setup = named('setup')
  const examples = named('examples')
  const propsSection = named('props')
  const useWhen = named('use when')
  const dontUse = named("don't use when")
  const a11y = named('accessibility')
  const mistakes = named('common mistakes')
  const extra = sections.filter((s) => !KNOWN.has(norm(s.title)))
  const withoutMarkers = (s?: Section) => (s ? s.tokens.filter((t) => !isMarker(t)) : [])

  return (
    <div className="doc-body">
      <H2 id="import">Import</H2>
      <Code language="tsx" label="tsx">
        {importSnippet(entry)}
      </Code>
      <p className="lead mt-3 text-ui-sm">
        Each component has its own entry point, so you only ship what you use. Everything is also exported from{' '}
        <code>@calmon/react</code>.
      </p>

      {setup ? (
        <>
          <H2 id="setup">Setup</H2>
          <MarkdownBlocks tokens={setup.tokens} />
        </>
      ) : null}

      <H2 id="examples">Examples</H2>
      {examples && withoutMarkers(examples).length ? <MarkdownBlocks tokens={withoutMarkers(examples)} /> : null}
      {entry.examples.length ? (
        entry.examples.map((ex) => <ExampleCard key={ex.name} ex={ex} />)
      ) : (
        <p className="lead">No examples yet.</p>
      )}

      <H2 id="props">Props</H2>
      <PropsTable props={props} />
      {propsSection && withoutMarkers(propsSection).length ? <MarkdownBlocks tokens={withoutMarkers(propsSection)} /> : null}

      {extra.map((s) => (
        <section key={s.title}>
          <H2 id={slugify(s.title)}>{typo(s.title)}</H2>
          <MarkdownBlocks tokens={s.tokens} />
        </section>
      ))}

      {useWhen ? (
        <>
          <H2 id="use-when">Use when</H2>
          <Ticks section={useWhen} tone="normal" />
        </>
      ) : null}
      {dontUse ? (
        <>
          <H2 id="dont-use-when">{typo(dontUse.title)}</H2>
          <Ticks section={dontUse} tone="critical" />
        </>
      ) : null}
      {a11y ? (
        <>
          <H2 id="accessibility">Accessibility</H2>
          <A11y section={a11y} />
        </>
      ) : null}
      {mistakes ? (
        <>
          <H2 id="common-mistakes">Common mistakes</H2>
          <Mistakes section={mistakes} />
        </>
      ) : null}
      <Related entry={entry} />
    </div>
  )
}
