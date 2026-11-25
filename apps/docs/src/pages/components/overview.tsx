import { useMemo, useState } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { EmptyState } from '@openvanta/pikore-react/empty-state'
import { SearchIcon } from '@openvanta/pikore-react/icons'
import { Input } from '@openvanta/pikore-react/input'
import { Tab, Tabs } from '@openvanta/pikore-react/tabs'
import { COMPONENT_GROUPS } from '../../nav.ts'
import { entries, type DocEntry } from '../../registry.ts'
import { ComponentCard, isSignature } from './_kit.tsx'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type Show = 'all' | 'signature'

/** Entries grouped in the order the nav uses; categories the nav does not know follow, in order of appearance. */
function groupEntries(list: DocEntry[]): { name: string; items: DocEntry[] }[] {
  const byCategory = new Map<string, DocEntry[]>()
  for (const e of list) byCategory.set(e.category, [...(byCategory.get(e.category) ?? []), e])
  const known: readonly string[] = COMPONENT_GROUPS
  const order = [...known.filter((g) => byCategory.has(g)), ...[...byCategory.keys()].filter((g) => !known.includes(g))]
  return order.map((name) => ({ name, items: byCategory.get(name) ?? [] }))
}

export default function ComponentsOverview() {
  const [query, setQuery] = useState('')
  const [show, setShow] = useState<Show>('all')

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter(
      (e) =>
        (show === 'all' || isSignature(e)) &&
        (!q || e.name.toLowerCase().includes(q) || e.slug.includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [query, show])

  const groups = useMemo(() => groupEntries(matches), [matches])
  const filtering = query.trim() !== '' || show !== 'all'

  return (
    <div>
      <div className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="w-[260px] max-w-full">
          <Input
            type="search"
            iconStart={<SearchIcon />}
            placeholder="Filter components"
            aria-label="Filter components"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <p role="status" aria-live="polite" className="text-ui-sm text-fg-muted">
            {filtering ? `${matches.length} of ${entries.length} components` : `${entries.length} components`}
          </p>
          <Tabs variant="segmented" value={show} onValueChange={(v) => setShow(v as Show)} aria-label="Show">
            <Tab value="all">All</Tab>
            <Tab value="signature">Signature</Tab>
          </Tabs>
        </div>
      </div>

      {groups.length > 0 ? (
        groups.map(({ name, items }) => (
          <section key={name} className="mt-12">
            <div className="mb-4 flex items-baseline gap-2.5">
              <h2 id={slugify(name)} className="m-0 scroll-mt-20 text-lg leading-[1.15] font-semibold tracking-[-0.018em]">
                {name}
              </h2>
              <span className="font-mono text-ui-sm text-fg-subtle">{items.length}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {items.map((e) => (
                <ComponentCard key={e.slug} entry={e} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState
          title={query.trim() ? `No components match “${query.trim()}”` : 'No signature components yet'}
          headingLevel={2}
          data-no-prose
          action={
            <Button
              size="sm"
              onClick={() => {
                setQuery('')
                setShow('all')
              }}
            >
              Clear filter
            </Button>
          }
        >
          Try a broader word, like “input” or “score”.
        </EmptyState>
      )}
    </div>
  )
}
