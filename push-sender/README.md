# push-sender

The dumb push sender of [ADR-0001](../docs/adr/0001-local-first-data-with-a-dumb-push-sender.md):
it stores one web push subscription and one schedule of ready-made notifications, and sends
each entry when due. It knows nothing about the domain. Separate package, separate image.

## Contract

Every request carries `Authorization: Bearer <PUSH_SHARED_SECRET>`, otherwise `401` and nothing
changes — unknown routes included. Bodies are JSON.

| Route | Body | Answers |
| --- | --- | --- |
| `PUT /subscription` | `PushSubscription.toJSON()` (`https` endpoint, `keys.p256dh`, `keys.auth`) | `204`, `400` |
| `PUT /schedule` | `{ "notifications": [{ "sendAt": "<ISO 8601>", "title", "body", "screen": "/…" }] }` | `204`, `400` |
| `POST /test` | `{ "title", "body", "screen": "/…" }` | `204` sent, `409` no subscription, `410` subscription gone (dropped), `502` push failed |

Both `PUT`s replace what was there and are idempotent. The push payload the service worker
receives is `{ "title", "body", "screen" }`; `screen` is always a path of the app.

## Send loop

Every 15 s, due entries are sent once, in `sendAt` order, and removed from the schedule before
the first send. Entries replaced before their time are never sent; entries already past when a
schedule is uploaded are discarded. An entry found more than an hour late (service down) is
dropped, not sent. A subscription the push service answers `404`/`410` for is dropped; the
app registers a new one. Other failures are logged and the entry is not retried.

State is one JSON file (`DATA_FILE`), written atomically, so it survives a restart.

## Run

```bash
npm ci                            # at the repository root: one install for every workspace
npm run verify -w push-sender     # lint · typecheck · tests
node --env-file=.env src/main.ts  # from push-sender/; needs .env, see .env.example
docker build -f push-sender/Dockerfile -t quit-push-sender .   # from the repository root
```

Node ≥ 24 runs the TypeScript sources directly: there is no build step. The push sender is an
npm workspace of the repository, sharing its one lockfile.
