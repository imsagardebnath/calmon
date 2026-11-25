// Small building blocks for static docs pages, matching the design's .lead, .callout, .linkcards and .example.
// Pages start with their own h2 sections; the layout supplies the h1, description and table of contents.
import type { ReactNode } from 'react'
import { Code } from '@openvanta/pikore-react/code'
import { InfoIcon } from '@openvanta/pikore-react/icons'

/** An introductory paragraph. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>
}

/** A short aside with an icon. */
export function Callout({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="callout">
      {icon ?? <InfoIcon className="size-4" />}
      <span>{children}</span>
    </div>
  )
}

/** A bulleted list in the page's reading style. */
export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="bul">{children}</ul>
}

export function LinkCards({ children }: { children: ReactNode }) {
  return <div className="linkcards">{children}</div>
}

/** A card that links to another docs page (or any URL). */
export function LinkCard({ href, icon, title, children }: { href: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <a className="linkcard" href={href}>
      <span className="lc-ic">{icon}</span>
      <b>{title}</b>
      <span>{children}</span>
    </a>
  )
}

/** A heading with a numbered badge, for step-by-step pages. Renders an h2 so it appears in "On this page". */
export function StepHeading({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="steps-h">
      <span className="stepno" aria-hidden="true">
        {n}
      </span>
      {children}
    </h2>
  )
}

/** A live preview on the dotted stage, with its code underneath. The preview can be interactive. */
export function ExampleBox({ children, code, label = 'tsx', language = 'tsx' }: { children: ReactNode; code: string; label?: string; language?: string }) {
  return (
    <div className="example" data-example>
      <div className="ex-p">
        <div className="ex-in">{children}</div>
      </div>
      <Code language={language} label={label} className="rounded-none border-0 border-t border-border">
        {code}
      </Code>
    </div>
  )
}
