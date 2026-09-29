# Deploy

Production runs on one VPS, public at `https://quit.atelierspinard.com` through a Cloudflare
Tunnel. A merge to `main` is a deploy: it is live within about two minutes, and a release that
fails its health check is rolled back by itself.

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
  tunnel token, `quit.env` the VAPID key pair and subject. None is in the repository or the image.
- **Continuous deploy.** CI publishes `ghcr.io/maximespinard/quit:main` on every merge. Every
  minute `quit-update.timer` runs `/opt/quit/update.sh`: it pulls `main` and, when it changed,
  moves the local `quit:current` tag to it, recreates the app and asks it `/api/health` on the
  private network. Without an answer within 60 s, it puts the previous image back and
  remembers the rejected one, so the timer does not retry it; the next image on `main` is
  tried as usual.

| Installed file | Role |
| --- | --- |
| `/opt/quit/compose.yaml` | the app and the tunnel |
| `/opt/quit/update.sh` | deploy and rollback |
| `/etc/systemd/system/quit-update.{service,timer}` | runs `update.sh` every minute |
| `/etc/quit/{tunnel,quit}.env` | secrets |
| `/var/lib/quit/` | the rejected image, the lock, the firewall and port snapshot |

The timer only ever runs the installed copies, owned by root, never a checkout: a change
under `deploy/` reaches the host when `setup.sh` runs again.

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

**Try a rollback** once after the install, then whenever `update.sh` changes:

```bash
sudo /opt/quit/update.sh --image nginx:alpine   # fails its health check: must print "rolled back"
```

**Rotate the tunnel token**: refresh it in the Cloudflare dashboard, run `setup.sh` again and
paste the new one, then `sudo docker compose -f /opt/quit/compose.yaml up -d tunnel`.

**Never regenerate the VAPID key pair** once the phone has subscribed: the subscription is
bound to the public key, and push would stop silently until the app subscribes again.

**Stop everything**, the data kept:

```bash
sudo systemctl disable --now quit-update.timer
sudo docker compose -f /opt/quit/compose.yaml down   # the quit_data volume stays
```
