---
name: IconButton
category: Actions
principle: none
import: "@calmon/react/icon-button"
status: stable
related: [Button, Tooltip]
description: A button that shows only an icon. It always has an accessible label, shown as a tooltip on hover.
---

## Use when

- The action repeats and is well known: settings, more actions, close, delete in a table row or toolbar.

## Don't use when

- It is the main action on a page. Give it words with Button.
- The meaning of the icon is not obvious to your users.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- `label` becomes `aria-label` and the tooltip, so sighted and screen-reader users get the same name.
- The icon itself is hidden from screen readers.
- While `loading`, a spinner replaces the icon and the button sets `aria-busy="true"`. The button keeps keyboard focus, and `label` stays its accessible name, so say what is happening in it (for example "Saving settings").

## Common mistakes

Wrong: no accessible name.

```tsx
<Button><SettingsIcon /></Button>
```

Right:

```tsx
<IconButton label="Settings" icon={<SettingsIcon />} />
```
