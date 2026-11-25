import pkg from '../../../../packages/ui/package.json'

/** Base URL of the site ("/" locally, "/<repo>/" on GitHub Pages). Every asset URL goes through it. */
export const BASE = import.meta.env.BASE_URL

/** Library version shown in the header and on component pages. */
export const VERSION: string = pkg.version

export const PACKAGE = '@openvanta/pikore-react'
export const INSTALL_COMMAND = `npm install ${PACKAGE}`

/** Where the source lives. Override with VITE_REPO_URL when building. */
export const REPO_URL: string = import.meta.env.VITE_REPO_URL ?? 'https://github.com/imsagardebnath/pikore-ui'

/** Absolute URL of a file published next to the site (llms.txt, components.json ...). */
export function siteUrl(path: string): string {
  return new URL(`${BASE}${path}`, window.location.href).href
}

export const DENSITY_KEY = 'pikore-density'
