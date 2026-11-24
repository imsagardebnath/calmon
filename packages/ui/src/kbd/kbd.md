---
name: Kbd
category: Data display
principle: none
import: "@calmon/react/kbd"
status: stable
related: [Code]
description: A keyboard key cap. Pass a shortcut as "Ctrl+K" or as several children and each key gets its own cap.
---

## Use when

- You tell people which key or shortcut triggers an action: a search hint, a menu item, a tooltip.
- You document keyboard support for a component.

## Don't use when

- You show code, commands or file names: use Code.
- The shortcut does not exist yet or cannot be changed by the person using it: do not advertise it.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<kbd>` element. A shortcut is one `<kbd>` that holds one inner `<kbd>` per key, as HTML defines key combinations.
- Between caps, screen readers get a hidden "+", so `Ctrl+K` is read as "Ctrl plus K", not as two unrelated words.
- Use `mod` instead of a fixed `Ctrl` or `⌘`, so each reader sees the key on their own keyboard. It shows `Ctrl` on the server and on first render, then switches to `⌘` on Apple platforms in an effect, so server and client markup match.
- Caps are static text. Never rely on a cap alone to explain an action: put the action in words next to it.

## Common mistakes

Wrong: one cap for the whole combination, which reads as a single odd key.

```tsx
<Kbd>Ctrl K</Kbd>
```

Right: a `+`-separated string, or several children, so each key is its own cap.

```tsx
<Kbd>Ctrl+K</Kbd>
```

Wrong: a hard-coded platform key, which is wrong for half of the readers.

```tsx
<Kbd>⌘+K</Kbd>
```

Right: `mod` follows the platform.

```tsx
<Kbd>mod+K</Kbd>
```

Wrong: a cap used to style a command or a file name.

```tsx
Run <Kbd>npm install</Kbd>
```

Right: use inline code for commands and file names.

```tsx
Run <Code inline>npm install</Code>
```
