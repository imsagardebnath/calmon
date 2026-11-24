// Example dashboard: a workspace admin console, built only from Calmon components.
// Every name, number and time is fictional. Underscore files are not routes.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Severity } from '@openvanta/calmon-react'
import { Avatar } from '@openvanta/calmon-react/avatar'
import { Badge } from '@openvanta/calmon-react/badge'
import { Banner } from '@openvanta/calmon-react/banner'
import { Button } from '@openvanta/calmon-react/button'
import { Card, CardBody } from '@openvanta/calmon-react/card'
import { ConfirmTarget, EnvironmentBadge } from '@openvanta/calmon-react/confirm-target'
import { Dialog } from '@openvanta/calmon-react/dialog'
import { EmptyState } from '@openvanta/calmon-react/empty-state'
import { Field } from '@openvanta/calmon-react/field'
import { CheckIcon, CopyIcon, GridIcon, LimitsIcon, MoreIcon, PlusIcon, SettingsIcon, TimelineIcon, TrashIcon, UserIcon, XIcon } from '@openvanta/calmon-react/icons'
import { IconButton } from '@openvanta/calmon-react/icon-button'
import { Input } from '@openvanta/calmon-react/input'
import { Menu, MenuItem, MenuSeparator } from '@openvanta/calmon-react/menu'
import { Search } from '@openvanta/calmon-react/search'
import { Select } from '@openvanta/calmon-react/select'
import { SideNav, SideNavGroup, SideNavItem } from '@openvanta/calmon-react/side-nav'
import { Switch } from '@openvanta/calmon-react/switch'
import { Table, type RowId, type TableColumn } from '@openvanta/calmon-react/table'
import { Timeline, type TimelineEvent } from '@openvanta/calmon-react/timeline'
import { ToastProvider, useToast } from '@openvanta/calmon-react/toast'

/* ------------------------------------------------------------------ Scenario data (fictional) */

/** The screen starts at 14:32 UTC and then ticks, so it reads the same on every visit. */
const NOW = Date.UTC(2026, 10, 23, 14, 32)
const LOADED_AT = Date.now()
const screenNow = () => NOW + (Date.now() - LOADED_AT)
const at = (hh: number, mm: number, daysAgo = 0) => new Date(Date.UTC(2026, 10, 23 - daysAgo, hh, mm))

type Role = 'Owner' | 'Admin' | 'Editor' | 'Viewer'
type Status = 'Active' | 'Invited' | '2FA off' | 'Suspended'
type Member = { id: string; name: string; email: string; role: Role; status: Status; last: string }

const STATUS: Record<Status, Severity> = { Active: 'normal', Invited: 'info', '2FA off': 'caution', Suspended: 'critical' }
const MEMBERS: Member[] = [
  { id: 'priya', name: 'Priya Shah', email: 'priya@lumen.dev', role: 'Owner', status: 'Active', last: 'Now' },
  { id: 'arjun', name: 'Arjun Kumar', email: 'arjun@lumen.dev', role: 'Admin', status: 'Active', last: '12 min' },
  { id: 'ana', name: 'Ana Silva', email: 'ana@lumen.dev', role: 'Admin', status: 'Active', last: '3 h' },
  { id: 'lena', name: 'Lena Torres', email: 'lena@lumen.dev', role: 'Editor', status: 'Active', last: '2 h' },
  { id: 'noor', name: 'Noor Haddad', email: 'noor@lumen.dev', role: 'Editor', status: 'Active', last: '1 d' },
  { id: 'tom', name: 'Tom Baker', email: 'tom@lumen.dev', role: 'Editor', status: '2FA off', last: '3 d' },
  { id: 'jonas', name: 'Jonas Weber', email: 'jonas@lumen.dev', role: 'Viewer', status: 'Active', last: '5 d' },
  { id: 'mei', name: 'Mei Ong', email: 'mei@lumen.dev', role: 'Viewer', status: 'Invited', last: 'Never' },
  { id: 'dev', name: 'Dev Patel', email: 'dev@lumen.dev', role: 'Editor', status: 'Invited', last: 'Never' },
  { id: 'sam', name: 'Sam Okafor', email: 'sam@lumen.dev', role: 'Viewer', status: 'Suspended', last: '41 d' },
]

