import { Breadcrumbs } from '@openvanta/pikore-react/breadcrumbs'

/** The last item is the current page. It has no link and is marked with aria-current. */
export function Path() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Production', href: '/' },
        { label: 'eu-west', href: '/eu-west' },
        { label: 'payments-api' },
      ]}
    />
  )
}

/** Start with the environment, so people always know where they are. */
export function WithEnvironment() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Production', href: '/production' },
        { label: 'Services', href: '/production/services' },
        { label: 'orders-api', href: '/production/services/orders-api' },
        { label: 'Deploys' },
      ]}
    />
  )
}

/** A path longer than maxItems keeps the first and last crumbs and collapses the middle. Activate the ellipsis to show them all. */
export function Collapsed() {
  return (
    <Breadcrumbs
      maxItems={4}
      items={[
        { label: 'Production', href: '/' },
        { label: 'eu-west', href: '/eu-west' },
        { label: 'Clusters', href: '/eu-west/clusters' },
        { label: 'blue', href: '/eu-west/clusters/blue' },
        { label: 'Services', href: '/eu-west/clusters/blue/services' },
        { label: 'payments-api' },
      ]}
    />
  )
}

/** A level without a page of its own is plain text. */
export function WithoutLinks() {
  return (
    <Breadcrumbs
      aria-label="You are here"
      items={[{ label: 'Production', href: '/' }, { label: 'Reports' }, { label: 'Weekly summary' }]}
    />
  )
}
