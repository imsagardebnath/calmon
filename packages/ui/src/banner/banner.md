---
name: Banner
category: Feedback
principle: alarm-fatigue
import: "@openvanta/calmon-react/banner"
status: stable
related: [Toast, Badge, Button]
description: A message across a page or section that stays until it is resolved or dismissed.
---

## Use when

- A condition affects the whole page or section and should stay visible until someone resolves it: a degraded service, an expiring certificate, planned maintenance.
- You need to explain what is wrong and offer one next step.

## Don't use when

- The message confirms an action and should leave on its own: use a Toast.
- The user must decide before continuing: use a Dialog.
- There would be more than two banners on screen. Group repeated causes into one banner with a count, or summarise.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Critical banners use `role="alert"`, so they are announced at once. Caution, advisory, info and normal banners use `role="status"` (polite).
- The severity icon changes shape per level and is hidden from screen readers; the title carries the meaning, so colour is never the only signal.
- The close button only appears when you pass `onDismiss`. Its accessible name is "Dismiss" (change it with `dismissLabel`).
- Put one action in `action`, usually a small `Button` that names what it does ("View hosts").

## Common mistakes

Wrong: stacking many banners, one per host.

```tsx
<Banner severity="caution" title="Disk above 85% on db-02" />
<Banner severity="caution" title="Disk above 85% on db-03" />
<Banner severity="caution" title="Disk above 85% on db-05" />
```

Right: one banner with the count.

```tsx
<Banner severity="caution" title="Disk above 85% on 3 hosts" action={<Button size="sm">View hosts</Button>}>
  Free space before 90%, when writes slow down.
</Banner>
```

Wrong: a vague title and raw colours.

```tsx
<div className="bg-red-100 p-4">Something went wrong</div>
```

Right: a severity and a title that says what and where.

```tsx
<Banner severity="critical" title="Payments failing in eu-west" />
```

Wrong: a banner for a message that should vanish by itself.

```tsx
<Banner severity="normal" title="Saved" />
```

Right: use a toast for confirmations.

```tsx
toast({ severity: 'normal', title: 'Saved' })
```
