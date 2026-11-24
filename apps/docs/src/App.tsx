import { lazy, Suspense, useEffect, useState } from 'react'
import { Drawer } from '@calmon/react/drawer'
import { ComponentPage } from './site/ComponentPage.tsx'
import { DocsLayout } from './site/DocsLayout.tsx'
import { Footer } from './site/Footer.tsx'
import { Header, TOP_LINKS } from './site/Header.tsx'
import { hasPrinciple, PatternPage } from './site/PatternPage.tsx'
import { pushRecent } from './site/hooks.ts'
import { SearchPalette } from './site/Search.tsx'
import { SidebarNav } from './site/Sidebar.tsx'
import { ComingSoon, ComponentsStub, NotFound } from './site/Stubs.tsx'
import { bodyOf, getPage, topLinkOf, type DocPage } from './site/pages.ts'
import { docsHref, scrollToAnchor, useRoute, type Route } from './site/router.ts'

const Landing = lazy(() => import('./pages/landing/index.tsx'))

const HOME_TITLE = 'Calmon · Calm interfaces for systems that can’t fail'

/**
 * The body of a docs page: generated for components, a lazy file for static pages. While a file is missing, a
 * safety pattern gets its default page and anything else a stub.
 */
function PageBody({ page }: { page: DocPage }) {
  if (page.entry) return <ComponentPage entry={page.entry} />
  const Body = bodyOf(page.id)
  if (Body) return <Body />
  if (page.section === 'Safety patterns' && hasPrinciple(page.id)) return <PatternPage id={page.id} />
  return page.id === 'components' ? <ComponentsStub /> : <ComingSoon />
}

function routeKey(route: Route) {
  return route.kind === 'home' ? 'home' : route.kind === 'docs' ? `docs/${route.id}#${route.anchor}` : `missing/${route.path}`
}

export function App() {
  const { route, pending } = useRoute()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const page = route.kind === 'docs' ? getPage(route.id) : undefined
  const key = routeKey(route)
  const [announcement, setAnnouncement] = useState('')

  // Title, scroll position, recent pages and the mobile menu follow the route.
  useEffect(() => {
    document.title = route.kind === 'home' ? HOME_TITLE : page ? `${page.title} · Calmon` : 'Page not found · Calmon'
    setAnnouncement(document.title)
    if (route.kind === 'docs' && route.anchor) scrollToAnchor(route.anchor)
    else window.scrollTo(0, 0)
    // Pages shown inside the phone frames of the Responsive page must not count as visits.
    if (page && window.self === window.top) pushRecent(page.id)
    setMenuOpen(false)
    // The key already holds everything about the route that matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // The search button, the mobile menu and Ctrl K all open the same palette.
  const openSearch = () => setSearchOpen(true)

  let content
  if (route.kind === 'home') {
    content = (
      <>
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <Landing />
          </Suspense>
        </main>
        <Footer />
      </>
    )
  } else if (page) {
    content = (
      <DocsLayout page={page}>
        <PageBody page={page} />
      </DocsLayout>
    )
  } else {
    content = <NotFound path={route.kind === 'docs' ? `#/docs/${route.id}` : `#${route.path}`} onSearch={openSearch} />
  }

  return (
    <div className="min-h-dvh bg-surface text-fg">
      <a
        href={docsHref('introduction')}
        className="sr-only z-[100] rounded-control bg-surface-raised px-3 py-2 text-ui-sm shadow-high focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <Header
        active={topLinkOf(page)}
        onSearch={openSearch}
        onMenu={() => setMenuOpen(true)}
      />
      {pending ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[60px] z-[59] h-0.5 overflow-hidden">
          <div className="h-full w-1/4 animate-calmon-indet bg-accent" />
        </div>
      ) : null}
      {content}
      {/* Tells screen readers about the new page: a hash change alone is silent. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} currentId={page?.id} />
      <Drawer open={menuOpen} onOpenChange={setMenuOpen} side="start" size={320} title="Menu" description="Browse the documentation">
        <nav aria-label="Primary" className="mb-4 flex flex-col gap-px border-b border-border pb-4 text-ui-sm font-medium">
          {TOP_LINKS.map((l) => (
            <a
              key={l.id}
              href={l.href}
              aria-current={topLinkOf(page) === l.id ? 'page' : undefined}
              className="rounded-[7px] px-2.5 py-1.5 text-fg-muted no-underline hover:bg-surface-sunken hover:text-fg aria-[current=page]:bg-surface-sunken aria-[current=page]:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <SidebarNav currentId={page?.id} onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  )
}
