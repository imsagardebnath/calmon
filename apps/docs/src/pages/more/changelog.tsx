import { Badge } from '@openvanta/pikore-react/badge'
import { Bullets } from '../../site/doc.tsx'
import { VERSION } from '../../site/config.ts'
import { pages } from '../../site/pages.ts'

export default function Changelog() {
  const count = pages.filter((p) => p.entry).length
  return (
    <>
      <h2 className="flex items-center gap-3">
        {VERSION}
        <Badge intent="primary">First release</Badge>
      </h2>
      <Bullets>
        <li>
          <b>{count} components</b> in eight groups: actions, forms, feedback, overlays, navigation, data display, monitoring and
          safety.
        </li>
        <li>
          <b>Design tokens</b> for light and dark, five severity levels with their own icon shapes, and intent aliases:
          primary, secondary, success, warning, danger.
        </li>
        <li>
          <b>Three densities</b>: comfortable, compact and station, for wall displays.
        </li>
        <li>
          <b>Tailwind CSS v4</b> mapping, so tokens work as classes: <code>bg-surface</code>, <code>text-fg-muted</code>,{' '}
          <code>bg-critical-soft</code>.
        </li>
        <li>
          <b>Docs for AI agents</b>: <code>llms.txt</code>, <code>llms-full.txt</code>, <code>components.json</code> and one
          Markdown doc per component, rebuilt from the source on every deploy.
        </li>
        <li>
          <b>CommandPalette</b>: search and run commands with Ctrl K.
        </li>
      </Bullets>
    </>
  )
}
