---
name: Button
category: Actions
principle: positive-identification
import: "@openvanta/calmon-react/button"
status: stable
related: [IconButton, ConfirmTarget]
description: Starts an action. Use one primary button per view, and let severity say how serious the action is.
---

## Use when

- The user starts an action: save, publish, open a dialog, delete.
- You need a link that looks like a button: use `asChild` with an `<a>` or a router link.

## Don't use when

- The action only moves to another page and should read as text: use a plain link.
- You need an on/off state: use a Switch or Checkbox.
- The button shows only an icon: use IconButton, which requires an accessible label.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<button>`, so Enter and Space work with no extra code.
- Defaults to `type="button"`. Inside a form, pass `type="submit"` explicitly.
- `loading` sets `aria-busy="true"` and blocks clicks. The button stays in the tab order (it is `aria-disabled`, not natively disabled), so a focused button keeps its focus when loading starts and ends. Keep a meaningful label.
- `disabled` uses the native attribute, so the button leaves the tab order. With `asChild`, `disabled` sets `aria-disabled="true"`, removes the link from the tab order (`tabindex="-1"`) and blocks its click.
- Icons in `iconStart` and `iconEnd` are decorative and hidden from screen readers.
- Severity colour is never the only signal: the label should say what the action does and to what.

## Common mistakes

Wrong: a button inside a link (invalid nested interactive content).

```tsx
<a href="/docs"><Button>Docs</Button></a>
```

Right:

```tsx
<Button asChild><a href="/docs">Docs</a></Button>
```

Wrong: colour as the only sign of danger, with a vague label and raw colours.

```tsx
<Button className="bg-red-600">OK</Button>
```

Right: a severity and a label that names the target. Wrap risky actions in ConfirmTarget.

```tsx
<Button variant="primary" severity="critical">Delete service “api-gateway”</Button>
```

Wrong: more than one primary button in a view, so nothing stands out.

```tsx
<Button variant="primary">Save</Button>
<Button variant="primary">Export</Button>
```

Right: one primary, the rest secondary or ghost.

```tsx
<Button variant="primary">Save</Button>
<Button>Export</Button>
```
