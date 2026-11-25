---
name: Popover
category: Overlays
principle: none
import: "@openvanta/pikore-react/popover"
status: stable
related: [Tooltip, Dialog, Menu]
description: Rich content anchored to a trigger, such as an explanation of a number or a small form. Opens on click and closes on Escape or an outside click.
---

## Use when

- You explain a number or status in place, for example why a health score is 62.
- You show a small, optional form or a few links next to the thing they are about.

## Don't use when

- The text is a short label and never needs interaction: use a Tooltip.
- The user must complete a step before moving on: use a Dialog. Don't put required steps in a popover.
- It is a list of actions: use a Menu.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The trigger gets `aria-haspopup="dialog"`, `aria-expanded` and, while open, `aria-controls`. Its own props and handlers are kept.
- The popover is `role="dialog"`. Its name is `label` when you pass it, otherwise the trigger's name. Pass `label` when the trigger is an icon.
- On open, focus moves into the popover (so keyboard users can reach links and buttons inside). Escape closes it and returns focus to the trigger, and so does closing it from a button inside it (for example by calling your `setOpen(false)`).
- Clicking outside or clicking the trigger again closes it. Tab from the last control closes it and moves on from the trigger; Shift+Tab from the first control (or from the popover itself) closes it and puts focus on the trigger. The popover sits at the end of `<body>`, so this keeps the tab order in step with what you see.
- `label` names the popover; `aria-label` and `aria-labelledby` work too, and `id` is kept.
- It renders into `<body>` (or into the enclosing `<dialog>`), so it is never clipped and inherits the theme. It flips and shifts to stay on screen.
- Escape closes only the popover, not a dialog around it.
- A Menu or Popover opened from inside a popover renders inside it, so using it does not close the popover. Escape closes the innermost one first.
- `side` `start` and `end` are the left and right sides and do not flip in right-to-left layouts.

## Common mistakes

Wrong: required steps or the only way to do something inside a popover.

```tsx
<Popover trigger={<Button>Continue</Button>}>
  <Button variant="primary">Confirm payment</Button>
</Popover>
```

Right: use a Dialog for anything the user must do.

Wrong: a trigger that is not a button, so keyboards cannot open it.

```tsx
<Popover trigger={<div>Why 62?</div>}>…</Popover>
```

Right: a real button.

```tsx
<Popover trigger={<Button>Why 62?</Button>}>…</Popover>
```
