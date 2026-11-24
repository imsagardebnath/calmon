// Small helpers shared by the landing sections. Kept apart from the component files so React Fast Refresh keeps working.
import { docsHref } from '../../site/router.ts'
import { pages } from '../../site/pages.ts'

/** Joins class names, skipping anything falsy. (No conflict resolution: do not pass two classes for the same property.) */
export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

/** Docs route of a component. Two components share a slug with a safety pattern and live at "<slug>-component". */
export function componentHref(slug: string): string {
  const page = pages.find((p) => p.entry?.slug === slug)
  return docsHref(page?.id ?? slug)
}