const AUDIT: TimelineEvent[] = [
  { id: 'a1', time: at(10, 42), severity: 'caution', icon: <LimitsIcon width={13} height={13} />, title: 'Rate limit raised to 1,200', description: 'Arjun Kumar: “Partner batch import this week.”', type: 'limits' },
  { id: 'a2', time: at(9, 15), severity: 'info', icon: <UserIcon width={13} height={13} />, title: 'Mei Ong invited as Viewer', actor: 'Priya Shah', type: 'members' },
  { id: 'a3', time: at(16, 3, 1), severity: 'critical', icon: <XIcon width={13} height={13} />, title: 'Sam Okafor suspended', description: 'After 40 days without activity.', actor: 'Priya Shah', type: 'members' },
  { id: 'a4', time: at(11, 20, 1), severity: 'normal', icon: <CheckIcon width={13} height={13} />, title: 'Two-factor required for admins', actor: 'Priya Shah', type: 'security' },
]

const VIEWS = [
  { id: 'members', label: 'Members', icon: <UserIcon /> },
  { id: 'limits', label: 'API and limits', icon: <LimitsIcon /> },
  { id: 'audit', label: 'Audit log', icon: <TimelineIcon /> },
] as const
type View = (typeof VIEWS)[number]['id']

const rank = (s: Severity) => ['normal', 'info', 'advisory', 'caution', 'critical'].indexOf(s)

/* ------------------------------------------------------------------ Small pieces */

/** On a narrow screen the side navigation moves into a menu. */
function NavMenu({ onPick }: { onPick: (id: string) => void }) {
  return (
    <Menu trigger={<IconButton variant="ghost" size="sm" label="Open navigation" icon={<GridIcon />} className="@3xl:hidden" />}>
      {VIEWS.map((v) => (
        <MenuItem key={v.id} icon={v.icon} onClick={() => onPick(v.id)}>
          {v.label}
        </MenuItem>
      ))}
      <MenuItem icon={<SettingsIcon />} onClick={() => onPick('preferences')}>
        Preferences
      </MenuItem>
    </Menu>
  )
}

/** The invite form. It lives inside the dialog, so it starts empty every time the dialog opens. */
function InviteForm({ onSend }: { onSend: (email: string, role: Role) => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Viewer')
  const [error, setError] = useState<string>()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Enter a full email address, like name@company.com.')
    onSend(email.trim(), role)
  }
  return (
    <form id="invite-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Email" required error={error} hint={error ? undefined : 'They get an invite that is valid for 7 days.'}>
        <Input
          type="email"
          value={email}
          placeholder="name@company.com"
          onChange={(e) => {
            setEmail(e.target.value)
            setError(undefined)
          }}
        />
      </Field>
      <Field label="Role">
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          options={(['Viewer', 'Editor', 'Admin'] as const).map((r) => ({ label: r, value: r }))}
        />
      </Field>
    </form>
  )
}

/* ------------------------------------------------------------------ The screen */

