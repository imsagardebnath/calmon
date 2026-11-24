// Reads the design tokens at runtime so the Foundations pages never drift from packages/ui/src/styles.css.
// Light and dark values come from the loaded stylesheets (both themes at once); the "live" value of a token
// comes from getComputedStyle, so it follows whatever theme the page is in right now.
// Underscore files are not routes.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

export type TokenMap = Record<string, string>

export interface ThemeTokens {
  /** Declarations in `:root` as written (may contain var() references), in source order. */
  lightRaw: TokenMap
  /** Declarations in `.dark` as written: only the tokens dark mode overrides. */
  darkRaw: TokenMap
  /** Light values with every var() resolved. */
  light: TokenMap
  /** Dark values with every var() resolved (tokens dark does not override keep their light value). */
  dark: TokenMap
  /** Tokens declared by the app's own stylesheets that no group in TOKEN_GROUPS lists (so new tokens still show up). */
  unlisted: string[]
}

/* ------------------------------------------------------------------------------------------------
 * Token catalogue: the names the docs show, grouped. Values are never written here.
 * ---------------------------------------------------------------------------------------------- */

export const FAMILIES = ['accent', 'normal', 'info', 'advisory', 'caution', 'critical'] as const
export type Family = (typeof FAMILIES)[number]
export const ROLES = ['', '-on', '-soft', '-fg', '-border'] as const

export const NEUTRALS: { name: string; use: string }[] = [
  { name: 'surface', use: 'Page background' },
  { name: 'surface-raised', use: 'Cards, inputs, popovers' },
  { name: 'surface-sunken', use: 'Wells, table heads, code' },
  { name: 'border', use: 'Default 1px borders' },
  { name: 'border-strong', use: 'Control borders, dividers that matter' },
  { name: 'fg', use: 'Primary text' },
  { name: 'fg-muted', use: 'Secondary text' },
  { name: 'fg-subtle', use: 'Captions, placeholders' },
  { name: 'ring', use: 'Focus ring' },
]

const family = (f: Family) => ROLES.map((r) => `--${f}${r}`)
const intent = (a: string) => ROLES.map((r) => `--${a}${r}`)

export interface TokenGroup {
  id: string
  title: string
  blurb: string
  /** Comment printed above the group in the copyable CSS. */
  comment: string
  names: string[]
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    id: 'neutrals',
    title: 'Neutrals',
    blurb: 'Surfaces, borders and text. Everything that is not a status or the accent.',
    comment: 'Neutrals',
    names: NEUTRALS.map((n) => `--${n.name}`),
  },
  { id: 'accent', title: 'Accent', blurb: 'The brand teal: actions, selection, focus. Never a status.', comment: 'Accent (brand teal)', names: family('accent') },
  { id: 'normal', title: 'Normal', blurb: 'Everything is in range. Also the success intent.', comment: 'Severity: normal', names: family('normal') },
  { id: 'info', title: 'Info', blurb: 'Neutral notices and queued work. Never used for a score.', comment: 'Severity: info', names: family('info') },
  { id: 'advisory', title: 'Advisory', blurb: 'Worth a look, no action yet.', comment: 'Severity: advisory', names: family('advisory') },
  { id: 'caution', title: 'Caution', blurb: 'Needs action soon. Also the warning intent and soft limits.', comment: 'Severity: caution', names: family('caution') },
  { id: 'critical', title: 'Critical', blurb: 'Act now. Also the danger intent, destructive actions and hard limits.', comment: 'Severity: critical', names: family('critical') },
  {
    id: 'intent-aliases',
    title: 'Intent aliases',
    blurb: 'Familiar colour names that point at the tokens above. Components accept either name.',
    comment: 'Intent aliases: familiar names mapped onto the severity scale',
    names: ['primary', 'secondary', 'success', 'warning', 'danger'].flatMap(intent),
  },
  { id: 'radius', title: 'Radius', blurb: 'Two corner radii and a pill.', comment: 'Radius', names: ['--radius-control', '--radius-card', '--radius-pill'] },
  { id: 'shadows', title: 'Shadows', blurb: 'Soft and layered; deeper in dark mode.', comment: 'Shadows', names: ['--shadow-1', '--shadow-2', '--shadow-3'] },
  {
    id: 'type',
    title: 'Type',
    blurb: 'Families, the size scale, line heights and numerals.',
    comment: 'Typography',
    names: [
      '--font-sans',
      '--font-mono',
      '--fs-xs',
      '--fs-sm',
      '--fs-md',
      '--fs-lg',
      '--fs-xl',
      '--fs-2xl',
      '--fs-3xl',
      '--leading-ui',
      '--leading-prose',
      '--numeral-sm',
      '--numeral-md',
      '--numeral-lg',
      '--numeral-xl',
      '--numeral-weight',
    ],
  },
  {
    id: 'spacing',
    title: 'Spacing',
    blurb: 'A 4px base.',
    comment: 'Spacing (4px base)',
    names: ['--space-0', ...[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24].map((n) => `--space-${n}`)],
  },
  {
    id: 'motion',
    title: 'Motion',
    blurb: 'Three durations and one easing. All durations are 0 under reduced motion.',
    comment: 'Motion',
    names: ['--duration-fast', '--duration-base', '--duration-slow', '--ease-calmon-curve'],
  },
  { id: 'focus', title: 'Focus', blurb: 'One ring for every focusable thing.', comment: 'Focus ring', names: ['--ring-width', '--ring-offset'] },
  {
    id: 'density',
    title: 'Density',
    blurb: 'Read by Button, Input, Select and the other controls. Override per container with data-density.',
    comment: 'Density (comfortable is the default; see data-density)',
    names: ['--btn-h', '--btn-px', '--btn-fs', '--btn-radius', '--control-h', '--control-fs', '--control-px'],
  },
]

