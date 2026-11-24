#!/usr/bin/env node
// Bundle-size guard. Bundles each package entry point with esbuild (minified, tree-shaken, with
// react and the npm dependencies left external), then reports the gzip size. This is what an app
// that imports the entry actually pays for the library's own code, including sibling components
// the entry depends on (a Banner includes Button) but not unused icons.
//
// Needs `npm run build` first (reads packages/ui/dist).

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const uiDir = join(root, 'packages/ui')
const pkg = JSON.parse(readFileSync(join(uiDir, 'package.json'), 'utf8'))

const BUDGET_PER_COMPONENT_KB = 3
const BUDGET_TOTAL_KB = 42
// Per-entry overrides in KB, for components that are inherently larger or that include other
// components. Keep this list short and justified.
const OVERRIDES_KB = {
  table: 5,
  chart: 4,
  search: 5,
  'command-palette': 4,
  toast: 6, // includes Badge, ProgressBar, IconButton
  'number-input': 3.5,
  banner: 3.5, // includes Button, IconButton
  'health-score': 5, // includes Badge, Button
  'vital-tile': 4, // includes Badge, Sparkline
  'station-grid': 5, // includes VitalTile parts, Badge
  'limited-number-input': 5, // includes NumberInput
  'pause-point': 4.5, // includes Button, Checkbox
  'confirm-target': 6.5, // includes Dialog, Button, Banner, Input
}

const external = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/*',
  ...Object.keys(pkg.dependencies ?? {}),
]

let failed = false
const rows = []
for (const [key, value] of Object.entries(pkg.exports)) {
  if (typeof value !== 'object' || !value.import) continue
  const entry = join(uiDir, value.import)
  if (!existsSync(entry)) {
    console.error(`check-size: ${entry} not found. Run "npm run build" first.`)
    process.exit(1)
  }
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    external,
    logLevel: 'silent',
  })
  const size = gzipSync(result.outputFiles[0].contents).length
  const budgetKb = key === '.' ? BUDGET_TOTAL_KB : (OVERRIDES_KB[key.slice(2)] ?? BUDGET_PER_COMPONENT_KB)
  const ok = size <= budgetKb * 1024
  failed ||= !ok
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${key.padEnd(20)} ${(size / 1024).toFixed(2).padStart(6)} KB gz  (budget ${budgetKb} KB)`)
}
console.log(rows.join('\n'))
if (failed) process.exit(1)
