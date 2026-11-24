---
name: Breadcrumbs
category: Navigation
principle: none
import: "@calmon/react/breadcrumbs"
status: stable
related: [SideNav, Tabs]
description: Shows where the current page sits in a hierarchy. Start with the environment so people always know where they are.
---

## Use when

- The app is more than two levels deep: environment, region, service, page.
- People may arrive from a link or a search and need to see where they landed.
- The same name can exist in two places, such as `orders-api` in Production and in Staging.

## Don't use when

- The app has one or two levels. The page title is enough.
- You want to show the steps of a process. Use a stepper.
- You want to switch between views of the same thing. Use Tabs.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders `<nav aria-label="Breadcrumb">` with an ordered list, so screen readers announce a list and its length. Pass `aria-label` to change the name.
- The last item has `aria-current="page"`. It is plain text unless you give it an `href`.
- The chevron separators are decorative and hidden from screen readers.
- A long path keeps the first and last crumbs. The "…" is a real button named "Show all breadcrumbs", and its tooltip lists the hidden crumbs. Activating it shows the whole path and moves focus to the first crumb that appeared.

## Common mistakes

Wrong: leaving the environment out. Two pages with the same name look the same.

```tsx
<Breadcrumbs items={[{ label: 'orders-api', href: '/orders-api' }, { label: 'Deploys' }]} />
```

Right: the environment is the first crumb.

```tsx
<Breadcrumbs items={[{ label: 'Production', href: '/production' }, { label: 'orders-api', href: '/production/orders-api' }, { label: 'Deploys' }]} />
```

Wrong: the page title repeated in the trail, once as a link and once as the current page.

```tsx
<Breadcrumbs items={[{ label: 'Production', href: '/' }, { label: 'Deploys', href: '/deploys' }, { label: 'Deploys' }]} />
```

Right: each level appears once, and the current page is the last crumb.

```tsx
<Breadcrumbs items={[{ label: 'Production', href: '/' }, { label: 'orders-api', href: '/orders-api' }, { label: 'Deploys' }]} />
```