/** Every token name the docs read. Used to probe the page when the stylesheet cannot be read. */
export const ALL_TOKEN_NAMES: string[] = [...new Set(TOKEN_GROUPS.flatMap((g) => g.names))]

/* ------------------------------------------------------------------------------------------------
 * Reading tokens from the page
 * ---------------------------------------------------------------------------------------------- */

const isRootSelector = (s: string) => s === ':root' || s === ':host' || s === 'html'
const isDarkSelector = (s: string) =>
  s === '.dark' || s === 'html.dark' || s === ':root.dark' || s === '[data-theme="dark"]' || s === '[data-theme=dark]'

interface Acc {
  light: TokenMap
  dark: TokenMap
}

function addRule(rule: CSSStyleRule, acc: Acc) {
  const selectors = rule.selectorText.split(',').map((s) => s.trim())
  const light = selectors.some(isRootSelector)
  const dark = selectors.some(isDarkSelector)
  if (!light && !dark) return
  const style = rule.style
  for (let i = 0; i < style.length; i++) {
    const name = style[i]
    if (!name || !name.startsWith('--')) continue
    const value = style.getPropertyValue(name).trim()
    if (light) acc.light[name] = value
    if (dark) acc.dark[name] = value
  }
}

/**
 * Walk a rule list. Unlayered rules win over layered ones, as in the browser. `@media` blocks are skipped on
 * purpose: the prefers-reduced-motion override of the durations is not the token's value.
 */
function walk(rules: CSSRuleList, top: Acc, layered: Acc, inLayer: boolean) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      addRule(rule, inLayer ? layered : top)
    } else if (rule instanceof CSSMediaRule) {
      continue
    } else if ('cssRules' in rule) {
      const kind = rule.constructor.name
      if (kind === 'CSSLayerBlockRule') walk((rule as CSSGroupingRule).cssRules, top, layered, true)
      else if (kind === 'CSSSupportsRule') walk((rule as CSSGroupingRule).cssRules, top, layered, inLayer)
    }
  }
}

function resolveVars(value: string, map: TokenMap, depth = 0): string {
  if (depth > 8) return value
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (whole, name: string, fallback?: string) => {
    const found = map[name] ?? fallback
    return found === undefined ? whole : resolveVars(found.trim(), map, depth + 1)
  })
}

function resolveAll(raw: TokenMap, scope: TokenMap): TokenMap {
  const out: TokenMap = {}
  for (const [k, v] of Object.entries(raw)) out[k] = resolveVars(v, scope)
  return out
}

