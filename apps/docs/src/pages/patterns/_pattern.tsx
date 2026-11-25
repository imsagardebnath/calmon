// Shared template for the seven Safety pattern pages. Underscore files are not routes.
//
// A pattern page is: the principle's lede, why it matters, what goes wrong without it, the components that build it
// in, a live demo on a framed stage, Do and Don't pairs, a checklist, and links to neighbouring principles. The page
// files (alarm-fatigue.tsx and the rest) hold only what is specific to them: the demo, the previews and the component list.
import { useState, type ComponentType, type ReactNode } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { Checkbox } from '@openvanta/pikore-react/checkbox'
import {
  BellOffIcon,
  CheckIcon,
  CriticalIcon,
  GaugeIcon,
  GridIcon,
  LimitsIcon,
  PauseIcon,
  RoomIcon,
  TargetIcon,
  TimelineIcon,
  XIcon,
  type IconProps,
} from '@openvanta/pikore-react/icons'
import { DASHBOARDS_SECTION, STATIC_SECTIONS } from '../../nav.ts'
import { entries } from '../../registry.ts'

/* ------------------------------------------------------------------------------------------------
 * The seven principles (design/extracted/principles.json, plus the copy this template adds)
 * ---------------------------------------------------------------------------------------------- */

export type PatternId =
  | 'alarm-fatigue'
  | 'composite-score'
  | 'limits'
  | 'pause-points'
  | 'confirm-target'
  | 'timeline'
  | 'station-display'

export interface Principle {
  /** Route id of the page: #/docs/<id>. */
  id: PatternId
  title: string
  icon: ComponentType<IconProps>
  /** "Why it matters", from the design. */
  why: string
  /** "In your software", from the design. It is the lede of the page. */
  what: string
  /** The principle's rules, from the design. They are the page's checklist. */
  rules: string[]
  /** What goes wrong without the pattern. */
  goesWrong: { title: string; text: string }[]
  /** Neighbouring principles, and how each one connects. */
  related: { id: PatternId; because: string }[]
}

