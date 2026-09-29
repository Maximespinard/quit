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
| `contract/` | Zod schemas of the facts, the settings, the journal file and the API bodies; their types are inferred from them |
| `server/` | The API server and Web Push sender: Express 5, SQLite through Drizzle (see [Server](#server)) |

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
| `VAPID_PUBLIC_KEY` | — (required) | VAPID key pair (`npx web-push generate-vapid-keys`); the public key is the app's `applicationServerKey` |
| `VAPID_PRIVATE_KEY` | — (required) | |
| `VAPID_SUBJECT` | — (required) | `mailto:` or `https://` contact for the push services (Apple rejects anything else) |
| `PORT` | `8080` | |
| `LOG_LEVEL` | `info` | pino level; logs are JSON lines on stdout, never a body, a query nor a header |
| `TRUST_PROXY` | `0` | Reverse proxies in front, e.g. `1` behind the tunnel, so the rate limit counts per client |
| `APP_DIR` | — (API only) | The built PWA (`dist/`) to serve outside `/api` |

A missing or invalid variable stops the start with a message naming it.

`GET /api/health` is open: `200` while the database answers, `503` otherwise. Every other
`/api` route requires `Authorization: Bearer <device key>`, else `401`. Errors are
`application/problem+json`. Ten failed key checks from one address within 15 minutes, and
that address gets `429` for every request until the window ends.

### API

The server holds the **mirror** of the device's journal (`docs/adr/0003`). Bodies are checked
against the `@quit/contract` schemas, for shape only, never a domain rule: a `400` names the
fields at fault. A fact id is the UUIDv7 the device gave it.

| Route | Body | Answers |
| --- | --- | --- |
| `GET /api/health` | — | `200` database reachable, `503` otherwise |
| `PUT /api/facts/:id` | one fact; its `id` equals the path's | `204` stored or replaced, a replay leaving one fact, `400`, `401` |
| `DELETE /api/facts/:id` | — | `204`, also when already absent; `400` on an id that is not a UUIDv7 |
| `PUT /api/settings` | the whole settings | `204` replaced, protocol steps included, `400`, `401` |
| `GET /api/mirror` | — | `200` `{ facts, settings }`: the facts ordered by time, `settings` `null` until first sent |

Issue the **device key** where the server runs, with the same `DATA_DIR`:

```bash
DATA_DIR=./data npm run issue-device-key --silent
```

It prints the new key once, on stdout, and revokes the previous one at once; the server keeps
only its SHA-256.

### Push

The server is also the dumb push sender of ADR-0001: it stores one web push subscription and
one schedule of ready-made notifications, and sends each entry when due, knowing nothing about
the domain. Routes sit under `/api/push`, behind the device key; bodies are JSON, sent as
`Content-Type: application/json` (any other type reads as no body: `400`), validated against
`@quit/contract/push`.

| Route | Body | Answers |
| --- | --- | --- |
| `PUT /api/push/subscription` | `PushSubscription.toJSON()` (`https` endpoint, `keys.p256dh`, `keys.auth`) | `204`, `400` |
| `PUT /api/push/schedule` | `{ "notifications": [{ "sendAt": "<ISO 8601>", "title", "body", "screen": "/…" }] }`, at most 1000 | `204`, `400` |
| `POST /api/push/test` | `{ "title", "body", "screen": "/…" }` | `204` sent, `409` no subscription, `410` subscription gone (dropped), `502` push failed |

Both `PUT`s replace what was there and are idempotent. The push payload the service worker
receives is `{ "title", "body", "screen" }`, 3000 bytes at most; `screen` is always a path of
the app.

Every 15 s, due entries are sent once, in `sendAt` order, and removed from the schedule before
the first send. Entries replaced before their time are never sent; entries already past when a
schedule is uploaded are discarded. An entry found more than an hour late (server down) is
dropped, not sent. A subscription the push service answers `404`/`410` for is dropped; the app
registers a new one. Other failures are logged, without the notification's text, and the entry
is not retried. The subscription and the schedule live in the database, so they survive a
restart.

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
docker run --rm --name quit -p 8080:8080 -v quit-data:/data \
  -e VAPID_PUBLIC_KEY=… -e VAPID_PRIVATE_KEY=… -e VAPID_SUBJECT=mailto:… quit   # the app on http://localhost:8080
docker exec quit node src/issue-device-key.ts   # the device key, same DATA_DIR
E2E_BASE_URL=http://127.0.0.1:8080 npm run test:e2e -- smoke.spec.ts offline.spec.ts
```

## Docs

- `CONTEXT.md` — the domain glossary; the words used in code and UI copy
- `docs/adr/` — architecture decisions
- `CLAUDE.md` — conventions for agents working in this repo

## License

MIT — see `LICENSE`.
