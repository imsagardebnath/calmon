---
name: Table
category: Data display
principle: alarm-fatigue
import: "@openvanta/calmon-react/table"
status: stable
related: [Pagination, Checkbox, Badge, IconButton, EmptyState]
description: Rows of records with sorting, selection and bulk actions. Rows are sorted worst first by default, and every severity is shown with a bar, an icon and a word.
---

## Use when

- People scan, compare, sort or act on many records of the same kind: services, alerts, hosts, keys.
- Rows carry a severity and the worst should be seen first.
- People select several rows to act on them together (acknowledge, assign, delete).

## Don't use when

- You show one record: use a Card, or a detail page.
- You show a handful of key figures: use VitalTile or StationTile.
- You only need layout: a table is for data, not for page layout.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a real `<table>` with `<th scope="col">` headers. The column marked `rowHeader` becomes `<th scope="row">`, so a screen reader announces the row's name with each cell.
- Give the table a name with `aria-label` or `aria-labelledby`. It goes on the `<table>`.
- Sortable headers hold a `<button>`, so Enter and Space sort. The sorted header has `aria-sort`; the others have none.
- Selection uses native checkboxes: each is named "Select <row>", and select-all shows the mixed (indeterminate) state. The bulk bar is a labelled region. The "N selected" count (and "Loading") is announced through one live region that is always on the page, so the change is spoken. After "Clear selection", focus moves to the select-all checkbox, because the bar goes away. While rows are loading or failed to load, select-all is disabled and the bar is hidden.
- A row's severity shows as a left bar, an icon and a word in the Status cell. Colour is never the only signal. Normal rows get the label but no bar, so the severe rows stand out.
- Numeric columns are right-aligned in tabular figures, so digits line up.
- While loading, the table has `aria-busy="true"` and shows skeleton rows. An error message is announced with `role="alert"`.
- The header is sticky. Give the table a height limit with `className` (for example `max-h-96`) and the rows scroll under the header.
- A wide table scrolls sideways. The scroll area becomes a tab stop only when it overflows, so keyboard users can scroll it.

## Common mistakes

Wrong: sorting overviews by name, so a critical row can sit below the fold.

```tsx
<Table data={services} defaultSort={{ key: 'name', dir: 'asc' }} columns={columns} />
```

Right: leave the default. Rows with a `severity` are sorted worst first.

```tsx
<Table data={services} columns={columns} />
```

Wrong: showing severity with colour only, in a cell you render yourself.

```tsx
{ key: 'status', header: 'Status', accessor: (s) => <span className="text-red-600">●</span> }
```

Right: put `severity` on the row. The table adds a Status column with an icon and a word, and the left bar.

```tsx
const services = [{ id: 'payments-api', name: 'payments-api', severity: 'critical' }]
```

Wrong: truncating the column that identifies the row.

```tsx
{ key: 'name', header: 'Service', accessor: (s) => <span className="block w-20 truncate">{s.name}</span> }
```

Right: mark it `rowHeader` and let it take the room it needs.

```tsx
{ key: 'name', header: 'Service', rowHeader: true }
```

Wrong: a row menu button with no name that says which row it belongs to.

```tsx
accessor: () => <IconButton label="More" icon={<MoreIcon />} />
```

Right: name the row in the label.

```tsx
accessor: (s) => <IconButton label={`Actions for ${s.name}`} icon={<MoreIcon />} />
```
