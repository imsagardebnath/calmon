// The trust strip: five facts about the library. Every one of them is checked, see the notes in _data.ts.
//  - components and patterns are counted from the docs registry and nav.ts
//  - WCAG AA: every text and icon colour pair in light and dark is at least 4.5:1 (worst: 4.53, checked with a script over
//    styles.css); the component examples run through axe in the package tests
//  - gzip: scripts/check-size.mjs reports 40.41 KB for the whole library entry
//  - React 19 and Tailwind v4: the peerDependencies in packages/ui/package.json (react >=19, tailwindcss >=4.1)
import { COMPONENT_COUNT, GZIP_KB, PATTERN_COUNT } from './_data.ts'
import { Section } from './_ui.tsx'

const STATS = [
  { value: String(COMPONENT_COUNT), label: 'components, from Button to HealthScore' },
  { value: String(PATTERN_COUNT), label: 'safety patterns, with a page for each' },
  { value: 'AA', label: 'WCAG contrast in light and dark' },
  { value: `~${GZIP_KB} KB`, label: 'gzip for the whole library' },
  { value: 'React 19', label: 'with Tailwind CSS v4' },
] as const

export function Stats() {
  return (
    <Section label="Calmon in numbers" flush>
      <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-8 py-10 min-[56.25rem]:grid-cols-5 min-[56.25rem]:gap-x-0 min-[56.25rem]:divide-x min-[56.25rem]:divide-border min-[56.25rem]:py-12">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col gap-1.5 min-[56.25rem]:px-6 min-[56.25rem]:first:pl-0 ${i === 4 ? 'col-span-2 min-[56.25rem]:col-span-1' : ''}`}
          >
            <dt className="num text-[clamp(1.75rem,1.2rem+1.6vw,2.25rem)] leading-none font-normal tracking-[-0.04em] text-fg">
              {s.value}
            </dt>
            <dd className="m-0 max-w-[24ch] text-ui-sm leading-[1.45] text-fg-muted">{s.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
