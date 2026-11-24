---
name: Drawer
category: Overlays
principle: none
import: "@calmon/react/drawer"
status: stable
related: [Dialog, Popover]
description: A side sheet for detail and editing without losing your place. Modal like Dialog, anchored to a screen edge.
---

## Use when

- The user needs detail or an edit form for the item they were looking at, and should keep the page behind it in view.
- The content is taller or wider than a dialog should be: timelines, forms with several sections.

## Don't use when

- It is a quick yes or no: use a Dialog.
- It is a hint or an explanation: use a Popover.
- Another drawer or dialog is already open. Never stack drawers.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Built on the native `<dialog>` element and `showModal()`, like Dialog: focus is trapped, the page behind it is inert, Escape closes it, and focus returns to the trigger.
- `title` becomes the drawer's name (`aria-labelledby`) and `description` its description (`aria-describedby`).
- The body scrolls on its own while the header and footer stay in view, so the primary action is always reachable.
- `dismissible={false}` stops Escape and backdrop clicks and hides the close button. Provide another way to close it.
- Content is only rendered while the drawer is open.

## Common mistakes

Wrong: the primary action at the bottom of a long scrolling body.

```tsx
<Drawer open={open} onOpenChange={setOpen} title="payments-api">
  <LongDetails />
  <Button variant="primary">Acknowledge</Button>
</Drawer>
```

Right: keep it in the footer, where it stays in view.

```tsx
<Drawer open={open} onOpenChange={setOpen} title="payments-api" footer={<Button variant="primary">Acknowledge</Button>}>
  <LongDetails />
</Drawer>
```

Wrong: opening a drawer from inside another drawer.

Right: replace the content of the open drawer, or close it first.
