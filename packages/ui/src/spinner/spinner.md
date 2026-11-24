---
name: Spinner
category: Feedback
import: "@calmon/react/spinner"
status: stable
related: [Skeleton, ProgressBar, Button]
description: Shows a short wait of under a few seconds. For longer work, show progress.
---

## Use when

- A small part of the page is waiting on something that takes a second or two: a refresh, a lookup, a save.
- You need an inline "working" signal next to text or a control. (A `Button` has its own `loading` state.)

## Don't use when

- The wait is long or measurable: use a ProgressBar.
- A whole page or list is loading: use Skeleton, so the layout does not jump.
- The wait is likely under 300ms. Delay showing the spinner by 300ms to avoid flicker.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The spinner has `role="status"` and a visually hidden label (default "Loading"), so screen readers announce it politely.
- Say what is loading with `label="Loading services"`.
- The rotation is a decorative animation. Under reduced motion the shared animation tokens apply.

## Common mistakes

Wrong: a spinner that blocks the whole page.

```tsx
<div className="fixed inset-0 grid place-items-center"><Spinner size="lg" /></div>
```

Right: skeletons in the shape of the content, and `aria-busy` on the container.

```tsx
<section aria-busy="true"><Skeleton lines={3} /></section>
```

Wrong: a spinner with no hint of what is happening, in a long task.

```tsx
<Spinner />
```

Right: progress with a label for anything longer than a few seconds.

```tsx
<ProgressBar value={66} label="Deploying v2.31.0" />
```
