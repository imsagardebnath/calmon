---
name: Code
category: Data display
principle: none
import: "@openvanta/calmon-react/code"
status: stable
related: [Kbd]
description: Inline code and copyable code blocks, with light syntax colours for tsx, ts, js, json, css and bash.
---

## Use when

- You show a command, a snippet or a config file that people will copy: use the block (`<Code>`, also exported as `CodeBlock`).
- You mention a prop, a value, a file name or a command inside a sentence: use `<Code inline>`.

## Don't use when

- You give a keyboard shortcut: use Kbd.
- You want emphasis in prose: use bold or italic text.
- The snippet is very long: link to the file instead. A block scrolls sideways, it does not wrap.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- A block is a `<pre><code>`. The code area can be focused, so keyboard users can scroll a long line sideways with the arrow keys.
- The Copy button is a native button. On success it changes to "Copied" and a polite live region announces "Copied", then it resets after two seconds. If the browser blocks clipboard access, nothing changes: the text is still there to select. In `bash`, `sh`, `shell` and `zsh` blocks, a leading `$ ` prompt is shown but left out of the copied text.
- Token colours are never the only carrier of meaning: the code reads the same without them. The colours are the info, normal, subtle, accent and advisory foreground tokens.
- Highlighting is a small approximation for common snippets, not a parser. Unknown languages are shown as plain text.

## Common mistakes

Wrong: a long line that forces people to scroll to read the important part.

```tsx
<Code language="bash">{'npm install @openvanta/calmon-react @floating-ui/react-dom class-variance-authority clsx tailwind-merge'}</Code>
```

Right: break the command over lines, so it reads without scrolling.

```tsx
<Code language="bash">{'npm install @openvanta/calmon-react \\\n  class-variance-authority clsx tailwind-merge'}</Code>
```

Wrong: a block for one word in a sentence.

```tsx
Set the <Code>severity</Code> prop.
```

Right: the inline variant.

```tsx
Set the <Code inline>severity</Code> prop.
```

Wrong: a copy button on output that nobody should paste.

```tsx
<Code language="json">{sampleResponse}</Code>
```

Right: turn the button off for read-only output.

```tsx
<Code language="json" copyable={false}>{sampleResponse}</Code>
```
