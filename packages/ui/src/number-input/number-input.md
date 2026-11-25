---
name: NumberInput
category: Forms
principle: none
import: "@openvanta/pikore-react/number-input"
status: stable
related: [Field, Input, LimitedNumberInput]
description: Numeric entry with steppers, units and tabular figures. For values with safe ranges, use LimitedNumberInput.
---

## Use when

- The value is a quantity the person types or nudges: replicas, a timeout, a percentage.
- You want a unit shown beside the number, and hard bounds enforced.

## Don't use when

- The value is an ID, phone number or code: those are text, so use Input.
- A value past a usual range should warn, and past a safe range should block: use LimitedNumberInput.
- The person chooses from a few fixed values: use Select or Radio.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- A text input with `role="spinbutton"`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`. When there is a unit, `aria-valuetext` reads it, such as "30 sec".
- Up and Down step. Page Up and Page Down step by ten steps, as does Shift with an arrow. Home and End jump to `min` and `max` when they are set.
- The stepper buttons are skipped by Tab (the keyboard already steps) and are labelled "Increase" and "Decrease". They disable at the bounds.
- Out-of-range numbers are never sent to `onValueChange`. Typing past a bound is clamped when the field loses focus or Enter is pressed. The arrows and steppers step from the number on screen, so after typing `150` with a `max` of `100`, Down lands on `100`.
- Only a point separates decimals. A comma is not accepted, because pasted text such as "1,000" could mean one or a thousand.
- Digits use tabular numerals so a column of values lines up.

## Common mistakes

Wrong: the unit left out, so the number could mean anything.

```tsx
<NumberInput defaultValue={30} />
```

Right: the unit beside the value, and bounds that match what the system accepts.

```tsx
<NumberInput defaultValue={30} unit="sec" min={1} max={300} />
```

Wrong: a number input for something that is not a quantity.

```tsx
<NumberInput aria-label="Phone number" />
```

Right: text for IDs, phone numbers and codes.

```tsx
<Input type="tel" aria-label="Phone number" />
```

Wrong: treating an empty field as zero.

```tsx
<NumberInput value={count} onValueChange={(v) => setCount(v ?? 0)} />
```

Right: keep `null` as "empty" and decide at submit time what that means.

```tsx
<NumberInput value={count} onValueChange={setCount} />
```
