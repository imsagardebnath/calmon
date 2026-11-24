// Confirm the target: look-alike production databases, and a dialog that asks for the exact name.
import { useEffect, useRef, useState } from 'react'
import { Button } from '@openvanta/calmon-react/button'
import { Code } from '@openvanta/calmon-react/code'
import { ConfirmTarget, EnvironmentBadge } from '@openvanta/calmon-react/confirm-target'
import { TrashIcon } from '@openvanta/calmon-react/icons'
import { Input } from '@openvanta/calmon-react/input'
import { Toast } from '@openvanta/calmon-react/toast'
import { Panel, PatternPage, PRINCIPLES, type DoDontPair, type PatternComponent } from './_pattern.tsx'

interface Database {
  name: string
  env: 'prod' | 'staging' | 'dev'
  region: string
  detail: string
  consequences: string[]
}

/** Names that differ by two letters, and one that differs only by its environment. */
const DATABASES: Database[] = [
  {
    name: 'orders-prod-eu',
    env: 'prod',
    region: 'eu-west-1',
    detail: '284 GB · 3 replicas',
    consequences: ['All tables and backups are removed.', 'The 3 replicas are shut down.', 'checkout-web and orders-api start failing.'],
  },
  {
    name: 'orders-prod-us',
    env: 'prod',
    region: 'us-east-1',
    detail: '311 GB · 3 replicas',
    consequences: ['All tables and backups are removed.', 'The 3 replicas are shut down.', 'checkout-web and orders-api start failing.'],
  },
  {
    name: 'orders-staging-eu',
    env: 'staging',
    region: 'eu-west-1',
    detail: '12 GB · 1 replica',
    consequences: ['All tables and backups are removed.', 'The replica is shut down.'],
  },
]

function ConfirmDemo() {
  const [databases, setDatabases] = useState(DATABASES)
  const [openName, setOpenName] = useState<string | null>(null)
  const [deleted, setDeleted] = useState<string | null>(null)
  const status = useRef<HTMLParagraphElement>(null)

  // The row that held focus is gone, so move focus to the result instead of leaving it on the page body.
  useEffect(() => {
    if (deleted) status.current?.focus()
  }, [deleted])

  return (
    <Panel title="Databases">
      {databases.length === 0 ? (
        <p className="m-0 py-3 text-ui-sm text-fg-muted">Every database is deleted. Use Reset to bring them back.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {databases.map((db) => (
            <li key={db.name} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 not-first:border-t not-first:border-border">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-ui-sm font-medium break-all">{db.name}</span>
                  <EnvironmentBadge env={db.env} />
                </div>
                <span className="text-ui-sm text-fg-muted">
                  {db.region} · {db.detail}
                </span>
              </div>
              <Button
                variant="ghost"
                severity="critical"
                iconStart={<TrashIcon />}
                aria-haspopup="dialog"
                onClick={() => setOpenName(db.name)}
              >
                Delete<span className="sr-only"> {db.name}</span>
              </Button>
              <ConfirmTarget
                name={db.name}
                env={db.env}
                action="Delete database"
                detail={db.detail}
                description="Services that read from it will start to fail."
                consequences={db.consequences}
                open={openName === db.name}
                onOpenChange={(open) => setOpenName(open ? db.name : null)}
                onConfirm={() => {
                  setDatabases((list) => list.filter((d) => d.name !== db.name))
                  setDeleted(db.name)
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <p ref={status} tabIndex={-1} role="status" className="m-0 mt-3 border-t border-border pt-3 text-ui-sm text-fg-muted">
        {deleted ? `Deleted ${deleted}.` : 'Nothing deleted yet.'}
      </p>
    </Panel>
  )
}

const components: PatternComponent[] = [
  {
    name: 'ConfirmTarget',
    role: 'Shows the exact name with its environment badge beside it, and unlocks the button only on a case-sensitive match.',
  },
]

const dos: DoDontPair[] = [
  {
    doPreview: (
      <div className="flex w-full max-w-[320px] flex-col gap-2.5">
        <div className="flex items-center gap-2.5 rounded-control border border-border bg-surface-sunken px-3 py-2.5">
          <span className="font-mono text-ui-sm font-medium">orders-prod-eu</span>
          <EnvironmentBadge env="prod" />
          <span className="ml-auto text-xs text-fg-muted">284 GB</span>
        </div>
        <Input className="font-mono text-ui-sm" defaultValue="orders-prod-" aria-label="Type the name to confirm" />
        <Button severity="critical" iconStart={<TrashIcon />} disabled className="self-start">
          Delete database
        </Button>
      </div>
    ),
    dontPreview: (
      <div className="w-full max-w-[320px] rounded-card border border-border bg-surface-raised p-4 shadow-low">
        <p className="m-0 mb-1 text-ui-sm font-semibold text-fg">Delete this database?</p>
        <p className="m-0 mb-3 text-ui-sm text-fg-muted">Are you sure you want to continue?</p>
        <div className="flex justify-end gap-2">
          <Button size="sm">Cancel</Button>
          <Button size="sm" variant="primary">
            OK
          </Button>
        </div>
      </div>
    ),
    doText: 'Ask for the exact name, with the environment badge right beside it.',
    dontText: 'Confirm with OK. Nothing names the target or the environment, so it is clicked on autopilot.',
  },
  {
    doPreview: (
      <div className="w-full max-w-[320px]">
        <Toast
          intent="primary"
          title="3 rows archived"
          description="Restore them from Archive for 30 days."
          action={{ label: 'Undo', onClick: () => {} }}
        />
      </div>
    ),
    dontPreview: (
      <div className="flex w-full max-w-[320px] flex-col gap-2.5">
        <span className="text-ui-sm font-[550] text-fg">
          Type <Code inline>row-4182</Code> to archive it
        </span>
        <Input className="font-mono text-ui-sm" placeholder="row-4182" aria-label="Type the row id to confirm" />
        <Button variant="primary" disabled className="self-start">
          Archive row
        </Button>
      </div>
    ),
    doText: 'Give reversible actions an Undo. Keep the typing for what can’t be undone.',
    dontText: 'Make people type a name to archive something they could restore. Friction on everything teaches people to skip it.',
  },
]

export default function ConfirmTargetPattern() {
  return (
    <PatternPage
      principle={PRINCIPLES['confirm-target']}
      components={components}
      demoTitle="Delete a production database"
      demoIntro={
        <>
          Delete <Code inline>orders-prod-eu</Code>. The button stays locked until the name matches exactly. Try typing{' '}
          <Code inline>orders-prod-us</Code> and see that a near-miss never passes. Paste works, and the match is
          case-sensitive.
        </>
      }
      demo={<ConfirmDemo />}
      dos={dos}
    />
  )
}
