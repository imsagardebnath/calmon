// The hero: the "New" pill, the headline, the pitch, two calls to action, the install command and the live monitor.
import { Badge } from '@openvanta/pikore-react/badge'
import { Button } from '@openvanta/pikore-react/button'
import { IconButton } from '@openvanta/pikore-react/icon-button'
import { CheckIcon, ChevronRightIcon, CopyIcon } from '@openvanta/pikore-react/icons'
import { INSTALL_COMMAND, VERSION } from '../../site/config.ts'
import { useCopy } from '../../site/hooks.ts'
import { docsHref } from '../../site/router.ts'
import { COMPONENT_COUNT } from './_data.ts'
import { Monitor } from './_monitor.tsx'

/** The design's `.announce`: a pill with a badge that links to the changelog. */
function Announce() {
  return (
    <a
      href={docsHref('changelog')}
      className="mb-6 inline-flex h-[30px] max-w-full items-center gap-2 rounded-full bg-surface-raised pr-3 pl-1 text-ui-sm text-fg-muted no-underline shadow-[0_0_0_1px_var(--border),var(--shadow-1)] transition-colors duration-(--duration-fast) hover:text-fg"
    >
      <Badge intent="primary" variant="solid" className="h-[22px]">
        New
      </Badge>
      <span className="truncate">
        v{VERSION}, the first release: {COMPONENT_COUNT} components
      </span>
      <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  )
}

/** `$ npm install @openvanta/pikore-react` with a copy button. */
function InstallCommand() {
  const { copied, copy } = useCopy()
  return (
    <div className="mt-5 flex w-full max-w-[26rem] items-center gap-2 rounded-[10px] bg-surface-sunken py-1 pr-1 pl-3.5 font-mono text-ui-sm shadow-[inset_0_0_0_1px_var(--border)]">
      <span aria-hidden="true" className="text-fg-subtle select-none">
        $
      </span>
      <code className="min-w-0 flex-1 truncate text-fg">{INSTALL_COMMAND}</code>
      <IconButton
        variant="ghost"
        size="sm"
        label={copied ? 'Copied' : 'Copy install command'}
        icon={copied ? <CheckIcon className="size-4 text-normal-fg" /> : <CopyIcon className="size-4" />}
        onClick={() => copy(INSTALL_COMMAND)}
      />
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden px-5 pt-12 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:pt-24">
      {/* The design's subtle grid, faded out towards the edges, and one soft accent glow behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[360px] w-[min(900px,100%)] -translate-x-1/2 rounded-full bg-accent/10 blur-[110px]"
      />

      <div className="relative mx-auto grid max-w-[1180px] items-end gap-8 min-[64rem]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] min-[64rem]:gap-12">
        <div>
          <Announce />
          <h1
            id="hero-title"
            className="max-w-[13ch] text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance"
          >
            Interfaces that stay calm when the system isn’t.
          </h1>
        </div>
        <div>
          <p className="max-w-[40ch] text-lg leading-[1.6] text-fg-muted">
            React and Tailwind components built on proven safety principles: fewer alarms, clear limits, and a short pause
            before anything risky.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild variant="primary" size="lg">
              <a href={docsHref('installation')}>Get started</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={docsHref('dashboards')}>See example dashboards</a>
            </Button>
          </div>
          <InstallCommand />
        </div>
      </div>

      <div className="relative">
        <Monitor />
      </div>
    </section>
  )
}
