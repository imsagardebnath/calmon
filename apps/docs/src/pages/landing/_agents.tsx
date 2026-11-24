// "Agent-ready from the first commit": the design's `.agent` section. The llms.txt excerpt is the first lines of the
// real file served next to the site (fetched, with a fallback while it loads), shown in the library's Code component.
import type { ReactNode } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Code } from '@openvanta/calmon-react/code'
import { ArrowRIcon, BotIcon, FileIcon, LayersIcon, ListCheckIcon } from '@openvanta/calmon-react/icons'
import { PACKAGE, siteUrl } from '../../site/config.ts'
import { useTextFile } from '../../site/hooks.ts'
import { docsHref } from '../../site/router.ts'
import { Section, SectionHead } from './_ui.tsx'

const BASE = import.meta.env.BASE_URL

/** Shown until llms.txt has loaded, and if it cannot be fetched. Mirrors the start of the real file. */
const FALLBACK = `# Calmon

> React + Tailwind CSS v4 components for operational software: monitoring, incident response, admin consoles.

## Docs

- [Setup and rules](llms-full.txt)
- [Component catalogue (JSON)](components.json)

## Components

- [Button](components/button.md): Starts an action.
- [HealthScore](components/health-score.md): One 0 to 100 number from many signals.
…`

/** Longer lines are cut at a word with an ellipsis, so the preview stays narrow. The real file is one click away. */
const clip = (line: string, max = 66) => {
  if (line.length <= max) return line
  const cut = line.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 40))} …`
}

/** The first lines of the real llms.txt: the title, the summary, the doc links and the first components. */
function excerpt(text: string, lines = 17): string {
  const all = text.trim().split('\n').map((l) => clip(l))
  return all.length > lines ? `${all.slice(0, lines).join('\n')}\n…` : all.join('\n')
}

const FILES = [
  ['llms.txt', 'Index of every component'],
  ['llms-full.txt', 'Setup, rules and every doc in one file'],
  ['components.json', 'Props, types and examples as JSON'],
] as const

function Point({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[22px_1fr] gap-3 border-t border-border py-3.5 leading-[1.6] text-fg-muted">
      <span aria-hidden="true" className="mt-1 text-accent-fg">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  )
}

export function Agents() {
  const llms = useTextFile('llms.txt')
  const prompt = `Build this UI with Calmon (${PACKAGE}). Read ${siteUrl('llms.txt')} first, follow its rules, and read the doc for each component you use before writing code. Use severity (normal, info, advisory, caution, critical) or intent (primary, secondary, success, warning, danger) props instead of colours. Wrap every destructive action in ConfirmTarget and every risky change in PausePoint. Do not guess props.`

  return (
    <Section id="agents">
      <div className="grid items-start gap-10 min-[68.75rem]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[68.75rem]:gap-16">
        <div>
          <SectionHead
            id="agents"
            title="Agent-ready from the first commit."
            lede="Coding agents read the same docs you do, in a format built for them. Every component page has a plain-text twin."
          />
          <ul className="m-0 mt-8 flex list-none flex-col p-0">
            <Point icon={<FileIcon className="size-4" />}>
              <b className="font-semibold text-fg">llms.txt and llms-full.txt</b> at the site root, listing every component with
              props and rules.
            </Point>
            <Point icon={<ListCheckIcon className="size-4" />}>
              <b className="font-semibold text-fg">Rules, not just props.</b> Each page says when to use the component and which
              mistakes to avoid.
            </Point>
            <Point icon={<LayersIcon className="size-4" />}>
              <b className="font-semibold text-fg">Stable token names</b> so generated code survives a theme change.
            </Point>
            <Point icon={<BotIcon className="size-4" />}>
              <b className="font-semibold text-fg">A copyable prompt</b> that tells your agent how to build with Calmon.
            </Point>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {FILES.map(([file, hint]) => (
              <Button key={file} asChild variant="secondary" size="sm" className="font-mono" title={hint}>
                <a href={`${BASE}${file}`}>
                  {file}
                  <ArrowRIcon className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
            ))}
            <Button asChild variant="ghost" size="sm">
              <a href={docsHref('agents')}>How agents use it</a>
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Code language="text" label={`${BASE}llms.txt`} copyable={false}>
            {llms ? excerpt(llms) : FALLBACK}
          </Code>
          <Code language="text" label="Prompt for your coding agent" className="[&_pre]:break-words [&_pre]:whitespace-pre-wrap">
            {prompt}
          </Code>
        </div>
      </div>
    </Section>
  )
}
