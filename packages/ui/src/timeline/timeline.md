---
name: Timeline
category: Monitoring
principle: timeline
import: "@openvanta/calmon-react/timeline"
status: stable
related: [Badge, Card, Drawer, HealthScore]
description: One ordered record per entity of alerts, changes, deploys, notes and who did them, grouped by day.
---

## Use when

- During an incident the first question is "what changed?": show every alert, deploy, config change and note for one entity in one place.
- You record decisions: soft-limit justifications and pause-point completions belong here, with who did them.
- You show history in a detail page, a drawer or a side panel.

## Don't use when

- You need to filter, sort or compare many events across entities: use Table.
- The events are steps of a process the user moves through: show the steps with your own list or a ProgressBar, not a Timeline.
- You split one entity's history across tabs. Keep it in one list.

## Props

<!-- props -->

## Examples

<!-- examples -->

## Accessibility

- The timeline is an ordered list (`<ol>`). With `groupBy="day"` each day is a list item with a heading and its own ordered list of events. Choose the heading level with `headingLevel` (2 to 6, default 3) so it fits the page outline. The older `as` prop (`'h2'` to `'h6'`) still works but is deprecated.
- Each node shows a severity icon (a different shape per severity) and the severity is also written as a hidden word before the title ("Critical: Error rate above 4%"), so status is never colour alone.
- Times use a `<time>` element with `dateTime`. It shows the clock time and how long ago it was, and the full date and time zone is the tooltip. Relative times are filled in after the page loads. When you render on the server, clock times and days are written in UTC and English until the page has loaded, so server and client markup match and the same events fall under the same day headings; after that they switch to the viewer's zone and language. Set `timeZone` to keep one zone throughout.
- Day headings are sticky inside a scrolling parent. Set the `--timeline-bg` CSS variable to the panel colour when the panel is not the raised surface.
- The component does not announce new events. If a new critical event should be announced, use a Banner or Toast.

## Common mistakes

Wrong: events with no actor, so the record cannot say who changed what.

```tsx
<Timeline events={[{ id: '1', time: now, title: 'Config changed' }]} />
```

Right: say who did it.

```tsx
<Timeline events={[{ id: '1', time: now, title: 'Config v42 published', actor: 'A. Kaur', type: 'change' }]} />
```

Wrong: a time zone that depends on where each person sits, in a team that shares one.

```tsx
<Timeline events={events} />
```

Right: set the zone the team works in, and print it somewhere on the page.

```tsx
<Timeline events={events} timeZone="UTC" />
```

Wrong: marking events with colour only.

```tsx
<Timeline events={events.map((e) => ({ ...e, icon: <span className="size-2 rounded-full bg-red-500" /> }))} />
```

Right: give each event a severity, which draws its own shape and is spoken as a word.

```tsx
<Timeline events={[{ id: '1', time: now, severity: 'critical', title: 'Error rate above 4%' }]} />
```
