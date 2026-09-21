# quit

Personal PWA tracking one smoke-free journey under a self-managed nicotine patch taper.
Local-first: all data stays on the device and is exported as JSON. No accounts, no data backend.

## Getting started

```bash
npm install
npm run dev
```

Install the git hooks once per clone (gitleaks scan on every commit):

```bash
git config core.hooksPath .githooks
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run verify` | lint + typecheck + tests + build — the gate before any commit |
| `npm run test` | Vitest once (`test:watch` to watch) |
| `npm run build` | Production build (typecheck included) |
| `npm run lint:fix` | Biome autofix + ESLint fix |

## Docs

- `CONTEXT.md` — the domain glossary; the words used in code and UI copy
- `docs/adr/` — architecture decisions
- `CLAUDE.md` — conventions for agents working in this repo

## License

MIT — see `LICENSE`.
