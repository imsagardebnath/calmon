---
name: Input
category: Forms
principle: none
import: "@openvanta/calmon-react/input"
status: stable
related: [Field, NumberInput, Textarea, Search, Select]
description: Single-line text entry. Wrap it in Field for a label, hint and error.
---

## Use when

- The person types a short piece of free text: a name, an email, a URL, a slug.
- You need a label, a hint or an error: wrap the Input in Field.

## Don't use when

- The value is a number with a unit, range or steppers: use NumberInput.
- The text runs past one line, such as notes or reasons: use Textarea.
- The person picks from known choices: use Select, Radio or Checkbox.
- The field searches or filters: use Search.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<input>`. Pair it with a visible label: put it in a Field, or pass `aria-label` when the purpose is obvious from context.
- Placeholders disappear when typing and are not labels. Use them for an example value only.
- Inside a Field, the error and hint are linked with `aria-describedby`, and an error sets `aria-invalid`. Outside a Field, pass `invalid` and your own `aria-describedby`.
- An error or warning is never colour alone: Field adds an icon with a distinct shape and the message text.
- Keyboard focus shows a 4px soft ring in the ring colour. A focused input with an error or warning keeps its critical or caution border and shows a stronger 4px ring in that colour, so focus is visible in every state. A disabled input is not focusable.

## Common mistakes

Wrong: a placeholder as the only label.

```tsx
<Input placeholder="Service name" />
```

Right: a Field with a visible label, and the placeholder as an example.

```tsx
<Field label="Service name">
  <Input placeholder="payments-api" />
</Field>
```

Wrong: red styling by hand, which says nothing to a screen reader.

```tsx
<Input className="border-red-500" />
```

Right: an error on the Field, which sets the colour, the icon, the message and `aria-invalid`.

```tsx
<Field label="Alert email" error="Enter a full email address, like oncall@company.com.">
  <Input type="email" />
</Field>
```

Wrong: validating on every keystroke, so the error shows before the person has finished typing.

```tsx
<Input onChange={(e) => setError(validate(e.target.value))} />
```

Right: validate on blur or submit, and show the expected format in a hint before anyone gets it wrong.

```tsx
<Field label="Alert email" hint="For example oncall@company.com." error={error}>
  <Input type="email" onBlur={(e) => setError(validate(e.target.value))} />
</Field>
```
