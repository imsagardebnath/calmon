import { Fragment, useEffect, useRef, useState } from 'react'
import { Badge } from '@calmon/react/badge'
import { Input } from '@calmon/react/input'
import { SideNav, SideNavItem } from '@calmon/react/side-nav'
import { SearchIcon } from '@calmon/react/icons'
import { SectionIcon } from './icons.tsx'
import { docsHref } from './router.ts'
import { sections, type DocPage } from './pages.ts'

function Item({ page, current, onNavigate }: { page: DocPage; current: boolean; onNavigate?: () => void }) {
  return (
    <SideNavItem
      href={docsHref(page.id)}
      active={current}
      onClick={onNavigate}
      className="sidenav-page [&>span:first-child]:grow"
    >
      {page.signature ? (
        <span className="flex items-center gap-2">
          {page.title}
          <Badge intent="primary" className="ml-auto h-[18px] px-1.5 text-[10.5px]">
            Signature
          </Badge>
        </span>
      ) : (
        page.title
      )}
    </SideNavItem>
  )
}

/** The docs navigation: sections with icons, component sub-groups, a filter. Used in the sidebar and the mobile drawer. */
export function SidebarNav({ currentId, onNavigate }: { currentId?: string; onNavigate?: () => void }) {
  const [filter, setFilter] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const q = filter.trim().toLowerCase()
  const match = (p: DocPage) =>
    !q || p.title.toLowerCase().includes(q) || p.id.includes(q) || (p.group ?? '').toLowerCase().includes(q)

  // Keep the current page in view when the sidebar is scrolled.
  useEffect(() => {
    root.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: 'nearest' })
  }, [currentId])

  const rendered = sections.map((s) => {
    const direct = s.pages.filter(match)
    const groups = s.groups.map((g) => ({ ...g, pages: g.pages.filter(match) })).filter((g) => g.pages.length)
    return { s, direct, groups }
  })
  const empty = rendered.every((r) => !r.direct.length && !r.groups.length)

  return (
    <div ref={root}>
      <div className="mx-0.5 mb-4">
        <Input
          type="search"
          size="sm"
          iconStart={<SearchIcon className="size-3.5" />}
          placeholder="Filter pages"
          aria-label="Filter pages"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <SideNav aria-label="Documentation">
        {rendered.map(({ s, direct, groups }) =>
          direct.length || groups.length ? (
            <Fragment key={s.name}>
              <div className="sidenav-sec">
                <SectionIcon name={s.icon} className="size-4" />
                {s.name}
              </div>
              {direct.map((p) => (
                <Item key={p.id} page={p} current={p.id === currentId} onNavigate={onNavigate} />
              ))}
              {groups.map((g) => (
                <Fragment key={g.name}>
                  <div className="sidenav-sub">{g.name}</div>
                  {g.pages.map((p) => (
                    <Item key={p.id} page={p} current={p.id === currentId} onNavigate={onNavigate} />
                  ))}
                </Fragment>
              ))}
            </Fragment>
          ) : null,
        )}
      </SideNav>
      {empty ? (
        <p className="px-2.5 pt-2 text-ui-sm text-fg-muted" role="status">
          No pages match “{filter.trim()}”.
        </p>
      ) : null}
    </div>
  )
}
