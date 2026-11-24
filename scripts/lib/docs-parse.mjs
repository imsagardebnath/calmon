// Pure parsing helpers shared by scripts/build-agent-docs.mjs (Node) and the docs app (browser).
// No Node APIs here.

/**
 * Parse the small YAML subset used in component .md frontmatter:
 *   key: value | key: "quoted" | key: [a, b]
 * @param {string} text
 * @returns {{ data: Record<string, string | string[]>, body: string }}
 */
export function parseFrontmatter(text) {
  const src = text.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  if (!match) return { data: {}, body: src }
  /** @type {Record<string, string | string[]>} */
  const data = {}
  for (const line of match[1].split('\n')) {
    const m = /^([\w-]+):\s*(.*)$/.exec(line.trim())
    if (!m) continue
    const [, key, raw] = m
    const value = raw.trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
    } else {
      data[key] = unquote(value)
    }
  }
  return { data, body: src.slice(match[0].length) }
}

function unquote(s) {
  return s.replace(/^["'](.*)["']$/, '$1')
}

/**
 * Extract examples from a *.examples.tsx file. Convention:
 *
 *   /** One-line description. *\/
 *   export function ExampleName() {
 *     ...
 *   }            <- closing brace at column 0
 *
 * @param {string} source
 * @returns {{ name: string, description: string, code: string }[]}
 */
export function parseExamples(source) {
  const src = source.replace(/\r\n/g, '\n')
  const re = /\/\*\*([\s\S]*?)\*\/\s*\n(export function (\w+)\(\)[\s\S]*?\n\})/g
  /** @type {{ name: string, description: string, code: string }[]} */
  const out = []
  let m
  while ((m = re.exec(src))) {
    out.push({
      name: m[3],
      description: m[1]
        .split('\n')
        .map((l) => l.replace(/^\s*\*\s?/, '').trim())
        .filter(Boolean)
        .join(' '),
      code: m[2].replace(/^export /, ''),
    })
  }
  return out
}

/** "Button" -> "button", "LimitedNumberInput" -> "limited-number-input" */
export function toKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
