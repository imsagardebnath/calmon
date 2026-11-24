---
name: VitalTile
category: Monitoring
principle: composite-score
import: "@openvanta/calmon-react/vital-tile"
status: stable
related: [Sparkline, HealthScore, StationGrid, Badge]
description: A metric with its unit, a trend line and the threshold it is judged against, with the severity as an icon and a word.
---

## Use when

- You show one metric that has a limit: latency against its SLO, a queue against its capacity, SpO2 against its alarm level.
- The reader needs the value, where it is heading and how far it is from the limit, at a glance.
- The tile sits on a wall display: set `density="station"` for large numerals that read across a room.

## Don't use when

- The value has no limit and no trend: print it as text or in a table cell.
- People need to read exact values or compare series over time: use Chart.
- You want a general content box: use Card.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The tile is a group named by its label. The severity is text inside the tile: a badge with an icon and the word ("Caution", "Critical", "In range"), so colour is never the only signal.
- The limit is printed in the footer ("limit 400 ms"), so the value is never judged against a hidden number.
- The numeral uses tabular figures so it does not jump as it updates.
- The trend line is a Sparkline: an image with a generated text summary that includes the latest value and whether it is above the threshold.
- A tile with no threshold and no `severity` stays neutral and has no badge. Do not colour a tile without a label.
- It does not animate, and it is not focusable. Put it inside a link or button if it opens details.

## Common mistakes

Wrong: colouring the tile with no label, so the status depends on seeing the colour.

```tsx
<VitalTile label="p95 latency" value={412} className="border-red-500" />
```

Right: a threshold. The tile takes the severity, shows its word and icon, and prints the limit.

```tsx
<VitalTile label="p95 latency" value={412} unit="ms" threshold={{ value: 400, severity: 'caution' }} />
```

Wrong: a metric that is bad when it falls, judged as if high were bad.

```tsx
<VitalTile label="Availability" value={99.2} unit="%" threshold={{ value: 99.9, severity: 'critical' }} />
```

Right: say which side is bad.

```tsx
<VitalTile label="Availability" value={99.2} unit="%" threshold={{ value: 99.9, severity: 'critical', direction: 'below' }} />
```

Wrong: sizing a tile for a wall display with your own font classes.

```tsx
<VitalTile label="p95" value={412} className="text-8xl" />
```

Right: use the station density, which scales the numeral, label, trend line and badge together.

```tsx
<VitalTile density="station" label="p95 latency" value={412} unit="ms" />
```
