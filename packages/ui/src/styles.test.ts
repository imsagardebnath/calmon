import { describe, expect, it } from 'vitest'

/*
 * Vitest swaps stylesheets for empty modules, so these tests read the files with Node directly. The
 * specifiers are cast so the type checker does not need Node's types (the package only depends on Vitest's).
 */
const { readFileSync } = (await import('node:fs' as string)) as { readFileSync(path: string, encoding: 'utf8'): string }
const { dirname, join } = (await import('node:path' as string)) as { dirname(p: string): string; join(...p: string[]): string }
const { fileURLToPath } = (await import('node:url' as string)) as { fileURLToPath(url: string): string }
const { createRequire } = (await import('node:module' as string)) as { createRequire(url: string): { resolve(id: string): string } }

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const tailwindTheme = readFileSync(join(dirname(createRequire(import.meta.url).resolve('tailwindcss/package.json')), 'theme.css'), 'utf8')

/** The bodies of every top-level rule whose selector list is exactly `selector` (compared without spaces). */
function rulesFor(selector: string): string[] {
  const out: string[] = []
  for (const m of css.matchAll(/(^|\})\s*([^{}@]+)\{([^{}]*)\}/g)) {
    const selectors = m[2]!.split(',').map((s: string) => s.trim())
    if (selectors.join(',') === selector) out.push(m[3]!)
  }
  return out
}

const declared = (body: string) => [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()] as const)

describe('intent aliases', () => {
  const ALIASES = { primary: 'accent', secondary: null, success: 'normal', warning: 'caution', danger: 'critical' }
  const ROLES = ['', '-on', '-soft', '-fg', '-border']
  const scopes = rulesFor(':root,.dark,[data-theme="dark"]')

  it('are declared on :root and on the dark scopes, so a nested dark container resolves them again', () => {
    expect(scopes).toHaveLength(1)
    const names = declared(scopes[0]!).map(([name]) => name)
    for (const intent of Object.keys(ALIASES)) {
      for (const role of ROLES) expect(names, `--${intent}${role}`).toContain(`--${intent}${role}`)
    }
  })

  it('point at the severity palette with var()', () => {
    const map = Object.fromEntries(declared(scopes[0]!))
    for (const [intent, family] of Object.entries(ALIASES)) {
      if (!family) continue
      for (const role of ROLES) expect(map[`--${intent}${role}`]).toBe(`var(--${family}${role})`)
    }
  })

  it('are not left behind in the :root-only rule', () => {
    const rootOnly = rulesFor(':root').flatMap(declared).map(([name]) => name)
    expect(rootOnly).not.toContain('--danger')
    expect(rootOnly).not.toContain('--primary-soft')
  })
})

describe('token names', () => {
  const tailwindNames = new Set([...tailwindTheme.matchAll(/^\s*--([\w-]+)\s*:/gm)].map((m) => `--${m[1]}`))

  // Everything declared before the @theme block is plain CSS on :root, .dark or a data-tone selector, which
  // beats Tailwind's own (layered) theme variables. A shared name would change Tailwind's utilities app-wide.
  const plain = css.slice(0, css.indexOf('@theme inline'))
  const plainNames = [...new Set(declared(plain).map(([name]) => name))]

  it('does not redefine Tailwind theme variables, apart from the font families', () => {
    expect(plainNames.length).toBeGreaterThan(100)
    const shared = plainNames.filter((name) => tailwindNames.has(name))
    expect(shared.sort()).toEqual(['--font-mono', '--font-sans'])
  })

  it('keeps the design type scale and easing under their own names', () => {
    for (const name of ['--fs-xs', '--fs-sm', '--fs-md', '--fs-lg', '--fs-xl', '--fs-2xl', '--fs-3xl', '--ease-pikore-curve']) {
      expect(plainNames, name).toContain(name)
    }
    for (const name of ['--text-sm', '--text-xl', '--text-2xl', '--text-3xl', '--ease-out']) {
      expect(plainNames, name).not.toContain(name)
    }
  })

  it('feeds the density variables and the text-ui utilities from the same scale', () => {
    expect(css).toContain('--btn-fs: var(--fs-md)')
    expect(css).toContain('--control-fs: var(--fs-sm)')
    expect(css).toContain('--text-ui: var(--fs-md)')
    expect(css).toContain('--text-ui-sm: var(--fs-sm)')
    expect(css).toContain('--ease-pikore: var(--ease-pikore-curve)')
  })
})
