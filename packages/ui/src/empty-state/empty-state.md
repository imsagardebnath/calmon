---
name: EmptyState
category: Feedback
import: "@openvanta/pikore-react/empty-state"
status: stable
related: [Button, Skeleton, Banner]
description: Fills an empty area with what happened and what to do next.
---

## Use when

- A list, table, panel or search has nothing to show: no data yet, no results, or a failed load.
- You can offer the next step: add the first item, clear the filter, try again.

## Don't use when

- The content is still loading: use Skeleton.
- The empty area is on purpose and needs no explanation (an optional section with nothing in it).
- You need to report a page-level problem that stays: use a Banner.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The title is a real heading. Set `headingLevel` (2 to 6, default 3) so it fits the heading outline of the page or panel it sits in.
- The icon slot is decorative and hidden from screen readers; the title and text carry the meaning.
- Put the next step in `action`, usually a `Button` with a label that says what it does.

## Common mistakes

Wrong: apologising or joking, with no next step.

```tsx
<EmptyState title="Oops! Nothing here :(" />
```

Right: say what is empty, and offer the action that fills it.

```tsx
<EmptyState title="No services connected" action={<Button variant="primary" size="sm">Connect a source</Button>}>
  Connect a data source to see health scores and vitals here.
</EmptyState>
```

Wrong: a heading level that breaks the page outline.

```tsx
<EmptyState title="No alerts" headingLevel={5} />
```

Right: the level one below the heading of the container.

```tsx
<EmptyState title="No alerts" headingLevel={3} />
```
