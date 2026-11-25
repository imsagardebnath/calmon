---
name: Avatar
category: Data display
principle: none
import: "@openvanta/pikore-react/avatar"
status: stable
related: [Table, Card]
description: A person or team, shown as an image or as initials on a soft tint, with an optional presence dot. AvatarGroup stacks several.
---

## Use when

- You show who owns, last changed or is assigned to something, next to the thing itself.
- You show who is on call or online (add `status`).
- Several people share an item: use `AvatarGroup` so the row stays short.

## Don't use when

- The avatar is the only place the name appears: show the name next to it.
- You need a status for a service or an alert: use a Badge with a severity.
- The picture is decoration: use a plain image.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The avatar is an image (`role="img"`) named from `name`. If `status` is set, the status is part of the name: "Alex Kaur, online".
- The presence dot is also drawn as a shape, not only a colour: online is filled, away is a hollow ring.
- With `src`, the picture is decorative because the name already describes it. If the picture fails to load, the initials appear.
- `AvatarGroup` names the hidden people in the tail, for example "3 more: Cy Three, Di Four, Ed Five".
- Tints never use the caution or critical colours, so an avatar cannot be mistaken for an alert.

## Common mistakes

Wrong: an avatar alone, so a screen reader or a quick glance gives only initials.

```tsx
<Avatar name="Ravi Iyer" />
```

Right: the name sits next to it.

```tsx
<div className="flex items-center gap-2">
  <Avatar name="Ravi Iyer" />
  <span>Ravi Iyer</span>
</div>
```

Wrong: a colour override that makes the avatar look like an alert.

```tsx
<Avatar name="Ravi Iyer" className="bg-critical-soft text-critical-fg" />
```

Right: leave the tint alone. Show an alert with a Badge and a severity.

```tsx
<Avatar name="Ravi Iyer" />
```

Wrong: building a stack by hand, so the hidden people are not named.

```tsx
<div className="flex -space-x-2">{people.slice(0, 3).map((p) => <Avatar key={p.name} name={p.name} />)}</div>
```

Right: `AvatarGroup` overlaps and adds the "+N" tail with names.

```tsx
<AvatarGroup max={3} people={people} />
```