/** Both themes from the loaded stylesheets. Returns null when no stylesheet can be read. */
function readFromStylesheets(): ThemeTokens | null {
  const top: Acc = { light: {}, dark: {} }
  const layered: Acc = { light: {}, dark: {} }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, top, layered, false)
    } catch {
      // A cross-origin sheet cannot be read. The tokens live in a same-origin sheet, so keep going.
    }
  }
  const lightRaw = { ...layered.light, ...top.light }
  const darkRaw = { ...layered.dark, ...top.dark }
  if (!lightRaw['--surface'] || !darkRaw['--surface']) return null
  const light = resolveAll(lightRaw, lightRaw)
  const dark = resolveAll({ ...lightRaw, ...darkRaw }, { ...lightRaw, ...darkRaw })
  // Unlayered rules are the library's and the app's own tokens; layered ones are Tailwind's generated theme.
  const own = [...new Set([...Object.keys(top.light), ...Object.keys(top.dark)])]
  const unlisted = own.filter((n) => !ALL_TOKEN_NAMES.includes(n) && !n.startsWith('--tw-') && !n.startsWith('--color-'))
  return { lightRaw, darkRaw, light, dark, unlisted }
}

/** Fallback: ask the browser. Dark comes from a probe with the `dark` class; light is the page itself unless the page is dark. */
function readFromProbes(): ThemeTokens {
  const read = (el: Element) => {
    const cs = getComputedStyle(el)
    const out: TokenMap = {}
    for (const n of ALL_TOKEN_NAMES) out[n] = cs.getPropertyValue(n).trim()
    return out
  }
  const probe = document.createElement('div')
  probe.className = 'dark'
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const dark = read(probe)
  probe.remove()
  const light = isDarkNow() ? dark : read(document.documentElement)
  return { lightRaw: light, darkRaw: dark, light, dark, unlisted: [] }
}

/** Light and dark token values, read once after mount. `null` until then. */
export function useThemeTokens(): ThemeTokens | null {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null)
  useEffect(() => {
    setTokens(readFromStylesheets() ?? readFromProbes())
  }, [])
  return tokens
}

/* ------------------------------------------------------------------------------------------------
 * The current theme, live
 * ---------------------------------------------------------------------------------------------- */

export function isDarkNow(): boolean {
  const root = document.documentElement
  return root.classList.contains('dark') || root.dataset.theme === 'dark'
}

let version = 0
const listeners = new Set<() => void>()
let observer: MutationObserver | null = null

function subscribe(fn: () => void) {
  listeners.add(fn)
  if (!observer) {
    // One observer for the whole page: any change to the class, data-theme or inline style of <html>
    // (the theme toggle, a theme override) bumps the version.
    observer = new MutationObserver(() => {
      version++
      listeners.forEach((l) => l())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0) {
      observer?.disconnect()
      observer = null
    }
  }
}

/** A number that changes whenever the theme (class or data-theme on <html>) changes. Use it to recompute live values. */
export function useThemeVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  )
}

/** Is the page in dark mode right now? Updates when the theme changes. */
export function useIsDark(): boolean {
  useThemeVersion()
  return typeof document === 'undefined' ? false : isDarkNow()
}

/** Read one token as the browser computes it for the current theme. */
export function readLive(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** `live('--accent')`: the current computed value. The function changes identity with the theme, so memos and effects re-run. */
export function useLive(): (name: string) => string {
  const v = useThemeVersion()
  // The version is the dependency on purpose: readLive itself never changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((name: string) => readLive(name), [v])
}

export const DENSITY_IDS = ['comfortable', 'compact', 'station'] as const
export type DensityId = (typeof DENSITY_IDS)[number]

/**
 * Computed values of CSS variables inside each density (`data-density` on a container), read from the browser.
 * Empty until mounted.
 */
export function useDensityValues(names: readonly string[]): Partial<Record<DensityId, TokenMap>> {
  const [values, setValues] = useState<Partial<Record<DensityId, TokenMap>>>({})
  const key = names.join(',')
  useEffect(() => {
    const out: Partial<Record<DensityId, TokenMap>> = {}
    for (const id of DENSITY_IDS) {
      const probe = document.createElement('div')
      probe.hidden = true
      probe.dataset.density = id
      document.body.appendChild(probe)
      const cs = getComputedStyle(probe)
      out[id] = Object.fromEntries(key.split(',').map((n) => [n, cs.getPropertyValue(n).trim()]))
      probe.remove()
    }
    setValues(out)
  }, [key])
  return values
}

/** True when the visitor asks for reduced motion. Updates live. */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/* ------------------------------------------------------------------------------------------------
 * Colour maths (WCAG 2.x)
 * ---------------------------------------------------------------------------------------------- */

export type RGB = [number, number, number]

let canvas: CanvasRenderingContext2D | null | undefined

function parseViaCanvas(input: string): RGB | null {
  if (canvas === undefined) canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const ctx = canvas
  if (!ctx) return null
  const paint = (seed: string) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = seed
    ctx.fillStyle = input // an invalid colour is ignored, so the seed stays
    ctx.fillRect(0, 0, 1, 1)
    return Array.from(ctx.getImageData(0, 0, 1, 1).data)
  }
  const onBlack = paint('#000000')
  const onWhite = paint('#ffffff')
  if (onBlack.some((c, i) => c !== onWhite[i])) return null
  return [onBlack[0] ?? 0, onBlack[1] ?? 0, onBlack[2] ?? 0]
}

