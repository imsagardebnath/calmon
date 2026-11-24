---
name: Card
category: Data display
principle: none
import: "@calmon/react/card"
status: stable
related: [Dialog, VitalTile]
description: Groups related content on a raised surface, with an optional header and footer.
---

## Use when

- Several related pieces of information belong together: a service summary, a handover note, a settings group.
- A section needs its own header (a title and a status or a menu) or its own footer actions.

## Don't use when

- The content is one line of status: use a Banner or a Badge.
- You need to block the page until the user answers: use a Dialog.
- You are about to put a card inside a card: use spacing and dividers instead.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- `title` renders a real heading. It defaults to `h4`; set `as` (`h1` to `h6`) so the page outline stays in order.
- The card is a plain `div`, not a landmark, so many cards on a page do not clutter screen reader navigation.
- Interactive content in `action` and `footer` follows normal tab order: header first, then body, then footer.
- Put a visible severity label or icon in `action`: colour alone is not enough.

## Common mistakes

Wrong: a heading level chosen for its size, which breaks the page outline.

```tsx
<h1>Services</h1>
<Card title="orders-api" as="h4">…</Card>
```

Right: the level that follows the heading above it. The look does not change.

```tsx
<h1>Services</h1>
<Card title="orders-api" as="h2">…</Card>
```

Wrong: cards nested inside cards.

```tsx
<Card title="Team"><Card title="On call">…</Card></Card>
```

Right: one card per topic, with a divider or spacing inside.

```tsx
<Card title="Team">
  <p>On call: R. Iyer</p>
</Card>
```

Wrong: wrapping composed parts in a second body, which doubles the padding.

```tsx
<Card><CardBody><CardHeader>…</CardHeader></CardBody></Card>
```

Right: pass the parts as direct children of the card.

```tsx
<Card><CardHeader>…</CardHeader><CardBody>…</CardBody></Card>
```
