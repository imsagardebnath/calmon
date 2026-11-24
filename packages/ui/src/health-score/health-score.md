---
name: HealthScore
category: Monitoring
principle: composite-score
import: "@openvanta/calmon-react/health-score"
status: stable
related: [VitalTile, StationGrid, Badge]
description: One 0 to 100 number from many signals, shown as a ring with its band, the biggest factor and a breakdown of every factor.
---

## Use when

- Five charts take minutes to read and one score takes a second: combine weak signals for a service, a site or a patient into one number.
- You can say what moved the score. A score is only trusted when its factors sit beside it.
- The same kind of entity is scored the same way everywhere, so "62" always means caution.

## Don't use when

- There is one signal: show a VitalTile with its threshold.
- You have a list of many entities to scan: use StationGrid, which sorts them worst first.
- The number has no breakdown. A score without its factors is a black box people stop trusting: add factors or show the raw metrics.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The ring is a meter (`role="meter"`) with a text equivalent: `aria-valuetext` reads "62 of 100, caution". The ring graphic is hidden from screen readers.
- The band is also written as a word in a Badge with its own icon, and the biggest factor is named in plain text next to the score. Nothing depends on the ring or its colour.
- Every factor shows a severity icon (a different shape per severity) and a hidden severity word, its weight and its impact, so the list reads in full without the bars.
- The breakdown toggle is a native `<button>` with `aria-expanded` and `aria-controls`. Collapsing it hides the list but keeps the biggest factor visible.
- Bands: with the defaults, 85 and up is normal, 70 to 84 advisory, 50 to 69 caution and under 50 critical. Info is never used for a score.

## Common mistakes

Wrong: a score with no factors, so nobody can tell what to fix.

```tsx
<HealthScore value={62} factors={[]} />
```

Right: every factor that moved the score, with its weight and impact.

```tsx
<HealthScore
  value={62}
  factors={[
    { label: 'Latency p95', weight: 35, impact: -21, severity: 'caution' },
    { label: 'Error rate', weight: 30, impact: -4, severity: 'normal' },
  ]}
/>
```

Wrong: different bands for the same kind of entity on different screens.

```tsx
<HealthScore value={72} factors={factors} bands={{ advisory: 95, caution: 90, critical: 80 }} />
```

Right: keep the defaults, or define the bands once per entity type and reuse them.

```tsx
<HealthScore value={72} factors={factors} bands={SERVICE_BANDS} />
```

Wrong: showing the score as a coloured ring only.

```tsx
<div className="size-24 rounded-full border-8 border-orange-500">62</div>
```

Right: HealthScore, which pairs the ring with a band word, an icon and a text value.

```tsx
<HealthScore value={62} factors={factors} />
```
