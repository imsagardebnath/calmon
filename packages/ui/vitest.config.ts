import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@openvanta\/pikore-react$/, replacement: src('index.ts') },
      { find: /^@openvanta\/pikore-react\/styles\.css$/, replacement: src('styles.css') },
      { find: /^@openvanta\/pikore-react\/(.*)$/, replacement: src('$1/index.ts') },
    ],
  },
  test: { environment: 'jsdom', globals: true },
})
