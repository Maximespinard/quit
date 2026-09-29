# quit

Personal PWA tracking one smoke-free journey under a self-managed nicotine patch taper.
Local-first: all data stays on the device and is exported as JSON. No accounts, no data backend.

## Getting started

```bash
npm install
npm run dev
```

The repository is npm workspaces, installed together by one `npm install` at the root:

| Workspace | What it holds |
| --- | --- |
| root | The PWA |
| `contract/` | Zod schemas of the facts, the settings and the journal file; their types are inferred from them |
| `push-sender/` | The Web Push sender (see its README) |
| `server/` | The API server: Express 5, SQLite through Drizzle (see [Server](#server)) |

Install the git hooks once per clone (gitleaks scan on every commit):

```bash
git config core.hooksPath .githooks
```

The same hook also rejects a commit whose staged changes match a regex in
`.git/info/banned-words` — a local, never-committed list of wording that is out of scope here.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run verify` | lint + typecheck + tests + build, then every workspace's own verify — the gate before any commit |
| `npm run test` | Vitest once (`test:watch` to watch) |
| `npm run test:e2e` | Playwright smoke test (WebKit, iPhone) against the production preview build |
| `npm run build` | Production build (typecheck included) |
| `npm run lint:fix` | Biome autofix + ESLint fix |

## Server

`server/` runs its TypeScript sources directly on Node ≥ 24, no build step. SQLite (WAL) lives
in `DATA_DIR`; pending migrations from `server/drizzle/` are applied at start.

```bash
cd server
DATA_DIR=./data npm start                # or: node --env-file=.env src/main.ts (see .env.example)
npm run verify                           # lint · typecheck · tests
npm run db:generate -- --name <change>   # after editing src/schema.ts: writes the next migration
```

| Variable | Default | |
| --- | --- | --- |
| `DATA_DIR` | — (required) | Directory of the database file `quit.db`, created when missing |
| `PORT` | `8080` | |
| `LOG_LEVEL` | `info` | pino level; logs are JSON lines on stdout, never a body nor a header |

A missing or invalid variable stops the start with a message naming it.

`GET /api/health` is open: `200` while the database answers, `503` otherwise. Every other
route requires `Authorization: Bearer <device key>`, else `401`. Errors are
`application/problem+json`. Ten failed key checks from one address within 15 minutes, and
that address gets `429` for every request until the window ends.

Issue the **device key** where the server runs, with the same `DATA_DIR`:

```bash
DATA_DIR=./data npm run issue-device-key --silent
```

It prints the new key once, on stdout, and revokes the previous one at once; the server keeps
only its SHA-256.

## Docs

- `CONTEXT.md` — the domain glossary; the words used in code and UI copy
- `docs/adr/` — architecture decisions
- `CLAUDE.md` — conventions for agents working in this repo

## License

MIT — see `LICENSE`.
