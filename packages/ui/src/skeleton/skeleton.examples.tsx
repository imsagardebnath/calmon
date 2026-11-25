import { Skeleton } from '@openvanta/pikore-react/skeleton'

/** An avatar and two lines, in the shape of a list row. */
export function Row() {
  return (
    <div className="flex w-80 items-center gap-3">
      <Skeleton circle size={36} />
      <Skeleton lines={2} />
    </div>
  )
}

/** Several lines make a paragraph. The last two are shorter. */
export function Paragraph() {
  return (
    <div className="w-80">
      <Skeleton lines={4} />
    </div>
  )
}

/** A single bar. Set the height with `size`, and the width with a class. */
export function Block() {
  return (
    <div className="w-80">
      <Skeleton size={96} className="rounded-card" />
    </div>
  )
}

/** Skeletons are hidden from screen readers. Mark the loading container with aria-busy instead. */
export function Busy() {
  return (
    <section aria-busy="true" aria-label="Services" className="flex w-80 flex-col gap-3">
      <Skeleton className="w-1/3" />
      <Skeleton lines={3} />
    </section>
  )
}
