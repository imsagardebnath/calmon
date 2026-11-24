---
name: Switch
category: Forms
principle: none
import: "@calmon/react/switch"
status: stable
related: [Checkbox, Radio, Field]
description: Turns a setting on or off immediately, with no save step.
---

## Use when

- A setting is on or off and takes effect the moment it is flipped: "Group repeat alerts".
- The change is easy to reverse by flipping it back.

## Don't use when

- The choice is part of a form with a Save button: use Checkbox.
- A risky or irreversible action should run: use Button, with ConfirmTarget where it matters.
- The person picks one of several options: use Radio or Select.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- A native `<input type="checkbox">` with `role="switch"`, inside its `<label>`. The checked state is exposed as on or off, and Space toggles it.
- The label names the setting, not the action: "Group repeat alerts", not "Turn on".
- With no visible label, pass `aria-label`.
- A disabled switch looks inactive and cannot be focused. Say why in nearby text.

## Common mistakes

Wrong: a switch inside a form that needs a Save button, so flipping it looks final but is not.

```tsx
<form onSubmit={save}>
  <Switch>Group repeat alerts</Switch>
  <Button type="submit">Save</Button>
</form>
```

Right: a Checkbox when the change waits for Save.

```tsx
<form onSubmit={save}>
  <Checkbox>Group repeat alerts</Checkbox>
  <Button type="submit">Save</Button>
</form>
```

Wrong: a label that describes the action, so the state is ambiguous.

```tsx
<Switch>Turn on alerts</Switch>
```

Right: a label that names the setting.

```tsx
<Switch>Alerts</Switch>
```
