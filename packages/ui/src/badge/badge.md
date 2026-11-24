---
name: Badge
category: Feedback
import: "@calmon/react/badge"
status: stable
related: [Banner, Toast]
description: A short status label. Every severity badge carries an icon or a dot with its text, never colour alone.
---

## Use when

- You label the status of one thing: a service state, an environment, a count, a tag.
- The label is one or two words and sits next to the thing it describes (a table cell, a card header).

## Don't use when

- The message needs a sentence or an action: use a Banner or a Toast.
- The label is clickable or toggles something: use a Button, a Switch or a Checkbox.
- The status is normal and the row is already calm: leave it out. Save emphasis for problems.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- A badge is plain text in a `<span>`. A severity badge adds an icon whose shape changes per level (circle, circle, diamond, triangle, octagon), so the status is never colour alone.
- The icon is decorative and hidden from screen readers; the text says what the status is. Keep the text meaningful on its own ("Critical", not just a count).
- `variant="dot"` shows a coloured dot in place of the icon. It is decorative too.
- Pass `icon={false}` only when the text already names the severity.

## Common mistakes

Wrong: a solid badge for normal status, which makes calm things loud.

```tsx
<Badge severity="normal" variant="solid">Healthy</Badge>
```

Right: soft for normal, solid only for problems.

```tsx
<Badge severity="normal">Healthy</Badge>
<Badge severity="critical" variant="solid">Down</Badge>
```

Wrong: colour as the only signal, with raw colours and no text.

```tsx
<span className="size-2 rounded-full bg-red-500" />
```

Right: a severity and a word.

```tsx
<Badge severity="critical">Critical</Badge>
```

Wrong: a long sentence in a badge.

```tsx
<Badge severity="caution">Disk is above 85% on three hosts</Badge>
```

Right: one or two words, and put the detail in a Banner.

```tsx
<Badge severity="caution">Disk 85%</Badge>
```
