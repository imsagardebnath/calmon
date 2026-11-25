import type { ReactNode } from 'react'
import { marked, type Token, type Tokens } from 'marked'
import { Code } from '@openvanta/pikore-react/code'

type TokenList = Parameters<typeof marked.parser>[0]

/** Inline Markdown (code spans, links, emphasis) to an HTML string. */
export const inline = (src: string): string => marked.parseInline(src.replace(/\s*\n\s*/g, ' '), { async: false }) as string

export const lex = (src: string): Token[] => marked.lexer(src) as Token[]

export interface Section {
  title: string
  tokens: Token[]
}

/** Split a document at its `##` headings. Text before the first one is returned as `intro`. */
export function splitSections(body: string): { intro: Token[]; sections: Section[] } {
  const intro: Token[] = []
  const sections: Section[] = []
  for (const token of lex(body)) {
    if (token.type === 'heading' && (token as Tokens.Heading).depth === 2) {
      sections.push({ title: (token as Tokens.Heading).text, tokens: [] })
    } else (sections.at(-1)?.tokens ?? intro).push(token)
  }
  return { intro, sections }
}

/** An HTML comment on its own, such as the generator markers `<!-- props -->`. */
export const isMarker = (t: Token) => t.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(t.raw)

const isBlank = (t: Token) => t.type === 'space' || isMarker(t)

/**
 * Render Markdown tokens. Code blocks become the library `Code` component (highlighted, with a copy
 * button); everything else is ordinary Markdown HTML.
 */
export function MarkdownBlocks({ tokens }: { tokens: Token[] }) {
  const out: ReactNode[] = []
  let run: Token[] = []
  const flush = () => {
    if (!run.length) return
    const html = marked.parser(run as unknown as TokenList)
    out.push(<div key={out.length} className="md" dangerouslySetInnerHTML={{ __html: html }} />)
    run = []
  }
  for (const t of tokens) {
    if (isBlank(t)) continue
    if (t.type === 'code') {
      flush()
      const { lang, text } = t as Tokens.Code
      const language = (lang ?? '').split(/\s/)[0] || 'text'
      out.push(
        <Code key={out.length} language={language} label={language} className="md-code">
          {text}
        </Code>,
      )
    } else run.push(t)
  }
  flush()
  return <>{out}</>
}

/** A list token's items as inline HTML. */
export function listItems(tokens: Token[]): string[] | null {
  const list = tokens.find((t) => t.type === 'list') as Tokens.List | undefined
  return list ? list.items.map((item) => inline(item.text)) : null
}
