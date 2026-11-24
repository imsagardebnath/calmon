import { useState } from 'react'
import { Button } from '@calmon/react/button'
import { Checkbox } from '@calmon/react/checkbox'
import { Input } from '@calmon/react/input'
import { Switch } from '@calmon/react/switch'
import { InfoIcon, PauseIcon } from '@calmon/react/icons'
import { B, Bullets, C, Callout, H2, H3, Lead, Page, Specimen, TableWrap, Td, Th } from './_kit.tsx'
import { showValue, useLive, useReducedMotion } from './_tokens.ts'

const SHADOWS = [
  { token: '--shadow-1', cls: 'shadow-low', box: 'shadow-low', label: 'shadow-1', use: 'Resting cards, tables, tiles' },
  { token: '--shadow-2', cls: 'shadow-mid', box: 'shadow-mid', label: 'shadow-2', use: 'Popovers, menus, tooltips' },
  { token: '--shadow-3', cls: 'shadow-high', box: 'shadow-high', label: 'shadow-3', use: 'Dialogs, drawers, toasts, the palette' },
] as const

// Full class strings, so Tailwind sees every duration.
const TRACKS = [
  { token: '--duration-fast', label: 'fast', use: 'Hover and colour changes', ms: 120, cls: 'duration-(--duration-fast)' },
  { token: '--duration-base', label: 'base', use: 'Switches, tabs, popovers', ms: 200, cls: 'duration-(--duration-base)' },
  { token: '--duration-slow', label: 'slow', use: 'Dialogs and sheets', ms: 320, cls: 'duration-(--duration-slow)' },
] as const

const FOCUS_INPUT =
  'h-(--control-h) w-40 rounded-control border border-ring bg-surface-raised px-(--control-px) text-ui text-fg ' +
  'shadow-[0_0_0_4px_color-mix(in_oklab,var(--ring),transparent_82%)] outline-none dark:bg-surface-sunken'

