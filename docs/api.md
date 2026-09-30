# Server API

The HTTP contract of `server/`. How to run it and configure it: [`deploy.md`](deploy.md), "The server".

`GET /api/health` is open: `200` while the database answers, `503` otherwise. Every other
`/api` route requires `Authorization: Bearer <device key>`, else `401`. Errors are
`application/problem+json`. Ten failed key checks from one address within 15 minutes, and
that address gets `429` for every request until the window ends.

## Mirror

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

## Device key

Issue it where the server runs, with the same `DATA_DIR`:

```bash
DATA_DIR=./data npm run issue-device-key --silent
```

It prints the new key once, on stdout, and revokes the previous one at once; the server keeps
only its SHA-256.

## Push

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

## The app

With `APP_DIR`, the server also serves the app: files under `assets/` (hashed names) are cached
for a year as immutable; `index.html`, the service worker and the other files are revalidated on
every load (`no-cache`); a GET for a path without an extension (a deep link) gets `index.html`.