function Console() {
  const { toast } = useToast()
  const [view, setView] = useState<View>('members')
  const [members, setMembers] = useState(MEMBERS)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RowId[]>([])
  const [removing, setRemoving] = useState<Member[]>([])
  const [inviting, setInviting] = useState(false)
  const [reminded, setReminded] = useState(false)
  const [audit, setAudit] = useState(AUDIT)
  const [requireTwoFactor, setRequireTwoFactor] = useState(true)
  const [expiry, setExpiry] = useState('90')
  const [neverExpire, setNeverExpire] = useState(false)
  const [now, setNow] = useState(screenNow)
  const seq = useRef(0)
  useEffect(() => {
    const id = setInterval(() => setNow(screenNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  const noTwoFactor = members.filter((m) => m.status === '2FA off')
  const q = query.trim().toLowerCase()
  const shown = members.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q))

  const log = (e: Omit<TimelineEvent, 'id' | 'time'>) =>
    setAudit((a) => [{ id: `new-${++seq.current}`, time: new Date(screenNow()), actor: 'Priya Shah', ...e }, ...a])
  const soon = (label: string) =>
    toast({ severity: 'info', title: `${label} is not part of this example`, description: 'The docs show members, limits and the audit log.', duration: 3000 })
  const pick = (id: string) => (VIEWS.some((v) => v.id === id) ? setView(id as View) : soon('Preferences'))

  const changeRole = (m: Member, role: Role) => {
    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, role } : x)))
    log({ severity: 'normal', icon: <UserIcon width={13} height={13} />, title: `${m.name} is now ${role}`, type: 'members' })
    toast({ severity: 'normal', title: 'Role updated', description: `${m.name} is now ${role}.` })
  }

  const suspend = (list: Member[]) => {
    const ids = list.filter((m) => m.role !== 'Owner').map((m) => m.id)
    if (!ids.length) return toast({ severity: 'caution', title: 'The owner can’t be suspended', description: 'Transfer ownership first.' })
    setMembers((all) => all.map((x) => (ids.includes(x.id) ? { ...x, status: 'Suspended' } : x)))
    setSelected((s) => s.filter((id) => !ids.includes(String(id))))
    log({ severity: 'critical', icon: <XIcon width={13} height={13} />, title: ids.length === 1 ? `${list[0]!.name} suspended` : `${ids.length} members suspended`, type: 'members' })
    toast({ severity: 'caution', title: ids.length === 1 ? 'Member suspended' : `${ids.length} members suspended`, description: 'They are signed out and can’t sign in.' })
  }

  const reactivate = (m: Member) => {
    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, status: 'Active' } : x)))
    toast({ severity: 'normal', title: 'Member reactivated', description: `${m.name} can sign in again.` })
  }

  const remove = () => {
    const gone = removing
    setMembers((all) => all.filter((m) => !gone.includes(m)))
    setSelected((s) => s.filter((id) => !gone.some((m) => m.id === id)))
    log({ severity: 'critical', icon: <TrashIcon width={13} height={13} />, title: gone.length === 1 ? `${gone[0]!.name} removed` : `${gone.length} members removed`, type: 'members' })
    toast({
      severity: 'critical',
      title: gone.length === 1 ? `${gone[0]!.name} removed` : `${gone.length} members removed`,
      description: 'Access and API keys were revoked.',
      duration: 8000,
      action: { label: 'Undo', onClick: () => setMembers((all) => [...gone, ...all]) },
    })
  }

  const invite = (email: string, role: Role) => {
    const name = email.split('@')[0]!.replace(/^./, (c) => c.toUpperCase())
    setMembers((all) => [{ id: `invite-${email}`, name, email, role, status: 'Invited', last: 'Never' }, ...all])
    setInviting(false)
    log({ severity: 'info', icon: <UserIcon width={13} height={13} />, title: `${email} invited as ${role}`, type: 'members' })
    toast({ intent: 'primary', icon: <UserIcon />, title: 'Invite sent', description: `${email} can join as ${role}.` })
  }

  const columns: TableColumn<Member>[] = [
    {
      key: 'name',
      header: 'Name',
      rowHeader: true,
      sortable: true,
      accessor: (m) => (
        <span className="flex items-center gap-3 whitespace-nowrap">
          <Avatar name={m.name} />
          <span className="flex flex-col">
            <span>{m.name}</span>
            <span className="text-xs font-normal text-fg-muted">{m.email}</span>
          </span>
        </span>
      ),
      sortValue: (m) => m.name,
    },
    {
      key: 'role',
      header: 'Role',
      width: 140,
      accessor: (m) => (
        <Select
          size="sm"
          aria-label={`Role for ${m.name}`}
          value={m.role}
          disabled={m.role === 'Owner'}
          onChange={(e) => changeRole(m, e.target.value as Role)}
          options={(m.role === 'Owner' ? ['Owner'] : ['Admin', 'Editor', 'Viewer']).map((r) => ({ label: r, value: r }))}
        />
      ),
    },
    // Key `severity` with an accessor: a custom status cell that says "2FA off" or "Suspended", not just the severity word.
    {
      key: 'severity',
      header: 'Status',
      sortable: true,
      accessor: (m) => (m.status === 'Active' ? <Badge variant="dot" severity="normal">Active</Badge> : <Badge severity={STATUS[m.status]}>{m.status}</Badge>),
      sortValue: (m) => rank(STATUS[m.status]),
    },
    { key: 'last', header: 'Last active', numeric: true },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      width: 56,
      align: 'right',
      accessor: (m) => (
        <Menu align="end" trigger={<IconButton variant="ghost" size="sm" label={`Actions for ${m.name}`} icon={<MoreIcon />} />}>
          <MenuItem
            icon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard?.writeText(m.email).catch(() => {})
              toast({ severity: 'normal', title: 'Email copied', description: m.email, duration: 2500, solid: true })
            }}
          >
            Copy email
          </MenuItem>
          <MenuItem icon={<UserIcon />} onClick={() => toast({ severity: 'info', title: 'Password reset sent', description: `An email is on its way to ${m.email}.` })}>
            Send password reset
          </MenuItem>
          {m.status === 'Suspended' ? (
            <MenuItem icon={<CheckIcon />} onClick={() => reactivate(m)}>
              Reactivate
            </MenuItem>
          ) : (
            <MenuItem icon={<XIcon />} disabled={m.role === 'Owner'} onClick={() => suspend([m])}>
              Suspend
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} intent="danger" disabled={m.role === 'Owner'} onClick={() => setRemoving([m])}>
            Remove from workspace…
          </MenuItem>
        </Menu>
      ),
    },
  ]

  const selectedMembers = members.filter((m) => selected.includes(m.id))
  const sideNav = (collapsed: boolean) => (
    <SideNav aria-label="Workspace" collapsed={collapsed}>
      <SideNavGroup label="Workspace">
        {VIEWS.map((v) => (
          <SideNavItem
            key={v.id}
            icon={v.icon}
            active={view === v.id}
            badge={v.id === 'members' && noTwoFactor.length ? { severity: 'caution', count: noTwoFactor.length } : undefined}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </SideNavItem>
        ))}
      </SideNavGroup>
      <SideNavGroup label="Account">
        <SideNavItem icon={<SettingsIcon />} onClick={() => soon('Preferences')}>
          Preferences
        </SideNavItem>
      </SideNavGroup>
    </SideNav>
  )

  const title = VIEWS.find((v) => v.id === view)!.label
  const sub = view === 'members' ? `lumen-prod, ${members.length} members` : view === 'limits' ? 'Rate limits, keys and sign-in rules' : 'Everything that changed in lumen-prod, newest first'

  return (
    <div className="@container bg-surface text-fg">
      <div className="grid min-h-[680px] grid-cols-1 @3xl:grid-cols-[80px_minmax(0,1fr)] @5xl:grid-cols-[216px_minmax(0,1fr)]">
        <aside className="hidden flex-col border-r border-border bg-surface px-3 py-[18px] @3xl:flex">
          <div className="flex items-center justify-center gap-2.5 pb-4 font-semibold @5xl:justify-start @5xl:px-2">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent text-accent-on">
              <SettingsIcon />
            </span>
            <span className="hidden @5xl:inline">Lumen workspace</span>
          </div>
          <div className="@5xl:hidden">{sideNav(true)}</div>
          <div className="hidden @5xl:block">{sideNav(false)}</div>
          <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-border pt-3 text-ui-sm @5xl:justify-start @5xl:px-2">
            <Avatar name="Priya Shah" size="sm" status="online" />
            <div className="hidden @5xl:block">
              <div className="font-[550]">Priya Shah</div>
              <div className="text-xs text-fg-muted">Owner</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-raised px-5 py-3.5">
            <NavMenu onPick={pick} />
            <div className="min-w-0">
              <h3 className="text-lg">{title}</h3>
              <p className="text-ui-sm text-fg-muted">{sub}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <EnvironmentBadge env="prod" />
              <Button variant="primary" size="sm" iconStart={<PlusIcon />} onClick={() => setInviting(true)}>
                Invite member
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-4 p-4 @3xl:p-5">
            {view === 'members' ? (
              <>
                {noTwoFactor.length > 0 ? (
                  <Banner
                    severity="caution"
                    title={`${noTwoFactor.length} member${noTwoFactor.length === 1 ? ' has' : 's have'} two-factor authentication off`}
                    action={
                      reminded ? (
                        <Badge severity="info">Reminder sent</Badge>
                      ) : (
                        <Button
                          size="sm"
                          severity="caution"
                          onClick={() => {
                            setReminded(true)
                            log({ severity: 'info', icon: <UserIcon width={13} height={13} />, title: `2FA reminder sent to ${noTwoFactor[0]!.name}`, type: 'security' })
                            toast({ severity: 'info', title: 'Reminder sent', description: `${noTwoFactor[0]!.name} got an email with the steps to turn on two-factor.` })
                          }}
                        >
                          Remind {noTwoFactor[0]!.name.split(' ')[0]}
                        </Button>
                      )
                    }
                  >
                    {noTwoFactor[0]!.name} can still sign in with a password only. Require two-factor for everyone in API and limits.
                  </Banner>
                ) : null}

                <Card
                  as="h4"
                  title="Members"
                  action={
                    <Search
                      className="w-56"
                      placeholder="Search members"
                      value={query}
                      onValueChange={setQuery}
                      suggestions={(text) =>
                        members
                          .filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(text.trim().toLowerCase()))
                          .slice(0, 5)
                          .map((m) => ({ id: m.id, label: m.name, description: m.email }))
                      }
                    />
                  }
                >
                  <CardBody className="p-0">
                    <Table<Member>
                      aria-label="Members, needing attention first"
                      className="rounded-t-none border-0"
                      columns={columns}
                      data={shown}
                      getRowSeverity={(m) => STATUS[m.status]}
                      selectable
                      selected={selected}
                      onSelectedChange={setSelected}
                      rowLabel={(m) => m.name}
                      bulkActions={
                        <>
                          <Button size="sm" onClick={() => suspend(selectedMembers)}>
                            Suspend
                          </Button>
                          <Button size="sm" severity="critical" iconStart={<TrashIcon />} onClick={() => setRemoving(selectedMembers.filter((m) => m.role !== 'Owner'))}>
                            Remove…
                          </Button>
                        </>
                      }
                      empty={
                        <EmptyState
                          title={`No members match “${query}”`}
                          action={
                            <Button size="sm" onClick={() => setQuery('')}>
                              Clear search
                            </Button>
                          }
                        >
                          Check the spelling, or search by email.
                        </EmptyState>
                      }
                    />
                  </CardBody>
                </Card>
              </>
            ) : null}

            {view === 'limits' ? (
              <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2">
                <Card as="h4" title="Sign-in and keys">
                  <div className="flex flex-col gap-5">
                    <Switch
                      checked={requireTwoFactor}
                      onCheckedChange={(on) => {
                        setRequireTwoFactor(on)
                        log({ severity: on ? 'normal' : 'caution', icon: <CheckIcon width={13} height={13} />, title: `Two-factor ${on ? 'required' : 'no longer required'} for everyone`, type: 'security' })
                        toast({ severity: on ? 'normal' : 'caution', title: on ? 'Two-factor required' : 'Two-factor is optional again', description: on ? 'Members without it are asked to set it up at next sign-in.' : 'Accounts are protected by a password only.' })
                      }}
                    >
                      Require two-factor authentication
                    </Switch>
                    <Switch
                      checked={neverExpire}
                      onCheckedChange={(on) => {
                        setNeverExpire(on)
                        if (on) toast({ severity: 'caution', title: 'Keys without expiry allowed', description: 'A leaked key stays valid until someone revokes it.' })
                      }}
                    >
                      Allow API keys without expiry
                    </Switch>
                    <Field label="Default key expiry" hint={neverExpire ? 'Used when a key is created with an expiry.' : 'New keys stop working after this long.'}>
                      <Select
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        options={[
                          { label: '30 days', value: '30' },
                          { label: '90 days', value: '90' },
                          { label: '1 year', value: '365' },
                        ]}
                        className="max-w-48"
                      />
                    </Field>
                    <div>
                      <Button
                        variant="primary"
                        onClick={() => {
                          log({ severity: 'info', icon: <LimitsIcon width={13} height={13} />, title: `Default key expiry set to ${expiry} days`, type: 'limits' })
                          toast({ severity: 'normal', title: 'Saved', description: 'Key settings updated and recorded in the audit log.' })
                        }}
                      >
                        Save changes
                      </Button>
                    </div>
                  </div>
                </Card>
                <Card as="h4" title={<span className="text-critical-fg">Danger zone</span>} className="border-critical-border">
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="font-[550]">Delete workspace</div>
                      <p className="mt-0.5 text-ui-sm text-fg-muted">Removes lumen-prod, all members, API keys and 2 years of audit history. This can’t be undone.</p>
                    </div>
                    <div>
                      <ConfirmTarget
                        name="lumen-prod"
                        env="prod"
                        action="Delete workspace"
                        detail={`${members.length} members`}
                        description="Everyone loses access at once."
                        consequences={['All members are signed out.', 'API keys stop working immediately.', 'Audit history is deleted after 24 hours.']}
                        onConfirm={() => {
                          log({ severity: 'critical', icon: <TrashIcon width={13} height={13} />, title: 'Workspace deletion scheduled', description: 'lumen-prod will be deleted in 24 hours.', type: 'workspace' })
                          toast({ severity: 'critical', title: 'Deletion scheduled', description: 'lumen-prod will be deleted in 24 hours. Undo from Settings.' })
                        }}
                      >
                        <Button severity="critical" iconStart={<TrashIcon />}>
                          Delete workspace
                        </Button>
                      </ConfirmTarget>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {view === 'audit' ? (
              <Card
                as="h4"
                title="Audit log"
                action={
                  <Button size="sm" variant="ghost" onClick={() => toast({ severity: 'normal', title: 'Export started', description: 'audit-log.csv will be emailed to priya@lumen.dev.' })}>
                    Export
                  </Button>
                }
              >
                <div className="max-h-[520px] overflow-y-auto pr-1">
                  <Timeline events={audit} timeZone="UTC" now={now} />
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog
        open={inviting}
        onOpenChange={setInviting}
        title="Invite member"
        description="They join lumen-prod with the role you pick."
        footer={
          <>
            <Button onClick={() => setInviting(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="invite-form">
              Send invite
            </Button>
          </>
        }
      >
        <InviteForm onSend={invite} />
      </Dialog>

      <ConfirmTarget
        open={removing.length > 0}
        onOpenChange={(open) => {
          if (!open) setRemoving([])
        }}
        name={removing.length === 1 ? removing[0]!.email : `${removing.length} members`}
        env="prod"
        action={removing.length === 1 ? 'Remove member' : 'Remove members'}
        detail={removing.length === 1 ? removing[0]!.role : undefined}
        consequences={['They lose access to lumen-prod at once.', 'Their API keys are revoked.']}
        onConfirm={remove}
      />
    </div>
  )
}

export function AdminConsole() {
  return (
    <ToastProvider>
      <Console />
    </ToastProvider>
  )
}

export default AdminConsole
