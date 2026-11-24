// Shared test helpers. Not exported from the package and excluded from the build.
import type { ComponentType } from 'react'
import { cleanup, render } from '@testing-library/react'
import axe from 'axe-core'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(cleanup)

/**
 * Registers one test per example: it renders the example and fails on any axe violation.
 * Colour contrast is skipped because jsdom cannot compute styles; the tokens are checked by design.
 *
 *   import * as examples from './button.examples.tsx'
 *   testExamplesAxe(examples)
 */
export function testExamplesAxe(examples: Record<string, ComponentType>) {
  describe('examples', () => {
    it.each(Object.entries(examples))('%s has no axe violations', async (_name, Example) => {
      const { container } = render(<Example />)
      const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    })
  })
}
