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

  while true; do
    printf "Enter number [1-%s]: " "${#options[@]}"
    read -r choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
      selected="${options[$((choice - 1))]}"
      break
    fi
    echo "Invalid selection. Try again."
  done
fi

name="${selected%%|*}"
udid="${selected##*|}"
echo "Using simulator: $name ($udid)"

cd "$PROJECT_DIR"

# Reuse an existing dev server if one's already on $DEV_PORT (e.g. user is
# running `vp run dev` separately for cleaner logs); otherwise spawn one.
# iOS simulators share the host's loopback so localhost just works.
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

# Sync runs inside cap (not skipped) so the live-reload server.url lands in
# the native project's capacitor.config.json.
npx cap run ios \
  --target "$udid" \
  --live-reload \
  --host localhost \
  --port "$DEV_PORT"
