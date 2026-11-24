import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { InfoIcon, SearchIcon } from '@openvanta/calmon-react/icons'
import { docsHref } from './router.ts'
import { sections } from './pages.ts'

/** Catches a page that throws, so one broken page never blanks the whole site. Resets when `resetKey` changes. */
export class PageBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean; key: string }> {
  override state = { failed: false, key: this.props.resetKey }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  static getDerivedStateFromProps(props: { resetKey: string }, state: { key: string }) {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Docs page failed to render', error, info.componentStack)
  }
  override render() {
    return this.state.failed ? (
      <div className="callout" role="alert">
        <InfoIcon className="size-4" />
        <span>
          <b>This page failed to render.</b> Reload it, or open the browser console for details.
        </span>
      </div>
    ) : (
      this.props.children
    )
  }
}

/** Shown for a documented page whose file has not been written yet. */
export function ComingSoon() {
  return (
    <div className="callout">
      <InfoIcon className="size-4" />
      <span>
        <b>This page is being written.</b> Browse the <a href={docsHref('components')}>components</a>, or read the{' '}
        <a href={docsHref('introduction')}>introduction</a> in the meantime.
      </span>
    </div>
  )
}

/** Stand-in for the components gallery (pages/components/overview.tsx) until it exists: every component, grouped. */
export function ComponentsStub() {
  const groups = sections.find((s) => s.name === 'Components')?.groups ?? []
  return (
    <>
      {groups.map((g) => (
        <section key={g.name}>
          <h2>{g.name}</h2>
          <div className="linkcards">
            {g.pages.map((p) => (
              <a key={p.id} className="linkcard" href={docsHref(p.id)}>
                <b>{p.title}</b>
                <span>{p.description}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

/** The not-found page: friendly, with a way back and a way to search. */
export function NotFound({ path, onSearch }: { path: string; onSearch: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-[620px] flex-col items-start gap-4 px-6 py-24">
      <p className="num text-ui-sm text-fg-subtle">404</p>
      <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.04em]">We could not find that page</h1>
      <p className="text-lg leading-[1.6] text-fg-muted">
        Nothing lives at <code className="inline">{path}</code>. It may have moved, or the link may have a typo.
      </p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        <Button asChild variant="primary" size="lg">
          <a href={docsHref('introduction')}>Go to the docs</a>
        </Button>
        <Button size="lg" iconStart={<SearchIcon className="size-4" />} onClick={onSearch}>
          Search docs
        </Button>
        <Button asChild size="lg">
          <a href={docsHref('components')}>Browse components</a>
        </Button>
      </div>
    </main>
  )
}
