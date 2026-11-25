import { BotIcon, GridIcon, InfoIcon, LayersIcon } from '@openvanta/pikore-react/icons'
import { Callout, Lead, LinkCard, LinkCards } from '../../site/doc.tsx'
import { PatternIcon } from '../../site/icons.tsx'
import { docsHref } from '../../site/router.ts'
import { pages, sections } from '../../site/pages.ts'

export default function Introduction() {
  const patterns = sections.find((s) => s.name === 'Safety patterns')?.pages ?? []
  const componentCount = pages.filter((p) => p.entry).length

  return (
    <>
      <p className="lead">
        Pikore UI is an open-source component library for operational and enterprise software: monitoring, incident response,
        admin consoles, and any dashboard where a missed signal costs something. Use it to build screens people can trust under
        pressure.
      </p>
      <Callout icon={<InfoIcon className="size-4" />}>
        <b>Why safety principles?</b> Screens fail people under pressure in predictable ways: too many alarms, unclear limits,
        acting on the wrong target. Pikore UI builds the fixes into components, so every team gets them by default.
      </Callout>

      <h2>Seven principles</h2>
      <Lead>Each principle is a Safety pattern page with the component that implements it.</Lead>
      <LinkCards>
        {patterns.map((p) => (
          <LinkCard key={p.id} href={docsHref(p.id)} icon={<PatternIcon id={p.id} className="size-[18px]" />} title={p.title}>
            {p.description}
          </LinkCard>
        ))}
      </LinkCards>

      <h2>Find your way</h2>
      <LinkCards>
        <LinkCard href={docsHref('principles')} icon={<LayersIcon className="size-[18px]" />} title="Foundations">
          Colour codes, type, spacing, icons and tokens.
        </LinkCard>
        <LinkCard href={docsHref('components')} icon={<GridIcon className="size-[18px]" />} title="Components">
          {componentCount} components with examples, props and guidelines.
        </LinkCard>
        <LinkCard href={docsHref('agents')} icon={<BotIcon className="size-[18px]" />} title="For AI agents">
          llms.txt and a ready prompt for coding agents.
        </LinkCard>
      </LinkCards>
    </>
  )
}
