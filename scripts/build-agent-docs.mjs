#!/usr/bin/env node
// Generates the static, agent-readable docs served by the docs site (GitHub Pages):
//   /llms.txt                    index (llmstxt.org format)
//   /llms-full.txt               everything in one file
//   /components.json             machine-readable catalogue (props, examples, files)
//   /components/<name>.md        one doc per component, props + examples filled in
//   /source/<name>/<file>.tsx    raw component source, for copy-in
//   /AGENTS.snippet.md           paste into a consuming project's AGENTS.md
//
// Also validates that every component has its doc, examples, test and package export.
// Env: SITE_URL (e.g. https://user.github.io/pikore-ui) makes links absolute.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import docgen from 'react-docgen-typescript'
import { parseExamples, parseFrontmatter } from './lib/docs-parse.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const uiDir = join(root, 'packages/ui')
const srcDir = join(uiDir, 'src')
const outDir = join(root, 'apps/docs/public')
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')
const url = (p) => (siteUrl ? `${siteUrl}/${p}` : p)

const uiPkg = JSON.parse(readFileSync(join(uiDir, 'package.json'), 'utf8'))
const usage = readFileSync(join(root, 'docs/usage.md'), 'utf8')
  .split('\n')
  .filter((l) => !/^\s*<!--.*-->\s*$/.test(l)) // drop single-line HTML comments (not useful in agent docs)
  .join('\n')

const parser = docgen.withCustomConfig(join(uiDir, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // Keep only props declared in our own source, not the ~250 inherited DOM attributes.
  propFilter: (prop) => !prop.declarations?.every((d) => d.fileName.includes('node_modules')),
})

const errors = []
const dirs = readdirSync(srcDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !['lib', 'icons', 'provider'].includes(d.name))
  .map((d) => d.name)
  .sort()

const components = []
for (const slug of dirs) {
  const dir = join(srcDir, slug)
  const need = [`${slug}.tsx`, `${slug}.md`, `${slug}.examples.tsx`, `${slug}.test.tsx`, 'index.ts']
  const missing = need.filter((f) => !existsSync(join(dir, f)))
  if (missing.length) {
    errors.push(`src/${slug}: missing ${missing.join(', ')}`)
    continue
  }
  if (!uiPkg.exports[`./${slug}`]) errors.push(`src/${slug}: add "./${slug}" to packages/ui/package.json exports`)

  const { data, body } = parseFrontmatter(readFileSync(join(dir, `${slug}.md`), 'utf8'))
  for (const key of ['name', 'category', 'import', 'status', 'description']) {
    if (!data[key]) errors.push(`src/${slug}/${slug}.md: frontmatter is missing "${key}"`)
  }

  const examples = parseExamples(readFileSync(join(dir, `${slug}.examples.tsx`), 'utf8'))
  if (examples.length === 0) errors.push(`src/${slug}/${slug}.examples.tsx: no examples found (each example is an exported function with a one-line JSDoc comment; see button.examples.tsx)`)

  const doc = parser.parse(join(dir, `${slug}.tsx`)).find((d) => d.displayName === data.name)
  if (!doc) errors.push(`src/${slug}/${slug}.tsx: could not find component "${data.name}" for props`)
  const props = Object.values(doc?.props ?? {})
    .map((p) => ({
      name: p.name,
      type:
        p.type.name === 'enum' && Array.isArray(p.type.value)
          ? p.type.value.map((v) => v.value).join(' | ')
          : (p.type.raw ?? p.type.name),
      required: p.required,
      default: p.defaultValue?.value ?? null,
      description: p.description,
    }))
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))

  const files = readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !/\.(test|examples)\.tsx?$/.test(f))

  components.push({
    name: data.name,
    slug,
    category: data.category,
    principle: data.principle ?? null,
    status: data.status,
    import: data.import,
    description: data.description,
    related: data.related ?? [],
    docUrl: url(`components/${slug}.md`),
    sourceFiles: files.map((f) => url(`source/${slug}/${f}`)),
    props,
    examples,
    body,
  })
}

if (errors.length) {
  console.error(`build-agent-docs: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}

// ---------- render ----------

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')

function propsTable(props) {
  if (!props.length) return '_No props beyond standard HTML attributes._'
  const rows = props.map(
    (p) =>
      `| \`${p.name}\`${p.required ? ' (required)' : ''} | \`${esc(p.type)}\` | ${p.default != null ? `\`${esc(p.default)}\`` : ''} | ${esc(p.description)} |`,
  )
  return [
    '| Prop | Type | Default | Description |',
    '|---|---|---|---|',
    ...rows,
    '',
    'All other props are passed to the underlying HTML element.',
  ].join('\n')
}

function examplesMd(c) {
  return c.examples
    .map((e) => `### ${e.name}\n\n${e.description}\n\n\`\`\`tsx\nimport { ${c.name} } from '${c.import}'\n\n${e.code}\n\`\`\``)
    .join('\n\n')
}

