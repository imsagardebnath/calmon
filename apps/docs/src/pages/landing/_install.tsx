// "Install in under a minute" (three steps with code) and the closing call to action.
import { useState, type ReactNode } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Code } from '@openvanta/calmon-react/code'
import { ArrowRIcon, GithubIcon } from '@openvanta/calmon-react/icons'
import { Kbd } from '@openvanta/calmon-react/kbd'
import { Tab, Tabs, TabsList, TabsPanel } from '@openvanta/calmon-react/tabs'
import { PACKAGE, REPO_URL } from '../../site/config.ts'
import { docsHref } from '../../site/router.ts'
import { Section, SectionHead } from './_ui.tsx'

const MANAGERS = [
  ['npm', `npm install ${PACKAGE}`],
  ['pnpm', `pnpm add ${PACKAGE}`],
  ['yarn', `yarn add ${PACKAGE}`],
  ['bun', `bun add ${PACKAGE}`],
] as const

const STYLES = `@import "tailwindcss";
@import "${PACKAGE}/styles.css";`

const APP = `import { CalmonProvider, Button } from '${PACKAGE}'

export default function App() {
  return (
    <CalmonProvider theme="system">
      <Button variant="primary">Save changes</Button>
    </CalmonProvider>
  )
}`

function Step({ n, title, children }: { n: number; title: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 gap-y-3">
      <span
        aria-hidden="true"
        className="grid size-[26px] place-items-center rounded-full bg-surface-raised font-mono text-[11px] text-fg shadow-[0_0_0_1px_var(--border)]"
      >
        {n}
      </span>
      <h3 className="self-center text-ui font-[550] text-fg">{title}</h3>
      <div className="col-start-2 min-w-0">{children}</div>
    </li>
  )
}

export function Install() {
  const [manager, setManager] = useState<string>('npm')
  return (
    <Section id="install" tone="sunken">
      <div className="grid items-start gap-10 min-[68.75rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[68.75rem]:gap-16">
        <div className="min-[68.75rem]:sticky min-[68.75rem]:top-24">
          <SectionHead
            id="install"
            title="Install in under a minute."
            lede="Works with Tailwind CSS v4. Tokens arrive as CSS variables, so your theme stays yours."
          />
          <p className="mt-6 text-ui-sm text-fg-subtle">Requires React 19 and Tailwind CSS 4.1 or later.</p>
          <Button asChild variant="secondary" className="mt-8">
            <a href={docsHref('installation')}>
              Read the installation guide
              <ArrowRIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <ol className="m-0 flex list-none flex-col gap-8 p-0">
          <Step n={1} title="Add the package to your React project.">
            <Tabs variant="segmented" value={manager} onValueChange={setManager}>
              <TabsList aria-label="Package manager" className="mb-3">
                {MANAGERS.map(([name]) => (
                  <Tab key={name} value={name}>
                    {name}
                  </Tab>
                ))}
              </TabsList>
              {MANAGERS.map(([name, command]) => (
                <TabsPanel key={name} value={name}>
                  <Code language="bash" label="Terminal">
                    {command}
                  </Code>
                </TabsPanel>
              ))}
            </Tabs>
          </Step>
          <Step n={2} title="Import the stylesheet once, after Tailwind.">
            <Code language="css" label="app.css">
              {STYLES}
            </Code>
          </Step>
          <Step
            n={3}
            title={
              <>
                Wrap your app in <code className="rounded-[5px] bg-surface-sunken px-1.5 py-px font-mono text-[.84em] shadow-[inset_0_0_0_1px_var(--border)]">CalmonProvider</code> and start with a Button.
              </>
            }
          >
            <Code language="tsx" label="App.tsx">
              {APP}
            </Code>
          </Step>
        </ol>
      </div>
    </Section>
  )
}

/** The last call to action, before the footer. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden border-t border-border px-5 py-20 sm:px-8 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,#000_20%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[280px] w-[min(760px,100%)] -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]"
      />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center text-center">
        <h2 id="cta-title" className="max-w-[16ch] text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-none tracking-[-0.04em] text-balance">
          Build something calm.
        </h2>
        <p className="mt-5 max-w-[44ch] text-lg leading-[1.6] text-fg-muted">
          Start with one component and add the rest when you need them. The safety is built in.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Button asChild variant="primary" size="lg">
            <a href={docsHref('installation')}>Get started</a>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={docsHref('components')}>Browse components</a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <GithubIcon className="size-4" aria-hidden="true" />
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </div>
        <p className="mt-6 flex items-center gap-2 text-ui-sm text-fg-subtle">
          Or press <Kbd>mod+K</Kbd> to search the docs from anywhere.
        </p>
      </div>
    </section>
  )
}
