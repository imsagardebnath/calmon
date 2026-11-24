---
name: Pagination
category: Navigation
principle: none
import: "@openvanta/calmon-react/pagination"
status: stable
related: [Table, Tabs]
description: Moves through pages of a table or list, with a range summary such as "1–25 of 289".
---

## Use when

- A table or list has too many rows to show at once, and people need to scan or jump to a page.
- You can load a page of rows at a time, with a known total.

## Don't use when

- There are fewer than about 50 rows. Show them all.
- The list is a live feed or has no known end. Use "Load more", or let it scroll.
- The change is a filter or time range. Use Tabs.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders `<nav aria-label="Pagination">` with a list of buttons. Pass `aria-label` to name it when a page has more than one (for example "Alerts pages").
- Previous and next have `aria-label`s ("Previous page", "Next page") and are disabled at the ends. When a keyboard press reaches an end, focus moves to the current page button so it is not lost. Each number is labelled "Page 3" and the current one has `aria-current="page"`.
- The ellipses are hidden from screen readers. Once there are more than seven pages the row is always seven slots wide, so buttons do not jump around as the page changes.
- The range text ("1–25 of 289") is a polite, atomic live region, so a screen reader reads the whole range after the page changes.

## Common mistakes

Wrong: paging a short list, and hiding the total.

```tsx
<Pagination total={32} pageSize={10} />
```

Right: show all rows, or page only when the list is long, and always show the total (the range text does this for you).

```tsx
<Pagination total={289} pageSize={25} />
```

Wrong: keeping the page in the component while the rows are loaded somewhere else, so they drift apart.

```tsx
<Pagination total={rows.length} />
```

Right: control the page and load the rows for it.

```tsx
<Pagination page={page} onPageChange={setPage} total={total} pageSize={25} />
```
