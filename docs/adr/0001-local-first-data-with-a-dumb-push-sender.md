# Local-first data with a dumb push sender

All user data lives on the device (IndexedDB, with JSON export/import as the backup); there is no data backend, no sync and no accounts. iOS web push still needs a server, so a tiny sender runs on the VPS: the client computes a schedule of ready-made notifications (`sendAt`, title, body) for the coming 30 days and uploads it, and re-uploads a fresh one after a lapse or a protocol change. The sender only stores the push subscription and that schedule, and sends each entry when due.

We chose this because the app has one user on one device, must be fully usable before any deploy exists, and should keep health data off the server; the domain logic stays in one place (the client) instead of being duplicated server-side.

## Considered Options

- **Full backend on the VPS (Postgres + API + sync)**: rejected. Sync serves no purpose with a single device, the app would be unusable until the deploy is done, and health data would sit behind an API to secure.
- **Sender receives the quit moment and computes notifications itself**: rejected. It duplicates streak/badge logic on the server and needs every lapse reported to it.

## Consequences

- If the app is not opened for 30 days the schedule runs out and pushes stop until the next launch.
- The server sees notification texts, which can contain figures such as a streak length or an amount saved.
- iOS may evict storage of a rarely used PWA, so export must stay easy and the app nudges the user to export periodically.
