---
name: Sparkline
category: Data display
principle: none
import: "@openvanta/pikore-react/sparkline"
status: stable
related: [VitalTile, Chart]
description: A word-sized trend line, with an optional dashed threshold, a soft area fill and a dot on the latest value.
---

## Use when

- You show the recent shape of one value next to the value itself: latency on a tile, replicas in a table row.
- You want to show that a value crossed a limit, without drawing axes.

## Don't use when

- People need to read exact values, compare series or see time: use Chart, which has axes.
- There are fewer than three points: show the numbers.
- The trend is the only place the current value appears: always print the number beside it.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The sparkline is an image (`role="img"`) with a generated label: "Trend rising, 30 to 58. Min 30, max 58, latest 58, above threshold 45." Pass `aria-label` when you can say more, such as the metric name and the time range.
- Colour is never the only signal. The dashed threshold line shows where the limit is, and the label says whether the latest value is above it. Pair the sparkline with the number and a severity label.
- It does not animate, so there is nothing to pause or reduce.
- It is not focusable. If the trend opens details, put the sparkline inside the button or link that does.

## Common mistakes

Wrong: a sparkline alone, so the current value is missing.

```tsx
<Sparkline data={series} />
```

Right: the number first, the trend beside it.

```tsx
<div className="flex items-center gap-3">
  <span className="num">58 ms</span>
  <div className="w-32"><Sparkline data={series} /></div>
</div>
```

Wrong: colour with no reference, so nobody knows what "red" means.

```tsx
<Sparkline data={series} severity="critical" />
```

Right: a threshold shows the limit, and only the part above it changes colour.

```tsx
<Sparkline data={series} threshold={45} severity="critical" />
```

Wrong: axes and labels added around it with markup.

```tsx
<Sparkline data={series} /> <span>0</span> <span>60</span>
```

Right: use Chart when the reader needs a scale.

```tsx
<Chart data={rows} x="time" series={[{ key: 'p95', label: 'p95 latency' }]} />
```
