#!/bin/bash
# DON'T RUN THIS FILE DIRECTLY, USE PACKAGE.JSON SCRIPTS
# Live-reload runner. Always spawns its own Vite on a free port (starting at
# $DEV_PORT, falling back to the next free port if it's in use) and tears it
# down on exit. Set REUSE_DEV_SERVER=1 to opt into the legacy two-terminal
# workflow where a separately-managed `vp dev` on $DEV_PORT is reused as-is.
set -e

PROJECT_DIR="${INIT_CWD:-$PWD}"
DEV_PORT="${DEV_PORT:-5173}"
REUSE_DEV_SERVER="${REUSE_DEV_SERVER:-0}"
VITE_PID=""

cleanup() {
  if [ -n "$VITE_PID" ]; then
    echo
    echo "Stopping dev server (pid=$VITE_PID)..."
    kill "$VITE_PID" 2>/dev/null || true
    wait "$VITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Returns the first port at or after $1 that has nothing LISTENing, scanning
# up to $1 + 20. Exits non-zero if the range is exhausted. Owning vite on a
# guaranteed-free port avoids the failure mode where a previous dev-ios run
# left a vite on $DEV_PORT that this run reuses, then dies under us when
# that earlier run's trap fires.
find_free_port() {
  local p="$1"
  local max="$((p + 20))"
  while [ "$p" -lt "$max" ]; do
    if ! lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$p"
      return 0
    fi
    p=$((p + 1))
  done
  echo "No free port in range $1-$((max - 1))." >&2
  return 1
}

booted=$(xcrun simctl list devices booted -j | python3 -c '
import json
import sys

data = json.load(sys.stdin)
devices_by_runtime = data.get("devices", {})
booted = []
for runtime_devices in devices_by_runtime.values():
    for device in runtime_devices:
        if device.get("state") == "Booted":
            name = device.get("name", "")
            udid = device.get("udid", "")
            if udid:
                booted.append((name, udid))

for name, udid in booted:
    print(f"{name}|{udid}")
')

count=0
selected=""
while IFS= read -r line; do
  [ -z "$line" ] && continue
  count=$((count + 1))
  if [ "$count" -eq 1 ]; then
    selected="$line"
  fi
done <<EOF
$booted
EOF

if [ "$count" -eq 0 ]; then
  echo "No booted iOS simulators found. Open one simulator and try again."
  exit 1
fi

if [ "$count" -gt 1 ]; then
  echo "Multiple booted iOS simulators found. Choose one:"
  options=()
  while IFS= read -r entry; do
    [ -z "$entry" ] && continue
    options+=("$entry")
  done <<EOF
$booted
EOF

  for i in "${!options[@]}"; do
    entry="${options[$i]}"
    name="${entry%%|*}"
    udid="${entry##*|}"
    echo "  $((i + 1)). $name ($udid)"
  done

  choice="${1:-}"
  while true; do
    if [ -z "$choice" ]; then
      printf "Enter number [1-%s]: " "${#options[@]}"
      if ! read -r choice </dev/tty; then
        echo "Unable to read a simulator choice. Pass it as an argument, for example: vp run dev:ios 2"
        exit 1
      fi
    fi
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
      selected="${options[$((choice - 1))]}"
      break
    fi
    if [ -n "${1:-}" ]; then
      echo "Invalid selection."
      exit 1
    fi
    echo "Invalid selection. Try again."
    choice=""
  done
fi

name="${selected%%|*}"
udid="${selected##*|}"
echo "Using simulator: $name ($udid)"

cd "$PROJECT_DIR"

# iOS simulators share the host's loopback so localhost just works.
if [ "$REUSE_DEV_SERVER" = "1" ] \
    && curl -sSf -o /dev/null --max-time 1 "http://localhost:$DEV_PORT"; then
  echo "Reusing existing dev server on http://localhost:$DEV_PORT (REUSE_DEV_SERVER=1)"
else
  if [ "$REUSE_DEV_SERVER" = "1" ]; then
    echo "REUSE_DEV_SERVER=1 set but nothing on http://localhost:$DEV_PORT; spawning a new one."
  fi

  DEV_PORT="$(find_free_port "$DEV_PORT")" || exit 1
  echo "Starting dev server on http://localhost:$DEV_PORT..."
  vp dev --port "$DEV_PORT" &
  VITE_PID=$!

  for _ in $(seq 1 30); do
    if curl -sSf -o /dev/null --max-time 1 "http://localhost:$DEV_PORT"; then
      break
    fi
    sleep 1
  done

  if ! curl -sSf -o /dev/null --max-time 1 "http://localhost:$DEV_PORT"; then
    echo "Dev server didn't come up in 30s. Aborting."
    exit 1
  fi
fi

# Sync runs inside cap (not skipped) so the live-reload server.url lands in
# the native project's capacitor.config.json.
npx cap run ios \
  --target "$udid" \
  --live-reload \
  --host localhost \
  --port "$DEV_PORT"
