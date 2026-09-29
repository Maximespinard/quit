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
| `npm run test:e2e` | Playwright suite (WebKit, iPhone) against the production preview build, or against `E2E_BASE_URL` when set |
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
| `LOG_LEVEL` | `info` | pino level; logs are JSON lines on stdout, never a body, a query nor a header |
| `TRUST_PROXY` | `0` | Reverse proxies in front, e.g. `1` behind the tunnel, so the rate limit counts per client |
| `APP_DIR` | — (API only) | The built PWA (`dist/`) to serve outside `/api` |

A missing or invalid variable stops the start with a message naming it.

`GET /api/health` is open: `200` while the database answers, `503` otherwise. Every other
`/api` route requires `Authorization: Bearer <device key>`, else `401`. Errors are
`application/problem+json`. Ten failed key checks from one address within 15 minutes, and
that address gets `429` for every request until the window ends.

Issue the **device key** where the server runs, with the same `DATA_DIR`:

```bash
DATA_DIR=./data npm run issue-device-key --silent
```

It prints the new key once, on stdout, and revokes the previous one at once; the server keeps
only its SHA-256.

With `APP_DIR`, the server also serves the app: files under `assets/` (hashed names) are cached
for a year as immutable; `index.html`, the service worker and the other files are revalidated on
every load (`no-cache`); a GET for a path without an extension (a deep link) gets `index.html`.

## Image

One image holds the built app and the server that serves it (`Dockerfile`, built from the
root). It runs as `node`, not root, with the database on the `/data` volume. CI builds it on
every pull request and runs the smoke and offline e2e specs against the container; on `main`
it publishes `ghcr.io/maximespinard/quit` tagged with the commit sha and `main`.

```bash
docker build -t quit .
docker run --rm --name quit -p 8080:8080 -v quit-data:/data quit   # the app on http://localhost:8080
docker exec quit node src/issue-device-key.ts   # the device key, same DATA_DIR
E2E_BASE_URL=http://127.0.0.1:8080 npm run test:e2e -- smoke.spec.ts offline.spec.ts
```

## Docs

- `CONTEXT.md` — the domain glossary; the words used in code and UI copy
- `docs/adr/` — architecture decisions
- `CLAUDE.md` — conventions for agents working in this repo

## License

MIT — see `LICENSE`.
