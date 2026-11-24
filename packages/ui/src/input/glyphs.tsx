import type { ReactNode } from 'react'

/* A 24-unit icon box for small glyphs that have no counterpart in ../icons. Import the shared icons from ../icons where one exists. */
export function Glyph({
  size = 16,
  stroke = 2,
  className,
  children,
}: {
  size?: number
  stroke?: number
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}
