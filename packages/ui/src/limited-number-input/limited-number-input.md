---
name: LimitedNumberInput
category: Safety
principle: limits
import: "@openvanta/calmon-react/limited-number-input"
status: stable
related: [NumberInput, Field, Textarea, Timeline]
description: Number entry with a soft limit that asks for a reason and a hard limit that blocks.
---

## Use when

- A value has a usual range and a safe range: a traffic shift, a replica count, a rate limit, a dose.
- Most bad values are typos or misjudged defaults, so you want a warning for the first kind and a block for the dangerous kind.
- A person who goes past the usual range should say why, and the reason should be recorded (for example on the entity's Timeline).

## Don't use when

- Any number in a plain range is fine: use NumberInput with `min` and `max`.
- The value is an ID, phone number or code: those are text, so use Input.
- You would clamp what the person typed to the nearest allowed value. Show the limit and let them fix it instead.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Built on NumberInput, so it is a `spinbutton`: Up and Down step, Page Up and Page Down step by ten, and the unit is read ("40 %"). `aria-valuemin` and `aria-valuemax` are the hard limits.
- Past a **soft** limit the field turns caution and a message says so and gives the usual range: "Higher than usual (usual range up to 25%). Add a justification to continue." A required reason field appears under it, with its own label. When the field is `disabled` or `readOnly`, the reason field is too, and it no longer blocks a submit.
- Past a **hard** limit the field turns critical, `aria-invalid="true"` is set, and the message names the limit: "Maximum allowed is 60%." The input also gets a custom validity message, so a native `<form>` refuses to submit and shows it. The reason field has one too while it is empty.
- The message is text with a severity icon, never colour alone. It sits in one `aria-live="polite"` region tied to the input with `aria-describedby`, and its text only changes when the state changes, so typing inside a state is silent.
- The scale under the field (zones, soft ticks, a knob) is decorative and hidden from screen readers. The usual range is in the hint and in the soft message, and the hard limit is in the hard message, so the limits are never only in the scale.
- Inside a `Field`, the Field supplies the label, id, hint and required marker; this component adds its message and reason field below the control.

## Soft and hard limits

| Value | State | What the person sees | `onStateChange` |
|---|---|---|---|
| Inside the soft limits | `ok` | The usual range as a hint | `'ok'` |
| Past a soft limit | `soft` | Caution ring, a message, and a required reason | `'soft'` |
| Past a hard limit | `hard` | Critical ring, the limit, `aria-invalid`, submit blocked | `'hard'` |

`onValueChange` fires for every number typed or stepped, including ones past a hard limit: the value is never changed for you. Use `onStateChange` (or the form's own validation) to decide whether to accept it, and `onJustificationChange` to record the reason.

## Common mistakes

Wrong: clamping the number in `onValueChange`. The person types 75, sees 60, and never learns why.

```tsx
<NumberInput value={pct} onValueChange={(v) => setPct(Math.min(v ?? 0, 60))} unit="%" />
```

Right: keep what they typed, say the maximum, and block the submit.

```tsx
<LimitedNumberInput label="Shift traffic" unit="%" softMax={25} hardMax={60} value={pct} onValueChange={setPct} />
```

Wrong: a soft limit with no record of the reason, so the override is invisible later.

```tsx
<LimitedNumberInput label="Shift traffic" unit="%" softMax={25} hardMax={60} requireJustification={false} />
```

Right: ask for the reason and save it where the team will look.

```tsx
<LimitedNumberInput
  label="Shift traffic"
  unit="%"
  softMax={25}
  hardMax={60}
  onJustificationChange={setReason}
/>
```

Wrong: hiding the usual range, so people discover the limit by hitting it.

```tsx
<LimitedNumberInput label="Shift traffic" unit="%" softMax={25} hardMax={60} hint={false} />
```

Right: leave the default hint ("Usual range up to 25%.") or write a better one.
