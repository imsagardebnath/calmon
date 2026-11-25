// Search over page titles, descriptions, component names and headings, in the library CommandPalette.
//
// The palette keeps its own query. This wrapper listens for the input event on the dialog so it can swap the
// groups: with an empty query it shows Recent and Suggested pages; while typing it shows matches only, grouped
// by section, with a small cap per group so the list stays short.
import { useEffect, useMemo, useState } from 'react'
import { CommandPalette, type CommandGroup, type CommandItem } from '@openvanta/pikore-react/command-palette'
import { usePikore } from '@openvanta/pikore-react/provider'
import { CmdIcon, GridIcon, HashIcon } from '@openvanta/pikore-react/icons'
import { BASE, INSTALL_COMMAND } from './config.ts'
import { readRecent } from './hooks.ts'
import { SectionIcon } from './icons.tsx'
import { splitSections } from './markdown.tsx'
import { docsHref, navigate } from './router.ts'
import { getPage, pages, pageSources, sourcePathOf, type DocPage } from './pages.ts'
import { humanize, slugify, typo } from './slug.ts'

interface Heading {
  page: DocPage
  title: string
  anchor: string
}

const pageItem = (p: DocPage): CommandItem => ({
  id: `page:${p.id}`,
  label: p.title,
  description: p.group ? `${p.group} · ${p.description}` : p.description,
  icon: p.entry ? <GridIcon className="size-4" /> : <SectionIcon name={p.icon} className="size-4" />,
  keywords: [p.id, p.section, p.group ?? '', p.entry?.name ?? ''].filter(Boolean),
})

const headingItem = (h: Heading): CommandItem => ({
  id: `head:${h.page.id}#${h.anchor}`,
  label: `${h.page.title} › ${h.title}`,
  description: h.page.group ? `${h.page.section} · ${h.page.group}` : h.page.section,
  icon: <HashIcon className="size-4" />,
})

/** Headings of the component pages are known from their .md files. */
function componentHeadings(): Heading[] {
  const out: Heading[] = []
  for (const page of pages) {
    if (!page.entry) continue
    const { sections } = splitSections(page.entry.body)
    out.push({ page, title: 'Import', anchor: 'import' })
    for (const s of sections) out.push({ page, title: typo(s.title), anchor: slugify(s.title) })
    for (const ex of page.entry.examples) out.push({ page, title: `Example: ${humanize(ex.name)}`, anchor: `example-${slugify(ex.name)}` })
  }
  return out
}

/** Headings of static pages: the h2 elements in their source, read lazily the first time search opens. */
async function staticHeadings(): Promise<Heading[]> {
  const out: Heading[] = []
  const files = Object.entries(pageSources)
  await Promise.all(
    pages
      .filter((p) => !p.entry && sourcePathOf(p.id))
      .map(async (page) => {
        const load = files.find(([path]) => path === sourcePathOf(page.id))?.[1]
        if (!load) return
        const source = await load()
        for (const m of source.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)) {
          const text = m[1]!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          if (text && !/[{}]/.test(text)) out.push({ page, title: text, anchor: slugify(text) })
        }
      }),
  )
  return out
}

let headingIndex: Promise<Heading[]> | undefined
const loadHeadings = () => (headingIndex ??= staticHeadings().then((s) => [...s, ...componentHeadings()]))

/** The same rules as the palette: a substring of the label, description or keywords, or the letters in order. */
function matches(item: CommandItem, q: string): boolean {
  const has = (s?: string) => !!s && s.toLowerCase().includes(q)
  if (has(item.label) || has(item.description) || item.keywords?.some((k) => has(k))) return true
  const label = item.label.toLowerCase()
  let from = 0
  for (const ch of q) {
    if (ch === ' ') continue
    const at = label.indexOf(ch, from)
    if (at < 0) return false
    from = at + 1
  }
  return true
}

const SUGGESTED = ['introduction', 'installation', 'theming', 'agents', 'components', 'principles']
const CAP = { Components: 8, Sections: 7, default: 5 } as Record<string, number>

const ACTIONS: CommandItem[] = [
  { id: 'act:theme', label: 'Toggle theme', description: 'Switch between light and dark', icon: <CmdIcon className="size-4" />, keywords: ['dark', 'light', 'mode'] },
  { id: 'act:install', label: 'Copy install command', description: INSTALL_COMMAND, icon: <CmdIcon className="size-4" />, keywords: ['npm'] },
  { id: 'act:llms', label: 'Open llms.txt', description: 'Plain-text docs for coding agents', icon: <CmdIcon className="size-4" />, keywords: ['agents', 'ai'] },
]

function buildGroups(query: string, headings: Heading[], recent: string[], currentId?: string): CommandGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    const recents = recent
      .filter((id) => id !== currentId)
      .map((id) => getPage(id))
      .filter((p): p is DocPage => !!p)
      .slice(0, 5)
    const seen = new Set(recents.map((p) => p.id))
    const suggested = SUGGESTED.map((id) => getPage(id)).filter((p): p is DocPage => !!p && !seen.has(p.id))
    return [
      { label: 'Recent', items: recents.map(pageItem) },
      { label: 'Suggested', items: suggested.map(pageItem) },
      { label: 'Actions', items: ACTIONS },
    ].filter((g) => g.items.length)
  }

  const bySection = new Map<string, CommandItem[]>()
  for (const p of pages) {
    const item = pageItem(p)
    if (matches(item, q)) bySection.set(p.section, [...(bySection.get(p.section) ?? []), item])
  }
  const groups: CommandGroup[] = [...bySection].map(([label, items]) => ({
    label,
    items: items.slice(0, CAP[label] ?? CAP.default!),
  }))
  const heads = headings.map(headingItem).filter((i) => matches(i, q)).slice(0, CAP.Sections)
  if (heads.length) groups.push({ label: 'Sections', items: heads })
  const actions = ACTIONS.filter((a) => matches(a, q))
  if (actions.length) groups.push({ label: 'Actions', items: actions })
  return groups
}

export function SearchPalette({
  open,
  onOpenChange,
  currentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The page being read: left out of Recent. */
  currentId?: string
}) {
  const [query, setQuery] = useState('')
  const [headings, setHeadings] = useState<Heading[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const { resolvedTheme, setTheme } = usePikore()

  useEffect(() => {
    if (!open) return
    setRecent(readRecent())
    let live = true
    loadHeadings().then((h) => live && setHeadings(h))
    return () => {
      live = false
    }
  }, [open])

  const groups = useMemo(() => buildGroups(query, headings, recent, currentId), [query, headings, recent, currentId])

  function run(item: CommandItem) {
    const sep = item.id.indexOf(':')
    const kind = item.id.slice(0, sep)
    const rest = item.id.slice(sep + 1)
    if (kind === 'page') navigate(docsHref(rest))
    else if (kind === 'head') {
      const [id = '', anchor = ''] = rest.split('#')
      navigate(docsHref(id, anchor))
    } else if (rest === 'theme') setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    else if (rest === 'install') navigator.clipboard?.writeText(INSTALL_COMMAND).catch(() => {})
    else if (rest === 'llms') window.open(`${BASE}llms.txt`, '_blank', 'noopener')
  }

  return (
    <CommandPalette
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        onOpenChange(next)
      }}
      groups={groups}
      onSelect={run}
      placeholder="Search docs, components and headings"
      emptyText="Check the spelling, or search for a component name like “Dialog”."
      onInput={(e) => {
        if (e.target instanceof HTMLInputElement) setQuery(e.target.value)
      }}
    />
  )
}
