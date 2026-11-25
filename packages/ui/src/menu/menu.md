---
name: Menu
category: Actions
principle: none
import: "@openvanta/pikore-react/menu"
status: stable
related: [IconButton, Button, Popover, Dialog]
description: A list of actions that opens from a button. Destructive items sit last, after a divider.
---

## Use when

- A row, card or toolbar has several secondary actions and not enough room to show them as buttons.
- You group related commands behind one button, for example Export (CSV, JSON).

## Don't use when

- The only way to do a common task is inside a menu: show that action as a button.
- You need to show information or a form: use a Popover.
- You are choosing a value for a form field: use a Select.

## Props

<!-- props -->

### MenuItem

`MenuItem` is a native button with `role="menuitem"`. It takes the usual button props such as `onClick`, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | | Icon before the label. Decorative: hidden from screen readers. |
| `shortcut` | `string` | | Keyboard shortcut shown on the right as a hint. It does not register the shortcut. |
| `intent` | `"danger"` | | Marks a destructive item (critical colour). Put it last, after a `MenuSeparator`. |
| `disabled` | `boolean` | `false` | Greys the item out. It stays focusable (`aria-disabled`) and cannot be picked. |

`MenuSeparator` draws a divider between groups.

## Examples

<!-- examples -->

## Accessibility

- The trigger gets `aria-haspopup="menu"`, `aria-expanded` and, while open, `aria-controls`. Its own props and handlers are kept. The menu is named by the trigger (or by `aria-label` or `aria-labelledby` if you pass one), so give an icon-only trigger an accessible label (`IconButton` requires one).
- `role="menu"` with `role="menuitem"` items and `role="separator"` dividers.
- On the trigger, Enter, Space and Arrow Down open the menu on the first item. Arrow Up opens it on the last.
- In the menu: Arrow Up and Down move (and wrap), Home and End jump to the ends, typing letters jumps to the item that starts with them, Enter or Space picks, Escape closes and returns focus to the trigger, Tab closes it and moves on from the trigger.
- Pointing at an item focuses it, so there is only ever one highlighted item.
- Disabled items stay in the arrow-key order with `aria-disabled` so people can find them.
- Picking an item runs its `onClick` and closes the menu. If the item opens a Dialog, focus goes back to the menu button when the dialog closes.
- It renders into `<body>` (or into the enclosing `<dialog>`), is never clipped, and flips and shifts to stay on screen.

## Common mistakes

Wrong: a destructive item in the middle with a vague label.

```tsx
<Menu trigger={<IconButton label="Actions" icon={<MoreIcon />} />}>
  <MenuItem intent="danger">Delete</MenuItem>
  <MenuItem>Copy ID</MenuItem>
</Menu>
```

Right: destructive last, after a separator, and an ellipsis when it asks for confirmation.

```tsx
<Menu trigger={<IconButton label="Actions" icon={<MoreIcon />} />}>
  <MenuItem>Copy ID</MenuItem>
  <MenuSeparator />
  <MenuItem intent="danger">Delete service…</MenuItem>
</Menu>
```

Wrong: an icon-only trigger without a name.

```tsx
<Menu trigger={<button><MoreIcon /></button>}>…</Menu>
```

Right: `IconButton` with a `label`.

```tsx
<Menu trigger={<IconButton label="Actions" icon={<MoreIcon />} />}>…</Menu>
```
