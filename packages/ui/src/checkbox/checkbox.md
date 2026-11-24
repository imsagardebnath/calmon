---
name: Checkbox
category: Forms
principle: none
import: "@calmon/react/checkbox"
status: stable
related: [Switch, Radio, Field]
description: Independent yes-or-no choices, and multi-select lists. Supports an indeterminate state for "some selected".
---

## Use when

- The choice is independent and takes effect when the form is saved: "Send me a weekly summary".
- The person selects several items from a list: wrap them in CheckboxGroup.
- A parent box controls a set of children: use `checked="indeterminate"` when only some are selected.

## Don't use when

- The choice takes effect at once, with no save step: use Switch.
- Exactly one option must be picked: use Radio.
- A single action should run: use Button.

## Props

<!-- props -->

### CheckboxGroup props

`CheckboxGroup` is exported from the same entry point and renders a `<fieldset>` with a `<legend>`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` (required) | `string` | | Visible legend naming the group, such as "Notify me about". |
| `value` | `string[]` | | Controlled list of the checked boxes' `value`s. |
| `defaultValue` | `string[]` | `[]` | Initial checked values when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | | Called with the full list of checked values on every change. |
| `disabled` | `boolean` | `false` | Disables every box in the group. |

Each `Checkbox` inside a group needs a `value`. Outside a group, `value` is the native form value.

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<input type="checkbox">` inside its `<label>`, so clicking the text toggles it and Space works with no extra code.
- Wrap related checkboxes in CheckboxGroup: it renders a `fieldset` with a `legend`, which screen readers announce with each box.
- `checked="indeterminate"` sets the native `indeterminate` property, which assistive technology announces as "mixed". The next click checks the box.
- With no visible label, pass `aria-label`, such as "Select row 3".
- An error shows an icon and text through Field, never colour alone.

## Common mistakes

Wrong: a negative label, which makes "unchecked" mean "yes".

```tsx
<Checkbox>Don't send alerts</Checkbox>
```

Right: phrase labels positively.

```tsx
<Checkbox>Send alerts</Checkbox>
```

Wrong: a checkbox that triggers something as soon as it is clicked.

```tsx
<Checkbox onCheckedChange={() => deploy()}>Deploy now</Checkbox>
```

Right: a Switch for a setting that takes effect at once, or a Button for an action.

```tsx
<Switch onCheckedChange={setMuted}>Mute alerts</Switch>
```

Wrong: loose checkboxes with no group name.

```tsx
<Checkbox>Critical</Checkbox>
<Checkbox>Caution</Checkbox>
```

Right: a CheckboxGroup, so the group has a name.

```tsx
<CheckboxGroup label="Notify me about">
  <Checkbox value="critical">Critical</Checkbox>
  <Checkbox value="caution">Caution</Checkbox>
</CheckboxGroup>
```
