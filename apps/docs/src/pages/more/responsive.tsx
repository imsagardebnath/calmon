import { Bullets, Callout, Lead } from '../../site/doc.tsx'
import { BASE } from '../../site/config.ts'

const PHONES = [
  { title: 'Home at phone width', src: `${BASE}#/` },
  { title: 'Docs at phone width', src: `${BASE}#/docs/installation` },
] as const

export default function Responsive() {
  return (
    <>
      <h2>Home and docs on a phone</h2>
      <Lead>
        These are this site, loaded in two 390 px frames. Everything you see is built from Calmon and the same tokens.
      </Lead>
      <div className="mt-6 flex flex-wrap justify-center gap-12" data-no-prose>
        {PHONES.map((p) => (
          <figure key={p.title} className="m-0 flex w-full max-w-[390px] flex-col items-center gap-3">
            <div className="phone">
              <iframe title={p.title} src={p.src} loading="lazy" />
            </div>
            <figcaption className="text-ui-sm text-fg-subtle">{p.title}</figcaption>
          </figure>
        ))}
      </div>

      <h2>How the library behaves</h2>
      <Bullets>
        <li>
          <b>Mobile first.</b> Components fill the width you give them. Set the width in your layout, not on the component.
        </li>
        <li>
          <b>Tables scroll sideways</b> instead of squashing columns, and keep their header while you scroll down.
        </li>
        <li>
          <b>Side navigation</b> collapses to an icon rail, or moves into a Drawer on small screens.
        </li>
        <li>
          <b>Overlays fit the screen.</b> Dialogs and drawers never get wider than the viewport, and popups flip to stay on
          screen.
        </li>
        <li>
          <b>Touch targets follow density.</b> Comfortable controls are 36 px tall and large buttons are 44 px; use{' '}
          <code>size=&quot;lg&quot;</code> for primary actions on phones.
        </li>
      </Bullets>

      <h2>How these docs respond</h2>
      <Bullets>
        <li>
          <b>1280 px and up:</b> sidebar, content and an “On this page” list.
        </li>
        <li>
          <b>1024 px to 1279 px:</b> the “On this page” list hides.
        </li>
        <li>
          <b>Below 1024 px:</b> the sidebar moves into the menu drawer, opened from the header.
        </li>
        <li>
          <b>Below 768 px:</b> the header links collapse into the menu and search shows as an icon.
        </li>
      </Bullets>
      <Callout>
        Test your own screens at 390 px and in station density. A layout that works at both ends works in between.
      </Callout>
    </>
  )
}
