---
name: ProgressBar
category: Feedback
import: "@openvanta/calmon-react/progress-bar"
status: stable
related: [Spinner, Skeleton, Badge]
description: Shows known progress, or a level against capacity with severity.
---

## Use when

- Work has a known length: an upload, a deploy, an import.
- You show a level against capacity, such as disk or memory use. Add `thresholds` and the bar turns caution or critical by itself.
- The length is unknown but the wait is long: omit `value` for an indeterminate bar.

## Don't use when

- The wait is short: use a Spinner.
- You show a score or a trend over time: use a chart or HealthScore.
- The bar colour would be the only sign of a problem. Show the number next to it.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The bar has `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`. An indeterminate bar leaves out `aria-valuenow`.
- Its name comes from `label` (shown above the bar) or, without a label, from `aria-label`. To name it with text that is already on the page, pass `aria-labelledby`. `aria-labelledby`, `aria-describedby` and `aria-valuetext` are set on the progress bar itself; every other prop goes on the wrapper.
- When a threshold is reached, `aria-valuetext` adds the severity ("87%, caution"), so the level is also given in text, not only in colour.
- Show the number next to the bar (`label` shows it by default).

## Common mistakes

Wrong: a bar that relies on colour alone, with no number and no name.

```tsx
<div className="h-1.5 bg-red-500" style={{ width: '97%' }} />
```

Right: a label, the number, and thresholds.

```tsx
<ProgressBar value={97} label="Disk" thresholds={{ caution: 85, critical: 95 }} />
```

Wrong: a fake determinate bar for work of unknown length.

```tsx
<ProgressBar value={50} label="Loading" />
```

Right: indeterminate, with a name.

```tsx
<ProgressBar aria-label="Loading services" />
```
