---
name: Field
category: Forms
principle: none
import: "@openvanta/calmon-react/field"
status: stable
related: [Input, NumberInput, Textarea, Select, Checkbox, Switch]
description: Wraps any input with a label, hint, warning or error, and wires up the accessibility attributes.
---

## Use when

- A control needs a visible label. Always wrap Input, NumberInput, Textarea and Select in a Field.
- You need helper text, a caution that does not block, or an error that does.
- A field is required: Field adds the marker and `aria-required`.

## Don't use when

- A group of radios or checkboxes needs a name: use RadioGroup or CheckboxGroup, which render a fieldset with a legend.
- The control stands alone with an obvious purpose, such as a Search field: give it an `aria-label` instead.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The label is a real `<label>` with `htmlFor` pointing at the control, so clicking it focuses the control and screen readers announce it.
- The hint, warning and error are joined into the control's `aria-describedby`, so they are read when the control gets focus. An error also sets `aria-invalid="true"`.
- The error is a live region (`role="alert"`) and the warning a polite one (`role="status"`), so a message that appears after the person has left the control, for example when you validate on blur or submit, is still announced. The hint is static text.
- Required fields get `aria-required="true"`. The visible asterisk is hidden from screen readers so it is not read twice.
- Warnings and errors show an icon with its own shape (triangle, octagon) next to the text, so they never depend on colour alone. An error outranks a warning on the control.
- Field gives the control its id, so set `id` on the Field rather than on the control.

### Using the wiring in your own control

Field shares what it computes through `useFieldContext()`, which returns `null` outside a Field, so a custom control works with or without one:

```tsx
import { useFieldContext } from '@openvanta/calmon-react/field'

function MyControl() {
  const field = useFieldContext() // { id, describedBy, invalid, warning, required } | null
  return <input id={field?.id} aria-describedby={field?.describedBy} aria-invalid={field?.invalid || undefined} />
}
```

## Common mistakes

Wrong: a vague error that does not say how to fix the problem.

```tsx
<Field label="Alert email" error="Invalid input">
  <Input type="email" />
</Field>
```

Right: say what is wrong and what to do.

```tsx
<Field label="Alert email" error="Enter a full email address, like oncall@company.com.">
  <Input type="email" />
</Field>
```

Wrong: a label-less control that relies on its placeholder.

```tsx
<Input placeholder="Service name" />
```

Right: a Field with a label.

```tsx
<Field label="Service name">
  <Input placeholder="payments-api" />
</Field>
```

Wrong: the same id on the control and the Field, so the label points at the wrong thing.

```tsx
<Field label="Name" id="a"><Input id="b" /></Field>
```

Right: let Field own the id.

```tsx
<Field label="Name" id="name"><Input /></Field>
```