export const PRINCIPLES: Record<PatternId, Principle> = {
  'alarm-fatigue': {
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
    goesWrong: [
      {
        title: 'The real alarm is missed.',
        text: 'After the tenth identical toast people stop reading them. The eleventh one is the outage.',
      },
      {
        title: 'One cause, twenty-three alerts.',
        text: 'A single failing dependency notifies six people six times, and each of them starts the same investigation.',
      },
      {
        title: 'Everything is coloured, so nothing is urgent.',
        text: 'When healthy items are filled in too, the eye has no place to land and the screen turns into background noise.',
      },
    ],
    related: [
      { id: 'composite-score', because: 'One score with a band is one signal in place of five separate alerts.' },
      { id: 'station-display', because: 'Worst first puts the one grouped alert where the room will look.' },
      { id: 'timeline', because: 'A grouped alert lands on the entity’s timeline as a single event.' },
    ],
  },
  'composite-score': {
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
    goesWrong: [
      {
        title: 'Reading takes too long.',
        text: 'Five charts mean five judgements. By the time someone has compared them, the incident is minutes old.',
      },
      {
        title: 'Two people, two answers.',
        text: 'Without one agreed number, two engineers look at the same service and disagree about whether it is healthy.',
      },
      {
        title: 'A black box nobody trusts.',
        text: 'A bare score with no factors can’t be checked, so people ignore it and go back to the raw charts.',
      },
    ],
    related: [
      { id: 'alarm-fatigue', because: 'Clear bands are what let healthy services stay quiet.' },
      { id: 'station-display', because: 'The score is the big number on every station tile.' },
    ],
  },
  limits: {
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
    goesWrong: [
      {
        title: 'Typos reach production.',
        text: '40 instead of 4 is a single keystroke, and nothing stopped it.',
      },
      {
        title: 'Silent fixes hide the problem.',
        text: 'Clamping 75 to 60 without saying so leaves the person believing 75 was applied.',
      },
      {
        title: 'Overrides leave no trace.',
        text: 'When someone has to go past the usual range, nobody can tell later who did it or why.',
      },
    ],
    related: [
      { id: 'timeline', because: 'The reason for a soft override is recorded on the entity’s timeline.' },
      { id: 'pause-points', because: 'Limits guard a value; a pause point guards the action that applies it.' },
      { id: 'confirm-target', because: 'A hard limit blocks a bad value; confirming the target blocks the wrong record.' },
    ],
  },
  'pause-points': {
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
    goesWrong: [
      {
        title: 'Known risks go unchecked.',
        text: 'The rollback link, the change window, the second approval: everyone knew, and nobody looked.',
      },
      {
        title: 'Long checklists get ticked blind.',
        text: 'Past five items people tick without reading. The list stops being a check and becomes a ritual.',
      },
      {
        title: 'Nothing proves it was checked.',
        text: 'Without evidence on the screen, “I checked” is a memory, not a record.',
      },
    ],
    related: [
      { id: 'confirm-target', because: 'Use a pause point for risky changes, and confirm the target when it can’t be undone.' },
      { id: 'timeline', because: 'Completed pause points are recorded on the timeline, with who confirmed them.' },
      { id: 'limits', because: 'A soft-limit override is the same idea for a single value.' },
    ],
  },
  'confirm-target': {
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
    goesWrong: [
      {
        title: 'Right action, wrong target.',
        text: 'orders-prod-eu and orders-prod-us differ by two letters, and prod and staging by a badge in a corner.',
      },
      {
        title: 'OK is a reflex.',
        text: 'A button that says OK is clicked without reading the dialog above it.',
      },
      {
        title: 'Deletes can’t be taken back.',
        text: 'Dropping the wrong database costs a restore from backup, and the hours until it finishes.',
      },
    ],
    related: [
      { id: 'pause-points', because: 'A pause point checks the plan; confirming the target checks the object.' },
      { id: 'limits', because: 'Both stop a mistake at the moment it is made, one for a value and one for a record.' },
    ],
  },
  timeline: {
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
    goesWrong: [
      {
        title: 'The first question has no answer.',
        text: '“What changed?” sends people across five tabs while the incident keeps running.',
      },
      {
        title: 'Cause and effect sit far apart.',
        text: 'The alert is in one tool and the deploy in another, so nobody connects the config change to the alert three minutes later.',
      },
      {
        title: 'Reasons and approvals are lost.',
        text: 'Justifications and sign-offs live in chat threads that nobody can find next week.',
      },
    ],
    related: [
      { id: 'alarm-fatigue', because: 'Grouped alerts arrive here as one event, next to the change that preceded them.' },
      { id: 'limits', because: 'Soft-limit reasons are written to this record.' },
      { id: 'pause-points', because: 'So are completed pause points, with the evidence people saw.' },
    ],
  },
  'station-display': {
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
    goesWrong: [
      {
        title: 'The problem isn’t obvious.',
        text: 'On a wall display, small numbers and thin lines can’t be read from three metres, so the problem waits.',
      },
      {
        title: 'The worst item is in the middle.',
        text: 'Alphabetical order puts a failing service wherever its name happens to fall.',
      },
      {
        title: 'Colour is the only clue.',
        text: 'Under glare, in a dark room, or for a colour-blind colleague, red and orange look alike.',
      },
    ],
    related: [
      { id: 'composite-score', because: 'The score is the large number on each tile.' },
      { id: 'alarm-fatigue', because: 'Worst first and quiet normals are what make a wall display glanceable.' },
    ],
  },
}

/* ------------------------------------------------------------------------------------------------
 * Small text pieces. The classes match the Foundations pages and the design's .lead, .callout and .linkcard.
 * ---------------------------------------------------------------------------------------------- */

