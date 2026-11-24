---
name: StationGrid
category: Monitoring
principle: alarm-fatigue
import: "@calmon/react/station-grid"
status: stable
related: [HealthScore, VitalTile, Banner, Toast]
description: A worst-first grid of entity tiles for overview screens, where only critical tiles draw the eye.
---

## Use when

- You watch many entities at once (services, beds, sites, hosts) and need the one that needs attention to be obvious.
- The screen is a central-station or wall display, glanced at from a distance.
- Each tile can lead somewhere: give it an `href` or an `onSelect`.

## Don't use when

- You need many columns of data per entity, sorting by column or bulk actions: use Table.
- There are two or three entities: use VitalTile or HealthScore, which carry more detail.
- You want to announce a new problem: use Banner or Toast. The grid never announces tiles by itself.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- Tiles are sorted worst first (severity, then the lowest score), and the DOM order is the visual order, so a screen reader hears the worst first.
- The grid is a list (`<ul>`) with an accessible name. It is not a live region: announcing every change would cause alarm fatigue. Only the count of critical tiles in the summary line is a polite live region (`role="status"`), so a new critical tile is announced once.
- Every tile shows a severity icon (a different shape per severity) and, unless it is normal, the severity word. The accessible name of a tile is "name, severity, score N, detail".
- Tiles with `href` are links and tiles with `onSelect` are buttons: both are reachable with Tab and show a visible focus ring. The rest are static groups, which are not interactive and not in the tab order.
- Only critical tiles animate: a ring pulses once every few seconds. With reduced motion the pulse is off, and the tile is still tinted, outlined and labelled.
- Normal tiles stay quiet: no colour fill, no severity word.

## Common mistakes

Wrong: animating or colouring every tile so everything looks urgent.

```tsx
<StationTile name="orders-api" severity="normal" score={88} className="animate-pulse bg-green-100" />
```

Right: leave normal tiles quiet. Only critical pulses, and the grid handles it.

```tsx
<StationGrid items={services} />
```

Wrong: sorting the data yourself in a different order than people see, or hiding tiles to look calm.

```tsx
<StationGrid items={services.filter((s) => s.severity !== 'normal')} sort="name" />
```

Right: keep worst first and show the summary count, so the quiet tiles are still accounted for.

```tsx
<StationGrid items={services} sort="worst-first" />
```

Wrong: making the whole grid a live region.

```tsx
<div aria-live="polite"><StationGrid items={services} /></div>
```

Right: the grid already announces the critical count politely. Use Banner for incidents.

```tsx
<StationGrid items={services} />
```