function componentMd(c) {
  const header = [
    `# ${c.name}`,
    '',
    `> ${c.description}`,
    '',
    `- Import: \`import { ${c.name} } from '${c.import}'\``,
    `- Category: ${c.category} · Status: ${c.status}${c.principle ? ` · Principle: ${c.principle}` : ''}`,
    `- Source: ${c.sourceFiles.join(', ')}`,
    '',
  ].join('\n')
  return header + c.body.replace('<!-- props -->', propsTable(c.props)).replace('<!-- examples -->', examplesMd(c))
}

// Fresh output for generated folders only.
for (const d of ['components', 'source']) rmSync(join(outDir, d), { recursive: true, force: true })
mkdirSync(join(outDir, 'components'), { recursive: true })

for (const c of components) {
  writeFileSync(join(outDir, 'components', `${c.slug}.md`), componentMd(c))
  mkdirSync(join(outDir, 'source', c.slug), { recursive: true })
  for (const f of readdirSync(join(srcDir, c.slug))) {
    if (/\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f)) copyFileSync(join(srcDir, c.slug, f), join(outDir, 'source', c.slug, f))
  }
}
for (const shared of ['lib', 'icons', 'provider']) {
  mkdirSync(join(outDir, 'source', shared), { recursive: true })
  for (const f of readdirSync(join(srcDir, shared))) copyFileSync(join(srcDir, shared, f), join(outDir, 'source', shared, f))
}
copyFileSync(join(srcDir, 'styles.css'), join(outDir, 'source', 'styles.css'))

const intro = usage.split('\n## ')[0] // title + summary blockquote
const llms = [
  intro.trim(),
  '',
  'Read the setup and rules before writing UI, then read the doc for each component you use. Do not guess props.',
  '',
  '## Docs',
  '',
  `- [Setup and rules](${url('llms-full.txt')}): install, CSS setup, conventions, tokens, and every component doc in one file`,
  `- [Component catalogue (JSON)](${url('components.json')}): props, examples, import paths, source URLs`,
  `- [AGENTS.md snippet](${url('AGENTS.snippet.md')}): paste into your project's AGENTS.md or agent instructions file`,
  '',
  '## Components',
  '',
  ...components.map((c) => `- [${c.name}](${c.docUrl}): ${c.description}`),
  '',
].join('\n')

const full = [usage.trim(), '', ...components.map((c) => '\n---\n\n' + componentMd(c).trim()), ''].join('\n')

const snippet = [
  '## UI components: Pikore UI',
  '',
  `This project uses Pikore UI (\`@openvanta/pikore-react\`). Docs for agents: ${url('llms.txt')}`,
  '',
  '- Import per component: `import { Button } from \'@openvanta/pikore-react/button\'`.',
  '- Status is always `severity`: `normal | info | advisory | caution | critical`. Use tokens (`bg-critical`, `text-caution-fg`), never raw `red-*`/`amber-*`.',
  '- Colour is never the only signal; pair it with text.',
  '- Shared prop names: `variant`, `size`, `severity`, `value/defaultValue/onValueChange`, `open/defaultOpen/onOpenChange`.',
  `- Before using a component, read ${url('components/<name>.md')}. Do not guess props.`,
  '',
].join('\n')

const catalogue = {
  name: '@openvanta/pikore-react',
  version: uiPkg.version,
  generatedAt: new Date().toISOString(),
  severities: ['normal', 'info', 'advisory', 'caution', 'critical'],
  components: components.map(({ body, ...c }) => c),
}

writeFileSync(join(outDir, 'llms.txt'), llms)
writeFileSync(join(outDir, 'llms-full.txt'), full)
writeFileSync(join(outDir, 'AGENTS.snippet.md'), snippet)
writeFileSync(join(outDir, 'components.json'), JSON.stringify(catalogue, null, 2) + '\n')

console.log(
  `build-agent-docs: ${components.length} component(s) → ${relative(root, outDir)} ` +
    `(llms.txt, llms-full.txt ~${Math.round(full.length / 4 / 1000)}k tokens, components.json)`,
)
