// A default body for the Safety patterns pages (ids match design/extracted/principles.json), used until a page
// file for that pattern exists at src/pages/<group>/<id>.tsx. It follows the design's pattern page: why it
// matters, what to do in your software, the rules, and the components that implement the pattern.
import { GridIcon } from '@calmon/react/icons'
import principles from '../../../../design/extracted/principles.json'
import { Bullets, Callout, LinkCard, LinkCards } from './doc.tsx'
import { PatternIcon } from './icons.tsx'
import { docsHref } from './router.ts'
import { pages } from './pages.ts'

/** [id, title, icon, why it matters, in your software, rules, components] */
type Principle = [string, string, string, string, string, string[], string[]]

export const hasPrinciple = (id: string) => (principles as unknown as Principle[]).some((p) => p[0] === id)

export function PatternPage({ id }: { id: string }) {
  const principle = (principles as unknown as Principle[]).find((p) => p[0] === id)
  if (!principle) return null
  const [, , , why, inSoftware, rules, components] = principle
  const linked = components
    .map((name) => pages.find((p) => p.entry?.name === name))
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <>
      <Callout icon={<PatternIcon id={id} className="size-4" />}>
        <b>Why it matters.</b> {why}
      </Callout>
      <p className="lead">
        <b>In your software.</b> {inSoftware}
      </p>

      <h2>Rules</h2>
      <Bullets>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </Bullets>

      {linked.length ? (
        <>
          <h2>Components</h2>
          <LinkCards>
            {linked.map((p) => (
              <LinkCard key={p.id} href={docsHref(p.id)} icon={<GridIcon className="size-[18px]" />} title={p.title}>
                {p.description}
              </LinkCard>
            ))}
          </LinkCards>
        </>
      ) : null}
    </>
  )
}
