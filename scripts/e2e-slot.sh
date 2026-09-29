#!/usr/bin/env bash
# Runs the e2e suite once one of E2E_SLOTS slots is free, so parallel sessions on one
# machine never run more suites at once than it can hold. A slot is an flock on a file:
# the kernel releases it when the process exits, even killed, so no lock goes stale.
# Without flock (macOS) or in CI, the suite runs straight away.
set -euo pipefail

slots="${E2E_SLOTS:-3}"
lock_dir="${E2E_LOCK_DIR:-${TMPDIR:-/tmp}/quit-e2e-slots}"

if [[ -n "${CI:-}" ]] || ! command -v flock >/dev/null 2>&1; then
  exec "$@"
fi

mkdir -p "$lock_dir"
waited=0
while true; do
  for slot in $(seq 1 "$slots"); do
    exec {fd}>"$lock_dir/slot-$slot.lock"
    if flock -n "$fd"; then
      # One port per slot, unless the session chose its own.
      export E2E_PORT="${E2E_PORT:-$((4180 + slot))}"
      echo "e2e slot $slot/$slots taken (port $E2E_PORT)" >&2
      # The command inherits the locked descriptor: the slot is held until it exits.
      exec "$@"
    fi
    exec {fd}>&-
  done
  if (( waited % 60 == 0 )); then
    echo "waiting for an e2e slot ($slots/$slots busy)… this is expected, do not kill it" >&2
  fi
  sleep 5
  waited=$((waited + 5))
done
