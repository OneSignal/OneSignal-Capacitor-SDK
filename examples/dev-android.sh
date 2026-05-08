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
# guaranteed-free port avoids the failure mode where a previous dev-android
# run left a vite on $DEV_PORT that this run reuses, then dies under us when
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

serials=$(adb devices | awk '/\tdevice$/{print $1}')

if [ -z "$serials" ]; then
  echo "No Android devices connected. Start an emulator and try again."
  exit 1
fi

labels=()
devices=()
while IFS= read -r serial; do
  avd=$(adb -s "$serial" emu avd name 2>/dev/null | head -1 | tr -d '\r')
  label="${avd:-$serial} ($serial)"
  labels+=("$label")
  devices+=("$serial")
done <<< "$serials"

if [ ${#devices[@]} -eq 1 ]; then
  selected="${devices[0]}"
  echo "Using device: ${labels[0]}"
else
  echo "Select a device:"
  for i in "${!labels[@]}"; do
    echo "  $((i+1))) ${labels[$i]}"
  done
  printf "Choice [1]: "
  read -r choice
  choice=${choice:-1}
  idx=$((choice - 1))
  if [ "$idx" -lt 0 ] || [ "$idx" -ge ${#devices[@]} ]; then
    echo "Invalid choice."
    exit 1
  fi
  selected="${devices[$idx]}"
fi

cd "$PROJECT_DIR"

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

# --forwardPorts wires up `adb reverse` so the device's localhost hits the
# host machine — no LAN IP / firewall hops, works on emulators and physical
# devices alike. Sync runs inside cap (not skipped) so the live-reload
# server.url + cleartext exemption land in the native project.
npx cap run android \
  --target "$selected" \
  --live-reload \
  --host localhost \
  --port "$DEV_PORT" \
  --forwardPorts "$DEV_PORT:$DEV_PORT"
