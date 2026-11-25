---
name: ConfirmTarget
category: Safety
principle: confirm-target
import: "@openvanta/pikore-react/confirm-target"
status: stable
related: [Dialog, Button, PausePoint, Banner]
description: Type the exact name to delete, with the environment shown beside it.
---

## Use when

- The action cannot be undone: deleting a database, revoking a key, overwriting a config.
- Two things look alike and a wrong pick would hurt: prod and staging, `orders-eu` and `orders-us`.
- You want the person to read the target before they act. Typing the name breaks the autopilot of clicking Confirm.

## Don't use when

- The action is reversible. Do it and offer Undo in a Toast.
- The risk is a checklist, not a name: use PausePoint.
- The action has no named target ("Clear all filters"): use a plain Dialog.
- You only need a yes or no question: use Dialog.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Built on Dialog, so it is a native modal `<dialog>`: focus moves into it and is trapped, the page behind is inert, and focus returns to the trigger when it closes. The title names it and `description` describes it.
- The title includes the action, the name and the environment ("Delete database “orders-prod-eu”? PROD"), so the target is read first.
- The field is labelled "Type orders-prod-eu to confirm". The match is exact and **case-sensitive**. Paste is allowed.
- The confirm button stays disabled until the name matches. Enter in the field confirms only when it matches.
- Messages ("Keep typing…", "Doesn’t match orders-prod-eu.", "Name matches.") are text in a polite live region tied to the field. A mismatch also sets `aria-invalid`. The match and mismatch states have their own icons, so colour is never the only signal.
- Escape and Cancel close it. A click on the backdrop does not, so a stray click cannot throw away a half-typed name. There is no header close button: Cancel is the way out.
- The confirm button is critical and its label names the action. Opening the dialog puts focus in the field (or on Cancel when `requireTyping` is off), never on the destructive button.

## Environments

`EnvironmentBadge` is exported from the same entry. It shows `PROD` (solid critical), `STAGING` (solid advisory) or `DEV` (quiet info) in capitals, and the text is the signal. ConfirmTarget shows it in the header and again beside the name, so nobody deletes prod while thinking they are in staging. Use it on its own beside any record name that people are about to change.

```tsx
<EnvironmentBadge env="prod" />
```

## Common mistakes

Wrong: a Dialog with OK and Cancel for a delete. Clicking OK is automatic, and nothing says which record or where.

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Are you sure?" footer={<Button onClick={del}>OK</Button>} />
```

Right: name the target and the environment, and make the person type it.

```tsx
<ConfirmTarget name="orders-prod-eu" env="prod" action="Delete database" onConfirm={del}>
  <Button severity="critical">Delete database</Button>
</ConfirmTarget>
```

Wrong: a case-insensitive or "contains" match, or pre-filling the name. The point is to read it.

```tsx
<Input defaultValue={db.name} />
```

Right: leave the field empty. The exact, case-sensitive match is built in.

Wrong: leaving out `consequences`, so the dialog does not say what breaks.

```tsx
<ConfirmTarget name="orders-prod-eu" env="prod" />
```

Right: say what is removed and what stops working.

```tsx
<ConfirmTarget
  name="orders-prod-eu"
  env="prod"
  consequences={['All tables and backups are removed.', 'Services that read from it will fail.']}
/>
```

Wrong: using it for reversible actions. People learn to type through it, and the real one is lost in the noise.

Right: save it for what cannot be undone, and give everything else an Undo.
