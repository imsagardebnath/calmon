---
name: Skeleton
category: Feedback
import: "@openvanta/pikore-react/skeleton"
status: stable
related: [Spinner, ProgressBar]
description: A placeholder in the shape of content that is loading, so layout doesn't jump.
---

## Use when

- A list, card, table or page region is loading and you know roughly what it will look like.
- The wait is long enough to notice (over about 300ms).

## Don't use when

- The wait is under 300ms: show nothing, so the page does not flash.
- You cannot predict the layout, or it is a tiny inline wait: use a Spinner.
- The work has a known length: use a ProgressBar.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Skeletons are `aria-hidden`: they are decoration, not content.
- Set `aria-busy="true"` on the container that is loading, and remove it when the content arrives. Give the container an accessible name (a landmark label or a heading) so the wait is understood.
- The shimmer slows to a stop under reduced motion through the shared animation tokens.

## Common mistakes

Wrong: a skeleton that does not match the layout, so content jumps when it arrives.

```tsx
<Skeleton size={400} />
```

Right: match the real shape: an avatar and two lines for a row.

```tsx
<div className="flex items-center gap-3"><Skeleton circle size={36} /><Skeleton lines={2} /></div>
```

Wrong: a skeleton for a fast request, which flashes.

```tsx
{isLoading && <Skeleton lines={3} />}
```

Right: only show it after a short delay, or keep the old content while refreshing.

```tsx
{isLoading && delayed && <Skeleton lines={3} />}
```
