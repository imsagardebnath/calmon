// The seven safety habits: the design's `.principles` (a sticky heading and a ruled list), with every row a link to its
// pattern page. The ids match nav.ts and design/extracted/principles.json.
import type { ComponentType, SVGProps } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { ArrowRIcon, BellOffIcon, GaugeIcon, LimitsIcon, PauseIcon, RoomIcon, TargetIcon, TimelineIcon } from '@openvanta/pikore-react/icons'
import { docsHref } from '../../site/router.ts'
import { Section, SectionHead } from './_ui.tsx'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const HABITS: { id: string; title: string; text: string; code: string; icon: Icon }[] = [
  {
    id: 'alarm-fatigue',
    title: 'Fight alarm fatigue',
    text: 'Group related signals, rate-limit repeats, and keep red for things that need a person now.',
    code: 'StationGrid',
    icon: BellOffIcon,
  },
  {
    id: 'composite-score',
    title: 'One composite score',
    text: 'Combine many weak signals into a single health score, with the factors one click away.',
    code: 'HealthScore',
    icon: GaugeIcon,
  },
  {
    id: 'limits',
    title: 'Soft and hard limits',
    text: 'Warn and ask for a reason past the usual range. Block outright past the safe one.',
    code: 'LimitedNumberInput',
    icon: LimitsIcon,
  },
  {
    id: 'pause-points',
    title: 'Pause points',
    text: 'Three to five checks before a risky action. Short enough to actually read.',
    code: 'PausePoint',
    icon: PauseIcon,
  },
  {
    id: 'confirm-target',
    title: 'Confirm the target',
    text: 'Before deleting, people type the exact name and see which environment they are in.',
    code: 'ConfirmTarget',
    icon: TargetIcon,
  },
  {
    id: 'timeline',
    title: 'One timeline per entity',
    text: 'Deploys, alerts, notes and changes in a single ordered record. No hunting across tabs.',
    code: 'Timeline',
    icon: TimelineIcon,
  },
  {
    id: 'station-display',
    title: 'Readable across the room',
    text: 'A station density with large numerals for wall displays, sorted so the worst is top left.',
    code: 'density="station"',
    icon: RoomIcon,
  },
]

export function Principles() {
  return (
    <Section id="habits">
      <div className="grid items-start gap-10 min-[68.75rem]:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] min-[68.75rem]:gap-16">
        <div className="min-[68.75rem]:sticky min-[68.75rem]:top-24">
          <SectionHead
            id="habits"
            title="Seven safety habits, built into components."
            lede="Screens fail people under pressure in predictable ways. Each habit maps to a component you can drop into your app."
          />
          <Button asChild variant="secondary" className="mt-6">
            <a href={docsHref('principles')}>Read the principles</a>
          </Button>
        </div>

        <ul className="m-0 list-none border-t border-border p-0">
          {HABITS.map(({ id, title, text, code, icon: Icon }) => (
            <li key={id} className="border-b border-border">
              <a
                href={docsHref(id)}
                className="group -mx-3 grid grid-cols-[44px_minmax(0,1fr)] gap-x-[18px] gap-y-2 rounded-[14px] px-3 py-[22px] text-fg no-underline transition-colors duration-(--duration-fast) hover:bg-surface-raised sm:grid-cols-[44px_minmax(0,1fr)_auto]"
              >
                <span className="grid size-10 place-items-center rounded-[11px] bg-surface-raised text-accent-fg shadow-[0_0_0_1px_var(--border),var(--shadow-1)] transition-colors duration-(--duration-fast) group-hover:bg-accent-soft">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-[-0.015em]">{title}</h3>
                  <p className="mt-1 max-w-[52ch] text-ui leading-[1.6] text-fg-muted">{text}</p>
                </div>
                <span className="col-start-2 flex items-start gap-2 pt-[5px] sm:col-start-3">
                  <code className="font-mono text-[11.5px] whitespace-nowrap text-fg-subtle">{code}</code>
                  <ArrowRIcon
                    aria-hidden="true"
                    className="mt-px size-3.5 -translate-x-1 text-fg-subtle opacity-0 transition-[opacity,translate] duration-(--duration-base) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
