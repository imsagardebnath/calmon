# Calmon

> React + Tailwind CSS v4 components for operational software: monitoring, incident response, admin consoles. Built on safety principles: fewer alarms, clear limits, a short pause before anything risky.

## Install

```bash
npm install @openvanta/calmon-react
```

Peer dependencies: `react >= 19`, `react-dom >= 19`, `tailwindcss >= 4.1`.

## Set up CSS

In your app's main CSS file, import Calmon once, after Tailwind. The tokens arrive as CSS variables and the components' classes are found automatically.

```css
@import "tailwindcss";
@import "@openvanta/calmon-react/styles.css";
```

Optional: load the fonts (Instrument Sans for the interface, Azeret Mono for code and numerals) from Google Fonts. Without them the system fonts are used.

## Add the provider

```tsx
import { CalmonProvider, Button } from '@openvanta/calmon-react'

export default function App() {
  return (
    <CalmonProvider theme="system" density="comfortable">
      <Button variant="primary">Save changes</Button>
    </CalmonProvider>
  )
}
```

`CalmonProvider` sets the theme (class `dark` on `<html>`) and density (`data-density` on `<html>`). It is optional: without it you get the light theme and comfortable density. Read or change them with `useCalmon()`. Density can also be set on any container: `<div data-density="compact">`.

## Import

Import from the package root, or from one entry per component:

```tsx
import { Button, Badge } from '@openvanta/calmon-react'
import { Button } from '@openvanta/calmon-react/button'
import { CheckIcon } from '@openvanta/calmon-react/icons'
```

## Rules for writing UI with Calmon

1. **Severity is the only status vocabulary.** Five levels, least to most urgent: `normal`, `info`, `advisory`, `caution`, `critical`. Components that show status take a `severity` prop. `intent` is an alias for familiar names: `primary`, `secondary`, `success` (normal), `warning` (caution), `danger` (critical). Never invent `color`, `tone` or `status` props, and never hard-code `red-500` or `amber-*` for status: use tokens such as `bg-critical`, `text-caution-fg`, `bg-advisory-soft`.
2. **Colour is never the only signal.** Every severity has its own icon shape and a text label. Pair colour with them.
3. **Same prop names everywhere:** `variant`, `size` (`sm | md | lg`), `severity`, `intent`, `disabled`, `className`. Controlled state is `value / defaultValue / onValueChange`, `open / defaultOpen / onOpenChange`, `checked / defaultChecked / onCheckedChange`.
4. **`className` always wins.** It is merged with `tailwind-merge`, so a later class overrides a default one.
5. **One primary button per view.** Links that look like buttons use `asChild`: `<Button asChild><a href="…">…</a></Button>`.
6. **Destructive actions** use `severity="critical"`, a label that names the target ("Delete service “api-gateway”", never "OK"), and `ConfirmTarget`.
7. **Risky changes** use `PausePoint` (3 to 5 checks). **Inputs with a safe range** use `LimitedNumberInput` (soft limit: ask why; hard limit: block).
8. **Overviews sort worst first.** `StationGrid` does this by default.
9. **Before you use a component, read its doc** (`components/<name>.md`). Do not guess props: the Props table lists every prop that exists.

## Token reference

Each colour comes in five forms: `<name>` (solid fill), `<name>-on` (text on the fill), `<name>-soft` (tinted background), `<name>-fg` (text on surfaces), `<name>-border`.

| Group | Names |
|---|---|
| Surfaces | `surface`, `surface-raised`, `surface-sunken`, `border`, `border-strong`, `fg`, `fg-muted`, `fg-subtle`, `ring` |
| Accent | `accent` (+ `-on`, `-soft`, `-fg`, `-border`) |
| Severity | `normal`, `info`, `advisory`, `caution`, `critical` (each with the five forms) |
| Radius | `rounded-control` (8px), `rounded-card` (14px), `rounded-pill` |
| Shadow | `shadow-low`, `shadow-mid`, `shadow-high` |
| Numerals | `text-numeral-sm`, `-md`, `-lg`, `-xl` with the `num` class |
| Density | `data-density="comfortable" | "compact" | "station"` |

To change the brand colour, override the `--accent*` variables in `:root` and `.dark`.

## License

Calmon is open source under the MIT license. You may use, copy, modify and distribute it, including in commercial products, as long as you keep the copyright notice and the license text in copies of the source code. No attribution is needed in your application's interface. Full text: the LICENSE file in the repository and the License page of the docs.
