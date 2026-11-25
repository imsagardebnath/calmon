// Navigation contract for the docs site. Shared by the docs framework, the content pages and the
// landing page. Route format: "#/" is the landing page, "#/docs/<id>" is any docs page.
//
// Static pages register a component at apps/docs/src/pages/<group>/<id>.tsx (default export).
// Component pages (one per library component) are generated from packages/ui/src/<name>/<name>.md
// by the docs framework; they need no page file.

export type NavIcon = 'book' | 'layers' | 'pulse' | 'grid' | 'room'

export interface NavPage {
  /** Route id: the page is at #/docs/<id>. */
  id: string
  title: string
  description: string
}

export interface NavSection {
  name: string
  icon: NavIcon
  pages: NavPage[]
}

export const STATIC_SECTIONS: NavSection[] = [
  {
    name: 'Get started',
    icon: 'book',
    pages: [
      {
        id: 'introduction',
        title: 'Introduction',
        description:
          'A React and Tailwind design system for software people rely on, built on safety principles for high-stakes work.',
      },
      { id: 'installation', title: 'Installation', description: 'Add Pikore UI to a React project with Tailwind CSS v4.' },
      {
        id: 'theming',
        title: 'Theming',
        description: 'Light and dark are equal. Change the accent, density and radius with tokens.',
      },
      {
        id: 'agents',
        title: 'For AI agents',
        description: 'Plain-text docs, rules and a prompt so coding agents build correctly with Pikore UI.',
      },
    ],
  },
  {
    name: 'Foundations',
    icon: 'layers',
    pages: [
      { id: 'principles', title: 'Design principles', description: 'Seven safety habits that shape every component and pattern.' },
      { id: 'colour', title: 'Colour', description: 'Intents, the severity scale and every colour code for light and dark.' },
      {
        id: 'typography',
        title: 'Typography',
        description: 'Instrument Sans for interface and prose; Azeret Mono for code and numerals.',
      },
      { id: 'layout', title: 'Spacing and layout', description: 'A 4px spacing scale, two radii, and three densities.' },
      { id: 'elevation', title: 'Elevation and motion', description: 'Three shadow levels, restrained motion and one focus ring.' },
      {
        id: 'iconography',
        title: 'Iconography',
        description: 'A 24px stroke icon set where every severity has its own shape.',
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        description: 'WCAG AA contrast in both themes, full keyboard support, and nothing conveyed by colour alone.',
      },
      { id: 'tokens', title: 'Design tokens', description: 'Every token as a CSS variable, with live contrast checks.' },
    ],
  },
  {
    // One page per safety principle, ids match design/extracted/principles.json.
    name: 'Safety patterns',
    icon: 'pulse',
    pages: [
      { id: 'alarm-fatigue', title: 'Fight alarm fatigue', description: 'When every signal is loud, people learn to ignore all of them.' },
      { id: 'composite-score', title: 'One composite score', description: 'Five charts take minutes to read; one score with a clear band takes a second.' },
      { id: 'limits', title: 'Soft and hard limits', description: 'Ask when a value is unusual, block when it is impossible.' },
      { id: 'pause-points', title: 'Pause points', description: 'A short mandatory check at the moment errors cost most.' },
      { id: 'confirm-target', title: 'Confirm the target', description: 'Make the thing you are about to change unmistakable.' },
      { id: 'timeline', title: 'One timeline per entity', description: 'Everything that happened to one thing, in order, in one place.' },
      { id: 'station-display', title: 'Readable across the room', description: 'Overview screens are glanced at, often from across a room.' },
    ],
  },
]

/** Order and labels of the component groups (matches the `category` frontmatter in each component doc). */
export const COMPONENT_GROUPS = [
  'Actions',
  'Forms',
  'Feedback',
  'Overlays',
  'Navigation',
  'Data display',
  'Monitoring',
  'Safety',
] as const

export const COMPONENTS_OVERVIEW: NavPage = {
  id: 'components',
  title: 'Overview',
  description: 'Every component, grouped by what it helps people do.',
}

export const MORE_SECTION: NavSection = {
  name: 'More',
  icon: 'room',
  pages: [
    { id: 'responsive', title: 'Responsive previews', description: 'Home and docs at phone width.' },
    { id: 'changelog', title: 'Changelog', description: 'What changed in each release.' },
    {
      id: 'license',
      title: 'License',
      description: 'Pikore UI is open source under the MIT license.',
    },
  ],
}

export interface ComponentNavInput {
  slug: string
  name: string
  category: string
  description: string
}

/** Full sidebar: static sections, then Components (overview + one sub-group per category), then More. */
export function buildNav(components: ComponentNavInput[]): NavSection[] {
  const byGroup = new Map<string, ComponentNavInput[]>()
  for (const c of components) {
    const list = byGroup.get(c.category) ?? []
    list.push(c)
    byGroup.set(c.category, list)
  }
  const groups = [
    ...COMPONENT_GROUPS.filter((g) => byGroup.has(g)),
    ...[...byGroup.keys()].filter((g) => !(COMPONENT_GROUPS as readonly string[]).includes(g)),
  ]
  const componentSection: NavSection & { groups: { name: string; pages: NavPage[] }[] } = {
    name: 'Components',
    icon: 'grid',
    pages: [COMPONENTS_OVERVIEW],
    groups: groups.map((g) => ({
      name: g,
      pages: byGroup.get(g)!.map((c) => ({ id: c.slug, title: c.name, description: c.description })),
    })),
  }
  return [...STATIC_SECTIONS, componentSection, MORE_SECTION]
}
