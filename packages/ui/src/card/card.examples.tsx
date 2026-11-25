import { Button } from '@openvanta/pikore-react/button'
import { Card, CardBody, CardFooter, CardHeader } from '@openvanta/pikore-react/card'
import { CautionIcon, NormalIcon, PulseIcon } from '@openvanta/pikore-react/icons'

/** A title, a status on the right and a short body. Keep one topic per card. */
export function Panel() {
  return (
    <div className="w-85">
      <Card
        title="On call"
        action={
          <span className="inline-flex items-center gap-1 text-xs font-medium text-normal-fg">
            <NormalIcon />
            Covered
          </span>
        }
      >
        <p className="text-ui-sm text-fg-muted">R. Iyer until 18:00, then A. Kaur.</p>
      </Card>
    </div>
  )
}

/** The footer holds the actions for the whole card, aligned to the right. */
export function WithFooter() {
  return (
    <div className="w-96">
      <Card
        title="checkout-api"
        action={
          <span className="inline-flex items-center gap-1 text-xs font-medium text-advisory-fg">
            <CautionIcon />
            Advisory
          </span>
        }
        footer={
          <>
            <Button variant="ghost" size="sm">
              Acknowledge
            </Button>
            <Button size="sm">Open timeline</Button>
          </>
        }
      >
        <p className="text-ui-sm leading-[1.55] text-fg-muted">
          p95 latency drifted above baseline 14 minutes ago. No user-facing errors yet.
        </p>
      </Card>
    </div>
  )
}

/** Without a title the card is only a surface. Use it to frame a figure or a list. */
export function Plain() {
  return (
    <div className="w-72">
      <Card>
        <p className="text-ui-sm text-fg-muted">Nothing needs attention right now.</p>
      </Card>
    </div>
  )
}

/** `as` sets the heading level of the title so the page outline stays correct. It does not change the look. */
export function HeadingLevel() {
  return (
    <div className="w-72">
      <Card as="h2" title="Deploys today">
        <p className="num text-numeral-sm">14</p>
      </Card>
    </div>
  )
}

/** For a custom header, compose CardHeader, CardBody and CardFooter yourself. */
export function Composed() {
  return (
    <div className="w-96">
      <Card>
        <CardHeader>
          <PulseIcon className="text-accent-fg" />
          <h3 className="text-ui font-semibold">orders-api</h3>
        </CardHeader>
        <CardBody>
          <p className="text-ui-sm text-fg-muted">All vitals are in range.</p>
        </CardBody>
        <CardFooter>
          <Button variant="ghost" size="sm">
            View history
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
