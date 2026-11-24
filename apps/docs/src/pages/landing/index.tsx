// The landing page. The docs shell supplies the header, the <main> and the footer; the sections live in the
// underscore files next to this one (they are not routes). Keep the default export.
import { Agents } from './_agents.tsx'
import { Examples } from './_examples.tsx'
import { Hero } from './_hero.tsx'
import { FinalCta, Install } from './_install.tsx'
import { Principles } from './_principles.tsx'
import { Showcase } from './_showcase.tsx'
import { Stats } from './_stats.tsx'

export default function Landing() {
  return (
    <>
      <Hero />
      <Stats />
      <Principles />
      <Examples />
      <Showcase />
      <Agents />
      <Install />
      <FinalCta />
    </>
  )
}
