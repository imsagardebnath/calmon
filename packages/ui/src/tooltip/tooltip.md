---
name: Tooltip
category: Overlays
principle: none
import: "@openvanta/calmon-react/tooltip"
status: stable
related: [Popover, IconButton, Button]
description: A short label on hover or keyboard focus. Never holds essential information or interactive content.
---

## Use when

- You name an icon-only button, or explain why a control is disabled.
- You add a short extra hint (under 80 characters) that nobody needs in order to finish the task.

## Don't use when

- The text is essential: put it on the page.
- It holds a link, a button or anything to click: use a Popover.
- It is a long explanation: use a Popover or help text.
- The user is on a touch screen and has no other way to read it. Tooltips do not show on touch.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The tooltip is `role="tooltip"`. While it is shown, the wrapped element gets `aria-describedby` pointing at it.
- It shows on hover after `delay` (default 400 ms) and at once on keyboard focus. Pointer leave, blur and Escape hide it. Escape closes only the tooltip, not a dialog around it.
- A natively `disabled` button cannot take focus. For disabled controls use `aria-disabled="true"` so the tooltip can be reached by keyboard, and ignore the click yourself. A natively disabled child lets the pointer through to the tooltip, but keyboards cannot reach it.
- The tooltip replaces the native `title` attribute of the wrapped element (so `IconButton` does not show two tips).
- Tooltip text is not announced when it is not focused, so never rely on it for required information.

## Common mistakes

Wrong: interactive content in a tooltip.

```tsx
<Tooltip content="See the docs at example.com/docs">
  <Button>Help</Button>
</Tooltip>
```

Right: a Popover with a real link.

```tsx
<Popover trigger={<Button>Help</Button>}>
  <a href="/docs">Read the docs</a>
</Popover>
```

Wrong: a disabled control with no reason.

```tsx
<Button disabled>Publish</Button>
```

Right: say why, and keep it focusable.

```tsx
<Tooltip content="Locked until all checks pass">
  <Button aria-disabled="true">Publish</Button>
</Tooltip>
```
