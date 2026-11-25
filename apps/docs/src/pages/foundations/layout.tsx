import { Button } from '@openvanta/pikore-react/button'
import { Field } from '@openvanta/pikore-react/field'
import { Input } from '@openvanta/pikore-react/input'
import { NumberInput } from '@openvanta/pikore-react/number-input'
import { Select } from '@openvanta/pikore-react/select'
import { VitalTile } from '@openvanta/pikore-react/vital-tile'
import { TrashIcon } from '@openvanta/pikore-react/icons'
import { B, Bullets, C, H2, Lead, Page, Specimen, TableWrap, Td, Th } from './_kit.tsx'
import { useDensityValues, useLive } from './_tokens.ts'

const STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24]

const RADII = [
  { label: 'control', token: '--radius-control', cls: 'rounded-control', use: 'Inputs, buttons, menu items', w: 72, h: 44 },
  { label: 'card', token: '--radius-card', cls: 'rounded-card', use: 'Cards, tables, tiles', w: 72, h: 44 },
  { label: 'pill', token: '--radius-pill', cls: 'rounded-pill', use: 'Badges, switches', w: 72, h: 24 },
] as const

const DENSITIES = [
  { id: 'comfortable', title: 'Comfortable', use: 'Default. Forms and detail pages.', tileWidth: 260 },
  { id: 'compact', title: 'Compact', use: 'Tables, admin screens, side panels.', tileWidth: 200 },
  { id: 'station', title: 'Station', use: 'Wall displays read from across the room.', tileWidth: 460 },
] as const

const DENSITY_VARS = ['--btn-h', '--btn-px', '--btn-fs', '--control-h', '--control-px', '--control-fs'] as const

const REGIONS = [
  { value: 'eu-west-1', label: 'eu-west-1' },
  { value: 'us-east-1', label: 'us-east-1' },
  { value: 'ap-south-1', label: 'ap-south-1' },
]

/** Spacing steps as bars, with the value read from the token. */
function SpacingScale() {
  const live = useLive()
  return (
    <Specimen title="Spacing, 4px base">
      {STEPS.map((n) => (
        <div key={n} className="flex items-center gap-3 py-1 font-mono text-xs text-fg-muted">
          <span className="w-[72px] flex-none">space-{n}</span>
          <i aria-hidden="true" className="block h-2.5 rounded-[3px] bg-accent" style={{ width: `var(--space-${n})` }} />
          <span className="w-10 flex-none">{live(`--space-${n}`)}</span>
          <span className="hidden text-fg-subtle sm:inline">p-{n}</span>
        </div>
      ))}
    </Specimen>
  )
}

/** One density: a form row and a button set, rendered inside a container with that data-density. */
const SERIES = [310, 330, 320, 350, 345, 370, 380, 365, 390, 400, 405, 412]

function DensitySpecimen({ id, title, use, tileWidth }: { id: string; title: string; use: string; tileWidth: number }) {
  return (
    <Specimen data-density={id}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="text-ui font-semibold">{title}</h3>
        <C>{`density="${id}"`}</C>
        <span className="text-ui-sm text-fg-muted">{use}</span>
      </div>
      <div className="flex flex-wrap items-end gap-3.5 [&>*:first-child]:min-w-[200px] [&>*:first-child]:flex-[1.4] [&>*]:min-w-[140px] [&>*]:flex-1 [&>button]:flex-none">
        <Field label="Service name">
          <Input defaultValue="payments-api" />
        </Field>
        <Field label="Region">
          <Select options={REGIONS} defaultValue="eu-west-1" />
        </Field>
        <Field label="Replicas">
          <NumberInput defaultValue={6} unit="pods" min={0} max={50} />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Button variant="primary">Save changes</Button>
        <Button>Cancel</Button>
        <Button variant="ghost">View history</Button>
        <Button severity="critical" iconStart={<TrashIcon />}>
          Delete
        </Button>
      </div>
      <div className="mt-5 max-w-full" style={{ width: tileWidth }}>
        <VitalTile label="p95 latency" value={412} unit="ms" data={SERIES} threshold={{ value: 400, severity: 'caution' }} change="+12% 1h" />
      </div>
    </Specimen>
  )
}

/** Density variables as the browser computes them inside each density. */
function DensityTable() {
  const values = useDensityValues(DENSITY_VARS)
  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Variable</Th>
          {DENSITIES.map((d) => (
            <Th key={d.id}>{d.title}</Th>
          ))}
          <Th>Read by</Th>
        </tr>
      </thead>
      <tbody>
        {DENSITY_VARS.map((v) => (
          <tr key={v}>
            <Td>
              <C>{v}</C>
            </Td>
            {DENSITIES.map((d) => (
              <Td key={d.id} className="font-mono text-xs">
                {values[d.id]?.[v] ?? '…'}
              </Td>
            ))}
            <Td className="text-fg-muted">{v.startsWith('--btn') ? 'Button, IconButton' : 'Input, Select, NumberInput, Search'}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

export default function Layout() {
  const live = useLive()
  return (
    <Page>
      <Lead>Calm density comes from alignment, not air. Everything sits on a 4px grid.</Lead>

      <h2 id="spacing" className={H2}>Spacing</h2>
      <Lead>
        A 4px base with steps at 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 and 96. Each step is also Tailwind’s own: <C>space-4</C>{' '}
        is 16px, the same as <C>p-4</C>, <C>gap-4</C> and <C>m-4</C>.
      </Lead>
      <SpacingScale />
      <div className="mt-5">
        <Bullets>
          <li>
            <B>Controls</B> use 12px horizontal padding and 8px gaps. <B>Cards</B> pad 16px. <B>Page sections</B> separate by
            64px.
          </li>
          <li>Prefer the step below when unsure. Density is calm because of alignment, not air.</li>
        </Bullets>
      </div>

      <h2 id="radius" className={H2}>Radius</h2>
      <Lead>
        Two corner radii and a pill. <B>control</B> for inputs, buttons and menu items; <B>card</B> for cards, tables and
        tiles. Dialogs and the command palette use 16px; badges and switches are pills.
      </Lead>
      <Specimen title="Radius">
        <div className="flex flex-wrap gap-6">
          {RADII.map((r) => (
            <div key={r.label} className="flex flex-col items-start gap-2">
              <div
                className={`border border-border-strong bg-surface-sunken ${r.cls} ${r.label === 'pill' ? 'my-2.5' : ''}`}
                style={{ width: r.w, height: r.h }}
              />
              <span className="text-xs text-fg">
                {r.label} <span className="text-fg-subtle">{live(r.token)}</span>
              </span>
              <code className="font-mono text-[11px] text-accent-fg">{r.cls}</code>
              <span className="max-w-[160px] text-xs text-fg-subtle">{r.use}</span>
            </div>
          ))}
        </div>
      </Specimen>

      <h2 id="density" className={H2}>Density</h2>
      <Lead>
        Set <C>density</C> on the provider or any subtree, with <C>data-density</C> on a container. Comfortable is the
        default; compact suits tables and admin screens; station is for wall displays read from several metres away.
        Controls follow it unless you pass an explicit <C>size</C>.
      </Lead>
      <div className="flex flex-col gap-6">
        {DENSITIES.map((d) => (
          <DensitySpecimen key={d.id} id={d.id} title={d.title} use={d.use} tileWidth={d.tileWidth} />
        ))}
      </div>

      <h2 id="density-variables" className={H2}>Density variables</h2>
      <Lead>
        Components read these variables, so they follow the nearest <C>data-density</C> ancestor. The values below are read
        from the browser inside each density.
      </Lead>
      <DensityTable />
    </Page>
  )
}
