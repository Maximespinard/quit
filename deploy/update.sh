#!/usr/bin/env bash
#
# Deploys the newest `main` image of quit and rolls back by itself when it fails its health
# check. quit-update.timer runs it every minute; it does nothing while `main` is unchanged.
#
#   sudo /opt/quit/update.sh                     # what the timer runs
#   sudo /opt/quit/update.sh --image <image>     # deploy another image, e.g. to try a rollback
#
# A rejected image is remembered, so the timer does not redeploy it every minute; the next
# image published on `main` is tried as usual.

set -euo pipefail

SOURCE=ghcr.io/maximespinard/quit:main
STATE=/var/lib/quit
HEALTH_TIMEOUT_S=60
COMPOSE=(docker compose --project-directory /opt/quit -f /opt/quit/compose.yaml)

source=$SOURCE
trial=false
if [[ ${1:-} == --image ]]; then
  source=${2:?--image needs an image reference}
  trial=true
fi

mkdir -p "$STATE"
exec 9>"$STATE/update.lock"
flock -n 9 || exit 0 # the previous run is still deploying

docker pull -q "$source" >/dev/null
candidate=$(docker image inspect -f '{{.Id}}' "$source")
current=$(docker image inspect -f '{{.Id}}' quit:current 2>/dev/null || true)

[[ $candidate == "$current" ]] && exit 0
if ! $trial && [[ -f $STATE/rejected && $(<"$STATE/rejected") == "$candidate" ]]; then
  exit 0
fi

# The app answers on the project network only: ask it there, from the host.
healthy() {
  local ip deadline=$((SECONDS + HEALTH_TIMEOUT_S))
  while ((SECONDS < deadline)); do
    ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' quit 2>/dev/null || true)
    if [[ -n $ip ]] && curl -fsS -m 2 "http://$ip:8080/api/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

start() {
  "${COMPOSE[@]}" up -d --no-deps --force-recreate quit
}

echo "deploying $source ($candidate)"
[[ -n $current ]] && docker tag quit:current quit:previous
docker tag "$candidate" quit:current
start

if healthy; then
  echo "live: $source"
  rm -f "$STATE/rejected"
  # Old quit images nothing tags any more; other projects' images are left alone.
  docker image prune -f --filter label=org.opencontainers.image.source=https://github.com/Maximespinard/quit >/dev/null
  exit 0
fi

echo "health check failed after ${HEALTH_TIMEOUT_S}s: $source rejected" >&2
printf '%s\n' "$candidate" >"$STATE/rejected"
if [[ -z $current ]]; then
  echo "no previous image to roll back to" >&2
  exit 1
fi
docker tag quit:previous quit:current
start
if healthy; then
  echo "rolled back to $current" >&2
else
  echo "the previous image fails its health check too" >&2
fi
exit 1
