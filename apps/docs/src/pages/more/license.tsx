import { CheckIcon, InfoIcon } from '@openvanta/calmon-react/icons'
import { Callout, Lead } from '../../site/doc.tsx'
// The canonical license text. Importing the real file means this page can never drift from it.
import licenseText from '../../../../../LICENSE?raw'

const YOU_CAN = [
  'Use Calmon in personal, commercial and internal projects, with no fee.',
  'Copy it, modify it, and merge it into your own code.',
  'Publish and distribute your changes, including your own forks and derived libraries.',
  'Sublicense it and sell products that include it.',
]

const YOU_MUST = [
  'Keep the copyright notice and the MIT license text in copies of the source code, or substantial portions of it.',
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Can I use Calmon in a commercial product?',
    a: 'Yes. MIT places no limit on commercial use and asks for no fee.',
  },
  {
    q: 'Do I need to show “Powered by Calmon”?',
    a: 'No. The notice is only required in copies of the source code, not in your application’s interface.',
  },
  {
    q: 'Can I fork it or build my own library from it?',
    a: 'Yes, as long as you keep the copyright notice and the MIT license text.',
  },
  {
    q: 'Is there a warranty?',
    a: 'No. The software is provided as is, as the license text below says. You are responsible for testing it for your own use.',
  },
]

export default function License() {
  return (
    <>
      <Lead>
        Calmon is open source under the MIT license: use it, change it and share it, as long as you keep the notice. This
        page is a plain-language summary; the full license text is at the bottom and is the only binding version.
      </Lead>

      <h2 id="in-plain-language">In plain language</h2>
      <div className="not-prose my-6 grid gap-4 md:grid-cols-2" data-no-prose>
        <section aria-labelledby="lic-can" className="rounded-card border border-normal-border bg-normal-soft p-5">
          <h3 id="lic-can" className="flex items-center gap-2 text-ui font-semibold text-normal-fg">
            <CheckIcon className="size-4" /> You can
          </h3>
          <ul className="mt-3 grid gap-2.5 text-ui-sm text-fg">
            {YOU_CAN.map((t) => (
              <li key={t} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 text-normal-fg" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="lic-must" className="rounded-card border border-info-border bg-info-soft p-5">
          <h3 id="lic-must" className="flex items-center gap-2 text-ui font-semibold text-info-fg">
            <InfoIcon className="size-4" /> You must
          </h3>
          <ul className="mt-3 grid gap-2.5 text-ui-sm text-fg">
            {YOU_MUST.map((t) => (
              <li key={t} className="flex gap-2.5">
                <InfoIcon className="mt-0.5 size-4 text-info-fg" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <h2 id="common-questions">Common questions</h2>
      <dl className="my-4 grid gap-5">
        {FAQ.map(({ q, a }) => (
          <div key={q}>
            <dt className="font-semibold text-fg">{q}</dt>
            <dd className="mt-1 text-fg-muted">{a}</dd>
          </div>
        ))}
      </dl>

      <Callout icon={<InfoIcon className="size-4" />}>
        <b>Not legal advice.</b> This summary explains the license in everyday words. If a use is unclear, read the full text
        below or ask a lawyer.
      </Callout>

      <h2 id="full-license-text">Full license text</h2>
      <pre
        data-no-prose
        tabIndex={0}
        aria-label="MIT License, full text"
        className="not-prose my-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-card border border-border bg-surface-sunken p-5 font-mono text-xs leading-relaxed text-fg-muted"
      >
        {licenseText}
      </pre>
    </>
  )
}
