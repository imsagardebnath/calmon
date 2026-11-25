---
name: Select
category: Forms
principle: none
import: "@openvanta/pikore-react/select"
status: stable
related: [Field, Radio, Switch]
description: Choose one option from a short list. For long lists, use a searchable combobox.
---

## Use when

- The person picks one value from a known list of about three to fifteen options: a region, an environment, a time window.
- Space is tight and a group of radios would take too much room.

## Don't use when

- There are two options: use Radio or Switch.
- There are two to five options and the choice matters: Radio shows them all at once.
- The list is long and needs typing to find an item: use a searchable combobox.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Renders a native `<select>`, so keyboard and screen-reader support is the platform's. Space, Enter and the arrow keys open and move through the options; typing jumps to a match.
- Pair it with a visible label: put it in a Field, or pass `aria-label`.
- The chevron is decorative and hidden from screen readers.
- A placeholder is a hidden, disabled first option. It names the empty state without being a choice.

## Common mistakes

Wrong: an unordered list, so people hunt for the common choice.

```tsx
<Select options={[eu, ap, us]} />
```

Right: order by frequency of use or alphabetically.

```tsx
<Select options={[us, eu, ap]} />
```

Wrong: a disabled select with no explanation.

```tsx
<Select options={regions} disabled />
```

Right: say why in the hint.

```tsx
<Field label="Region" hint="Locked while a deploy runs.">
  <Select options={regions} disabled />
</Field>
```

Wrong: a Select for two options.

```tsx
<Select options={[{ label: 'On', value: 'on' }, { label: 'Off', value: 'off' }]} />
```

Right: a Switch for an on-off setting.

```tsx
<Switch>Group repeat alerts</Switch>
```
