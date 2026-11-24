---
name: Chart
category: Data display
principle: limits
import: "@openvanta/calmon-react/chart"
status: stable
related: [Sparkline, VitalTile, Table]
description: Line, area and bar charts with a threshold band, a hover and keyboard readout, and a legend. A generated summary and a hidden data table make it readable without sight.
---

## Use when

- People need to see how values change over time, or compare categories, with the axes in view.
- The data is judged against a limit: draw it as a threshold, so the chart shows how close the line is.
- A readout of exact values matters: hover, touch or arrow keys show every series at one point.

## Don't use when

- You show a tiny trend inside a tile or a table cell: use a Sparkline.
- One current value is the point: use VitalTile, and let its sparkline give context.
- You need pie charts, scatter plots or zooming: this chart covers the common operational cases only.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The chart is an image (`role="img"`) whose label is a generated summary: the chart type, the number of points and the range of x, the latest, lowest and highest value of each series, and how many readings are beyond the threshold. Pass `label` to start the summary with what the chart shows.
- Every chart has a visually hidden data table with all the values, so the data is there for screen readers and for search.
- The chart takes focus. Left and right arrow keys move the readout one point, Home and End jump to the first and last point, and Escape clears it. The readout is announced as it changes.
- The readout (a crosshair, a dot per series and a tooltip with every series' value) also follows the mouse and touch.
- The threshold is a dashed line and a band, named with a text label. Colour is never the only signal. Series are named in the legend and the readout.
- Axis numerals are tabular, so digits line up.
- The line draws in once with the `calmon-trace` animation. Under `prefers-reduced-motion` it is simply there.

## Common mistakes

Wrong: a limit that exists only in people's heads, so the chart can't show how close the line is.

```tsx
<Chart data={latency} x="time" series={[{ key: 'p95', label: 'p95 latency' }]} />
```

Right: draw the threshold and label it in words.

```tsx
<Chart
  data={latency}
  x="time"
  series={[{ key: 'p95', label: 'p95 latency' }]}
  threshold={{ value: 400, label: 'limit 400 ms', severity: 'caution' }}
/>
```

Wrong: raw colours, and too many of them.

```tsx
<Chart series={[{ key: 'a', label: 'A', color: '#ff0000' }]} />
```

Right: tone tokens, and no more than 6 series. The default palette is already made of tokens.

```tsx
<Chart series={[{ key: 'errors', label: '5xx', color: 'critical' }]} />
```

Wrong: a chart with no name, so a screen reader hears only "Line chart".

```tsx
<Chart data={rows} x="time" series={series} />
```

Right: say what it shows.

```tsx
<Chart label="p95 latency, last 24 hours" data={rows} x="time" series={series} unit="ms" />
```
