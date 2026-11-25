import type { ComponentType } from 'react'
import {
  BellOffIcon,
  GaugeIcon,
  LimitsIcon,
  PauseIcon,
  RoomIcon,
  TargetIcon,
  TimelineIcon,
  type IconProps,
} from '@openvanta/pikore-react/icons'
import { entries } from '../../registry.ts'
import { A, B, Bullets, C, Callout, H2, Lead, Page, componentSlug } from './_kit.tsx'

interface Principle {
  /** Route id of the Safety pattern page: #/docs/<id>. */
  id: string
  title: string
  icon: ComponentType<IconProps>
  why: string
  what: string
  rules: string[]
  components: string[]
}

// Same seven principles as design/extracted/principles.json and the Safety patterns in nav.ts.
const PRINCIPLES: Principle[] = [
  {
    id: 'alarm-fatigue',
    title: 'Fight alarm fatigue',
    icon: BellOffIcon,
    why: 'When every signal is loud, people learn to ignore all of them, and the one that matters gets missed. Fewer, better-grouped alerts get more attention, not less.',
    what: 'Group related signals into one alert with a count. Rate-limit repeats. Reserve red, sound and motion for things a person must act on now. Normal stays quiet.',
    rules: [
      'Group alerts that share a cause; show the count, not 23 toasts.',
      'Only critical can animate, and only gently.',
      'Normal status gets no colour fill and no badge in lists.',
      'Sort every overview worst first.',
    ],
    components: ['StationGrid', 'Toast', 'Banner'],
  },
  {
    id: 'composite-score',
    title: 'One composite score',
    icon: GaugeIcon,
    why: 'Five charts take minutes to read; one score with a clear band takes a second. Showing the factors beside it keeps the number trustworthy.',
    what: 'Combine weak signals into a health score with clear bands, and keep the breakdown one click away. A score without its factors is a black box people stop trusting.',
    rules: [
      'Show the score, its band, and the biggest factor together.',
      'Use the same bands everywhere for the same entity type.',
      'Each metric shows the threshold it’s judged against.',
    ],
    components: ['HealthScore', 'VitalTile'],
  },
  {
    id: 'limits',
    title: 'Soft and hard limits',
    icon: LimitsIcon,
    why: 'Most bad values are typos or misjudged defaults, not intent. A warning catches the first kind; a block stops the dangerous kind.',
    what: 'Inputs that matter get two limits. Past the soft limit, warn and ask for a reason that lands on the timeline. Past the hard limit, block and say the maximum.',
    rules: [
      'Show the usual range before anyone types.',
      'Never silently clamp a value.',
      'The reason for a soft override is recorded.',
    ],
    components: ['LimitedNumberInput'],
  },
  {
    id: 'pause-points',
    title: 'Pause points',
    icon: PauseIcon,
    why: 'Risky actions fail on things everyone knew but nobody checked. A short, specific checklist at the moment of action catches them in seconds.',
    what: 'Before a risky action, show three to five checks that a person can verify in seconds. Pre-fill what the system already knows. The action button unlocks when every item is checked.',
    rules: [
      'Three to five items, phrased as facts.',
      'Show evidence: who approved and when.',
      'The button names the action; the toast repeats it.',
    ],
    components: ['PausePoint'],
  },
  {
    id: 'confirm-target',
    title: 'Confirm the target',
    icon: TargetIcon,
    why: 'Wrong-target mistakes happen when two things look alike: prod and staging, orders-eu and orders-us. Reading the exact name breaks autopilot.',
    what: 'Before deleting or overwriting, the person types the exact name and sees the environment badge beside it. Wrong-environment mistakes become hard to make.',
    rules: [
      'Exact, case-sensitive match.',
      'PROD badge sits next to the name, not in a corner.',
      'Reversible actions get Undo instead.',
    ],
    components: ['ConfirmTarget'],
  },
  {
    id: 'timeline',
    title: 'One timeline per entity',
    icon: TimelineIcon,
    why: 'During an incident the first question is always “what changed?”. One ordered record answers it without hunting across tools.',
    what: 'Every entity has one ordered record of alerts, changes, deploys, notes and who did them. Nobody hunts across five tabs during an incident.',
    rules: [
      'Group by day; show who and when.',
      'Soft-limit justifications and pause-point completions are recorded here.',
      'Link alerts to the change that preceded them.',
    ],
    components: ['Timeline'],
  },
  {
    id: 'station-display',
    title: 'Readable across the room',
    icon: RoomIcon,
    why: 'Overview screens are glanced at, often from across a room. If the problem isn’t obvious in two seconds, the screen hasn’t done its job.',
    what: 'Overviews have a station density with large numerals for wall displays. Tiles sort worst first, so the top-left is always the one to look at.',
    rules: [
      'Station density scales type, spacing and numerals together.',
      'Worst first, always.',
      'Severity is readable in greyscale, from a distance.',
    ],
    components: ['VitalTile', 'StationGrid'],
  },
]

/** A component name: a link when its doc page exists, plain code until then. */
function ComponentRef({ name }: { name: string }) {
  const slug = componentSlug(name)
  const exists = entries.some((e) => e.slug === slug)
  return exists ? (
    <a href={`#/docs/${slug}`} className="no-underline">
      <C>{name}</C>
    </a>
  ) : (
    <C>{name}</C>
  )
}

/** What follows each principle's heading: why it matters, what the library does, the rules, and the links. */
function PrincipleBody({ id }: { id: string }) {
  const p = PRINCIPLES.find((x) => x.id === id)
  if (!p) return null
  const Icon = p.icon
  return (
    <div>
      <Callout icon={<Icon width={18} height={18} />}>
        <B>Why it matters.</B> {p.why}
      </Callout>
      <Lead>
        <B>In your software.</B> {p.what}
      </Lead>
      <Bullets>
        {p.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </Bullets>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ui-sm text-fg-muted">
        <A href={`#/docs/${p.id}`}>Open the {p.title.toLowerCase()} pattern</A>
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span className="text-fg-subtle">Built with</span>
          {p.components.map((c) => (
            <ComponentRef key={c} name={c} />
          ))}
        </span>
      </p>
    </div>
  )
}

// The headings are written out (not mapped) so the docs search can find them in this file's source.
export default function Principles() {
  return (
    <Page>
      <Lead>
        Every component and pattern traces back to one of these. When two good options conflict, the principle decides.
        Each has a Safety pattern page with the interactive demo, and the components that carry it.
      </Lead>

      <h2 id="fight-alarm-fatigue" className={H2}>Fight alarm fatigue</h2>
      <PrincipleBody id="alarm-fatigue" />

      <h2 id="one-composite-score" className={H2}>One composite score</h2>
      <PrincipleBody id="composite-score" />

      <h2 id="soft-and-hard-limits" className={H2}>Soft and hard limits</h2>
      <PrincipleBody id="limits" />

      <h2 id="pause-points" className={H2}>Pause points</h2>
      <PrincipleBody id="pause-points" />

      <h2 id="confirm-the-target" className={H2}>Confirm the target</h2>
      <PrincipleBody id="confirm-target" />

      <h2 id="one-timeline-per-entity" className={H2}>One timeline per entity</h2>
      <PrincipleBody id="timeline" />

      <h2 id="readable-across-the-room" className={H2}>Readable across the room</h2>
      <PrincipleBody id="station-display" />
    </Page>
  )
}