function Shadows() {
  const live = useLive()
  return (
    <>
      <div className="rounded-card border border-border bg-surface px-6 py-10">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
          {SHADOWS.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-3">
              <div className={`h-14 w-24 rounded-card border border-border bg-surface-raised ${s.box}`} />
              <span className="text-xs text-fg">
                {s.label} <span className="text-fg-subtle">{s.cls}</span>
              </span>
              <span className="max-w-[160px] text-center text-xs text-fg-subtle">{s.use}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <TableWrap>
          <thead>
            <tr>
              <Th>Token</Th>
              <Th>Tailwind</Th>
              <Th>Value in this theme</Th>
            </tr>
          </thead>
          <tbody>
            {SHADOWS.map((s) => (
              <tr key={s.token}>
                <Td>
                  <C>{s.token}</C>
                </Td>
                <Td>
                  <C>{s.cls}</C>
                </Td>
                <Td className="font-mono text-[11px] break-words text-fg-muted">{showValue(live(s.token))}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </>
  )
}

function MotionDemo() {
  const live = useLive()
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)
  return (
    <Specimen title="Try it">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => setOn((v) => !v)} aria-pressed={on}>
          {on ? 'Send them back' : 'Play'}
        </Button>
        <span className="text-ui-sm text-fg-muted">
          Each dot moves with its own duration and the same <C>--ease-calmon-curve</C> curve.
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        {TRACKS.map((t) => (
          <div key={t.token} className="flex items-center gap-3 font-mono text-xs text-fg-muted">
            <span className="w-24 flex-none">{t.label}</span>
            <span className="relative h-4 min-w-0 flex-1 rounded-pill bg-surface-sunken shadow-[inset_0_0_0_1px_var(--border)]">
              <span
                aria-hidden="true"
                className={`absolute top-0 size-4 rounded-full bg-accent transition-[left] ease-calmon ${t.cls}`}
                style={{ left: on ? 'calc(100% - 16px)' : '0px' }}
              />
            </span>
            <span className="w-14 flex-none text-right">{live(t.token)}</span>
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {on ? 'Dots moved to the end' : 'Dots at the start'}
      </p>
      <div className="mt-5">
        {reduced ? (
          <Callout icon={<PauseIcon width={18} height={18} />}>
            <B>Reduced motion is on.</B> Your system asks for less motion, so every duration reads 0ms and the dots jump
            instead of sliding. Nothing else changes.
          </Callout>
        ) : (
          <Callout icon={<InfoIcon width={18} height={18} />}>
            If your system asks for reduced motion, every duration becomes 0ms and the dots jump instead of sliding. Turn
            it on in your operating system to see it here.
          </Callout>
        )}
      </div>
    </Specimen>
  )
}

function AmbientDemo() {
  return (
    <Specimen title="Ambient motion">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className="inline-flex items-center gap-2 text-ui-sm font-[550]" data-tone="normal">
          <span aria-hidden="true" className="size-2 rounded-full bg-tone motion-safe:animate-calmon-blink" />
          Live
        </span>
        <span className="text-ui-sm text-fg-muted">
          The live dot and critical station tiles are the only things that move on their own. Both stop under reduced
          motion.
        </span>
      </div>
    </Specimen>
  )
}

function FocusDemo() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Specimen title="Live: press Tab">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Button</Button>
          <div className="w-40">
            <Input defaultValue="Input" aria-label="Example input" />
          </div>
          <Checkbox defaultChecked>Check</Checkbox>
          <Switch defaultChecked aria-label="Example switch" />
        </div>
        <p className="mt-4 text-ui-sm text-fg-muted">
          The ring only appears for the keyboard (<C>:focus-visible</C>), never on a mouse click.
        </p>
      </Specimen>
      <Specimen title="Forced, for reference">
        <div className="flex flex-wrap items-center gap-5 p-1">
          <Button className="outline-2 outline-offset-2 outline-ring">Button</Button>
          <input readOnly tabIndex={-1} value="Input" aria-label="Focused input, for reference" className={FOCUS_INPUT} />
          <label className="inline-flex items-center gap-2 text-ui">
            <input
              type="checkbox"
              checked
              readOnly
              tabIndex={-1}
              className="size-4 accent-accent outline-2 outline-offset-2 outline-ring"
            />
            Check
          </label>
        </div>
        <p className="mt-4 text-ui-sm text-fg-muted">The same states, held on so you can inspect them.</p>
      </Specimen>
    </div>
  )
}

function FocusTokens() {
  const live = useLive()
  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Token</Th>
          <Th>Value</Th>
          <Th>Meaning</Th>
        </tr>
      </thead>
      <tbody>
        {[
          ['--ring', 'Ring colour. Teal in both themes.'],
          ['--ring-width', 'Outline thickness.'],
          ['--ring-offset', 'Gap between the control and the ring.'],
        ].map(([token, meaning]) => (
          <tr key={token}>
            <Td>
              <C>{token!}</C>
            </Td>
            <Td className="font-mono text-xs">
              <span className="inline-flex items-center gap-2">
                {token === '--ring' ? (
                  <span aria-hidden="true" className="size-3 rounded-[3px] shadow-[inset_0_0_0_1px_rgb(0_0_0/.1)]" style={{ background: 'var(--ring)' }} />
                ) : null}
                {showValue(live(token!))}
              </span>
            </Td>
            <Td className="text-fg-muted">{meaning}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

export default function Elevation() {
  return (
    <Page>
      <Lead>
        Light mode uses soft layered shadows with a hairline ring; dark mode leans on borders, because shadows vanish on
        navy. Motion is restrained, and one focus ring serves every control.
      </Lead>

      <h2 id="shadows" className={H2}>Shadows</h2>
      <Lead>
        Three levels. <B>shadow-1</B> for resting cards, <B>shadow-2</B> for popovers, menus and tooltips, <B>shadow-3</B>{' '}
        for dialogs, drawers, toasts and the palette. Dark mode uses deeper, blacker shadows because grey ones vanish on
        a dark surface.
      </Lead>
      <Shadows />

      <h2 id="motion" className={H2}>Motion</h2>
      <Lead>
        Durations of 120ms (hover, colour), 200ms (switches, tabs, popovers) and 320ms (dialogs, sheets), all on one
        ease-out curve, <C>cubic-bezier(.2, .7, .2, 1)</C>. Motion answers an action.
      </Lead>
      <MotionDemo />
      <div className="mt-5">
        <AmbientDemo />
      </div>
      <H3>Rules</H3>
      <Bullets>
        <li>
          Use <C>duration-(--duration-fast)</C>, <C>duration-(--duration-base)</C> or <C>duration-(--duration-slow)</C> with{' '}
          <C>ease-calmon</C>. Never a raw millisecond value.
        </li>
        <li>The only ambient motion is a slow pulse on critical tiles and the live dot.</li>
        <li>
          <B>prefers-reduced-motion</B> sets every duration to zero and stops both. Use <C>motion-safe:</C> on anything
          that loops.
        </li>
        <li>Never animate numbers counting up; people read values mid-animation.</li>
      </Bullets>

      <h2 id="focus-ring" className={H2}>Focus ring</h2>
      <Lead>
        A 2px solid <C>--ring</C> with a 2px offset, drawn with <C>:focus-visible</C> only. Text inputs use an inset
        version: the border turns the ring colour and a 4px soft halo appears, so the ring does not collide with
        neighbouring fields. The ring is teal in both themes and passes 3:1 against every surface.
      </Lead>
      <FocusDemo />
      <div className="mt-4">
        <FocusTokens />
      </div>
    </Page>
  )
}
