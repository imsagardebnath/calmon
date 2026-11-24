import type { ReactNode } from 'react'

/*
 * A tiny highlighter: one global regex per language. Each alternative is one named group, and the
 * group name is the token type: c comment, s string, k keyword, t tag name, e end of tag (> or />),
 * a attribute, key or flag, n hex colour (drawn as s), p shell prompt (drawn as c), x plain text.
 * Code colours the types with [data-t] selectors. It is not a parser: it aims to be right for
 * common snippets and never to lose or reorder text.
 */
const join = (...parts: RegExp[]) => new RegExp(parts.map((p) => p.source).join('|'), 'gm')
const words = (list: string) => new RegExp(`\\b(?<k>${list})\\b`)

const STRING = /(?<s>"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)/

const JS = join(
  /(?<c>\/\/.*|\/\*[\s\S]*?\*\/)/,
  STRING,
  /(?<t><\/[A-Za-z][\w.-]*|(?<![\w$])<[A-Za-z][\w.-]*)/,
  /(?<e>\/?>)/,
  /(?<x>=>)/,
  /(?<a>[\w-]+(?==["'{]))/,
  words(
    'import|export|from|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|' +
      'extends|async|await|try|catch|finally|throw|typeof|instanceof|in|of|as|type|interface|enum|public|private|' +
      'readonly|static|void|null|undefined|true|false|this|yield|delete|satisfies|string|number|boolean',
  ),
)

const JSON_ = join(/(?<a>"(?:\\.|[^"\\\n])*"(?=\s*:))/, STRING, words('true|false|null'))

const CSS = join(
  /(?<c>\/\*[\s\S]*?\*\/)/,
  STRING,
  /(?<k>@[\w-]+)/,
  /(?<n>#[\da-fA-F]{3,8}\b)/,
  /(?<a>[\w-]+(?=\s*:[^;{}]*[;}]))/,
  /(?<t>[.#][A-Za-z_-][\w-]*)/,
)

const SH = join(
  /(?<c>(?<!\S)#.*)/,
  STRING,
  /(?<p>^\$(?= ))/,
  /(?<a>(?<!\S)--?[A-Za-z][\w-]*|\$\{?\w+\}?)/,
  words('if|then|else|elif|fi|for|in|do|done|while|case|esac|function|export|source|return|exit'),
)

const LANGS: Record<string, RegExp> = {
  js: JS,
  jsx: JS,
  ts: JS,
  tsx: JS,
  javascript: JS,
  typescript: JS,
  json: JSON_,
  css: CSS,
  bash: SH,
  sh: SH,
  shell: SH,
  zsh: SH,
}

const DRAW: Record<string, string> = { e: 't', n: 's', p: 'c' }

/** Split `code` into plain text and `<span data-t="…">` tokens. Unknown languages come back as plain text. */
export function highlight(code: string, language: string): ReactNode[] {
  const re = LANGS[language.toLowerCase()]
  if (!re) return [code]
  const out: ReactNode[] = []
  let last = 0
  let open = 0 // tags whose closing ">" has not been seen yet
  for (const m of code.matchAll(re)) {
    const groups = m.groups ?? {}
    let type = Object.keys(groups).find((k) => groups[k] !== undefined) ?? 'x'
    if (type === 't') open++
    else if (type === 'e') type = open > 0 ? (open--, 'e') : 'x'
    if (m.index > last) out.push(code.slice(last, m.index))
    out.push(
      type === 'x' ? (
        m[0]
      ) : (
        <span key={m.index} data-t={DRAW[type] ?? type}>
          {m[0]}
        </span>
      ),
    )
    last = m.index + m[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}