/** Heading classes. Each page section writes a literal `<h2 id="kebab-case-text">` so "On this page" can link to it. */
const H2 = 'relative mt-16 mb-3 scroll-mt-20 text-2xl leading-[1.15] font-semibold tracking-[-0.02em]'

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mb-5 max-w-[68ch] leading-[1.65] text-fg-muted ${className}`}>{children}</p>
}

export function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-fg">{children}</strong>
}

function Callout({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-xl bg-surface-sunken px-4 py-3.5 text-ui-sm leading-[1.6] text-fg-muted shadow-[inset_0_0_0_1px_var(--border)]">
      <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-accent-fg">
        {icon}
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * The stage: a frame for a live demo
 * ---------------------------------------------------------------------------------------------- */

/**
 * A framed stage for a live demo: a header with the "Live" mark and a Reset button, and a dotted floor like the
 * design's example frames. Reset remounts the demo, so it forgets its state. `data-no-prose` keeps the page's
 * heading styles, and the table of contents, away from anything inside.
 */
export function Stage({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  const [run, setRun] = useState(0)
  return (
    <div
      data-no-prose
      role="group"
      aria-label={`Live demo: ${title}`}
      className="my-4 overflow-hidden rounded-card border border-border bg-surface-raised shadow-low"
    >
      <div className="flex items-center gap-3 border-b border-border py-1.5 pr-2 pl-4">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-normal-fg">
          <i
            aria-hidden="true"
            className="size-[7px] animate-pikore-blink rounded-full bg-normal shadow-[0_0_0_3px_color-mix(in_oklab,var(--normal),transparent_80%)]"
          />
          Live demo
        </span>
        <span className="min-w-0 truncate text-xs text-fg-subtle">{title}</span>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setRun((n) => n + 1)}>
          Reset
        </Button>
      </div>
      <div
        className={`p-4 sm:p-8 ${className}`}
        style={{
          backgroundColor: 'var(--surface)',
          backgroundImage: 'radial-gradient(color-mix(in oklab, var(--border-strong), transparent 40%) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      >
        <div key={run}>{children}</div>
      </div>
    </div>
  )
}

/** A raised panel inside a stage, with an optional small title. */
export function Panel({
  title,
  children,
  className = '',
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-card border border-border bg-surface-raised p-5 shadow-low ${className}`}>
      {title ? <div className="mb-3 text-ui-sm font-semibold text-fg">{title}</div> : null}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Do and Don't (the design's .dd)
 * ---------------------------------------------------------------------------------------------- */

export interface DoDontPair {
  /** The preview of the good version: real components. */
  doPreview?: ReactNode
  /** The preview of the bad version. */
  dontPreview?: ReactNode
  doText: ReactNode
  dontText: ReactNode
}

/**
 * One Do and one Don't, side by side. Each side is a card with a coloured top edge, an icon (check or cross) and
 * the word Do or Don’t, so it never relies on colour. Previews are illustrations: they are inert and hidden from
 * assistive technology, which read the text instead.
 */
function DoDont({ doPreview, dontPreview, doText, dontText }: DoDontPair) {
  // From the sm breakpoint the two cards share rows (subgrid), so the previews and the text rule line up across them.
  const side = (tone: 'normal' | 'critical', label: string, icon: ReactNode, preview: ReactNode, text: ReactNode) => (
    <div
      data-tone={tone}
      className="min-w-0 overflow-hidden rounded-card bg-surface-raised shadow-[0_0_0_1px_var(--border)] sm:row-span-2 sm:grid sm:grid-rows-subgrid sm:gap-y-0"
    >
      <div
        inert
        data-no-prose
        aria-hidden="true"
        className="flex min-h-[110px] flex-wrap items-center justify-center gap-2.5 bg-surface p-5 text-left select-none sm:p-6"
      >
        {preview}
      </div>
      <div className="border-t-[3px] border-tone px-4 py-3 text-ui-sm leading-[1.55] text-fg-muted">
        <b className="mb-0.5 flex items-center gap-1.5 font-semibold text-tone-fg">
          {icon}
          {label}
        </b>
        {text}
      </div>
    </div>
  )
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_auto]">
      {side('normal', 'Do', <CheckIcon />, doPreview, doText)}
      {side('critical', 'Don’t', <XIcon />, dontPreview, dontText)}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Links to components and to other principles
 * ---------------------------------------------------------------------------------------------- */

/** "HealthScore" becomes "health-score": the folder and doc name of a component. */
const componentSlug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/**
 * Route ids of the pages that are not components. A component whose slug is also a static page (the ConfirmTarget
 * component next to the "confirm-target" pattern, Timeline next to "timeline") is served at "<slug>-component".
 */
const STATIC_IDS = new Set(
  [...STATIC_SECTIONS, DASHBOARDS_SECTION].flatMap((s) => s.pages.map((p) => p.id)).concat('components'),
)

/** The docs link of a component page: `#/docs/<slug>`, or `#/docs/<slug>-component` when the slug is taken. */
export const componentHref = (name: string) => {
  const slug = componentSlug(name)
  return `#/docs/${STATIC_IDS.has(slug) ? `${slug}-component` : slug}`
}

const CARD =
  'flex min-w-0 flex-col gap-1.5 rounded-card bg-surface-raised p-[18px] text-fg no-underline shadow-[0_0_0_1px_var(--border),var(--shadow-1)] ' +
  'transition-[box-shadow,transform] duration-(--duration-base) ease-pikore hover:-translate-y-px hover:shadow-[0_0_0_1px_var(--border-strong),var(--shadow-2)]'

function CardIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="mb-1.5 grid size-9 place-items-center rounded-[10px] bg-accent-soft text-accent-fg">
      {children}
    </span>
  )
}

export interface PatternComponent {
  /** Component name as in the docs, such as `HealthScore`. */
  name: string
  /** What this component does for the pattern, in one sentence. */
  role: string
}

function ComponentCards({ components }: { components: PatternComponent[] }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
      {components.map((c) => {
        const entry = entries.find((e) => e.slug === componentSlug(c.name))
        return (
          <a key={c.name} href={componentHref(c.name)} className={CARD}>
            <CardIcon>
              <GridIcon width={20} height={20} />
            </CardIcon>
            <b className="font-semibold">{c.name}</b>
            <span className="text-ui-sm leading-[1.5] text-fg-muted">{c.role}</span>
            {entry ? <code className="mt-auto pt-1 font-mono text-xs text-fg-subtle">{entry.importPath}</code> : null}
          </a>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * The page
 * ---------------------------------------------------------------------------------------------- */

export interface PatternPageProps {
  principle: Principle
  /** The live demo: real components with their own state. It is rendered inside a Stage. */
  demo: ReactNode
  /** Short name of the demo, shown in the stage header and as its accessible name. */
  demoTitle: string
  /** A line or two above the stage that tells people what to try. */
  demoIntro: ReactNode
  /** Components that build the pattern in, each with what it does for it. */
  components: PatternComponent[]
  /** Do and Don't pairs, with previews made of real components. */
  dos: DoDontPair[]
}

export function PatternPage({ principle: p, demo, demoTitle, demoIntro, components, dos }: PatternPageProps) {
  const Icon = p.icon
  return (
    <div>
      <Lead>
        <B>In your software.</B> {p.what}
      </Lead>

      <h2 id="why-it-matters" className={H2}>
        Why it matters
      </h2>
      <Callout icon={<Icon width={18} height={18} />}>{p.why}</Callout>

      <h2 id="what-goes-wrong-without-it" className={H2}>
        What goes wrong without it
      </h2>
      <ul data-tone="critical" className="m-0 mt-4 list-none overflow-hidden rounded-card border border-border bg-surface-raised p-0">
        {p.goesWrong.map((g) => (
          <li key={g.title} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3 px-4 py-3.5 not-first:border-t not-first:border-border">
            <CriticalIcon aria-hidden="true" className="mt-0.5 text-tone-fg" />
            <p className="m-0 text-ui-sm leading-[1.6] text-fg-muted">
              <b className="font-semibold text-fg">{g.title}</b> {g.text}
            </p>
          </li>
        ))}
      </ul>

      <h2 id="how-pikore-builds-it-in" className={H2}>
        How Pikore UI builds it in
      </h2>
      <Lead>
        {components.length === 1 ? 'This component carries' : 'These components carry'} the pattern, so the habit is the
        default and no screen has to remember it.
      </Lead>
      <ComponentCards components={components} />

      <h2 id="live-demo" className={H2}>
        Live demo
      </h2>
      <Lead>{demoIntro}</Lead>
      <Stage title={demoTitle}>{demo}</Stage>

      <h2 id="do-and-dont" className={H2}>
        Do and don’t
      </h2>
      {dos.map((pair, i) => (
        <DoDont key={i} {...pair} />
      ))}

      <h2 id="checklist" className={H2}>
        Checklist
      </h2>
      <Lead>Check a screen against these before it ships. The boxes are for you; nothing here is saved.</Lead>
      <div className="overflow-hidden rounded-card border border-border bg-surface-raised shadow-low">
        <ul className="m-0 list-none p-0">
          {p.rules.map((rule) => (
            <li key={rule} className="px-4 py-3 not-first:border-t not-first:border-border">
              <Checkbox className="flex w-full items-start gap-3 text-ui leading-[1.5] [&>input]:mt-0.5">{rule}</Checkbox>
            </li>
          ))}
        </ul>
      </div>

      <h2 id="related" className={H2}>
        Related
      </h2>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {p.related.map((r) => {
          const other = PRINCIPLES[r.id]
          const OtherIcon = other.icon
          return (
            <a key={r.id} href={`#/docs/${r.id}`} className={CARD}>
              <CardIcon>
                <OtherIcon width={20} height={20} />
              </CardIcon>
              <b className="font-semibold">{other.title}</b>
              <span className="text-ui-sm leading-[1.5] text-fg-muted">{r.because}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
