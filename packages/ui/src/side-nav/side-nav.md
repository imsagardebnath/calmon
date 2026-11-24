---
name: SideNav
category: Navigation
principle: alarm-fatigue
import: "@openvanta/calmon-react/side-nav"
status: stable
related: [Tabs, Breadcrumbs, Badge]
description: The main app navigation, with groups, icons and alert counts. It collapses to an icon rail.
---

## Use when

- The app has several top-level areas, and people move between them all day.
- Some areas can need attention, and a count next to the name saves a visit: alerts, pending approvals.

## Don't use when

- You only switch between views of one thing. Use Tabs.
- The app has two or three pages. A top bar is enough.
- You want a count on every item. A count on a normal item is noise: show it only when someone has to act.

## Props

<!-- props -->

### Parts

Put `SideNavGroup`s (or `SideNavItem`s directly) inside `SideNav`.

| Part | Props | Notes |
|---|---|---|
| `SideNavGroup` | `label` (required) | A titled set of items, with `role="group"` named by its heading. A group inside a group gets a smaller sub-heading and indented items. |
| `SideNavItem` | `icon`, `active`, `badge`, `href`, `asChild` | A link with an icon, a label and an optional count. Without `href` it renders a button. `badge` is `{ severity, count }`. Any `<a>` prop (`target`, `onClick`) is passed on. |

With a router, use `asChild` and put the router link inside, so the item keeps its icon and count:

```tsx
<SideNavItem asChild icon={<GridIcon />} badge={{ severity: 'critical', count: 1 }}>
  <Link to="/station">Station</Link>
</SideNavItem>
```

The item gives the child its `className`, `aria-current` and `title`, so the link component must pass those props on to the element it renders (router links do). If `asChild` has no single element to render, it is ignored and the item renders as a normal link or button.

## Examples

<!-- examples -->

## Accessibility

- Renders `<nav aria-label="Main">`. Change the name with `aria-label` when the page has more than one navigation, for example "Documentation".
- The current item has `aria-current="page"`. Set it with `active`, or let your router's link do it.
- Each group is `role="group"` labelled by its heading.
- A badge always shows the number, and the severity name is read out after it ("Station 1 Critical"), so colour is never the only signal.
- Collapsed rail: the label stays in the page as hidden text, so every link keeps its name. `title` shows it as a tooltip on hover, and a visible tip beside the icon shows it on keyboard focus, so people who tab through the rail can read each name. Labels that are not plain text (several nodes, or an element) still get the tooltip from their text. Always give collapsed items an `icon`. Group headings are hidden but still name the group.
- Icons are decorative and hidden from screen readers.

## Common mistakes

Wrong: counts on every item, including ones where nothing needs doing.

```tsx
<SideNavItem href="/services" badge={{ severity: 'normal', count: 12 }}>Services</SideNavItem>
```

Right: a count only where someone must act, with the severity that says how urgent it is.

```tsx
<SideNavItem href="/station" badge={{ severity: 'critical', count: 1 }}>Station</SideNavItem>
```

Wrong: an icon rail with items that have no icon, so nothing shows.

```tsx
<SideNav collapsed>
  <SideNavItem href="/station">Station</SideNavItem>
</SideNav>
```

Right: every item in a rail has an icon. The label becomes its tooltip.

```tsx
<SideNav collapsed>
  <SideNavItem icon={<GridIcon />} href="/station">Station</SideNavItem>
</SideNav>
```
