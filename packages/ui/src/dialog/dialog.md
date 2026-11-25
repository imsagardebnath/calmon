---
name: Dialog
category: Overlays
principle: confirm-target
import: "@openvanta/pikore-react/dialog"
status: stable
related: [Drawer, Button, ConfirmTarget, PausePoint]
description: Blocks the page for a decision. Use it for confirmations and short forms, and set an intent when the choice is risky.
---

## Use when

- The user must decide or confirm before anything else: delete a service, restart in business hours, add an item.
- A short form is the whole task and the page behind it can wait.
- A risky action needs a last, clear question: set `intent="danger"` (or `severity="critical"`) and name the target in the title.

## Don't use when

- The user needs to keep looking at the page while they work: use a Drawer.
- The content is a hint or an explanation: use a Popover or a Tooltip.
- The message is not a question: use a Banner or a Toast.
- It would open on top of another dialog. Never stack dialogs.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Built on the native `<dialog>` element and `showModal()`: focus moves into the dialog and is trapped there, the page behind it is inert, and Escape closes it.
- Focus returns to the element that was focused before it opened, normally your trigger button.
- `title` becomes the dialog's name (`aria-labelledby`) and `description` its description (`aria-describedby`). Say what the dialog is about in the title.
- The severity icon has a different shape for every level, so risk is never shown by colour alone. Keep the title and the confirm button's label saying what will happen.
- `dismissible={false}` stops Escape and backdrop clicks, and hides the header close button. Always give the user a button that ends the dialog.
- Dialog content is only rendered while the dialog is open, so form state inside resets each time.
- A Popover, Menu or Tooltip opened from inside a dialog renders inside it, so it stays usable.

## Common mistakes

Wrong: vague button labels.

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Are you sure?" footer={<><Button>Cancel</Button><Button>OK</Button></>} />
```

Right: the title names the target and the confirm button names the action.

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  intent="danger"
  title="Delete checkout-web?"
  footer={<><Button>Cancel</Button><Button variant="primary" intent="danger">Delete service</Button></>}
/>
```

Wrong: building your own overlay with `position: fixed` and a backdrop div (no focus trap, no Escape, page still reachable by keyboard).

```tsx
<div className="fixed inset-0 bg-black/50"><div className="bg-white p-4">Delete?</div></div>
```

Right: use `Dialog`.

Wrong: opening it without a trigger the user chose, or keeping it open with `dismissible={false}` and no way out.

```tsx
<Dialog defaultOpen dismissible={false} title="Notice" />
```

Right: control `open` from the button that asked for it, and let the user close it.
