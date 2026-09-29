---
status: accepted
---

# Device-first journal, mirrored to the server change by change

ADR-0001 kept all data on the device, with a manual JSON export as the only backup. Its own consequence, iOS evicting a rarely used PWA's storage, and a lost phone both erase a journal that was never exported. We now mirror the journal to the VPS: the device's IndexedDB stays the reference and every change leaves as soon as it is recorded, so the app never waits for the network. Each fact carries an id generated on the device; a pending change is replayed as an idempotent `PUT` or `DELETE` of one fact, or a `PUT` of the settings, until the server acknowledges it. The server stores the mirror in readable relational tables in SQLite, behind a device key of which it keeps only a hash. A restore replaces the device's journal with the mirror. The domain logic stays in the client: the server checks the shape of what it receives against the schemas it shares with the app, never the domain rules, and the push sender stays as dumb as ADR-0001 describes. The project also serves as a demonstration of backend work, which weighed in favour of a real relational schema.

## Considered Options

- **Server as the reference, online-first**: rejected. A craving is logged one-handed, often without signal; the app must record it offline.
- **End-to-end encrypted blobs, server blind**: rejected. The data is the author's own, on the author's server; encryption would reduce the database to opaque blobs with nothing relational left.
- **Whole journal uploaded on every change**: rejected in favour of one request per changed fact, idempotent and replayable from a queue.
- **Merging on restore**: rejected. With one device there is nothing to merge, and a union of facts would bring deleted ones back.
- **Postgres**: rejected. One node, one writing process and a few writes a day; SQLite needs no separate service, and the device can re-send everything if the server's copy is lost.

## Consequences

- Health data now sits on the server in clear, and Cloudflare sees it in transit through the tunnel.
- iOS PWAs have no background sync: pending changes leave only while the app is open.
- The journal file format and the IndexedDB schema move to a version with fact ids; files exported before it are still imported, their facts getting ids on the way in.
- The server's copy is only as fresh as the last time the app reached it; the home screen warns once the mirror is more than three days behind and offers an export.
