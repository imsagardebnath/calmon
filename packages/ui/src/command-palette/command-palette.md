---
name: CommandPalette
category: Navigation
principle: none
import: "@openvanta/pikore-react/command-palette"
status: stable
related: [Dialog, Search, Kbd, SideNav]
description: Search and run commands from anywhere with Ctrl K. A fuzzy search over grouped commands, driven entirely from the keyboard.
---

## Use when

- The app has many places and actions, and experienced users want to reach them without the mouse.
- You want one fast way to jump to a page, switch a setting or run a common action.

## Don't use when

- You only search one list or table. Use Search or a filter field on that list.
- The command is destructive and runs at once. Choosing it must open a confirm step that names the target (see ConfirmTarget).
- It is the only way to reach something. Every command should also exist in normal navigation.

## Props

<!-- props -->

### Types

```ts
type CommandItem = {
  id: string              // unique within the palette
  label: string           // shown, searched, and highlighted
  description?: string    // second line, also searched
  icon?: ReactNode        // decorative tile before the label
  shortcut?: string       // display only, keys split on "+", for example "G+D"
  keywords?: string[]     // extra words that find the command, not shown
}

type CommandGroup = { label: string; items: CommandItem[] }
```

## Examples

<!-- examples -->

## Accessibility

- Built on a native `<dialog>` opened with `showModal()`: the page behind is inert, focus stays inside, and Escape closes it. Focus moves to the search box on open and returns to where it was on close, unless the chosen command moved it somewhere else.
- The search box is `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant`. The results are a `role="listbox"` of `role="option"`s in `role="group"`s named by their headings, and the active option has `aria-selected="true"`. Focus never leaves the search box.
- ArrowDown and ArrowUp move through the results and wrap around. Home and End stay with the search box and move the text caret. Enter runs the active command, and clicking runs any command. Escape, or a click on the backdrop, closes. Neither Escape nor Enter acts while an input method is composing text, and a drag that starts in the search box and ends on the backdrop does not close it.
- With no matches there is no listbox: a status message says "No results for …" and the box reports `aria-expanded="false"`.
- The shortcut works from anywhere on the page, including inside text fields. Turn it off with `shortcut=""` if it clashes with your app.
- Matches are highlighted with `<mark>`. Highlight is a hint on top of the text, never the only signal.

## Common mistakes

Wrong: a destructive command that runs the moment it is chosen.

```tsx
<CommandPalette groups={groups} onSelect={(item) => item.id === 'delete' && deleteService()} />
```

Right: the palette only picks. Open a confirm step that names the target, then act.

```tsx
<CommandPalette groups={groups} onSelect={(item) => item.id === 'delete' && setConfirming('api-gateway')} />
```

Wrong: an empty palette that shows nothing until people type, so they have to guess what is in it.

```tsx
<CommandPalette groups={[]} onSelect={run} />
```

Right: pass the groups people use most as the starting list, and let typing narrow them. Group them under clear headings such as "Go to" and "Actions".

```tsx
<CommandPalette groups={[{ label: 'Recent', items: recent }, { label: 'Go to', items: pages }]} onSelect={run} />
```

Wrong: controlling `open` without handling `onOpenChange`, so Escape, the shortcut and a chosen command cannot close it.

```tsx
<CommandPalette open={open} groups={groups} onSelect={run} />
```

Right: pass both.

```tsx
<CommandPalette open={open} onOpenChange={setOpen} groups={groups} onSelect={run} />
```
