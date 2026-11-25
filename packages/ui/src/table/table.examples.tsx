import { useState } from 'react'
import { Button } from '@openvanta/pikore-react/button'
import { IconButton } from '@openvanta/pikore-react/icon-button'
import { MoreIcon, TrashIcon } from '@openvanta/pikore-react/icons'
import { Table, type TableSort } from '@openvanta/pikore-react/table'

/** Rows with a severity are sorted worst first by default, marked with a left bar, and labelled with an icon and a word. */
export function WorstFirst() {
  const services = [
    { id: 'ledger', name: 'ledger', severity: 'normal', score: 95, p95: 61, errors: 0.01 },
    { id: 'payments-api', name: 'payments-api', severity: 'critical', score: 41, p95: 1240, errors: 4.2 },
    { id: 'auth-service', name: 'auth-service', severity: 'advisory', score: 77, p95: 96, errors: 0.02 },
    { id: 'checkout-web', name: 'checkout-web', severity: 'caution', score: 58, p95: 1800, errors: 0.61 },
  ] as const

  return (
    <div className="w-[40rem] max-w-full">
      <Table
        aria-label="Services"
        data={services}
        columns={[
          { key: 'name', header: 'Service', rowHeader: true, sortable: true },
          { key: 'score', header: 'Score', numeric: true, sortable: true },
          { key: 'p95', header: 'p95 (ms)', numeric: true, sortable: true },
          { key: 'errors', header: 'Errors', numeric: true, sortable: true, accessor: (s) => `${s.errors.toFixed(2)}%`, sortValue: (s) => s.errors },
        ]}
      />
    </div>
  )
}

/** Selectable rows get a checkbox column, select-all, and a bulk-actions bar that shows how many are selected. */
export function SelectableWithBulkActions() {
  const alerts = [
    { id: 'a1', title: 'Error rate above 4%', service: 'payments-api', severity: 'critical' },
    { id: 'a2', title: 'p95 latency above 1.2 s', service: 'checkout-web', severity: 'caution' },
    { id: 'a3', title: 'Replica lag 92 s', service: 'search-index', severity: 'caution' },
    { id: 'a4', title: 'CPU 78% and rising', service: 'auth-service', severity: 'advisory' },
  ] as const

  return (
    <div className="w-[40rem] max-w-full">
      <Table
        aria-label="Open alerts"
        selectable
        defaultSelected={['a1', 'a2']}
        data={alerts}
        columns={[
          { key: 'title', header: 'Alert', rowHeader: true },
          { key: 'service', header: 'Service' },
        ]}
        bulkActions={
          <>
            <Button variant="ghost" size="sm">
              Acknowledge
            </Button>
            <Button variant="primary" severity="critical" size="sm" iconStart={<TrashIcon />}>
              Delete…
            </Button>
          </>
        }
      />
    </div>
  )
}

/** Control the sort yourself with sort and onSortChange, for example to keep it in the URL. */
export function ControlledSort() {
  const [sort, setSort] = useState<TableSort | null>({ key: 'replicas', dir: 'desc' })
  const pools = [
    { name: 'web', region: 'eu-west-1', replicas: 12 },
    { name: 'workers', region: 'us-east-1', replicas: 30 },
    { name: 'cron', region: 'ap-south-1', replicas: 2 },
  ]

  return (
    <div className="w-[32rem] max-w-full">
      <Table
        aria-label="Pools"
        data={pools}
        getRowId={(p) => p.name}
        sort={sort}
        onSortChange={setSort}
        columns={[
          { key: 'name', header: 'Pool', rowHeader: true, sortable: true },
          { key: 'region', header: 'Region', sortable: true },
          { key: 'replicas', header: 'Replicas', numeric: true, sortable: true },
        ]}
      />
    </div>
  )
}

/** Compact rows are 32px, for dense admin screens. Without a density prop the table follows the page. A max height makes the rows scroll under a pinned header. */
export function Compact() {
  const regions = [
    { region: 'eu-west-1', services: 12, alerts: 3, rpm: '48,210' },
    { region: 'us-east-1', services: 14, alerts: 0, rpm: '61,904' },
    { region: 'ap-south-1', services: 9, alerts: 1, rpm: '22,380' },
    { region: 'eu-central-1', services: 7, alerts: 0, rpm: '17,052' },
    { region: 'us-west-2', services: 11, alerts: 2, rpm: '39,771' },
    { region: 'sa-east-1', services: 4, alerts: 0, rpm: '6,418' },
  ]

  return (
    <div className="w-[34rem] max-w-full">
      <Table
        aria-label="Regions"
        density="compact"
        className="max-h-40"
        data={regions}
        getRowId={(r) => r.region}
        columns={[
          { key: 'region', header: 'Region', rowHeader: true },
          { key: 'services', header: 'Services', numeric: true },
          { key: 'alerts', header: 'Alerts', numeric: true },
          { key: 'rpm', header: 'Requests/min', numeric: true },
        ]}
      />
    </div>
  )
}

/** Station density makes rows and type large enough to read from across the room. */
export function Station() {
  const hosts = [
    { id: 'db-1', name: 'db-1', severity: 'caution', load: '82%' },
    { id: 'api-3', name: 'api-3', severity: 'normal', load: '41%' },
  ] as const

  return (
    <div className="w-[34rem] max-w-full">
      <Table
        aria-label="Hosts"
        density="station"
        data={hosts}
        columns={[
          { key: 'name', header: 'Host', rowHeader: true },
          { key: 'load', header: 'Load', numeric: true },
        ]}
      />
    </div>
  )
}

/** Loading shows skeleton rows. Empty and error have built-in messages, or take your own content. */
export function LoadingEmptyAndError() {
  const columns = [
    { key: 'name', header: 'Service', rowHeader: true },
    { key: 'owner', header: 'Owner' },
  ]
  const none: { name: string; owner: string }[] = []

  return (
    <div className="flex w-[30rem] max-w-full flex-col gap-4">
      <Table aria-label="Loading services" columns={columns} data={none} loading />
      <Table aria-label="No services" columns={columns} data={none} />
      <Table
        aria-label="Services failed to load"
        columns={columns}
        data={none}
        error={
          <div role="alert" className="flex flex-col items-center gap-2">
            <p>Couldn’t load services.</p>
            <Button size="sm">Try again</Button>
          </div>
        }
      />
    </div>
  )
}

/** Put row menus in a column with a render function. Give each button a label that names its row. */
export function RowActions() {
  const keys = [
    { id: 'k1', name: 'ci-deploy', created: '12 Nov' },
    { id: 'k2', name: 'grafana-readonly', created: '2 Oct' },
  ]

  return (
    <div className="w-[30rem] max-w-full">
      <Table
        aria-label="API keys"
        data={keys}
        columns={[
          { key: 'name', header: 'Key', rowHeader: true },
          { key: 'created', header: 'Created' },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            width: 56,
            accessor: (k) => <IconButton variant="ghost" size="sm" label={`Actions for ${k.name}`} icon={<MoreIcon />} />,
          },
        ]}
      />
    </div>
  )
}
