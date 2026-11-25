---
name: Textarea
category: Forms
principle: none
import: "@openvanta/pikore-react/textarea"
status: stable
related: [Field, Input]
description: Multi-line text, such as notes, reasons and descriptions. Grows with content up to a maximum height.
---

## Use when

- The person writes more than a line: a reason for a change, a note, a description.
- A change needs a justification that is shown on a timeline later.

## Don't use when

- The value is a single line: use Input.
- The text must follow a strict format, such as an ID or a code: use Input with a hint.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<textarea>`. Pair it with a visible label: put it in a Field.
- With `maxLength` a visible counter shows the characters used. A hidden status region announces the characters left, politely, only within 20 characters of the limit, so it does not chatter while someone types.
- The counter changes colour near and at the limit, and the numbers are always visible, so colour is never the only signal.
- Auto-grow caps at `maxRows` and then scrolls. Manual resizing is off while it is on. The height is refitted when the width changes, so re-wrapped text is not clipped.

## Common mistakes

Wrong: a textarea for a single value.

```tsx
<Textarea aria-label="Service name" />
```

Right: an Input.

```tsx
<Input aria-label="Service name" />
```

Wrong: a limit enforced silently, so the person loses text without knowing why.

```tsx
<Textarea maxLength={140} />
```

Right: say the limit in a hint, and let the counter show how much is left.

```tsx
<Field label="Status update" hint="Posted to the status page. 140 characters.">
  <Textarea maxLength={140} />
</Field>
```