/** Any CSS colour (hex, rgb(), oklch(), color-mix(), a keyword) to sRGB. `null` if it is not a colour. */
export function parseColour(input: string): RGB | null {
  const v = input.trim()
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v)
  if (hex?.[1]) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length === 6 || h.length === 8) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
    return null
  }
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/i.exec(v)
  if (rgb) return [Math.round(Number(rgb[1])), Math.round(Number(rgb[2])), Math.round(Number(rgb[3]))]
  if (typeof document === 'undefined' || !v) return null
  return parseViaCanvas(v)
}

export function toHex([r, g, b]: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

/** Is this value a colour the swatches can paint? */
export const isColour = (value: string | undefined): value is string =>
  !!value && /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\(|color\()/i.test(value)

/** A colour as `#RRGGBB`; anything else (shadows, lengths, fonts) as written. */
export function showValue(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase()
  if (isColour(value) && !value.startsWith('#')) {
    const rgb = parseColour(value)
    if (rgb) return toHex(rgb)
  }
  return value
}

function luminance([r, g, b]: RGB): number {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }) as RGB
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/** WCAG contrast ratio between two CSS colours (1 to 21), or null if either is not a colour. */
export function contrast(a: string | undefined, b: string | undefined): number | null {
  if (!a || !b) return null
  const x = parseColour(a)
  const y = parseColour(b)
  if (!x || !y) return null
  const la = luminance(x)
  const lb = luminance(y)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** A ratio as shown: truncated, never rounded up across a threshold (4.496 must not read as 4.50). */
export const formatRatio = (r: number) => (Math.floor(r * 100) / 100).toFixed(2)

/* ------------------------------------------------------------------------------------------------
 * Contrast pairs the library promises
 * ---------------------------------------------------------------------------------------------- */

export interface ContrastPair {
  id: string
  /** Shown as text. */
  label: string
  /** Token name of the text or icon colour. */
  fg: string
  /** Token name of what it sits on. */
  bg: string
  /** 4.5 for text, 3 for focus rings and other UI parts. */
  min: 4.5 | 3
  group: string
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const CONTRAST_PAIRS: ContrastPair[] = [
  ...FAMILIES.flatMap((f): ContrastPair[] => [
    { id: `${f}-on`, label: `${f}-on on ${f}`, fg: `--${f}-on`, bg: `--${f}`, min: 4.5, group: cap(f) },
    { id: `${f}-fg-soft`, label: `${f}-fg on ${f}-soft`, fg: `--${f}-fg`, bg: `--${f}-soft`, min: 4.5, group: cap(f) },
    { id: `${f}-fg-surface`, label: `${f}-fg on surface`, fg: `--${f}-fg`, bg: '--surface', min: 4.5, group: cap(f) },
  ]),
  { id: 'fg', label: 'fg on surface', fg: '--fg', bg: '--surface', min: 4.5, group: 'Neutrals' },
  { id: 'fg-muted', label: 'fg-muted on surface', fg: '--fg-muted', bg: '--surface', min: 4.5, group: 'Neutrals' },
  { id: 'fg-subtle', label: 'fg-subtle on surface', fg: '--fg-subtle', bg: '--surface', min: 4.5, group: 'Neutrals' },
  { id: 'fg-subtle-sunken', label: 'fg-subtle on surface-sunken', fg: '--fg-subtle', bg: '--surface-sunken', min: 4.5, group: 'Neutrals' },
  { id: 'ring', label: 'ring on surface', fg: '--ring', bg: '--surface', min: 3, group: 'Focus ring' },
]

/** Ratio of a pair in a token map (null when a value is missing or not a colour). */
export function pairRatio(pair: ContrastPair, map: TokenMap | undefined): number | null {
  return map ? contrast(map[pair.fg], map[pair.bg]) : null
}
