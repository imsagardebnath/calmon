# Calmon

React 19 + Tailwind CSS v4 components for operational software: monitoring, incident response, admin consoles, and any screen where a missed signal costs something. Built on safety principles from ICUs and operating theatres: fewer alarms, clear limits, and a short pause before anything risky.

- **42 components**, 7 of them signature safety and monitoring components (HealthScore, VitalTile, StationGrid, Timeline, LimitedNumberInput, PausePoint, ConfirmTarget)
- **One status vocabulary**: five severities (`normal`, `info`, `advisory`, `caution`, `critical`), each with its own icon shape, so colour is never the only signal
- **Light and dark**, and three densities (`comfortable`, `compact`, `station` for wall displays)
- **Small**: the whole library is about 40 KB gzipped, tree-shakeable, one entry per component
- **Open source**: MIT licensed
- **Agent-ready**: the docs site publishes `llms.txt`, `llms-full.txt`, `components.json` and one Markdown doc per component, generated from the source on every deploy

## Quick start (this repo)

```bash
npm install
npm run dev      # docs site on http://localhost:5173
npm run ci       # typecheck, tests, build, size budgets
```

## Use it in an app

```bash
npm install @calmon/react
```

```css
/* app.css */
@import "tailwindcss";
@import "@calmon/react/styles.css";
```

```tsx
import { CalmonProvider, Button } from '@calmon/react'

export default function App() {
  return (
    <CalmonProvider theme="system" density="comfortable">
      <Button variant="primary" severity="critical">Delete service "api-gateway"</Button>
    </CalmonProvider>
  )
}
```

Tell your agent: "Use Calmon. Before writing code, read `https://<user>.github.io/<repo>/llms.txt`."

## Deploy the docs to GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo: Settings > Pages > Build and deployment > Source: GitHub Actions.
3. The `Deploy docs to GitHub Pages` workflow runs on every push to `main`. The base path and the absolute URLs in `llms.txt` are set automatically.
4. Set the repository URL shown in the docs header and footer: edit `apps/docs/src/site/config.ts` or set `VITE_REPO_URL` in the workflow.

## Repository layout

See [CONTRIBUTING.md](CONTRIBUTING.md) for the layout and the rules for changing the library.

## License

MIT, see [LICENSE](LICENSE). Copyright (c) 2026 Sagar Debnath.
