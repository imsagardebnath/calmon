import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const lib = (p: string) => fileURLToPath(new URL(`../../packages/ui/src/${p}`, import.meta.url))

// BASE_PATH is set by the GitHub Pages workflow (e.g. "/pikore-ui/"). Locally it is "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // The docs render the library from source, so edits show up instantly.
      { find: /^@openvanta\/pikore-react$/, replacement: lib('index.ts') },
      { find: /^@openvanta\/pikore-react\/styles\.css$/, replacement: lib('styles.css') },
      { find: /^@openvanta\/pikore-react\/(.*)$/, replacement: lib('$1/index.ts') },
    ],
  },
  server: { fs: { allow: ['../..'] } },
})
