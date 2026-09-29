#!/usr/bin/env bash
#
# Deploys the newest `main` image of quit and rolls back by itself when it fails its health
# check. quit-update.timer runs it every minute; it does nothing while `main` is unchanged.
#
#   sudo /opt/quit/update.sh                        # what the timer runs
#   sudo /opt/quit/update.sh --image <quit image>   # deploy another quit image, e.g. an older sha
#   sudo /opt/quit/update.sh --simulate-failure     # redeploy the live image, fail it, roll back
#   sudo /opt/quit/update.sh --check                # exit 0 only if the running app is healthy
#
# `quit:live` tags the last image that passed its check; `quit:current` is the one compose runs.
# A rejected image is remembered, so the timer does not redeploy it every minute; the next
# image published on `main` is tried as usual. An `--image` deploy that passes also rejects the
# current `main`, so the timer keeps it until `main` moves on.

set -euo pipefail

REPOSITORY=ghcr.io/maximespinard/quit
SOURCE=$REPOSITORY:main
STATE=/var/lib/quit
HEALTH_TIMEOUT_S=60
COMPOSE=(docker compose --project-directory /opt/quit -f /opt/quit/compose.yaml)

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

image_id() { docker image inspect -f '{{.Id}}' "$1" 2>/dev/null || true; }

mode=timer
source=$SOURCE
case ${1:-} in
  '') ;;
  --check)
    if healthy; then exit 0; fi
    echo "the running app fails its health check" >&2
    exit 1
    ;;
  --simulate-failure) mode=simulate ;;
  --image)
    source=${2:?--image needs an image reference}
    # compose hands the production secrets and data to whatever it runs: quit images only.
    [[ $source == "$REPOSITORY":* || $source == "$REPOSITORY"@* ]] ||
      { echo "--image takes a $REPOSITORY image only" >&2; exit 2; }
    mode=manual
    ;;
  *) echo "usage: $0 [--image <image> | --simulate-failure | --check]" >&2; exit 2 ;;
esac

mkdir -p "$STATE"
exec 9>"$STATE/update.lock"
if [[ $mode == timer ]]; then
  flock -n 9 || exit 0 # the previous run is still deploying
elif ! flock -n 9; then
  echo "a deploy is in progress: waiting for it"
  flock -w 300 9 || { echo "still locked after 5 min" >&2; exit 1; }
fi

live=$(image_id quit:live)
if [[ $mode == simulate ]]; then
  [[ -n $live ]] || { echo "no live image to simulate with" >&2; exit 1; }
  candidate=$live
else
  docker pull -q "$source" >/dev/null
  candidate=$(image_id "$source")
  [[ $candidate == "$live" ]] && exit 0
  if [[ $mode == timer && -f $STATE/rejected && $(<"$STATE/rejected") == "$candidate" ]]; then
    exit 0
  fi
fi

start() { "${COMPOSE[@]}" up -d --no-deps --force-recreate quit; }

echo "deploying $source ($candidate)"
docker tag "$candidate" quit:current
if start && [[ $mode != simulate ]] && healthy; then
  docker tag "$candidate" quit:live
  echo "live: $source"
  if [[ $mode == manual ]]; then
    main=$(image_id "$SOURCE")
    [[ -n $main && $main != "$candidate" ]] && printf '%s\n' "$main" >"$STATE/rejected"
  else
    rm -f "$STATE/rejected"
  fi
  # Old quit images nothing tags any more; other projects' images are left alone.
  docker image prune -f --filter label=org.opencontainers.image.source=https://github.com/Maximespinard/quit >/dev/null
  exit 0
fi

case $mode in
  simulate) echo "simulated failure: rolling back" >&2 ;;
  timer) echo "health check failed: $source rejected" >&2
    printf '%s\n' "$candidate" >"$STATE/rejected" ;;
  manual) echo "health check failed: $source not kept" >&2 ;;
esac
if [[ -z $live ]]; then
  echo "no live image to roll back to" >&2
  exit 1
fi
docker tag quit:live quit:current
if start && healthy; then
  echo "rolled back to $live" >&2
else
  echo "the live image fails its health check too" >&2
fi
exit 1
