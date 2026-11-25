import { Code, CodeBlock } from '@openvanta/pikore-react/code'

/** A terminal command. The header label can be anything, here a name for the place to run it. The `$ ` prompt is shown but not copied. */
export function Block() {
  return (
    <div className="w-96">
      <CodeBlock language="bash" label="Terminal" copyable>
        {'$ npm install @openvanta/pikore-react'}
      </CodeBlock>
    </div>
  )
}

/** The default language is tsx. Keywords, strings, comments, tags and attributes get token colours. */
export function Tsx() {
  return (
    <div className="w-[34rem] max-w-full">
      <Code label="Save.tsx">
        {`import { Button } from '@openvanta/pikore-react/button'

// One primary action per view.
export const Save = () => (
  <Button variant="primary" severity="critical" onClick={() => remove(id)}>
    Delete service “api-gateway”
  </Button>
)`}
      </Code>
    </div>
  )
}

/** JSON keys, strings and literals. Long lines scroll sideways, and the block can be focused to scroll with the keyboard. */
export function Json() {
  return (
    <div className="w-96 max-w-full">
      <Code language="json">
        {`[
  { "name": "api-gateway", "replicas": 3, "healthy": true },
  { "name": "worker", "replicas": 2, "healthy": false }
]`}
      </Code>
    </div>
  )
}

/** CSS at-rules, properties, selectors and colours. */
export function Css() {
  return (
    <div className="w-96 max-w-full">
      <Code language="css" label="app.css">
        {`@import "tailwindcss";
@import "@openvanta/pikore-react/styles.css";

:root { --accent: #4F46E5; }
.card { border-radius: 14px; }`}
      </Code>
    </div>
  )
}

/** Turn the copy button off for output people should only read. With no label either, the header goes away. */
export function NoCopy() {
  return (
    <div className="w-72">
      <Code language="bash" copyable={false}>
        {'pnpm add @openvanta/pikore-react'}
      </Code>
    </div>
  )
}

/** Inline code inside a sentence, for a prop, a value or a file name. */
export function Inline() {
  return (
    <p className="text-ui-sm">
      Set <Code inline>severity=&quot;critical&quot;</Code> on the tile.
    </p>
  )
}
