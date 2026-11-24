// Collects every component's doc, live examples and example source straight from packages/ui/src.
import type { ComponentType } from 'react'
import { parseExamples, parseFrontmatter } from '../../../scripts/lib/docs-parse.mjs'

const docs = import.meta.glob<string>('../../../packages/ui/src/*/*.md', { query: '?raw', import: 'default', eager: true })
const exampleModules = import.meta.glob<Record<string, ComponentType>>('../../../packages/ui/src/*/*.examples.tsx', {
  eager: true,
})
const exampleSources = import.meta.glob<string>('../../../packages/ui/src/*/*.examples.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const indexSources = import.meta.glob<string>('../../../packages/ui/src/*/index.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export interface DocExample {
  name: string
  description: string
  /** The example function as written in the examples file. */
  code: string
  /** `code` preceded by the import lines it actually uses: what a reader copies. */
  fullCode: string
  Component: ComponentType
}

export interface DocEntry {
  slug: string
  name: string
  category: string
  description: string
  importPath: string
  status: string
  principle: string
  /** Names of related components (frontmatter `related`). */
  related: string[]
  /** Value exports of the component folder (components, hooks), for the import snippet. */
  exports: string[]
  body: string
  examples: DocExample[]
}

const slugOf = (path: string) => path.split('/').at(-2)!

/** Value exports of `index.ts` (type-only exports and `*Variants` helpers are left out). */
function valueExports(source: string): string[] {
  const names: string[] = []
  for (const block of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const part of block[1]!.split(',')) {
      const name = part.trim()
      if (!name || name.startsWith('type ') || /Variants$/.test(name)) continue
      names.push(name.split(/\s+as\s+/).at(-1)!)
    }
  }
  return names
}

/** The import statements of an examples file whose names the example code really uses. */
function importsUsedBy(code: string, source: string): string {
  const out: string[] = []
  for (const m of source.replace(/\r\n/g, '\n').matchAll(/^import\s+([\s\S]*?)\s+from\s+(['"][^'"]+['"])/gm)) {
    const clause = m[1]!
    if (/^type\s/.test(clause)) continue
    const used = (name: string) => new RegExp(String.raw`\b${name.replace(/^type\s+/, '')}\b`).test(code)
    const named = /\{([\s\S]*?)\}/.exec(clause)?.[1]
    if (named === undefined) {
      const def = clause.trim()
      if (used(def)) out.push(`import ${def} from ${m[2]}`)
      continue
    }
    const keep = named
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('type ') && used(s.split(/\s+as\s+/).at(-1)!))
    if (keep.length) out.push(`import { ${keep.join(', ')} } from ${m[2]}`)
  }
  return out.join('\n')
}

const asList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === 'string' && v ? [v] : [])

export const entries: DocEntry[] = Object.entries(docs)
  .map(([path, raw]) => {
    const slug = slugOf(path)
    const { data, body } = parseFrontmatter(raw)
    const exPath = path.replace(/\.md$/, '.examples.tsx')
    const mod = exampleModules[exPath] ?? {}
    const source = exampleSources[exPath] ?? ''
    const examples = parseExamples(source)
      .filter((e) => mod[e.name])
      .map((e) => {
        const imports = importsUsedBy(e.code, source)
        return { ...e, fullCode: imports ? `${imports}\n\n${e.code}` : e.code, Component: mod[e.name]! }
      })
    return {
      slug,
      name: String(data.name ?? slug),
      category: String(data.category ?? 'other'),
      description: String(data.description ?? ''),
      importPath: String(data.import ?? `@openvanta/calmon-react/${slug}`),
      status: String(data.status ?? 'beta'),
      principle: String(data.principle ?? 'none'),
      related: asList(data.related),
      exports: valueExports(indexSources[path.replace(/[^/]+$/, 'index.ts')] ?? ''),
      body,
      examples,
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
