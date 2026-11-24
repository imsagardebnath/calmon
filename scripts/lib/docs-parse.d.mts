export interface Frontmatter {
  data: Record<string, string | string[]>
  body: string
}
export interface ParsedExample {
  name: string
  description: string
  code: string
}
export function parseFrontmatter(text: string): Frontmatter
export function parseExamples(source: string): ParsedExample[]
export function toKebab(name: string): string
