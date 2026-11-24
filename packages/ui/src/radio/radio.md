---
name: Radio
category: Forms
principle: none
import: "@openvanta/calmon-react/radio"
status: stable
related: [Checkbox, Select, Switch]
description: Pick exactly one from two to five visible options. Use RadioGroup with Radio.
---

## Use when

- Exactly one option must be chosen, and seeing all of them helps: a deploy strategy, an environment.
- There are two to five options.

## Don't use when

- More than five options: use Select.
- The choice is on or off and takes effect at once: use Switch.
- Several options can be chosen: use Checkbox.

## Props

<!-- props -->

### RadioGroup props

`RadioGroup` is exported from the same entry point. It renders a `<fieldset role="radiogroup">` with a `<legend>`, and gives its radios one shared `name`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | | Visible legend naming the group. Without one, pass `aria-label`. |
| `value` | `string` | | Controlled selected value. |
| `defaultValue` | `string` | | Initially selected value when uncontrolled. Preselect the safest option. |
| `onValueChange` | `(value: string) => void` | | Called with the new value when the selection changes. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout of the options. |
| `name` | `string` | generated | Shared `name` of the radios, for form submission. |
| `invalid` | `boolean` | `false` | Error styling and `aria-invalid` on the group. |
| `disabled` | `boolean` | `false` | Disables every option. |

`Radio` takes a required `value`, its label as `children`, and `disabled`.

## Examples

<!-- examples -->

## Accessibility

- Each option is a native `<input type="radio">` sharing one `name`, so the browser provides the keyboard model: Tab moves into the group, the arrow keys move and select, and Tab leaves it.
- The group is a `fieldset` with `role="radiogroup"` named by its `legend`.
- A disabled option stays visible and is skipped by the arrow keys. Say why it is unavailable in its label.
- `invalid` sets `aria-invalid` on the group. Pair it with text that says what to do.

## Common mistakes

Wrong: nothing selected, so the person can submit without choosing.

```tsx
<RadioGroup label="Deploy strategy">...</RadioGroup>
```

Right: preselect the safest option.

```tsx
<RadioGroup label="Deploy strategy" defaultValue="rolling">...</RadioGroup>
```

Wrong: radios for a long list.

```tsx
<RadioGroup label="Region">{twentyRegions}</RadioGroup>
```

Right: a Select for more than five options.

```tsx
<Select options={twentyRegions} />
```

Wrong: radios with no group name.

```tsx
<Radio value="a">A</Radio>
<Radio value="b">B</Radio>
```

Right: always inside a RadioGroup with a label.

```tsx
<RadioGroup label="Mode">
  <Radio value="a">A</Radio>
  <Radio value="b">B</Radio>
</RadioGroup>
```
