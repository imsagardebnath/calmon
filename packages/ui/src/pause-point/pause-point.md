---
name: PausePoint
category: Safety
principle: pause-points
import: "@calmon/react/pause-point"
status: stable
related: [ConfirmTarget, Checkbox, Dialog, Button]
description: A short checklist before a risky action. The action unlocks when every item is checked.
---

## Use when

- A risky change is about to go out and the failures are things everyone knew but nobody checked: a deploy, a config publish, a dose, a failover.
- Each check is something a person can verify in seconds, phrased as a fact: "Rollback plan is linked".
- The system already knows some of the answers. Pre-fill them with `verified` and show the evidence, so people confirm instead of re-doing the work.

## Don't use when

- The action destroys a named record: use ConfirmTarget, where the person types the name.
- The action is reversible. Do it and offer Undo.
- There are more than five checks. A long list gets ticked without being read (it warns in development past seven). Split it, or cut it down to what actually fails.
- The checks are a form to fill in: use Checkbox, CheckboxGroup and a normal submit.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- A native `<fieldset>` with a `<legend>`, so screen readers announce the group by its title. `description` is the group's description.
- Every item is a real checkbox: Tab moves between them, Space toggles. The evidence is part of the checkbox's label, so it is read out with the item.
- "2 of 4 checked" is a polite live region (`role="status"`), announced as the count changes.
- The action button is disabled until every item is checked, so it leaves the tab order. The count explains why.
- The title is the heading of the group. Say what is about to happen: "Before you publish config v43".
- An environment badge (`env="prod"`) has text, so the environment is never shown by colour alone.

## Writing good items

- Three to five items, phrased as facts: "Diff reviewed by a second person", not "Did you review the diff?".
- Evidence says who and when: "Approved by A. Kaur, 12 min ago". An item without evidence is a question the person answers from memory.
- The action button names the action ("Publish config"), and the confirmation that follows repeats it ("Published").
- Items the system verified start ticked (`verified`), with their evidence. The person can still untick them.

## Common mistakes

Wrong: a long list of vague questions. By the sixth, every box is ticked on autopilot.

```tsx
<PausePoint
  action="Deploy"
  items={['Are you sure?', 'Did you test?', 'Is it safe?', 'Did you tell anyone?', 'Is it the right branch?', 'Any risks?', 'Ready?', 'Really?']}
/>
```

Right: three to five specific facts, with evidence.

```tsx
<PausePoint
  title="Before you deploy checkout-web"
  action="Deploy"
  items={[
    { label: 'Tests passed on this commit', evidence: 'CI run #4812, 4 min ago', verified: true },
    { label: 'Rollback plan is linked', evidence: 'v2.31.0 is one click away' },
    'No incident is open in this region',
  ]}
/>
```

Wrong: a vague action label.

```tsx
<PausePoint action="OK" items={['Diff reviewed']} />
```

Right: the label names the action.

```tsx
<PausePoint action="Publish config" items={['Diff reviewed']} />
```

Wrong: building your own checklist with a disabled button and no live count.

```tsx
<div>
  <input type="checkbox" /> Diff reviewed
  <button disabled>Publish</button>
</div>
```

Right: use `PausePoint`, which has the group, the count and the lock built in.
