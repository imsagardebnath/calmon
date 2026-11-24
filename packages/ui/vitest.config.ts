import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@openvanta\/calmon-react$/, replacement: src('index.ts') },
      { find: /^@openvanta\/calmon-react\/styles\.css$/, replacement: src('styles.css') },
      { find: /^@openvanta\/calmon-react\/(.*)$/, replacement: src('$1/index.ts') },
    ],
  },
  test: { environment: 'jsdom', globals: true },
})
