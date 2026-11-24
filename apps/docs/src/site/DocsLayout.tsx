import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Badge } from '@calmon/react/badge'
import { Breadcrumbs, type BreadcrumbItem } from '@calmon/react/breadcrumbs'
import { ArrowRIcon, ChevronLeftIcon } from '@calmon/react/icons'
import { ComponentMeta } from './ComponentPage.tsx'
import { REPO_URL, VERSION } from './config.ts'
import { SidebarNav } from './Sidebar.tsx'
import { PageBoundary } from './Stubs.tsx'
import { docsHref, scrollToAnchor } from './router.ts'
import { firstPageOf, neighbours, type DocPage } from './pages.ts'
import { slugify } from './slug.ts'

interface Head {
  id: string
  text: string
  /** An h3 marked with data-toc (an example title): shown indented under its h2. */
  sub: boolean
}

/** The permalink we add, and decorative bits such as a step number (aria-hidden), are not part of the title. */
const isDecoration = (n: Node) => n instanceof Element && (n.classList.contains('anchor') || n.getAttribute('aria-hidden') === 'true')
const headingText = (h: HTMLElement) =>
  [...h.childNodes]
    .filter((n) => !isDecoration(n))
    .map((n) => n.textContent)
    .join('')
    .trim()

/**
 * The h2 headings of the rendered page (and h3s marked `data-toc`). Gives each one an id (from its text) and a hover permalink, and
 * keeps the list up to date while a lazy page loads. Headings inside examples and dialogs are skipped.
 */
function useHeadings(root: React.RefObject<HTMLElement | null>, pageId: string): Head[] {
  const [heads, setHeads] = useState<Head[]>([])
  useEffect(() => {
    const el = root.current
    if (!el) return
    let frame = 0
    const scan = () => {
      const found = [...el.querySelectorAll<HTMLElement>('h2, h3[data-toc]')].filter(
        (h) => !h.closest('[data-example], [data-no-toc], [data-no-prose], dialog'),
      )
      const next = found.map((h) => {
        if (!h.id) {
          const base = slugify(headingText(h)) || 'section'
          let id = base
          for (let n = 2; document.getElementById(id); n++) id = `${base}-${n}`
          h.id = id
        }
        if (h.tagName === 'H2' && !h.querySelector(':scope > a.anchor')) {
          const a = document.createElement('a')
          a.className = 'anchor'
          a.href = docsHref(pageId, h.id)
          a.textContent = '#'
          a.setAttribute('aria-label', `Link to “${headingText(h)}”`)
          h.append(a)
        }
        return { id: h.id, text: headingText(h), sub: h.tagName === 'H3' }
      })
      setHeads((prev) =>
        prev.length === next.length && prev.every((p, i) => p.id === next[i]!.id && p.text === next[i]!.text && p.sub === next[i]!.sub)
          ? prev
          : next,
      )
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    scan()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [root, pageId])
  return heads
}

/** The heading that is last above the top of the viewport (the page's last heading once scrolled to the end). */
function useScrollSpy(heads: Head[]): string {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (!heads.length) return
    let frame = 0
    const update = () => {
      // A heading counts once it is in the top fifth of the screen, so the list follows what you are reading.
      const line = Math.max(110, window.innerHeight * 0.22)
      let current = heads[0]!.id
      for (const h of heads) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= line) current = h.id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = heads.at(-1)!.id
      setActive(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [heads])
  return active
}

function Toc({ heads, active, pageId }: { heads: Head[]; active: string; pageId: string }) {
  if (!heads.length) return null
  return (
    <nav className="toc" aria-label="On this page">
      <b className="toc-h">On this page</b>
      {heads.map((h) => (
        <a
          key={h.id}
          href={docsHref(pageId, h.id)}
          className={h.sub ? 'sub' : undefined}
          aria-current={active === h.id ? 'location' : undefined}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return
            e.preventDefault()
            scrollToAnchor(h.id, true)
            // Keep the address shareable without leaving the page (no hashchange, so no reload of the route).
            window.history.replaceState(null, '', docsHref(pageId, h.id))
          }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}

function Loading() {
  return (
    <p className="lead" role="status">
      Loading…
    </p>
  )
}

/**
 * Chrome around every docs page: sidebar, breadcrumb, title and description (from the nav metadata),
 * the page body, previous and next links, and the "On this page" table of contents.
 */
export function DocsLayout({ page, children }: { page: DocPage; children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null)
  const heads = useHeadings(content, page.id)
  const active = useScrollSpy(heads)
  const { prev, next } = neighbours(page.id)

  const crumbs: BreadcrumbItem[] = [
    { label: 'Docs', href: docsHref('introduction') },
    { label: page.section, href: docsHref(firstPageOf(page.section)?.id ?? 'introduction') },
    ...(page.group ? [{ label: page.group }] : []),
    { label: page.title },
  ]
  const editHref = page.editPath ? `${REPO_URL}/edit/main/${page.editPath}` : undefined

  return (
    <div className="docs">
      <aside className="docs-l" aria-label="Sidebar">
        <SidebarNav currentId={page.id} />
      </aside>
      <main className="docs-main" id="main-content" tabIndex={-1}>
        <article className={page.wide ? 'doc wide' : 'doc'}>
          <Breadcrumbs items={crumbs} maxItems={5} />
          <header className="doc-head">
            <h1>{page.title}</h1>
            <p className="desc">{page.description}</p>
            {page.entry || page.section === 'Safety patterns' ? (
              <div className="meta-row">
                {page.entry ? <ComponentMeta page={page} /> : <Badge intent="primary">Safety pattern</Badge>}
              </div>
            ) : null}
          </header>
          <div ref={content}>
            <div className="doc-body">
              <PageBoundary resetKey={page.id}>
                <Suspense fallback={<Loading />}>{children}</Suspense>
              </PageBoundary>
            </div>
          </div>
          <nav className="prevnext" aria-label="Previous and next page">
            {prev ? (
              <a href={docsHref(prev.id)} rel="prev">
                <small>
                  <ChevronLeftIcon className="size-3.5" />
                  Previous
                </small>
                <b>{prev.title}</b>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="next" href={docsHref(next.id)} rel="next">
                <small>
                  Next
                  <ArrowRIcon className="size-3.5" />
                </small>
                <b>{next.title}</b>
              </a>
            ) : null}
          </nav>
          <div className="doc-foot">
            <span>Calmon v{VERSION}</span>
            {editHref ? (
              <a href={editHref} target="_blank" rel="noreferrer">
                Edit this page
              </a>
            ) : null}
          </div>
        </article>
      </main>
      <aside className="docs-r" aria-label="On this page">
        <Toc heads={heads} active={active} pageId={page.id} />
      </aside>
    </div>
  )
}
