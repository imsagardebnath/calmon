import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { Code } from '@calmon/react/code'
import { Tab, Tabs, TabsList, TabsPanel } from '@calmon/react/tabs'
import { GridIcon, LayersIcon } from '@calmon/react/icons'
import { ExampleBox, Lead, LinkCard, LinkCards, StepHeading, Bullets } from '../../site/doc.tsx'
import { docsHref } from '../../site/router.ts'
import { PACKAGE } from '../../site/config.ts'

const MANAGERS = [
  ['npm', `npm install ${PACKAGE}`],
  ['pnpm', `pnpm add ${PACKAGE}`],
  ['yarn', `yarn add ${PACKAGE}`],
  ['bun', `bun add ${PACKAGE}`],
] as const

const STYLES = `@import "tailwindcss";
@import "${PACKAGE}/styles.css";`

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Azeret+Mono:wght@200;300;400;500;600&display=swap"
  rel="stylesheet"
/>`

const PROVIDER = `import { CalmonProvider, Button } from '${PACKAGE}'

export default function App() {
  return (
    <CalmonProvider theme="system" density="comfortable">
      <Button variant="primary">Save changes</Button>
    </CalmonProvider>
  )
}`

const IMPORTS = `import { Button, Badge } from '${PACKAGE}'
import { Button } from '${PACKAGE}/button'
import { CheckIcon } from '${PACKAGE}/icons'`

export default function Installation() {
  const [manager, setManager] = useState<string>('npm')
  return (
    <>
      <h2>Requirements</h2>
      <Bullets>
        <li>
          <b>React 19</b> or later (<code>react</code> and <code>react-dom</code>)
        </li>
        <li>
          <b>Tailwind CSS v4.1</b> or later
        </li>
        <li>Any bundler: Vite, Next.js, Remix</li>
      </Bullets>

      <StepHeading n={1}>Install the package</StepHeading>
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

      <StepHeading n={2}>Import the styles</StepHeading>
      <Lead>
        Import once, after Tailwind. The tokens arrive as CSS variables, and Tailwind finds the components&rsquo; classes
        automatically.
      </Lead>
      <Code language="css" label="app.css">
        {STYLES}
      </Code>
      <p className="lead mt-4">
        Optional: load the fonts. Instrument Sans is the interface font and Azeret Mono sets code and numerals. Without them
        the system fonts are used.
      </p>
      <Code language="tsx" label="index.html">
        {FONTS}
      </Code>

      <StepHeading n={3}>Add the provider</StepHeading>
      <Lead>
        <code>CalmonProvider</code> sets the theme (class <code>dark</code> on <code>&lt;html&gt;</code>) and the density (
        <code>data-density</code>). It is optional: without it you get the light theme and comfortable density.
      </Lead>
      <Code language="tsx" label="App.tsx">
        {PROVIDER}
      </Code>

      <h2>Your first component</h2>
      <Lead>That is the whole setup. Here is a button, rendered by the package you just installed.</Lead>
      <ExampleBox
        code={`import { Button } from '${PACKAGE}/button'

<Button variant="primary">Save changes</Button>
<Button>Cancel</Button>`}
      >
        <Button variant="primary">Save changes</Button>
        <Button>Cancel</Button>
      </ExampleBox>

      <h2>Importing</h2>
      <Lead>
        Import from the package root, or from one entry per component. The per-component entries keep bundles small in tools
        that do not tree-shake well.
      </Lead>
      <Code language="tsx" label="imports.ts">
        {IMPORTS}
      </Code>

      <h2>Next steps</h2>
      <LinkCards>
        <LinkCard href={docsHref('theming')} icon={<LayersIcon className="size-[18px]" />} title="Theme it">
          Light and dark, your own accent, and three densities.
        </LinkCard>
        <LinkCard href={docsHref('components')} icon={<GridIcon className="size-[18px]" />} title="Browse components">
          Every component with examples, props and guidelines.
        </LinkCard>
      </LinkCards>
    </>
  )
}
