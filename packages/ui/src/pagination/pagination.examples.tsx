import { Pagination } from '@openvanta/calmon-react/pagination'
import { useState } from 'react'

/** Shows the range and the total next to the page buttons. Uncontrolled: it keeps its own page. */
export function WithRange() {
  return <Pagination total={289} pageSize={25} />
}

/** Controlled: keep the page in your own state and load the matching rows. */
export function Controlled() {
  const [page, setPage] = useState(3)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-ui-sm text-fg-muted">Loading rows for page {page}.</p>
      <Pagination page={page} onPageChange={setPage} pageSize={25} total={312} />
    </div>
  )
}

/** Many pages collapse into a stable row of page numbers with ellipses. */
export function ManyPages() {
  return <Pagination defaultPage={50} pageSize={10} total={1200} />
}

/** A different page size changes the page count and the range. */
export function PageSize() {
  return <Pagination pageSize={100} total={289} />
}

/** A short list fits on one page, so the buttons stay disabled. The total is still shown. */
export function FewRows() {
  return <Pagination total={18} />
}
