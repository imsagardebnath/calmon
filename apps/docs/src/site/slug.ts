/** "Don't use when" -> "dont-use-when". Used for heading anchors. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** "WithIcons" -> "With icons". Example function names become sentence-case titles. */
export function humanize(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

/** Straight apostrophes to typographic ones, for headings read by people. */
export const typo = (text: string) => text.replace(/'/g, '’')
