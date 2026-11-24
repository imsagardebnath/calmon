---
name: Tabs
category: Navigation
principle: none
import: "@openvanta/calmon-react/tabs"
status: stable
related: [Breadcrumbs, SideNav, Pagination]
description: Switch between views of the same thing. Underline style for page sections, segmented style for filters and time ranges.
---

## Use when

- The views are parts of one thing: Overview, Timeline and Settings of a service.
- The user picks a filter or a time range (1h, 24h, 7d): use `variant="segmented"`.
- Each view has a few items that need attention: add a `count`, with a `severity` when it is urgent.

## Don't use when

- The views are steps in a sequence. Use a stepper, so people can see where they are and what is left.
- The choice moves to a different page or a different thing. Use SideNav or links.
- You have more than about six views. Group them, or use a Select.

## Props

<!-- props -->

### Parts

`Tabs` is the root. Put `Tab`s directly inside it for a plain tab list, or use the parts below when each tab controls a panel (keep `TabsList` and `TabsPanel` as direct children of `Tabs`).

| Part | Props | Notes |
|---|---|---|
| `TabsList` | `aria-label` and any `div` props | The `role="tablist"` row. Name it when a page has more than one. |
| `Tab` | `value` (required), `count`, `severity`, `disabled` | One tab. `count` shows a badge, `severity` colours it. With `severity` alone it shows a dot. |
| `TabsPanel` | `value` (required) and any `div` props | The content for the tab with the same `value`. Only the selected panel renders its children. |

## Examples

<!-- examples -->

## Accessibility

- Roles are `tablist`, `tab` and `tabpanel`. Each tab has `aria-selected`; a tab with a panel has `aria-controls`, and the panel has `aria-labelledby`.
- Roving tabindex: only the selected tab is in the tab order. While nothing is selected, or the value matches no enabled tab (an unknown URL parameter, a disabled tab), every enabled tab is, so the list can still be reached. ArrowLeft and ArrowRight move to the next or previous tab and select it, wrapping at the ends. Home and End jump to the first and last. Disabled tabs are skipped.
- Tab labels are text, so keep them to one or two words.
- A `severity` is always read out as a word after the label, so colour is never the only signal. Prefer a `count`: the number says how much, the severity says how urgent.
- Name the list with `aria-label` (or `aria-labelledby`) when it is not obvious from the page.

## Common mistakes

Wrong: tabs for the steps of a process. People cannot tell what is done and what is next.

```tsx
<Tabs defaultValue="1">
  <Tab value="1">1. Details</Tab>
  <Tab value="2">2. Review</Tab>
  <Tab value="3">3. Publish</Tab>
</Tabs>
```

Right: tabs for parts of one thing, with short labels.

```tsx
<Tabs defaultValue="overview" aria-label="Service sections">
  <Tab value="overview">Overview</Tab>
  <Tab value="timeline">Timeline</Tab>
</Tabs>
```

Wrong: a coloured dot as the only sign of urgency, on a tab that people may skip past.

```tsx
<Tab value="alerts" className="after:bg-red-500">Alerts</Tab>
```

Right: a count with a severity. The number and the severity name are both in the text.

```tsx
<Tab value="alerts" count={3} severity="critical">Alerts</Tab>
```
