# Contributing to Calmon

Thanks for helping. Calmon (`@calmon/react`) is a React 19 + Tailwind CSS v4 component library with a "Clinical monitor"
look. The visual design lives in `design/` and is the reference for styles and props.

## Setup

```bash
npm install
npm run dev      # docs site with live examples
npm run ci       # typecheck, tests (with accessibility checks), build, size budgets
```

Run `npm run ci` before you open a pull request. Pull requests are released under the MIT license of this repository.

## Layout

| Path | What it holds |
|---|---|
| `packages/ui/src/styles.css` | Design tokens (light and dark), the tone system, density, Tailwind theme, keyframes |
| `packages/ui/src/lib/` | `cn()`, `Slot`, tone helpers, `useControllable` |
| `packages/ui/src/icons/` | Icon components and `SeverityIcon` |
| `packages/ui/src/provider/` | `CalmonProvider` and `useCalmon` (theme and density) |
| `packages/ui/src/<name>/` | One folder per component |
| `apps/docs/` | The documentation website |
| `design/` | The design reference and the extracted component specification |
| `scripts/` | Export generation, docs generation, icon generation, size budgets |

`package.json` exports and `src/index.ts` are generated from the component folders. Do not edit them by hand.

## Adding or changing a component

Each component folder has five files:

- `<name>.tsx`: the component. Starts with `'use client'`. Named exports only.
- `index.ts`: re-exports the component, its prop types and variants.
- `<name>.examples.tsx`: three to seven canonical usages. Each is an exported function with a one-line JSDoc comment
  and the closing brace at column 0. See `button/button.examples.tsx`.
- `<name>.test.tsx`: behaviour tests plus `testExamplesAxe(examples)`.
- `<name>.md`: documentation. Keep the `<!-- props -->` and `<!-- examples -->` markers.

`button/` is the reference component.

## Rules

- **Colour:** use `severity` (`normal`, `info`, `advisory`, `caution`, `critical`) and its alias `intent`
  (`primary`, `secondary`, `success`, `warning`, `danger`). Never raw palette colours or hex. Set `data-tone` on the
  component root and style with the tone classes (`bg-tone`, `text-tone-fg`, ...).
- **Colour is never the only signal:** every severity also has an icon shape and a text label.
- **Props:** shared names are `variant`, `size` (`sm`, `md`, `lg`), `severity`, `intent`, `value / defaultValue /
  onValueChange`, `open / defaultOpen / onOpenChange`, `checked / defaultChecked / onCheckedChange`. Every prop has a
  JSDoc comment: it becomes the props table in the docs.
- **Styling:** Tailwind classes and tokens only, written as full class strings (never built by concatenation).
  `className` always merges through `cn()`. Follow `--btn-*` and `--control-*` for density.
- **Accessibility:** native elements first, visible focus, full keyboard support, and passing `testExamplesAxe`.
- **Size:** aim for under 3 KB gzip per component (`npm run check:size`).
- **Imports inside the package** are relative and include the extension: `'../lib/cn.ts'`.
- No new runtime dependencies without discussion.

## Pull requests

Describe what you changed and anything you could not match against the design. Keep pull requests focused on one component
or one fix.
