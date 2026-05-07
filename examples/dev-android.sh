#!/bin/bash
# DON'T RUN THIS FILE DIRECTLY, USE PACKAGE.JSON SCRIPTS
# Live-reload runner. Spawns Vite if no dev server is already on $DEV_PORT,
# then installs the app and points its WebView at the dev server. Vite is
# torn down on exit (Ctrl+C, error, etc.) only if this script started it.
set -e

PROJECT_DIR="${INIT_CWD:-$PWD}"
DEV_PORT="${DEV_PORT:-5173}"
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

# Reuse an existing dev server if one's already on $DEV_PORT (e.g. user is
# running `vp run dev` separately for cleaner logs); otherwise spawn one.
if curl -sSf -o /dev/null --max-time 1 "http://localhost:$DEV_PORT"; then
  echo "Reusing existing dev server on http://localhost:$DEV_PORT"
else
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
