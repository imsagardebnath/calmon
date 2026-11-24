import { useState } from 'react'
import { Search } from '@openvanta/calmon-react/search'
import { SeverityIcon, UserIcon } from '@openvanta/calmon-react/icons'

/** Live suggestions grouped by type, with recent searches on focus. Press / to focus the field. */
export function LiveSuggestions() {
  const index = [
    { label: 'payments-api', description: 'Caution, score 71', type: 'Services', icon: <SeverityIcon severity="caution" />, severity: 'caution' as const },
    { label: 'checkout-web', description: 'Normal, score 96', type: 'Services', icon: <SeverityIcon severity="normal" />, severity: 'normal' as const },
    { label: 'search-index', description: 'Critical, score 38', type: 'Services', icon: <SeverityIcon severity="critical" />, severity: 'critical' as const },
    { label: 'R. Iyer', description: 'Payments, on call', type: 'People', icon: <UserIcon /> },
    { label: 'A. Kaur', description: 'Platform SRE', type: 'People', icon: <UserIcon /> },
    { label: 'INC-2041 Payments failing in eu-west', description: 'Critical', type: 'Incidents', icon: <SeverityIcon severity="critical" />, severity: 'critical' as const },
  ]
  const [recent, setRecent] = useState([index[0]!, index[4]!])
  return (
    <Search
      placeholder="Search services, people, incidents"
      shortcut="/"
      suggestions={(q) =>
        index.filter((x) => `${x.label} ${x.description}`.toLowerCase().includes(q.trim().toLowerCase()))
      }
      groupBy="type"
      recent={recent}
      onClearRecent={() => setRecent([])}
      onSelect={(item) => setRecent([item, ...recent.filter((r) => r.label !== item.label)].slice(0, 4))}
    />
  )
}

/** Suggestions can come from a Promise. The spinner shows while it is pending, and late answers are ignored. */
export function AsyncSuggestions() {
  const names = ['payments-api', 'payments-worker', 'checkout-web', 'ledger-db']
  return (
    <Search
      placeholder="Search services"
      suggestions={async (q) => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return names.filter((n) => n.includes(q.trim().toLowerCase())).map((label) => ({ label }))
      }}
    />
  )
}

/** Sizes are 30, 38 and 46px, and the shape can be a pill. When size is unset, the field follows the page density. */
export function SizesAndShapes() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      <Search size="sm" />
      <Search shortcut="/" placeholder="Search services" />
      <Search size="lg" shape="pill" placeholder="Search the docs" />
    </div>
  )
}

/** A typed query shows the clear button, loading shows the spinner, and disabled blocks input. */
export function States() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      <Search defaultValue="payments" placeholder="Search services" />
      <Search loading defaultValue="checkout" placeholder="Search deploys" />
      <Search disabled placeholder="Search is unavailable while offline" />
    </div>
  )
}

/** Scopes are filter chips under the field. Use them to filter a list you already have. */
export function Scoped() {
  const services = [
    { name: 'payments-api', severity: 'Critical' },
    { name: 'checkout-web', severity: 'Caution' },
    { name: 'search-index', severity: 'Caution' },
    { name: 'ledger-db', severity: 'Normal' },
  ]
  const scopes = ['All', 'Critical', 'Caution', 'Normal']
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('All')
  const shown = services.filter(
    (s) => (scope === 'All' || s.severity === scope) && s.name.includes(query.trim().toLowerCase()),
  )
  return (
    <div className="w-full max-w-[520px]">
      <Search
        className="max-w-none"
        placeholder="Filter services"
        scopes={scopes}
        onValueChange={setQuery}
        onScopeChange={setScope}
      />
      <p className="mt-2.5 text-ui-sm text-fg-muted" aria-live="polite">
        {shown.length} of {services.length} services
      </p>
      <ul className="mt-2 text-ui-sm">
        {shown.map((s) => (
          <li key={s.name}>
            {s.name}, {s.severity}
          </li>
        ))}
      </ul>
    </div>
  )
}
