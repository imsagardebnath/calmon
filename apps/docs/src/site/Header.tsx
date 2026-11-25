import { Button } from '@openvanta/pikore-react/button'
import { IconButton } from '@openvanta/pikore-react/icon-button'
import { Kbd } from '@openvanta/pikore-react/kbd'
import { Menu, MenuItem } from '@openvanta/pikore-react/menu'
import { usePikore, type Density } from '@openvanta/pikore-react/provider'
import { CheckIcon, GithubIcon, LogoIcon, MoonIcon, SearchIcon, SunIcon } from '@openvanta/pikore-react/icons'
import { DENSITY_KEY, REPO_URL, VERSION } from './config.ts'
import { DensityIcon, MenuIcon } from './icons.tsx'
import { docsHref } from './router.ts'
import { getPage, type TopLink } from './pages.ts'

export const DENSITIES: { id: Density; label: string; hint: string }[] = [
  { id: 'comfortable', label: 'Comfortable', hint: '36px' },
  { id: 'compact', label: 'Compact', hint: '30px' },
  { id: 'station', label: 'Station', hint: '56px' },
]

/** The current density and a setter that also remembers the choice (the provider does not persist it). */
export function useDensityChoice() {
  const { density, setDensity } = usePikore()
  const choose = (next: Density) => {
    setDensity(next)
    try {
      localStorage.setItem(DENSITY_KEY, next)
    } catch {
      /* storage unavailable: the choice still applies for this visit */
    }
  }
  return [density, choose] as const
}

export const TOP_LINKS: { id: TopLink; label: string; href: string }[] = [
  { id: 'docs', label: 'Docs', href: docsHref('introduction') },
  { id: 'patterns', label: 'Safety patterns', href: docsHref('alarm-fatigue') },
  { id: 'components', label: 'Components', href: docsHref('components') },
  { id: 'dashboards', label: 'Dashboards', href: docsHref('dashboards') },
]

/** The first page of a top link may not exist yet; fall back to the introduction. */
const hrefFor = (link: { id: TopLink; href: string }) => {
  const id = link.href.replace('#/docs/', '')
  return getPage(id) ? link.href : docsHref('introduction')
}

export function Logo({ className }: { className?: string }) {
  return (
    <a className={className ? `logo ${className}` : 'logo'} href="#/" aria-label="Pikore UI, home">
      <LogoIcon aria-hidden="true" className="size-6" />
      Pikore UI
    </a>
  )
}

export function Header({
  active,
  onSearch,
  onMenu,
}: {
  /** The top link of the current page, for aria-current. */
  active: TopLink | undefined
  onSearch: () => void
  onMenu: () => void
}) {
  const { resolvedTheme, setTheme } = usePikore()
  const [density, setDensity] = useDensityChoice()
  const dark = resolvedTheme === 'dark'

  return (
    <header className="site-nav">
      <Logo />
      <span className="ver hidden sm:inline-block" title={`Pikore UI ${VERSION}`}>
        v{VERSION}
      </span>
      <nav className="links ml-2 hidden lg:flex" aria-label="Primary">
        {TOP_LINKS.map((l) => (
          <a key={l.id} href={hrefFor(l)} aria-current={active === l.id ? 'page' : undefined}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="right">
        <button
          type="button"
          className="searchbtn"
          onClick={onSearch}
          aria-label="Search docs"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <SearchIcon className="size-4" />
          <span className="lbl">Search docs</span>
          <span className="kk">
            <Kbd>mod+K</Kbd>
          </span>
        </button>
        <Button asChild variant="ghost" size="md" className="hidden w-9 p-0 sm:inline-flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository (opens in a new tab)">
            <GithubIcon className="size-4" />
          </a>
        </Button>
        <Menu
          align="end"
          trigger={<IconButton variant="ghost" size="md" label="Display density" icon={<DensityIcon className="size-4" />} />}
        >
          {DENSITIES.map((d) => (
            <MenuItem
              key={d.id}
              icon={density === d.id ? <CheckIcon className="size-4" /> : <span className="inline-block size-4" />}
              shortcut={d.hint}
              onClick={() => setDensity(d.id)}
            >
              {d.label}
              {density === d.id ? <span className="sr-only"> (current)</span> : null}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          variant="ghost"
          size="md"
          label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          icon={dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          onClick={() => setTheme(dark ? 'light' : 'dark')}
        />
        <IconButton
          variant="ghost"
          size="md"
          label="Open menu"
          icon={<MenuIcon className="size-4" />}
          className="lg:hidden"
          onClick={onMenu}
        />
      </div>
    </header>
  )
}
