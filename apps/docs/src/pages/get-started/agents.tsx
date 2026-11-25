import { Code } from '@openvanta/pikore-react/code'
import { BotIcon, FileIcon } from '@openvanta/pikore-react/icons'
import { Bullets, Callout, Lead } from '../../site/doc.tsx'
import { BASE, PACKAGE, siteUrl } from '../../site/config.ts'
import { useTextFile } from '../../site/hooks.ts'

const FALLBACK = `# Pikore UI

> React + Tailwind v4 components for operational software.

## Rules

- Use severity or intent props, never raw colours.
- Every severity indicator shows an icon or a label.
- Sort overviews worst first.
- Destructive actions use ConfirmTarget.
- Risky actions use PausePoint (3 to 5 items).
- Inputs with safe ranges use LimitedNumberInput.`

const FILES = [
  ['llms.txt', 'Index: what Pikore UI is, plus a link to every component doc.'],
  ['llms-full.txt', 'Setup, rules, tokens and every component doc in one file. Best for a single fetch.'],
  ['components.json', 'Machine-readable catalogue: props with types and defaults, examples, import paths, source URLs.'],
  ['AGENTS.snippet.md', 'Short rules to paste into your project’s AGENTS.md or other agent instructions file.'],
  ['components/button.md', 'One component doc. Every component has one at components/<name>.md.'],
  ['source/button/button.tsx', 'Raw component source, for copying a component into your project.'],
] as const

/** The first lines of the real llms.txt, so the preview never drifts from what agents read. */
const preview = (text: string, lines = 28) => {
  const all = text.trim().split('\n')
  return all.length > lines ? `${all.slice(0, lines).join('\n')}\n…` : all.join('\n')
}

export default function Agents() {
  const llms = useTextFile('llms.txt')
  const prompt = `Build this UI with Pikore UI (${PACKAGE}). Read ${siteUrl('llms.txt')} first, follow its rules, and read the doc for each component you use before writing code. Use severity (normal, info, advisory, caution, critical) or intent (primary, secondary, success, warning, danger) props instead of colours. Sort overviews worst first. Wrap destructive actions in ConfirmTarget, risky changes in PausePoint, and inputs with safe ranges in LimitedNumberInput. Do not guess props.`

  return (
    <>
      <p className="lead">
        Coding agents read the same rules people do. Everything an AI coding agent needs is a plain static
        file on this site: no CLI, server or install step. The files are rebuilt from the component source on every deploy, so
        they never drift.
      </p>

      <h2>llms.txt</h2>
      <Lead>
        The index lives at the site root, in the <a href="https://llmstxt.org">llms.txt</a> format: what the library is, the
        rules, and a link to every component doc. This is the start of the real file.
      </Lead>
      <Code language="text" label={`${BASE}llms.txt`} copyable={false} className="[&_pre]:break-words [&_pre]:whitespace-pre-wrap">
        {llms ? preview(llms) : FALLBACK}
      </Code>

      <h2>Prompt for your agent</h2>
      <Lead>Paste this into your AI coding agent before you ask it to build a screen.</Lead>
      <Code language="text" label="Prompt" className="[&_pre]:break-words [&_pre]:whitespace-pre-wrap">
        {prompt}
      </Code>

      <h2>Files</h2>
      <Lead>Plain files, served as they are. Link to them from your project’s AGENTS.md or other agent instructions file.</Lead>
      <ul className="overflow-hidden rounded-card border border-border bg-surface-raised">
        {FILES.map(([path, description], i) => (
          <li key={path} className={`grid gap-0.5 px-4 py-3 ${i ? 'border-t border-border' : ''}`}>
            <a className="textlink inline-flex w-fit items-center gap-2 font-mono text-ui-sm" href={`${BASE}${path}`}>
              <FileIcon className="size-3.5 text-fg-subtle" />
              {path}
            </a>
            <span className="text-ui-sm text-fg-muted">{description}</span>
          </li>
        ))}
      </ul>

      <h2>What agents get right with it</h2>
      <Bullets>
        <li>
          <b>Stable token names</b> survive theme changes: <code>bg-critical-soft</code> works in light and dark.
        </li>
        <li>
          <b>Rules on every page</b> under Use when, Don’t use when and Common mistakes, written as do and don’t pairs.
        </li>
        <li>
          <b>Props that exist.</b> Each component’s Props table is generated from its source, so an agent cannot invent one.
        </li>
      </Bullets>
      <Callout icon={<BotIcon className="size-4" />}>
        <b>Tip:</b> tell your agent to read the doc for each component before it uses it. That one sentence prevents most wrong
        guesses.
      </Callout>
    </>
  )
}
