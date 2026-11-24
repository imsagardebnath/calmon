---
name: Search
category: Forms
principle: none
import: "@openvanta/calmon-react/search"
status: stable
related: [Input, CommandPalette]
description: A search field with clear, loading and keyboard shortcut, plus live suggestions grouped by type. For site-wide commands, see CommandPalette.
---

## Use when

- The person looks for something by typing: a service, a person, an incident, a page.
- You have a list to filter in place: use the field alone with `onValueChange`, and `scopes` for chips.
- You want live suggestions, recent searches and a shortcut such as `/`.

## Don't use when

- The person runs commands or jumps anywhere in the app: use CommandPalette.
- The input is a plain value rather than a query: use Input.
- The list is short and fixed: use Select.

## Props

<!-- props -->

### SearchItem

Items for `suggestions` and `recent` are objects. Any extra fields you add are passed back to `onSelect` and can be used by `groupBy`.

| Field | Type | Description |
|---|---|---|
| `label` (required) | `string` | Main text. It is put in the field when the item is chosen, and the matching part is highlighted. |
| `description` | `string` | Second line, such as a status or an owner. |
| `icon` | `ReactNode` | Icon before the text. Decorative. |
| `severity` | `Severity` | Colours the icon. Pair it with a severity icon so colour is never the only signal. |
| `id` | `string` | Key for the option. Defaults to its position and label. |

## Examples

<!-- examples -->

## Accessibility

- The wrapper is `role="search"`, named like the input (from `aria-label`, or the placeholder) so several searches on one page stay distinguishable. The input has no visible label, so it takes `aria-label` from the placeholder: say what can be searched.
- With `suggestions` or `recent`, the input is a WAI-ARIA combobox: `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, with a `listbox` of `option`s and `group`s.
- Keyboard: Up and Down move through the list and wrap, Enter selects the active item, Escape clears the text and then closes the list. The shortcut key focuses the field from anywhere, unless the person is typing in another field.
- The number of results is announced politely as it changes, and "No results" is announced when nothing matches. `aria-busy` is set while results load.
- The clear button is always reachable once there is text. Scope chips are toggle buttons with `aria-pressed`.
- When `onClearRecent` is set, Tab from the empty field reaches the "Clear" button of the recent list, which keeps the list open while it has focus. After clearing, focus returns to the field.
- Search names itself, so do not wrap it in a Field. To use your own visible label, point `aria-labelledby` at it.

## Common mistakes

Wrong: a search that fires on every keystroke.

```tsx
<Search suggestions={(q) => fetchResults(q)} debounce={0} />
```

Right: keep the debounce (150 ms by default) so results settle while the person types.

```tsx
<Search suggestions={(q) => fetchResults(q)} />
```

Wrong: a vague placeholder, which is also the accessible name.

```tsx
<Search placeholder="Type here" />
```

Right: say what can be searched.

```tsx
<Search placeholder="Search services, people, incidents" />
```

Wrong: hiding the clear button or building your own, so keyboard and screen-reader users lose it.

```tsx
<Search className="[&_button]:hidden" />
```

Right: leave it. It shows whenever there is text.

```tsx
<Search />
```

Wrong: using Search to run app-wide commands.

```tsx
<Search suggestions={(q) => commands.filter(...)} />
```

Right: a CommandPalette for commands.

```tsx
<CommandPalette commands={commands} />
```
