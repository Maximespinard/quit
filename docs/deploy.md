# Deploy

Production runs on one VPS, public at `https://quit.atelierspinard.com` through a Cloudflare
Tunnel. A merge to `main` is a deploy: once CI has published its image, it is live within about
two minutes, and a release that fails its health check is rolled back by itself.

## How it works

- **No inbound port.** `deploy/compose.yaml` runs the image and `cloudflared` on a private
  Docker network and publishes nothing. The tunnel dials out to Cloudflare and reaches the app
  as `http://quit:8080`, so nothing listens on the host and the firewall is left as it is. TLS
  ends at Cloudflare.
- **Hardened containers.** Every capability dropped, `no-new-privileges`, the app as the
  unprivileged `node` user, logs rotated (3 × 10 MB).
- **Data.** The SQLite database lives on the `quit_data` volume; it is the mirror of the
  device's journal (`docs/adr/0003`), and survives every deploy.
- **Secrets stay on the host**, in `/etc/quit/` (mode 600, root only): `tunnel.env` holds the
  tunnel token, `quit.env` the VAPID key pair and subject. None is in the repository or the
  image. Once started, each container holds its own in its environment, like any process.
- **Continuous deploy.** CI publishes `ghcr.io/maximespinard/quit:main` on every merge. Every
  minute `quit-update.timer` runs `/opt/quit/update.sh`: it pulls `main` and, when it differs
  from `quit:live` (the last image that passed its check), points `quit:current` at it,
  recreates the app and asks it `/api/health` on the private network. It passes: it becomes
  `quit:live`. No answer within 60 s: `quit:live` goes back, and the rejected image is
  remembered so the timer does not retry it; the next image on `main` is tried as usual. A
  deploy cut short (reboot, failed start) is simply tried again at the next tick.
- **The very first deploy has nothing to roll back to**: if it fails, the app stays down until
  a fixed image is published.

| Installed file | Role |
| --- | --- |
| `/opt/quit/compose.yaml` | the app and the tunnel |
| `/opt/quit/update.sh` | deploy and rollback |
| `/etc/systemd/system/quit-update.{service,timer}` | runs `update.sh` every minute |
| `/etc/quit/{tunnel,quit}.env` | secrets |
| `/var/lib/quit/` | the rejected image, the deploy lock, the firewall and port snapshot |

The timer only ever runs the installed copies, owned by root, never a checkout: a change
under `deploy/` reaches the host when `setup.sh` runs again.

## The image

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

## The server

`server/` runs its TypeScript sources directly on Node ≥ 24, no build step. SQLite (WAL) lives
in `DATA_DIR`; pending migrations from `server/drizzle/` are applied at start. Its HTTP
contract (mirror, device key, push) is in [`api.md`](api.md).

```bash
cd server
DATA_DIR=./data npm start                # or: node --env-file=.env src/main.ts (see .env.example)
npm run verify                           # lint · typecheck · tests
npm run db:generate -- --name <change>   # after editing src/db/schema.ts: writes the next migration
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

A missing or invalid variable stops the start with a message naming it. In production the
image sets `DATA_DIR` and `APP_DIR`, `deploy/compose.yaml` sets `TRUST_PROXY` to `1`, and the
VAPID variables come from `/etc/quit/quit.env`.

## First install

Prerequisites: Docker with Compose v2, and in the Cloudflare dashboard (Zero Trust →
Networks → Tunnels) a tunnel whose public hostname routes to `http://quit:8080`.

```bash
sudo bash deploy/setup.sh
```

The wizard asks for the tunnel token, makes the VAPID key pair inside the image without
showing it, installs the files above, starts the app then the tunnel, and turns the timer on.
It ends by checking the public URL, that no new port listens on the host and that the `ufw`
rules match the ones it recorded before installing. It is safe to re-run: every stage keeps
what an earlier run saved.

## Operations

```bash
sudo journalctl -u quit-update -n 20                  # deploys and rollbacks
sudo docker logs -f quit                              # the server's JSON log lines
sudo docker compose -f /opt/quit/compose.yaml ps      # both containers
sudo docker exec quit node src/issue-device-key.ts    # a new device key; the previous one stops working
```

**Try a rollback** once after the install, then whenever `update.sh` changes. It redeploys the
live image, treats it as failed and rolls back: about a minute of downtime, no foreign image.

```bash
sudo /opt/quit/update.sh --simulate-failure   # must end with "rolled back to sha256:…"
```

**Go back to an older release** when `main` passes its check but misbehaves:

```bash
sudo /opt/quit/update.sh --image ghcr.io/maximespinard/quit:<commit sha>
```

It takes quit images only, since compose hands the secrets and the data to whatever it runs.
Once it passes, the current `main` is marked rejected, so the timer keeps the older release
until a new image lands on `main`.

**Rotate the tunnel token**: refresh it in the Cloudflare dashboard, run `setup.sh` again and
paste the new one, then `sudo docker compose -f /opt/quit/compose.yaml up -d tunnel`.

**Never regenerate the VAPID key pair** once the phone has subscribed: the subscription is
bound to the public key, and push would stop silently until the app subscribes again.

**Stop everything**, the data kept:

```bash
sudo systemctl disable --now quit-update.timer
sudo docker compose -f /opt/quit/compose.yaml down   # the quit_data volume stays
```
