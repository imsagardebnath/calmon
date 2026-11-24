import { docsHref } from './router.ts'
import { Logo } from './Header.tsx'
import { REPO_URL } from './config.ts'
import { sections } from './pages.ts'

const firstOfGroup = (name: string) => sections.find((s) => s.name === 'Components')?.groups.find((g) => g.name === name)?.pages[0]

/** The site footer (shown on the landing page). Links follow the design: docs, components, project. */
export function Footer() {
  const groups = ['Monitoring', 'Safety', 'Forms', 'Overlays']
    .map((name) => ({ name, page: firstOfGroup(name) }))
    .filter((g): g is { name: string; page: NonNullable<typeof g.page> } => !!g.page)
    .slice(0, 3)

  return (
    <footer className="footer">
      <div className="footer-in">
        <div>
          <Logo />
          <p>Open-source components for software people rely on.</p>
        </div>
        <div>
          <h4>Docs</h4>
          <a href={docsHref('installation')}>Getting started</a>
          <a href={docsHref('theming')}>Theming</a>
          <a href={docsHref('principles')}>Principles</a>
          <a href={docsHref('agents')}>For AI agents</a>
        </div>
        <div>
          <h4>Components</h4>
          {groups.map((g) => (
            <a key={g.name} href={docsHref(g.page.id)}>
              {g.name}
            </a>
          ))}
          <a href={docsHref('components')}>All components</a>
        </div>
        <div>
          <h4>Project</h4>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={docsHref('changelog')}>Changelog</a>
          <a href={docsHref('license')}>License</a>
          <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
            Contributing
          </a>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
            Issues
          </a>
        </div>
      </div>
    </footer>
  )
}
