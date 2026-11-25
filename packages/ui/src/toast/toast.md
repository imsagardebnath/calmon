---
name: Toast
category: Feedback
principle: alarm-fatigue
import: "@openvanta/pikore-react/toast"
status: stable
related: [Banner, Badge, Button]
description: A brief confirmation in the corner that leaves on its own. Critical toasts stay until dismissed.
---

## Use when

- You confirm something the user just did: "Published", "3 rows archived".
- A reversible action needs an Undo that is available for a few seconds.
- Background work reports progress or finishes (use an `id` to update one toast in place).

## Don't use when

- The user must act or decide: use a Dialog, or a Banner that stays.
- Something important would live only in a toast. It disappears: also record it in the page.
- The same message can repeat. Pass a `dedupeKey` so repeats merge into one toast with a count instead of stacking.

## Setup

Render one `ToastProvider` near the root of your app, then call `useToast()` anywhere under it. `ToastProvider` accepts `limit` (toasts shown at once, default 3), `label` (name of the notification area) and `className`.

```tsx
import { ToastProvider, useToast } from '@openvanta/pikore-react/toast'

function PublishButton() {
  const { toast } = useToast()
  return <Button onClick={() => toast({ severity: 'normal', title: 'Published' })}>Publish</Button>
}

<ToastProvider>
  <PublishButton />
</ToastProvider>
```

`useToast()` returns `{ toast, dismiss, dismissAll }`. `toast(options)` returns the toast's id. The `Toast` component on its own is for docs and previews.

## Props

<!-- props -->

`toast()` takes `severity` or `intent`, `title`, `description`, `duration`, `action`, `dedupeKey`, `icon`, `loading`, `progress`, `solid` and `id`. They mean the same as the `Toast` props above, plus `id`. `duration` and `dedupeKey` only take effect through `toast()`; a plain `Toast` ignores them.

- `duration`: milliseconds before the toast leaves. Default 5000. `0` keeps it open. Critical toasts default to 0.
- `dedupeKey`: a repeat updates the existing toast, adds to its `x2`, `x3` count, restarts its timer and moves it to the front.
- `id`: calling `toast()` again with the same id updates that toast in place (for progress).

## Examples

<!-- examples -->

## Accessibility

- The notification area is a polite live region (`role="region"`, `aria-live="polite"`). Critical and caution toasts use `role="alert"` so they are announced at once; the others use `role="status"`.
- Hover and keyboard focus pause the timer, so nobody loses a toast they are reading or reaching for. The countdown bar pauses too, and is hidden under reduced motion.
- When the toast that has keyboard focus is removed (its action or close button was pressed), focus moves to the next toast, or back to the element that had it before focus entered the notification area. It is never dropped to the page.
- Critical toasts never time out. Nothing important lives only in a toast.
- Toasts show as a pile (newest in front, older ones tucked behind, up to `limit`). Hovering or focusing the pile spreads it out so every toast can be read and dismissed.
- The severity icon changes shape per level and is decorative; the title says what happened.

## Common mistakes

Wrong: one toast per repeated alert, which buries the screen.

```tsx
alerts.forEach((a) => toast({ severity: 'caution', title: a.message }))
```

Right: merge repeats with a `dedupeKey`.

```tsx
alerts.forEach((a) => toast({ severity: 'caution', title: a.message, dedupeKey: a.rule }))
```

Wrong: a toast for an error that needs a decision, with a vague title.

```tsx
toast({ severity: 'critical', title: 'Error' })
```

Right: say what happened and to what, or use a Dialog when a decision is needed.

```tsx
toast({ severity: 'critical', title: 'Could not publish', description: 'The change window closed at 18:00.' })
```

Wrong: a confirmation for a reversible action.

```tsx
if (confirm('Archive 3 rows?')) archive()
```

Right: do it, and offer Undo.

```tsx
toast({ intent: 'primary', title: '3 rows archived', action: { label: 'Undo', onClick: restore } })
```
