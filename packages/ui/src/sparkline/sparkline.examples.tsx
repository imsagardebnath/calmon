import { Sparkline } from '@calmon/react/sparkline'

/** The line stretches to the width of its container. Give it a width with the parent. */
export function Basic() {
  return (
    <div className="w-56">
      <Sparkline data={[20, 22, 21, 24, 22, 23, 25, 22, 21, 23, 24, 22]} />
    </div>
  )
}

/** A threshold draws a dashed line. The parts of the line above it use the severity colour. */
export function WithThreshold() {
  const latency = [30, 32, 31, 35, 38, 42, 41, 46, 49, 52, 55, 58]

  return (
    <div className="w-56">
      <Sparkline data={latency} threshold={45} severity="caution" />
    </div>
  )
}

/** Use critical for a limit that must not be crossed. The latest point is also coloured when it is over. */
export function CriticalLimit() {
  return (
    <div className="w-56">
      <Sparkline data={[2, 2, 3, 2, 3, 5, 8, 12, 18, 24, 31, 42]} threshold={20} severity="critical" />
    </div>
  )
}

/** The area option fills under the line with a soft gradient. */
export function Area() {
  return (
    <div className="w-56">
      <Sparkline data={[10, 14, 12, 18, 22, 19, 26, 24, 28, 25, 30, 33]} area />
    </div>
  )
}

/** Height is in pixels. Pair the trend with its current value, so the number is never missing. */
export function BesideTheValue() {
  const latency = [30, 32, 31, 35, 38, 42, 41, 46, 49, 52, 55, 58]

  return (
    <div className="flex w-72 items-center gap-4">
      <span className="num text-numeral-md">58 ms</span>
      <div className="min-w-0 flex-1">
        <Sparkline data={latency} threshold={45} severity="caution" height={40} area />
      </div>
    </div>
  )
}

/** The accessible label is generated from the data. Pass aria-label when you can say more. */
export function CustomLabel() {
  const latency = [30, 32, 31, 35, 38, 42, 41, 46, 49, 52, 55, 58]

  return (
    <div className="w-56">
      <Sparkline data={latency} aria-label="p95 latency over the last hour, rising from 30 to 58 ms" />
    </div>
  )
}
