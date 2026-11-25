// The page registry: every docs page, in sidebar order, with its metadata and (for static pages) its lazy body.
//
//  - Static pages live at src/pages/<group>/<id>.tsx (default export). The file basename is the route id.
//    The one exception: pages/components/overview.tsx is the page with id "components".
//  - Component pages are generated from packages/ui/src/<slug>/<slug>.md (see registry.ts).
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { buildNav, type NavIcon, type NavPage, type NavSection } from '../nav.ts'
import { entries, type DocEntry } from '../registry.ts'

type Loader = () => Promise<{ default: ComponentType }>

const modules = import.meta.glob<{ default: ComponentType }>('../pages/**/*.tsx')

const loaders = new Map<string, { load: Loader; path: string }>()
for (const [path, load] of Object.entries(modules)) {
  const base = path.split('/').at(-1)!.replace(/\.tsx$/, '')
  if (base === 'index') continue // landing/index.tsx is the home page, not a docs page
  const id = base === 'overview' && path.includes('/pages/components/') ? 'components' : base
  loaders.set(id, { load, path })
}

/** Component categories that hold the library's signature components (shown with an accent badge). */
const SIGNATURE = new Set(['Monitoring', 'Safety'])
/** Pages whose content uses the full width instead of the reading column. */
const WIDE = new Set(['components', 'colour', 'tokens', 'responsive'])

export interface DocPage extends NavPage {
  /** Sidebar section name, e.g. "Get started". */
  section: string
  icon: NavIcon
  /** Component sub-group, e.g. "Actions". */
  group?: string
  /** Set for component pages generated from a .md file. */
  entry?: DocEntry
  signature: boolean
  wide: boolean
  /** Repo path of the file to edit, for the "Edit this page" link. */
  editPath?: string
}

export interface SidebarSection {
  name: string
  icon: NavIcon
  pages: DocPage[]
  groups: { name: string; pages: DocPage[] }[]
}

type NavWithGroups = NavSection & { groups?: { name: string; pages: NavPage[] }[] }

const entryBySlug = new Map(entries.map((e) => [e.slug, e]))

/** Ids of the pages that are not components. A component whose folder slug clashes with one (for example a
 * ConfirmTarget component next to the "confirm-target" safety pattern) is served at "<slug>-component". */
const staticIds = new Set(
  buildNav([])
    .filter((s) => s.name !== 'Components')
    .flatMap((s) => s.pages.map((p) => p.id)),
)

function toPage(section: NavSection, p: NavPage, group?: string): DocPage {
  const isComponent = section.name === 'Components' && p.id !== 'components'
  const entry = isComponent ? entryBySlug.get(p.id) : undefined
  const source = loaders.get(p.id)?.path
  const id = isComponent && staticIds.has(p.id) ? `${p.id}-component` : p.id
  return {
    ...p,
    id,
    section: section.name,
    icon: section.icon,
    group,
    entry,
    signature: !!entry && SIGNATURE.has(entry.category),
    wide: WIDE.has(p.id),
    editPath: entry ? `packages/ui/src/${entry.slug}/${entry.slug}.md` : source?.replace(/^\.\./, 'apps/docs/src'),
  }
}

export const sections: SidebarSection[] = (buildNav(entries) as NavWithGroups[]).map((s) => ({
  name: s.name,
  icon: s.icon,
  pages: s.pages.map((p) => toPage(s, p)),
  groups: (s.groups ?? []).map((g) => ({ name: g.name, pages: g.pages.map((p) => toPage(s, p, g.name)) })),
}))

/** Every page in sidebar order (a section's own pages first, then its groups). */
export const pages: DocPage[] = sections.flatMap((s) => [...s.pages, ...s.groups.flatMap((g) => g.pages)])

const byId = new Map(pages.map((p) => [p.id, p]))

export const getPage = (id: string): DocPage | undefined => byId.get(id)

export function neighbours(id: string): { prev?: DocPage; next?: DocPage } {
  const i = pages.findIndex((p) => p.id === id)
  return i < 0 ? {} : { prev: pages[i - 1], next: pages[i + 1] }
}

/** Is there a page file for this static id? Component pages need none. */
export const hasBody = (id: string) => loaders.has(id)

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>()

/** The lazy body of a static page, or undefined when its file is not there yet. Stable across renders. */
export function bodyOf(id: string): LazyExoticComponent<ComponentType> | undefined {
  const found = loaders.get(id)
  if (!found) return undefined
  let body = lazyCache.get(id)
  if (!body) {
    body = lazy(found.load)
    lazyCache.set(id, body)
  }
  return body
}

/** Source of a static page as text, loaded on demand (used to index its headings for search). */
export const pageSources = import.meta.glob<string>('../pages/**/*.tsx', { query: '?raw', import: 'default' })
export const sourcePathOf = (id: string) => loaders.get(id)?.path

/** Which top-nav link a page belongs under. */
export type TopLink = 'docs' | 'patterns' | 'components'
export function topLinkOf(page: DocPage | undefined): TopLink | undefined {
  if (!page) return undefined
  if (page.section === 'Components') return 'components'
  if (page.section === 'Safety patterns') return 'patterns'
  return 'docs'
}

export const firstPageOf = (section: string): DocPage | undefined => sections.find((s) => s.name === section)?.pages[0]
